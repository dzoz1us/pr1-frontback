const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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

// Middleware для логирования запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// ===========================================
// ДАННЫЕ
// ===========================================

// Пользователи (для аутентификации)
let users = [
    {
        id: nanoid(6),
        email: 'admin@musicstore.com',
        first_name: 'Admin',
        last_name: 'User',
        hashedPassword: '$2b$10$weGAKDkjd6U6RcNegv2QBuJwhb9v4x5HFHi7T/STX8Z4PmCdFZrg6' // password: admin123
    }
];

// Товары (музыкальные инструменты)
let products = [
    {
        id: nanoid(6),
        title: 'Fender Stratocaster',
        category: 'Гитары',
        description: 'Электрогитара, корпус ольха, гриф клен, 3 сингла',
        price: 89990
    },
    {
        id: nanoid(6),
        title: 'Yamaha C40',
        category: 'Гитары',
        description: 'Классическая гитара, для начинающих, нейлоновые струны',
        price: 8990
    },
    {
        id: nanoid(6),
        title: 'Roland TD-17KVX',
        category: 'Ударные',
        description: 'Электронная ударная установка, Bluetooth, USB',
        price: 119990
    },
    {
        id: nanoid(6),
        title: 'Yamaha P-45',
        category: 'Клавишные',
        description: 'Цифровое пианино, 88 молоточковых клавиш',
        price: 45990
    },
    {
        id: nanoid(6),
        title: 'Shure SM58',
        category: 'Микрофоны',
        description: 'Вокальный микрофон, кардиоида',
        price: 12990
    },
    {
        id: nanoid(6),
        title: 'Gibson Les Paul',
        category: 'Гитары',
        description: 'Электрогитара, махагони, хамбакеры',
        price: 189990
    },
    {
        id: nanoid(6),
        title: 'Korg Volca Beats',
        category: 'Синтезаторы',
        description: 'Аналоговый драм-машина',
        price: 13990
    },
    {
        id: nanoid(6),
        title: 'Focusrite Scarlett 2i2',
        category: 'Звуковые карты',
        description: 'USB аудиоинтерфейс, 2 входа',
        price: 15990
    },
    {
        id: nanoid(6),
        title: 'Zildjian A Custom',
        category: 'Тарелки',
        description: 'Набор тарелок',
        price: 45990
    },
    {
        id: nanoid(6),
        title: 'Ibanez SR300',
        category: 'Бас-гитары',
        description: '4-струнная бас-гитара',
        price: 32990
    }
];

// ===========================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ПАРОЛЯМИ
// ===========================================

// Хеширование пароля
async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

// Проверка пароля
async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

// Функция для поиска пользователя по email
function findUserByEmail(email, res) {
    const user = users.find(u => u.email === email);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return null;
    }
    return user;
}

// Функция для поиска товара по ID
function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

// ===========================================
// SWAGGER КОНФИГУРАЦИЯ
// ===========================================

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Music Store API with Authentication',
            version: '2.0.0',
            description: 'API для музыкального магазина с аутентификацией',
            contact: {
                name: 'Разработчик',
                email: 'developer@musicstore.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер'
            }
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Регистрация и вход в систему'
            },
            {
                name: 'Products',
                description: 'Управление товарами'
            }
        ]
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Music Store API with Auth'
}));

// ===========================================
// ДОКУМЕНТАЦИЯ СХЕМ
// ===========================================

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID пользователя
 *           example: "abc123"
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя (логин)
 *           example: "user@example.com"
 *         first_name:
 *           type: string
 *           description: Имя
 *           example: "Иван"
 *         last_name:
 *           type: string
 *           description: Фамилия
 *           example: "Петров"
 *         password:
 *           type: string
 *           description: Пароль (не возвращается в ответах)
 *           example: "qwerty123"
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *           example: "xyz789"
 *         title:
 *           type: string
 *           description: Название товара
 *           example: "Fender Stratocaster"
 *         category:
 *           type: string
 *           description: Категория
 *           example: "Гитары"
 *         description:
 *           type: string
 *           description: Описание
 *           example: "Электрогитара"
 *         price:
 *           type: number
 *           description: Цена
 *           example: 89990
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Error message"
 */

