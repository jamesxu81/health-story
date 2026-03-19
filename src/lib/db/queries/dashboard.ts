import { queryOne, queryAll } from '@/lib/db';
import { IllnessWithCounts } from '@/types/illness';

export interface ActivityEvent {
  type: 'illness_created' | 'illness_resolved' | 'treatment_added';
  title: string;
  illness_id: string;
  illness_name: string;
  timestamp: string;
}

export interface DashboardStats {
  total_illnesses: number;
  active_count: number;
  resolved_count: number;
  this_month_count: number;
  avg_recovery_days: number | null;
  most_common_illness: { name: string; count: number } | null;
}

export interface DashboardData {
  active_illnesses: IllnessWithCounts[];
  recent_activity: ActivityEvent[];
  stats: DashboardStats;
}

export async function getActiveIllnesses(
  userId: string
): Promise<IllnessWithCounts[]> {
  const rows = await queryAll<any>(
    `
    SELECT
      i.id, i.user_id, i.name, i.date_started, i.date_ended,
      i.status, i.symptoms, i.cause, i.notes, i.family_member_id,
      i.created_at, i.updated_at,
      fm.name AS family_member_name, fm.color AS family_member_color,
      COALESCE(COUNT(DISTINCT t.id), 0)::int AS treatment_count,
      COALESCE(COUNT(DISTINCT p.id), 0)::int AS photo_count
    FROM illnesses i
    LEFT JOIN treatments t ON i.id = t.illness_id
    LEFT JOIN photos p ON i.id = p.illness_id
    LEFT JOIN family_members fm ON i.family_member_id = fm.id
    WHERE i.user_id = $1 AND i.status = 'active'
    GROUP BY i.id, fm.name, fm.color
    ORDER BY i.date_started DESC
    LIMIT 10
    `,
    [userId]
  );

  return rows.map((row) => ({
    ...row,
    date_started: new Date(row.date_started),
    date_ended: row.date_ended ? new Date(row.date_ended) : null,
    symptoms:
      typeof row.symptoms === 'string'
        ? JSON.parse(row.symptoms)
        : row.symptoms || [],
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    treatment_count: parseInt(row.treatment_count || '0', 10),
    photo_count: parseInt(row.photo_count || '0', 10),
    family_member_name: row.family_member_name || null,
    family_member_color: row.family_member_color || null,
    recovery_days: null,
  }));
}

export async function getRecentActivity(
  userId: string,
  limit: number = 10
): Promise<{ events: ActivityEvent[]; hasMore: boolean }> {
  const rows = await queryAll<any>(
    `
    (
      SELECT
        'illness_created' AS type,
        i.name AS title,
        i.id AS illness_id,
        i.name AS illness_name,
        i.created_at AS timestamp
      FROM illnesses i
      WHERE i.user_id = $1
    )
    UNION ALL
    (
      SELECT
        'illness_resolved' AS type,
        i.name AS title,
        i.id AS illness_id,
        i.name AS illness_name,
        i.updated_at AS timestamp
      FROM illnesses i
      WHERE i.user_id = $1 AND i.date_ended IS NOT NULL
    )
    UNION ALL
    (
      SELECT
        'treatment_added' AS type,
        t.name AS title,
        i.id AS illness_id,
        i.name AS illness_name,
        t.created_at AS timestamp
      FROM treatments t
      JOIN illnesses i ON t.illness_id = i.id
      WHERE i.user_id = $1
    )
    ORDER BY timestamp DESC
    LIMIT $2
    `,
    [userId, limit + 1]
  );

  const hasMore = rows.length > limit;
  const events: ActivityEvent[] = rows.slice(0, limit).map((row) => ({
    type: row.type,
    title: row.title,
    illness_id: row.illness_id,
    illness_name: row.illness_name,
    timestamp:
      row.timestamp instanceof Date
        ? row.timestamp.toISOString()
        : row.timestamp,
  }));

  return { events, hasMore };
}

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const countsRow = await queryOne<any>(
    `
    SELECT
      COUNT(*)::int AS total_illnesses,
      COUNT(CASE WHEN status = 'active' THEN 1 END)::int AS active_count,
      COUNT(CASE WHEN status = 'resolved' THEN 1 END)::int AS resolved_count,
      COUNT(CASE WHEN date_started >= date_trunc('month', CURRENT_DATE) THEN 1 END)::int AS this_month_count,
      ROUND(AVG(
        CASE WHEN date_ended IS NOT NULL
          THEN (date_ended::date - date_started::date)
        END
      ))::int AS avg_recovery_days
    FROM illnesses
    WHERE user_id = $1
    `,
    [userId]
  );

  const mostCommonRow = await queryOne<any>(
    `
    SELECT name, COUNT(*)::int AS count
    FROM illnesses
    WHERE user_id = $1
    GROUP BY name
    ORDER BY count DESC, name ASC
    LIMIT 1
    `,
    [userId]
  );

  return {
    total_illnesses: countsRow?.total_illnesses ?? 0,
    active_count: countsRow?.active_count ?? 0,
    resolved_count: countsRow?.resolved_count ?? 0,
    this_month_count: countsRow?.this_month_count ?? 0,
    avg_recovery_days: countsRow?.avg_recovery_days ?? null,
    most_common_illness: mostCommonRow
      ? { name: mostCommonRow.name, count: mostCommonRow.count }
      : null,
  };
}
