/**
 * POST /api/illnesses/[id]/photos — upload an image or PDF attachment
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { getIllnessById } from '@/lib/db/queries/illness';
import { insertPhoto } from '@/lib/db/queries/photo';
import { uploadBlob, generateBlobPathname, resolveMimeType } from '@/lib/blob/upload';
import { ApiResponse } from '@/types/api';
import { errorToResponse, ValidationError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<unknown> | Record<string, unknown>>> {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const { user_id } = extractUserContext(headers);
    const illnessId = params.id;

    const illness = await getIllnessById(illnessId);
    if (!illness || illness.user_id !== user_id) {
      return NextResponse.json({ error: 'Illness not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      throw new ValidationError('Missing file');
    }

    const pathname = generateBlobPathname(illnessId, file.name);
    const { url } = await uploadBlob(file, pathname);
    const mime_type = resolveMimeType(file);

    const row = await insertPhoto({
      illness_id: illnessId,
      blob_url: url,
      filename: file.name,
      size_bytes: file.size,
      mime_type,
    });

    const response: ApiResponse<typeof row> = {
      data: row,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
