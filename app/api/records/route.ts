/**
 * POST /api/records — Create a sick-day / illness record via API.
 *
 * Same behavior and JSON body as POST /api/illnesses. Use whichever URL fits your integration.
 *
 * Authentication: Authorization: Bearer <user_id> (same as the rest of the app MVP).
 *
 * Request body (application/json):
 * - name (string, required)
 * - date_started (ISO date YYYY-MM-DD, required)
 * - symptoms (array, required, may be empty): { name, severity, duration? }[]
 * - date_ended (ISO date or null, optional)
 * - cause, treat, notes (optional strings)
 * - family_member_id (UUID or null, optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createIllnessFromJsonRequest } from '@/lib/api/create-illness-record';
import { ApiResponse } from '@/types/api';
import { errorToResponse } from '@/lib/errors';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<unknown> | Record<string, unknown>>> {
  try {
    const illness = await createIllnessFromJsonRequest(request);

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
