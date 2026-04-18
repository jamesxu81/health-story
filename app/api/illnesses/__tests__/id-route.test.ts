/** @jest-environment node */

import { NextRequest } from 'next/server';

jest.mock('@/lib/db/queries/illness', () => ({
  getIllnessWithRelationsForUser: jest.fn(),
}));

const { getIllnessWithRelationsForUser } = jest.requireMock('@/lib/db/queries/illness') as {
  getIllnessWithRelationsForUser: jest.Mock;
};

const { GET } = require('../[id]/route') as typeof import('../[id]/route');

function requestWithAuth(url: string) {
  return new NextRequest(url, {
    headers: { authorization: 'Bearer default-user' },
  });
}

describe('GET /api/illnesses/[id]', () => {
  it('returns 404 when illness does not exist', async () => {
    getIllnessWithRelationsForUser.mockResolvedValueOnce(null);

    const res = await GET(requestWithAuth('http://localhost/api/illnesses/missing-id'), {
      params: { id: 'missing-id' },
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: 'Illness not found',
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('returns 200 with illness data when found', async () => {
    getIllnessWithRelationsForUser.mockResolvedValueOnce({
      id: 'abc',
      name: 'Test',
      treatments: [],
      photos: [],
    });

    const res = await GET(requestWithAuth('http://localhost/api/illnesses/abc'), {
      params: { id: 'abc' },
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      status: 'success',
      data: { id: 'abc', name: 'Test', treatments: [], photos: [] },
    });
  });
});
