import { NextRequest, NextResponse } from 'next/server';
import { extractUserContext } from '@/lib/auth';
import { validateInput, familyMemberUpdateSchema } from '@/lib/validation/schemas';
import {
  getFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember,
} from '@/lib/db/queries/family-member';
import { errorToResponse } from '@/lib/errors';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    const { user_id } = extractUserContext(headers);

    const member = await getFamilyMemberById(params.id, user_id);
    if (!member) throw new NotFoundError('Family member');

    return NextResponse.json({
      data: member,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    const { user_id } = extractUserContext(headers);

    const body = await request.json();
    const input = validateInput(familyMemberUpdateSchema, body);

    const member = await updateFamilyMember(params.id, user_id, input);

    return NextResponse.json({
      data: member,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers?.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    const { user_id } = extractUserContext(headers);

    await deleteFamilyMember(params.id, user_id);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