// ===========================================
// АУТЕНТИФИКАЦИЯ (НОВЫЕ МАРШРУТЫ)
// ===========================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ivan@example.com"
 *               first_name:
 *                 type: string
 *                 example: "Иван"
 *               last_name:
 *                 type: string
 *                 example: "Петров"
 *               password:
 *                 type: string
 *                 example: "qwerty123"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *       400:
 *         description: Ошибка валидации или email уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    // Проверка обязательных полей
    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ 
            error: "email, first_name, last_name and password are required" 
        });
    }

    // Проверка, существует ли уже пользователь с таким email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(password);

    // Создаем нового пользователя
    const newUser = {
        id: nanoid(6),
        email: email.toLowerCase(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        hashedPassword: hashedPassword
    };

    users.push(newUser);

    // Отправляем ответ (без пароля)
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ivan@example.com"
 *               password:
 *                 type: string
 *                 example: "qwerty123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверный пароль
 *       404:
 *         description: Пользователь не найден
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await verifyPassword(password, user.hashedPassword);
    
    if (isPasswordValid) {
        res.status(200).json({ 
            success: true,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } else {
        res.status(401).json({ error: "Invalid password" });
    }
});

// ===========================================
// CRUD ДЛЯ ТОВАРОВ (АДАПТИРОВАННЫЙ)
// ===========================================

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создание нового товара
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Новая гитара"
 *               category:
 *                 type: string
 *                 example: "Гитары"
 *               description:
 *                 type: string
 *                 example: "Описание"
 *               price:
 *                 type: number
 *                 example: 15000
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 */
app.post('/api/products', (req, res) => {
    const { title, category, description, price } = req.body;
    
    if (!title || !price) {
        return res.status(400).json({ error: 'Title and price are required' });
    }
    
    const newProduct = {
        id: nanoid(6),
        title: title.trim(),
        category: category || 'Разное',
        description: description || '',
        price: Number(price)
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получение всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получение товара по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Полное обновление товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Обновленный товар
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: "Product not found" });
    }
    
    const { title, category, description, price } = req.body;
    
    if (!title || !price) {
        return res.status(400).json({ error: 'Title and price are required' });
    }
    
    products[productIndex] = {
        id,
        title: title.trim(),
        category: category || products[productIndex].category,
        description: description || products[productIndex].description,
        price: Number(price)
    };
    
    res.json(products[productIndex]);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаление товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар успешно удален
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const initialLength = products.length;
    
    products = products.filter(p => p.id !== id);
    
    if (products.length === initialLength) {
        return res.status(404).json({ error: "Product not found" });
    }
    
    res.status(204).send();
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
    console.log('\n' + '='.repeat(60));
    console.log('🚀 MUSIC STORE API WITH AUTH ЗАПУЩЕН!');
    console.log('='.repeat(60));
    console.log(`📡 API: http://localhost:${port}/api/products`);
    console.log(`🔐 Auth: http://localhost:${port}/api/auth/register | /api/auth/login`);
    console.log(`📚 Swagger: http://localhost:${port}/api-docs`);
    console.log('\n📦 Доступные эндпоинты:');
    console.log('   POST   /api/auth/register    - регистрация');
    console.log('   POST   /api/auth/login       - вход');
    console.log('   POST   /api/products          - создать товар');
    console.log('   GET    /api/products          - все товары');
    console.log('   GET    /api/products/:id      - товар по ID');
    console.log('   PUT    /api/products/:id      - обновить товар');
    console.log('   DELETE /api/products/:id      - удалить товар');
    console.log('='.repeat(60) + '\n');
});