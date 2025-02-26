import { HttpClient } from '../infra/http/httpClient';
import { AuthenticationService } from '../service/AuthenticationService';

const authenticationService = new AuthenticationService(HttpClient.create());

export const token = () => localStorage.getItem('token');

export const authenticate = async (email, password) => {
  const result = await authenticationService.authenticate(email, password);

  if (result.success) {
    localStorage.setItem('token', result.token);
    return { success: true };
  }

  return { success: false, message: result.message };
};

export const isAuthenticated = () => {
  return !!token();
};

export const logout = () => {
  localStorage.removeItem('token');
};
