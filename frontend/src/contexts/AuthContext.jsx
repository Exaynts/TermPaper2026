import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Загрузка профиля при монтировании
    useEffect(() => {
        const loadUser = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/profile/');
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to load user:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        loadUser();

        // Слушаем событие выхода
        const handleLogout = () => {
            setUser(null);
            setIsAuthenticated(false);
        };
        window.addEventListener('auth-logout', handleLogout);
        return () => window.removeEventListener('auth-logout', handleLogout);
    }, []);

    // Функция входа
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login/', { email, password });
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Загружаем профиль
            const userResponse = await api.get('/auth/profile/');
            setUser(userResponse.data);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.non_field_errors?.[0] || 'Неверный email или пароль';
            return { success: false, error: message };
        }
    };

    // Функция регистрации
    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register/', userData);
            const { user: registeredUser, message } = response.data;

            // После регистрации автоматически входим
            const loginResult = await login(userData.email, userData.password);
            if (loginResult.success) {
                return { success: true, user: registeredUser, message };
            }
            return { success: false, error: 'Ошибка автоматического входа после регистрации' };
        } catch (error) {
            const errors = error.response?.data || {};
            const firstError = Object.values(errors)[0]?.[0] || 'Ошибка регистрации';
            return { success: false, error: firstError };
        }
    };

    // Функция выхода
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Обновление профиля
    const updateProfile = async (data) => {
        try {
            const response = await api.patch('/auth/profile/', data);
            setUser(response.data);
            return { success: true, user: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
    };

    // ИСПРАВЛЕНО: убрана рекурсия
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};