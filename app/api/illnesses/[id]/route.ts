/**
 * Illness Detail Routes
 * GET /api/illnesses/[id] - Get single illness
 * PUT /api/illnesses/[id] - Update illness
 * DELETE /api/illnesses/[id] - Delete illness
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { validateInput, illnessUpdateSchema } from '@/lib/validation/schemas';
import { getIllnessDetail, updateIllness, deleteIllness } from '@/lib/db/queries/illness';
import { ApiResponse } from '@/types/api';
import { NotFoundError, errorToResponse } from '@/lib/errors';

/**
 * GET /api/illnesses/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<any> | any>> {
  try {
    const { id } = params;

    const illness = await getIllnessDetail(id);
    if (!illness) {
      throw new NotFoundError('Illness');
    }

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

/**
 * PUT /api/illnesses/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<any> | any>> {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const authContext = extractUserContext(headers);
    const { user_id } = authContext;
    const { id } = params;

    const body = await request.json();
    const input = validateInput(illnessUpdateSchema, body);

    const illness = await updateIllness(id, user_id, input);

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

/**
 * DELETE /api/illnesses/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<any> | any>> {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const authContext = extractUserContext(headers);
    const { user_id } = authContext;
    const { id } = params;

    await deleteIllness(id, user_id);

    const response: ApiResponse<{ id: string }> = {
      data: { id },
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

