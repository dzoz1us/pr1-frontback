const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Настройка CORS для React-клиента
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для статических файлов из папки frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware для логирования запросов (улучшенный)
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// ===== ДАННЫЕ С nanoid =====
let products = [
    {
        id: nanoid(6),
        name: 'Fender Stratocaster',
        category: 'Гитары',
        description: 'Электрогитара, корпус ольха, гриф клен, 3 сингла',
        price: 89990,
        stock: 5,
        rating: 4.9,
    },
    {
        id: nanoid(6),
        name: 'Yamaha C40',
        category: 'Гитары',
        description: 'Классическая гитара, для начинающих, нейлоновые струны',
        price: 8990,
        stock: 15,
        rating: 4.7,
    },
    {
        id: nanoid(6),
        name: 'Roland TD-17KVX',
        category: 'Ударные',
        description: 'Электронная ударная установка, Bluetooth, USB',
        price: 119990,
        stock: 3,
        rating: 4.8,
    },
    {
        id: nanoid(6),
        name: 'Yamaha P-45',
        category: 'Клавишные',
        description: 'Цифровое пианино, 88 молоточковых клавиш',
        price: 45990,
        stock: 7,
        rating: 4.8,
    },
    {
        id: nanoid(6),
        name: 'Shure SM58',
        category: 'Микрофоны',
        description: 'Вокальный микрофон, кардиоида, легендарный звук',
        price: 12990,
        stock: 20,
        rating: 4.9,
    },
    {
        id: nanoid(6),
        name: 'Gibson Les Paul',
        category: 'Гитары',
        description: 'Электрогитара, махагони, хамбакеры, винтажный звук',
        price: 189990,
        stock: 2,
        rating: 5.0,
    },
    {
        id: nanoid(6),
        name: 'Korg Volca Beats',
        category: 'Синтезаторы',
        description: 'Аналоговый драм-машина, секвенсор 16 шагов',
        price: 13990,
        stock: 8,
        rating: 4.5,
    },
    {
        id: nanoid(6),
        name: 'Focusrite Scarlett 2i2',
        category: 'Звуковые карты',
        description: 'USB аудиоинтерфейс, 2 входа, 48V фантомное питание',
        price: 15990,
        stock: 12,
        rating: 4.7,
    },
    {
        id: nanoid(6),
        name: 'Zildjian A Custom',
        category: 'Тарелки',
        description: 'Набор тарелок: 14" хай-хэт, 16" и 18" крэш, 20" райд',
        price: 45990,
        stock: 4,
        rating: 4.8,
    },
    {
        id: nanoid(6),
        name: 'Ibanez SR300',
        category: 'Бас-гитары',
        description: '4-струнная бас-гитара, активные звукосниматели',
        price: 32990,
        stock: 6,
        rating: 4.6,
    }
];

// ===== CRUD ОПЕРАЦИИ =====

// GET /api/products - все товары
app.get('/api/products', (req, res) => {
    res.json(products);
});

// GET /api/products/:id - товар по ID
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    res.json(product);
});

// POST /api/products - создать товар
app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock, rating, image } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ error: 'Название и цена обязательны' });
    }
    
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category || 'Разное',
        description: description || 'Описание отсутствует',
        price: Number(price),
        stock: Number(stock) || 0,
        rating: Number(rating) || 0,
        image: image || 'https://via.placeholder.com/300x200'
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PATCH /api/products/:id - обновить товар
app.patch('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Nothing to update" });
    }
    
    const { name, category, description, price, stock, rating, image } = req.body;
    
    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);
    if (image !== undefined) product.image = image;
    
    res.json(product);
});

// DELETE /api/products/:id - удалить товар
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const exists = products.some(p => p.id === id);
    
    if (!exists) {
        return res.status(404).json({ error: "Product not found" });
    }
    
    products = products.filter(p => p.id !== id);
    res.status(204).send(); // No content
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 БЭКЕНД ЗАПУЩЕН!');
    console.log('='.repeat(50));
    console.log(`📡 Адрес: http://localhost:${port}`);
    console.log(`🔑 Используется nanoid для ID`);
    console.log('\n📦 API ENDPOINTS:');
    console.log('   GET    /api/products');
    console.log('   GET    /api/products/:id');
    console.log('   POST   /api/products');
    console.log('   PATCH  /api/products/:id');
    console.log('   DELETE /api/products/:id');
    console.log('='.repeat(50) + '\n');
});