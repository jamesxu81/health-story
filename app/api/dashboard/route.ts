import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { errorToResponse } from '@/lib/errors';
import {
  getActiveIllnesses,
  getRecentActivity,
  getDashboardStats,
  DashboardData,
} from '@/lib/db/queries/dashboard';
import { ApiResponse } from '@/types/api';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<DashboardData> | any>> {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const { user_id } = extractUserContext(headers);

    const rawFm = request.nextUrl.searchParams.get('family_member_id');
    const familyMemberId =
      rawFm && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawFm)
        ? rawFm
        : null;

    const [active_illnesses, activityResult, stats] = await Promise.all([
      getActiveIllnesses(user_id, familyMemberId),
      getRecentActivity(user_id, 10, familyMemberId),
      getDashboardStats(user_id, familyMemberId),
    ]);

    const data: DashboardData = {
      active_illnesses,
      recent_activity: activityResult.events,
      stats,
    };

    const response: ApiResponse<DashboardData> = {
      data,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
