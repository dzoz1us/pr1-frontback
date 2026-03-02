import React, { useEffect, useState } from 'react';
import './ProductModal.scss';

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        rating: '',
        image: ''
    });

    useEffect(() => {
        if (!open) return;
        
        if (initialProduct) {
            setFormData({
                name: initialProduct.name || '',
                category: initialProduct.category || '',
                description: initialProduct.description || '',
                price: initialProduct.price || '',
                stock: initialProduct.stock || '',
                rating: initialProduct.rating || '',
                image: initialProduct.image || ''
            });
        } else {
            setFormData({
                name: '',
                category: '',
                description: '',
                price: '',
                stock: '',
                rating: '',
                image: ''
            });
        }
    }, [open, initialProduct]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Валидация
        if (!formData.name.trim()) {
            alert('Введите название товара');
            return;
        }
        if (!formData.price || formData.price <= 0) {
            alert('Введите корректную цену');
            return;
        }

        onSubmit({
            id: initialProduct?.id,
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock) || 0,
            rating: Number(formData.rating) || 0
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const title = mode === 'edit' ? 'Редактирование товара' : 'Создание товара';

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{title}</h2>
                    <button className="modal__close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="modal__form">
                    <div className="form-group">
                        <label>Название *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Например, Fender Stratocaster"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Категория</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Например, Гитары"
                        />
                    </div>
                    <div className="form-group">
                        <label>Описание</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Введите описание"
                            rows="3"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Цена *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Количество</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Рейтинг</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>URL изображения</label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="modal__footer">
                        <button type="button" className="btn btn--secondary" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === 'edit' ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}