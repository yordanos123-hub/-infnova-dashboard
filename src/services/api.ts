import axios from 'axios';

const api = axios.create({
  baseURL: 'https://infnova-intern.vercel.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/') {
        window.location.href = '/?sessionExpired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout request failed (clearing local session anyway):', err);
  } finally {
    localStorage.removeItem('token');
  }
}


export async function fetchCurrentAdmin() {
  const response = await api.get('/auth/me');
  return response.data;
}
