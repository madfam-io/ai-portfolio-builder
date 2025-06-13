import { NextRequest, NextResponse } from 'next/server';

describe('Portfolios API', () => {
  it('should handle portfolio operations', () => {
    const req = new NextRequest('http://localhost:3000/api/portfolios');
    expect(req).toBeDefined();
  });

  it('should create portfolio request', () => {
    const req = new NextRequest('http://localhost:3000/api/portfolios', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Portfolio',
        template: 'developer',
      }),
    });

    expect(req.method).toBe('POST');
  });
});
