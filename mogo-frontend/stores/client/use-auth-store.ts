export const useAuthStore = (selector?: any) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mogo_access_token') || 'dummy_token' : 'dummy_token';
  const state = { accessToken: token, user: { id: "user1", nickname: "User" } };
  return selector ? selector(state) : state;
};
