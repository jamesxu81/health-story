/**
 * Individual Treatment API Routes
 * PUT /api/illnesses/[id]/treatments/[treatmentId] - Update a treatment
 * DELETE /api/illnesses/[id]/treatments/[treatmentId] - Delete a treatment
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { validateInput, treatmentUpdateSchema } from '@/lib/validation/schemas';
import { 
  getTreatmentById, 
  updateTreatment,
  deleteTreatment,
} from '@/lib/db/queries/treatment';
import { getIllnessById } from '@/lib/db/queries/illness';
import { ApiResponse } from '@/types/api';
import { Treatment } from '@/types/treatment';
import { errorToResponse } from '@/lib/errors';

/**
 * PUT /api/illnesses/[id]/treatments/[treatmentId]
 * Update a treatment record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; treatmentId: string } }
): Promise<NextResponse<ApiResponse<Treatment> | any>> {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const authContext = extractUserContext(headers);
    const { user_id } = authContext;

    // Verify illness exists and belongs to user
    const illness = await getIllnessById(params.id);
    if (!illness || illness.user_id !== user_id) {
      return NextResponse.json(
        { error: 'Illness not found' },
        { status: 404 }
      );
    }

    // Verify treatment exists and belongs to illness
    const treatment = await getTreatmentById(params.treatmentId, params.id);
    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = validateInput(treatmentUpdateSchema, body);

    // Update treatment
    const updated = await updateTreatment(params.treatmentId, params.id, validated);

    const response: ApiResponse<Treatment> = {
      data: updated,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('PUT /api/illnesses/[id]/treatments/[treatmentId] error:', error);
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

/**
 * DELETE /api/illnesses/[id]/treatments/[treatmentId]
 * Delete a treatment record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; treatmentId: string } }
): Promise<NextResponse<any>> {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const authContext = extractUserContext(headers);
    const { user_id } = authContext;

    // Verify illness exists and belongs to user
    const illness = await getIllnessById(params.id);
    if (!illness || illness.user_id !== user_id) {
      return NextResponse.json(
        { error: 'Illness not found' },
        { status: 404 }
      );
    }

    // Verify treatment exists
    const treatment = await getTreatmentById(params.treatmentId, params.id);
    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      );
    }

    // Delete treatment
    const deleted = await deleteTreatment(params.treatmentId, params.id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete treatment' },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/illnesses/[id]/treatments/[treatmentId] error:', error);
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
