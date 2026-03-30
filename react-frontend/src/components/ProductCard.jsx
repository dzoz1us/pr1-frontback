import React from 'react';
import './ProductCard.css';

// Функция для получения иконки Font Awesome по категории
const getCategoryIcon = (category) => {
    const icons = {
        // Гитары
        'Гитары': { icon: 'fa-guitar', color: '#FF6B6B' },
        'Электрогитары': { icon: 'fa-guitar', color: '#FF6B6B' },
        'Классические гитары': { icon: 'fa-guitar', color: '#FF6B6B' },
        'Акустические гитары': { icon: 'fa-guitar', color: '#FF6B6B' },
        'Бас-гитары': { icon: 'fa-guitar', color: '#FF6B6B' },
        
        // Ударные
        'Ударные': { icon: 'fa-drum', color: '#4ECDC4' },
        'Электронные ударные': { icon: 'fa-drum', color: '#4ECDC4' },
        'Тарелки': { icon: 'fa-drum', color: '#FD79A8' },
        
        // Клавишные
        'Клавишные': { icon: 'fa-music', color: '#45B7D1' },
        'Пианино': { icon: 'fa-music', color: '#45B7D1' },
        'Рояль': { icon: 'fa-music', color: '#45B7D1' },
        
        // Синтезаторы
        'Синтезаторы': { icon: 'fa-microchip', color: '#A55EEA' },
        
        // Звуковые карты
        'Звуковые карты': { icon: 'fa-microchip', color: '#6C5CE7' },
        'Аудиоинтерфейсы': { icon: 'fa-microchip', color: '#6C5CE7' },
        
        // Микрофоны
        'Микрофоны': { icon: 'fa-microphone', color: '#F9CA24' },
        
        // Струнные
        'Струнные': { icon: 'fa-violin', color: '#FF9F4A' },
        'Скрипка': { icon: 'fa-violin', color: '#FF9F4A' },
        'Виолончель': { icon: 'fa-violin', color: '#FF9F4A' },
        
        // Духовые
        'Духовые': { icon: 'fa-saxophone', color: '#FDCB6E' },
        'Саксофон': { icon: 'fa-saxophone', color: '#FDCB6E' },
        'Труба': { icon: 'fa-trumpet', color: '#FDCB6E' },
        
        // Флейта
        'Флейта': { icon: 'fa-music', color: '#FDCB6E' },
        
        // Разное
        'Разное': { icon: 'fa-music', color: '#95A5A6' }
    };
    
    // Поиск иконки по категории
    const found = icons[category];
    if (found) return found;
    
    // Если категория не найдена, ищем частичное совпадение
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('гитар')) return { icon: 'fa-guitar', color: '#FF6B6B' };
    if (lowerCategory.includes('ударн')) return { icon: 'fa-drum', color: '#4ECDC4' };
    if (lowerCategory.includes('клавиш') || lowerCategory.includes('пианин')) return { icon: 'fa-music', color: '#45B7D1' };
    if (lowerCategory.includes('синтез') || lowerCategory.includes('midi')) return { icon: 'fa-microchip', color: '#A55EEA' };
    if (lowerCategory.includes('звук') || lowerCategory.includes('аудио')) return { icon: 'fa-microchip', color: '#6C5CE7' };
    if (lowerCategory.includes('микрофон')) return { icon: 'fa-microphone', color: '#F9CA24' };
    if (lowerCategory.includes('духов')) return { icon: 'fa-saxophone', color: '#FDCB6E' };
    
    return { icon: 'fa-music', color: '#95A5A6' };
};

export default function ProductCard({ product, onEdit, onDelete }) {
    const categoryIcon = getCategoryIcon(product.category);
    
    // Форматирование цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    // Проверяем, есть ли функции (для отображения кнопок)
    const showEditButton = onEdit !== null && onEdit !== undefined;
    const showDeleteButton = onDelete !== null && onDelete !== undefined;

    return (
        <div className="product-card">
            {/* Иконка категории */}
            <div className="product-icon" style={{ background: `linear-gradient(135deg, ${categoryIcon.color} 0%, ${categoryIcon.color}CC 100%)` }}>
                <i className={`fas ${categoryIcon.icon}`}></i>
            </div>
            
            {/* Контент карточки */}
            <div className="product-content">
                <div className="product-header">
                    <h3>{product.title}</h3>
                    <span className="product-category" style={{ background: `${categoryIcon.color}20`, color: categoryIcon.color }}>
                        <i className={`fas ${categoryIcon.icon}`} style={{ fontSize: '0.7rem' }}></i>
                        {product.category}
                    </span>
                </div>
                
                <p className="product-description">
                    {product.description || 'Описание отсутствует'}
                </p>
                
                <div className="product-footer">
                    <div className="product-price">
                        <span className="price-amount">{formatPrice(product.price)}</span>
                        <span className="price-currency">₽</span>
                    </div>
                    
                    <div className="product-actions">
                        {showEditButton && (
                            <button 
                                onClick={() => onEdit(product)} 
                                className="btn-edit"
                                title="Редактировать товар"
                            >
                                <i className="fas fa-edit"></i> Редактировать
                            </button>
                        )}
                        
                        {showDeleteButton && (
                            <button 
                                onClick={() => onDelete(product.id)} 
                                className="btn-delete"
                                title="Удалить товар"
                            >
                                <i className="fas fa-trash"></i> Удалить
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}