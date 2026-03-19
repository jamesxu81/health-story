import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { validateInput, familyMemberSchema } from '@/lib/validation/schemas';
import {
  getFamilyMembers,
  createFamilyMember,
} from '@/lib/db/queries/family-member';
import { ApiResponse } from '@/types/api';
import { errorToResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    const { user_id } = extractUserContext(headers);

    const members = await getFamilyMembers(user_id);

    return NextResponse.json({
      data: members,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    const { user_id } = extractUserContext(headers);

    const body = await request.json();
    const input = validateInput(familyMemberSchema, body);

    const member = await createFamilyMember(user_id, input);

    const response: ApiResponse<typeof member> = {
      data: member,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
