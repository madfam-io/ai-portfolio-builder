import { jest, describe, it, expect, beforeEach } from '@jest/globals';

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};

export const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
});

export const waitForAsync = async (ms: number = 0) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};
