import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './UsersPage.css';

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        checkAccess();
        loadUsers();
        loadCurrentUser();
    }, []);

    const checkAccess = async () => {
        try {
            const user = await api.getCurrentUser();
            if (user.role !== 'admin') {
                navigate('/products');
            }
            setCurrentUser(user);
        } catch (error) {
            navigate('/login');
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCurrentUser = async () => {
        try {
            const user = await api.getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    };

    const handleBlockUser = async (user) => {
        if (user.id === currentUser?.id) {
            alert('Нельзя заблокировать самого себя!');
            return;
        }
        
        if (!window.confirm(`Заблокировать пользователя ${user.email}?`)) return;

        try {
            await api.updateUser(user.id, { isActive: false });
            loadUsers();
        } catch (error) {
            console.error('Error blocking user:', error);
            alert('Ошибка блокировки пользователя');
        }
    };

    const handleUnblockUser = async (user) => {
        try {
            await api.updateUser(user.id, { isActive: true });
            loadUsers();
        } catch (error) {
            console.error('Error unblocking user:', error);
            alert('Ошибка разблокировки пользователя');
        }
    };

    const handleChangeRole = async (user, newRole) => {
        if (user.id === currentUser?.id) {
            alert('Нельзя изменить роль самого себя!');
            return;
        }
        
        try {
            await api.updateUser(user.id, { role: newRole });
            loadUsers();
        } catch (error) {
            console.error('Error changing role:', error);
            alert('Ошибка изменения роли');
        }
    };

    if (loading) {
        return (
            <div className="users-page">
                <div className="loading-container">
                    <i className="fas fa-spinner fa-spin"></i> Загрузка...
                </div>
            </div>
        );
    }

    return (
        <div className="users-page">
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <h1 className="logo">
                            <i className="fas fa-users-cog"></i>
                            Управление пользователями
                        </h1>
                        <button onClick={() => navigate('/products')} className="back-btn">
                            <i className="fas fa-arrow-left"></i> Назад в магазин
                        </button>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="users-stats">
                        <div className="stat-card">
                            <i className="fas fa-users"></i>
                            <span className="stat-number">{users.length}</span>
                            <span className="stat-label">Всего пользователей</span>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-user-check"></i>
                            <span className="stat-number">{users.filter(u => u.isActive).length}</span>
                            <span className="stat-label">Активных</span>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-user-lock"></i>
                            <span className="stat-number">{users.filter(u => !u.isActive).length}</span>
                            <span className="stat-label">Заблокированных</span>
                        </div>
                    </div>

                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Имя</th>
                                    <th>Фамилия</th>
                                    <th>Роль</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className={!user.isActive ? 'blocked' : ''}>
                                        <td>
                                            <i className="fas fa-envelope"></i> {user.email}
                                            {user.id === currentUser?.id && (
                                                <span className="current-user-badge">(Вы)</span>
                                            )}
                                        </td>
                                        <td>{user.first_name}</td>
                                        <td>{user.last_name}</td>
                                        <td>
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleChangeRole(user, e.target.value)}
                                                className="role-select"
                                                disabled={user.id === currentUser?.id}
                                            >
                                                <option value="user">👤 Пользователь</option>
                                                <option value="seller">🛒 Продавец</option>
                                                <option value="admin">👑 Администратор</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.isActive ? 'active' : 'blocked'}`}>
                                                {user.isActive ? (
                                                    <><i className="fas fa-check-circle"></i> Активен</>
                                                ) : (
                                                    <><i className="fas fa-ban"></i> Заблокирован</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            {user.isActive ? (
                                                <button 
                                                    onClick={() => handleBlockUser(user)} 
                                                    className="btn-block"
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    <i className="fas fa-ban"></i> Заблокировать
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUnblockUser(user)} 
                                                    className="btn-unblock"
                                                >
                                                    <i className="fas fa-check-circle"></i> Разблокировать
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}