/**
 * GET /api/attachments/[photoId] — stream an illness attachment (auth required).
 * Private Vercel Blob objects are fetched with the read-write token; local dev uses public/ files.
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { extractUserContext } from '@/lib/auth';
import { getPhotoIfOwnedByUser } from '@/lib/db/queries/photo';
import { errorToResponse } from '@/lib/errors';

function getBlobToken(): string | null {
  const raw = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!raw || raw === 'your_token_here') return null;
  return raw;
}

async function getBlobStream(blobUrl: string, token: string) {
  try {
    return await get(blobUrl, { access: 'private', token });
  } catch {
    return await get(blobUrl, { access: 'public', token });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string } }
): Promise<NextResponse> {
  try {
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    const { user_id } = extractUserContext(headers);
    const row = await getPhotoIfOwnedByUser(params.photoId, user_id);
    if (!row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { blob_url, mime_type, filename } = row;

    if (blob_url.startsWith('/')) {
      const relative = blob_url.replace(/^\//, '');
      if (relative.includes('..')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      const base = path.resolve(process.cwd(), 'public');
      const fullPath = path.resolve(path.join(process.cwd(), 'public', relative));
      if (!fullPath.startsWith(base)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      const buf = await readFile(fullPath);
      return new NextResponse(buf, {
        headers: {
          'Content-Type': mime_type || 'application/octet-stream',
          'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    }

    const token = getBlobToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Blob storage is not configured' },
        { status: 500 }
      );
    }

    const result = await getBlobStream(blob_url, token);
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
