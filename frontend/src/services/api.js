import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshPromise = null;

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.dispatchEvent(new Event('auth-logout'));
                return Promise.reject(error);
            }

            if (!refreshPromise) {
                refreshPromise = axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                    refresh: refreshToken,
                }).then((response) => {
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);
                    return newAccessToken;
                }).catch((refreshError) => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.dispatchEvent(new Event('auth-logout'));
                    throw refreshError;
                }).finally(() => {
                    refreshPromise = null;
                });
            }

            try {
                const newAccessToken = await refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;