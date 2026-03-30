import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Публичные маршруты (доступны гостям) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Защищенные маршруты (требуют аутентификации) */}
                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <ProductsPage />
                        </ProtectedRoute>
                    }
                />
                
                {/* Маршрут для администратора (только admin) */}
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />
                
                {/* Перенаправление по умолчанию */}
                <Route path="/" element={<Navigate to="/products" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;