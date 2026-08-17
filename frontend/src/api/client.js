import axios from 'axios';

// Where the Django backend lives. During local development this is your
// own computer, port 8000 (see backend/README.md for how to start it).
// Individual calls add their own path after this, e.g. '/auth/login/' or
// '/events/'.
const BASE_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach the saved login token (if any) to every request,
// so the backend knows who's asking.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default apiClient;
