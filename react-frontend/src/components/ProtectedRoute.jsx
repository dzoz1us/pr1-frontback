import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        const checkAuth = async () => {
            if (!accessToken) {
                setLoading(false);
                setIsAuthenticated(false);
                return;
            }

            try {
                const user = await api.getCurrentUser();
                setUserRole(user.role);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                // Если токен недействителен, очищаем его
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [accessToken]);

    // Пока загружаемся, показываем индикатор загрузки
    if (loading) {
        return (
            <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i> Загрузка...
            </div>
        );
    }

    // Если не аутентифицирован - перенаправляем на вход
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Если указаны разрешенные роли и текущая роль не входит в список
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/products" replace />;
    }

    // Все проверки пройдены - показываем защищенный контент
    return children;
}