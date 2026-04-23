/**
 * PUT /api/records/[id] — Update an existing sick-day / illness record.
 *
 * Mirrors PUT /api/illnesses/[id] and accepts partial updates.
 * Common use case: set status to "resolved".
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { validateInput, illnessUpdateSchema } from '@/lib/validation/schemas';
import { updateIllness } from '@/lib/db/queries/illness';
import { ApiResponse } from '@/types/api';
import { errorToResponse } from '@/lib/errors';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<unknown> | Record<string, unknown>>> {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const authContext = extractUserContext(headers);
    const body = await request.json();
    const input = validateInput(illnessUpdateSchema, body);

    const illness = await updateIllness(params.id, authContext.user_id, input);

    const response: ApiResponse<typeof illness> = {
      data: illness,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

