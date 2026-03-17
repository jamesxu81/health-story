/**
 * Illness API Routes
 * GET /api/illnesses - List illnesses with pagination and filters
 * POST /api/illnesses - Create new illness record
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { validateInput, illnessFilterSchema, illnessSchema } from '@/lib/validation/schemas';
import { getIllnessesByUser, createIllness } from '@/lib/db/queries/illness';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { IllnessWithCounts } from '@/types/illness';
import { errorToResponse } from '@/lib/errors';

/**
 * GET /api/illnesses
 * Retrieve illness records with pagination and optional filtering
 */
export async function GET(request: NextRequest): Promise<
  NextResponse<PaginatedResponse<IllnessWithCounts> | any>
> {
  try {
    // Extract user context from headers
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const authContext = extractUserContext(headers);
    const { user_id } = authContext;

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      status: searchParams.get('status'),
      date_from: searchParams.get('date_from'),
      date_to: searchParams.get('date_to'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    };

    const validated = validateInput(illnessFilterSchema, params);

    // Get illnesses from database
    const { illnesses, total } = await getIllnessesByUser({
      user_id,
      status: validated.status,
      date_from: validated.date_from,
      date_to: validated.date_to,
      limit: validated.limit,
      offset: validated.offset,
    });

    const response: PaginatedResponse<IllnessWithCounts> = {
      data: illnesses,
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
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/illnesses
 * Create a new illness record
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any> | any>> {
  try {
    // Extract user context from headers
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const authContext = extractUserContext(headers);
    const { user_id } = authContext;

    // Parse request body
    const body = await request.json();

    // Validate input
    const input = validateInput(illnessSchema, body);

    // Create illness in database
    const illness = await createIllness(user_id, input);

    const response: ApiResponse<typeof illness> = {
      data: illness,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
