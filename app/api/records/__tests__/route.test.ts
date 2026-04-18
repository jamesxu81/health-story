/** @jest-environment node */

import { NextRequest } from 'next/server';

jest.mock('@/lib/api/create-illness-record', () => ({
  createIllnessFromJsonRequest: jest.fn(),
}));

const { createIllnessFromJsonRequest } = jest.requireMock('@/lib/api/create-illness-record') as {
  createIllnessFromJsonRequest: jest.Mock;
};

const { POST } = require('../route') as typeof import('../route');

describe('POST /api/records', () => {
  it('returns 201 and illness payload when creation succeeds', async () => {
    createIllnessFromJsonRequest.mockResolvedValueOnce({
      id: 'rec-1',
      name: 'Cold',
      user_id: 'u1',
    });

    const req = new NextRequest('http://localhost/api/records', {
      method: 'POST',
      headers: {
        authorization: 'Bearer u1',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Cold',
        date_started: '2026-04-01',
        symptoms: [],
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toMatchObject({
      status: 'success',
      data: { id: 'rec-1', name: 'Cold' },
    });
    expect(createIllnessFromJsonRequest).toHaveBeenCalledWith(req);
  });
});
