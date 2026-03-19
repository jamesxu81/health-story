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

    const [active_illnesses, activityResult, stats] = await Promise.all([
      getActiveIllnesses(user_id),
      getRecentActivity(user_id),
      getDashboardStats(user_id),
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
