import api from './api';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  id: string;
  username: string;
}

export const login = (username: string, password: string): Promise<LoginResponse> => {
  const form = new FormData();
  form.append('username', username);
  form.append('password', password);
  return api.post<LoginResponse>('/auth/login', form).then((r) => r.data);
};

export const getMe = (): Promise<UserResponse> =>
  api.get<UserResponse>('/auth/me').then((r) => r.data);
