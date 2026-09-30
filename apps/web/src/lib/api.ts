import { NwisApiClient } from '@nwis/api-client';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let authToken: string | null = null;

if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('nwis_token');
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('nwis_token', token);
    } else {
      localStorage.removeItem('nwis_token');
    }
  }
};

export const api = new NwisApiClient({
  baseUrl: API_BASE_URL,
  getToken: () => {
    if (typeof window !== 'undefined' && !authToken) {
      authToken = localStorage.getItem('nwis_token');
    }
    return authToken;
  },
});
