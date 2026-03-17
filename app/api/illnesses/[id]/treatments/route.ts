/**
 * Treatment API Routes
 * GET /api/illnesses/[id]/treatments - List treatments for an illness
 * POST /api/illnesses/[id]/treatments - Create a new treatment
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { validateInput, treatmentFilterSchema, treatmentSchema } from '@/lib/validation/schemas';
import { 
  getTreatmentsForIllness, 
  createTreatment,
  getTreatmentById,
} from '@/lib/db/queries/treatment';
import { getIllnessById } from '@/lib/db/queries/illness';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Treatment } from '@/types/treatment';
import { errorToResponse } from '@/lib/errors';

/**
 * GET /api/illnesses/[id]/treatments
 * Retrieve treatments for a specific illness
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<PaginatedResponse<Treatment> | any>> {
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

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const filterParams = {
      effectiveness: searchParams.get('effectiveness'),
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    };

    const validated = validateInput(treatmentFilterSchema, filterParams);

    // Get treatments
    const { treatments, total } = await getTreatmentsForIllness(
      params.id,
      validated.effectiveness as 'effective' | 'ineffective' | undefined,
      validated.limit,
      validated.offset
    );

    const response: PaginatedResponse<Treatment> = {
      data: treatments,
      pagination: {
        total,
        limit: validated.limit,
        offset: validated.offset,
        total_pages: Math.ceil(total / validated.limit),
      },
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/illnesses/[id]/treatments error:', error);
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/illnesses/[id]/treatments
 * Create a new treatment for an illness
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Parse and validate request body
    const body = await request.json();
    const validated = validateInput(treatmentSchema, body);

    // Create treatment
    const treatment = await createTreatment(params.id, validated);

    const response: ApiResponse<Treatment> = {
      data: treatment,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('POST /api/illnesses/[id]/treatments error:', error);
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
