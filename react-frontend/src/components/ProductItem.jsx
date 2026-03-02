import React from 'react';
import './ProductItem.scss';

// Функция для получения иконки по категории
const getCategoryIcon = (category) => {
    const icons = {
        'Гитары': 'fa-guitar',
        'Ударные': 'fa-drum',
        'Клавишные': 'fa-piano-keyboard',
        'Микрофоны': 'fa-microphone',
        'Синтезаторы': 'fa-synth',
        'Звуковые карты': 'fa-waveform',
        'Тарелки': 'fa-drum-steelpan',
        'Бас-гитары': 'fa-guitar-electric'
    };
    return icons[category] || 'fa-music';
};

export default function ProductItem({ product, onEdit, onDelete }) {
    const iconClass = getCategoryIcon(product.category);
    
    return (
        <div className="product-card">
            <div className="product-card__icon">
                <i className={`fas ${iconClass}`}></i>
            </div>
            <div className="product-card__content">
                <div className="product-card__header">
                    <h3 className="product-card__title">{product.name}</h3>
                    <span className="product-card__category">{product.category}</span>
                </div>
                <p className="product-card__description">{product.description}</p>
                <div className="product-card__details">
                    <span className="product-card__price">{product.price.toLocaleString()} ₽</span>
                    <span className="product-card__stock">В наличии: {product.stock}</span>
                    <span className="product-card__rating">
                        <i className="fas fa-star"></i> {product.rating}
                    </span>
                </div>
                <div className="product-card__actions">
                    <button className="btn btn--edit" onClick={() => onEdit(product)}>
                        <i className="fas fa-edit"></i> Редактировать
                    </button>
                    <button className="btn btn--delete" onClick={() => onDelete(product.id)}>
                        <i className="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}