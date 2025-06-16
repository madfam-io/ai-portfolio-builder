export const getToken = jest.fn().mockResolvedValue({
  sub: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
});

export default {
  getToken,
};
