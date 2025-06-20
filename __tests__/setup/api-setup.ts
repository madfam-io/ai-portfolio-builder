/**
 * Setup for API route tests
 * Provides necessary globals and mocks for Next.js API routes
 */

import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock Request and Response for Next.js
class MockRequest {
  constructor(public url: string, public init: RequestInit = {}) {}
  public method = this.init.method || 'GET';
  public headers = new Headers(this.init.headers);
  
  async json() {
    return this.init.body ? JSON.parse(this.init.body as string) : {};
  }
  
  async text() {
    return this.init.body as string || '';
  }
}

class MockResponse {
  constructor(public body?: BodyInit, public init: ResponseInit = {}) {}
  public status = this.init.status || 200;
  public statusText = this.init.statusText || 'OK';
  public headers = new Headers(this.init.headers);
  public ok = this.status >= 200 && this.status < 300;
  
  async json() {
    return this.body ? JSON.parse(this.body as string) : {};
  }
  
  async text() {
    return this.body as string || '';
  }
}

// Set up globals
global.Request = MockRequest as any;
global.Response = MockResponse as any;
global.Headers = Headers;
global.fetch = jest.fn();

// Mock Next.js specific APIs
jest.mock('next/server', () => ({
  NextRequest: MockRequest,
  NextResponse: class NextResponse extends MockResponse {
    static json(object: any, init?: ResponseInit) {
      return new NextResponse(JSON.stringify(object), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    }
    
    static redirect(url: string, status = 307) {
      return new NextResponse(null, {
        status,
        headers: { Location: url },
      });
    }
  },
}));

// Common environment variables for tests
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';