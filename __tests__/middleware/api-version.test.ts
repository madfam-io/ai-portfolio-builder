
import { NextRequest, NextResponse } from 'next/server';
import { apiVersionMiddleware } from '@/middleware/api-version';

describe('API Version Middleware', () => {
  it('should add version header to response', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/test');
    const response = NextResponse.json({ data: 'test' });
    
    const result = apiVersionMiddleware(request, response);
    
    expect(result.headers.get('X-API-Version')).toBe('1.0');
  });

  it('should handle deprecated endpoints', async () => {
    const request = new NextRequest('http://localhost:3000/api/deprecated');
    const response = NextResponse.json({ data: 'test' });
    
    const result = apiVersionMiddleware(request, response);
    
    expect(result.headers.get('X-API-Deprecated')).toBe('true');
  });
});
