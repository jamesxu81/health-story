/** @jest-environment node */

jest.mock('@/lib/db/queries/illness', () => ({
  getIllnessDetail: jest.fn(),
}));

const { getIllnessDetail } = jest.requireMock('@/lib/db/queries/illness') as {
  getIllnessDetail: jest.Mock;
};

const { GET } = require('../[id]/route') as typeof import('../[id]/route');

describe('GET /api/illnesses/[id]', () => {
  it('returns 404 when illness does not exist', async () => {
    getIllnessDetail.mockResolvedValueOnce(null);

    const res = await GET({} as any, { params: { id: 'missing-id' } });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: 'Illness not found',
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('returns 200 with illness data when found', async () => {
    getIllnessDetail.mockResolvedValueOnce({ id: 'abc', name: 'Test' });

    const res = await GET({} as any, { params: { id: 'abc' } });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      status: 'success',
      data: { id: 'abc', name: 'Test' },
    });
  });
});

