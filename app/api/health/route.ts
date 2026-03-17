/**
 * Health Check Endpoint
 * GET /api/health/check
 * Returns database and application status
 */

import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/db';
import { HealthCheckResponse } from '@/types/api';

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  try {
    const dbHealth = await checkHealth();

    const response: HealthCheckResponse = {
      status: dbHealth.connected ? 'healthy' : 'degraded',
      database: {
        connected: dbHealth.connected,
        latency_ms: dbHealth.latency_ms,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: dbHealth.connected ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy' as const,
        database: {
          connected: false,
          latency_ms: 0,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
