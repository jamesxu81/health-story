/**
 * Shared handler: parse auth + JSON body and create an illness record.
 * Used by POST /api/illnesses and POST /api/records.
 */

import { NextRequest } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { validateInput, illnessSchema } from '@/lib/validation/schemas';
import { createIllness } from '@/lib/db/queries/illness';
import { Illness } from '@/types/illness';

export async function createIllnessFromJsonRequest(request: NextRequest): Promise<Illness> {
  const headers: Record<string, string | string[] | undefined> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const authContext = extractUserContext(headers);
  const body = await request.json();
  const input = validateInput(illnessSchema, body);
  return createIllness(authContext.user_id, input);
}
