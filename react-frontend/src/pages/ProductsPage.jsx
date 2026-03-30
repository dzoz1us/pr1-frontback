import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import './ProductsPage.css';

export default function ProductsPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState('');

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        loadProducts();
        loadCurrentUser();
    }, []);

    // Загрузка списка товаров
    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Загрузка текущего пользователя и его роли
    const loadCurrentUser = async () => {
        try {
            const data = await api.getCurrentUser();
            console.log('Current user:', data);
            console.log('User role:', data.role);
            setUser(data);
            setUserRole(data.role);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    // Выход из системы
    const handleLogout = async () => {
        await api.logout();
        navigate('/login');
    };

    // Создание нового товара
    const handleCreateProduct = async (productData) => {
        try {
            const newProduct = await api.createProduct(productData);
            setProducts([...products, newProduct]);
            setShowModal(false);
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Ошибка создания товара');
        }
    };

    // Обновление товара
    const handleUpdateProduct = async (id, productData) => {
        try {
            const updatedProduct = await api.updateProduct(id, productData);
            setProducts(products.map(p => p.id === id ? updatedProduct : p));
            setEditingProduct(null);
            setShowModal(false);
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Ошибка обновления товара');
        }
    };

    // Удаление товара
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Удалить товар?')) return;

        try {
            await api.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Ошибка удаления товара');
        }
    };

    // Открыть модальное окно для создания товара
    const openCreateModal = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    // Открыть модальное окно для редактирования товара
    const openEditModal = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    // Определение прав доступа на основе роли
    const canCreate = userRole === 'admin' || userRole === 'seller';
    const canEdit = userRole === 'admin' || userRole === 'seller';
    const canDelete = userRole === 'admin';

    // Получение названия роли для отображения
    const getRoleDisplay = (role) => {
        switch (role) {
            case 'admin':
                return '👑 Администратор';
            case 'seller':
                return '🛒 Продавец';
            case 'user':
                return '🎵 Пользователь';
            default:
                return '👤 Гость';
        }
    };

    return (
        <div className="products-page">
            {/* Хедер */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <h1 className="logo">
                            <span className="logo-icon">🎵</span>
                            Music Store
                        </h1>
                        {user && (
                            <div className="user-info">
                                <div className="user-greeting">
                                    <span className="user-avatar">
                                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                    </span>
                                    <span>Привет, {user.first_name} {user.last_name}</span>
                                </div>
                                <div className={`user-role role-${userRole}`}>
                                    {getRoleDisplay(userRole)}
                                </div>
                                {userRole === 'admin' && (
                                    <button onClick={() => navigate('/users')} className="admin-btn">
                                        <i className="fas fa-users-cog"></i> Управление пользователями
                                    </button>
                                )}
                                <button onClick={handleLogout} className="logout-btn">
                                    <i className="fas fa-sign-out-alt"></i> Выйти
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Основной контент */}
            <main className="main">
                <div className="container">
                    {/* Тулбар с кнопкой добавления (только для admin и seller) */}
                    <div className="toolbar">
                        <h2>Каталог товаров</h2>
                        {canCreate && (
                            <button onClick={openCreateModal} className="btn-primary">
                                <i className="fas fa-plus"></i> Добавить товар
                            </button>
                        )}
                    </div>

                    {/* Состояние загрузки */}
                    {loading ? (
                        <div className="loading">
                            <i className="fas fa-spinner fa-spin"></i> Загрузка товаров...
                        </div>
                    ) : products.length === 0 ? (
                        // Нет товаров
                        <div className="empty">
                            <i className="fas fa-box-open"></i>
                            <p>Товаров пока нет</p>
                            {canCreate && (
                                <button onClick={openCreateModal} className="btn-primary btn-sm">
                                    Добавить первый товар
                                </button>
                            )}
                        </div>
                    ) : (
                        // Список товаров
                        <div className="products-grid">
                            {products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={canEdit ? openEditModal : null}
                                    onDelete={canDelete ? handleDeleteProduct : null}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Футер */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <p>© {new Date().getFullYear()} Music Store. Все права защищены.</p>
                        <p className="footer-role-info">
                            {userRole === 'admin' && '👑 Вы вошли как администратор - вам доступно всё'}
                            {userRole === 'seller' && '🛒 Вы вошли как продавец - можете добавлять и редактировать товары'}
                            {userRole === 'user' && '🎵 Вы вошли как пользователь - можете только просматривать товары'}
                        </p>
                    </div>
                </div>
            </footer>

            {/* Модальное окно для создания/редактирования товара */}
            {showModal && (
                <ProductForm
                    product={editingProduct}
                    onSubmit={editingProduct ? 
                        (data) => handleUpdateProduct(editingProduct.id, data) : 
                        handleCreateProduct
                    }
                    onClose={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                />
            )}
        </div>
    );
}