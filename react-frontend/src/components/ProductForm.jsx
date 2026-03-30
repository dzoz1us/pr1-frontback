import React, { useState, useEffect } from 'react';
import './ProductForm.css';

export default function ProductForm({ product, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        price: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || '',
                category: product.category || '',
                description: product.description || '',
                price: product.price || ''
            });
        }
    }, [product]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.price) {
            alert('Название и цена обязательны');
            return;
        }
        onSubmit({
            ...formData,
            price: Number(formData.price)
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <i className={`fas ${product ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                        {product ? ' Редактировать товар' : ' Новый товар'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><i className="fas fa-tag"></i> Название товара *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Например: Fender Stratocaster"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-folder"></i> Категория</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Например: Гитары, Ударные, Клавишные..."
                        />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-align-left"></i> Описание</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Подробное описание товара..."
                            rows="4"
                        />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-ruble-sign"></i> Цена *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0"
                            required
                            min="0"
                            step="1"
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            <i className="fas fa-times"></i> Отмена
                        </button>
                        <button type="submit" className="btn-submit">
                            <i className={`fas ${product ? 'fa-save' : 'fa-plus'}`}></i>
                            {product ? ' Сохранить' : ' Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}