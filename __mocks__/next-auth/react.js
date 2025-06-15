const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

export const useSession = jest.fn(() => ({
  data: mockSession,
  status: 'authenticated',
  update: jest.fn()
}));

export const signIn = jest.fn();
export const signOut = jest.fn();

export const SessionProvider = ({ children }) => children;

export default {
  useSession,
  signIn,
  signOut,
  SessionProvider
};