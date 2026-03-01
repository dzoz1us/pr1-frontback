const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для статических файлов из папки frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware для логирования запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ===== ДАННЫЕ =====
let products = [
    { 
        id: 1, 
        name: 'Смартфон Galaxy S23', 
        price: 59990, 
        description: '6.1-дюймовый экран, 128 ГБ памяти, тройная камера',
        image: '/images/product.jpg'
    },
    { 
        id: 2, 
        name: 'Ноутбук MacBook Air', 
        price: 99990, 
        description: '13-дюймовый экран, 256 ГБ SSD, 8 ГБ RAM',
        image: '/images/product1.jpg'
    },
    { 
        id: 3, 
        name: 'Наушники Sony', 
        price: 24990, 
        description: 'Беспроводные, шумоподавление, 30 часов работы',
        image: '/images/product2.jpg'
    }
];

// ===== CRUD ОПЕРАЦИИ =====

// CREATE - создание нового товара (POST /api/products)
app.post('/api/products', (req, res) => {
    const { name, price, description, image } = req.body;
    
    // Валидация
    if (!name || !price) {
        return res.status(400).json({ 
            error: 'Необходимо указать название и цену товара' 
        });
    }
    
    // Создаем новый товар
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name,
        price: Number(price),
        description: description || 'Описание отсутствует',
        image: image || 'https://via.placeholder.com/300x200'
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// READ ALL - получение всех товаров (GET /api/products)
app.get('/api/products', (req, res) => {
    res.json(products);
});

// READ ONE - получение товара по ID (GET /api/products/:id)
app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ 
            error: `Товар с ID ${id} не найден` 
        });
    }
    
    res.json(product);
});

// UPDATE - обновление товара (PUT /api/products/:id)
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price, description, image } = req.body;
    
    // Ищем индекс товара
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            error: `Товар с ID ${id} не найден` 
        });
    }
    
    // Валидация
    if (!name || !price) {
        return res.status(400).json({ 
            error: 'Необходимо указать название и цену товара' 
        });
    }
    
    // Обновляем товар
    products[productIndex] = {
        id,
        name,
        price: Number(price),
        description: description || products[productIndex].description,
        image: image || products[productIndex].image
    };
    
    res.json(products[productIndex]);
});

// DELETE - удаление товара (DELETE /api/products/:id)
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = products.length;
    
    products = products.filter(p => p.id !== id);
    
    if (products.length === initialLength) {
        return res.status(404).json({ 
            error: `Товар с ID ${id} не найден` 
        });
    }
    
    res.json({ 
        message: `Товар с ID ${id} успешно удален`,
        products: products 
    });
});

// ===== ОБРАБОТКА ФРОНТЕНД МАРШРУТОВ =====
// Все запросы, которые не начинаются с /api, отправляем на фронтенд
app.get('/*', (req, res, next) => {
    // Пропускаем API запросы
    if (req.url.startsWith('/api')) {
        return next();
    }
    // Отдаем index.html для всех остальных запросов
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Обработка 404 для API маршрутов
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API маршрут не найден' });
});

// ===== ЗАПУСК СЕРВЕРА =====
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 СЕРВЕР УСПЕШНО ЗАПУЩЕН!');
    console.log('='.repeat(50));
    console.log(`📡 Адрес: http://localhost:${port}`);
    console.log('\n📦 API ENDPOINTS:');
    console.log('   GET    /api/products         - все товары');
    console.log('   GET    /api/products/:id     - товар по ID');
    console.log('   POST   /api/products         - создать товар');
    console.log('   PUT    /api/products/:id     - обновить товар');
    console.log('   DELETE /api/products/:id     - удалить товар');
    console.log('\n🖥️  ФРОНТЕНД:');
    console.log(`   http://localhost:${port}     - главная страница`);
    console.log('='.repeat(50) + '\n');
});