const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// ===========================================
// КОНФИГУРАЦИЯ JWT
// ===========================================

// Секретные ключи (в реальном проекте хранить в .env)
const ACCESS_SECRET = 'music_store_access_secret_2024';
const REFRESH_SECRET = 'music_store_refresh_secret_2024';

// Время жизни токенов
const ACCESS_EXPIRES_IN = '15m';   // Access-токен живет 15 минут
const REFRESH_EXPIRES_IN = '7d';   // Refresh-токен живет 7 дней

// ===========================================
// ХРАНИЛИЩЕ REFRESH-ТОКЕНОВ
// ===========================================
// В реальном проекте хранить в базе данных
const refreshTokens = new Set();

// ===========================================
// MIDDLEWARE
// ===========================================

// Настройка CORS
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Логирование запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            if (req.body && !req.body.password) {
                console.log('Body:', req.body);
            }
        }
    });
    next();
});

// ===========================================
// ДАННЫЕ
// ===========================================

// Пользователи
let users = [
    {
        id: nanoid(6),
        email: 'admin@musicstore.com',
        first_name: 'Admin',
        last_name: 'User',
        hashedPassword: '$2b$10$4nkEW/2p1Wdl9/zf7aJdv.J8e/9Tk32DQ0.QiM8batR4lNutAh876'  // Будет заполнено после генерации
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
// ФУНКЦИИ
// ===========================================

// Хеширование пароля
async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

// Проверка пароля
async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

// Генерация Access-токена
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

// Генерация Refresh-токена
function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email
        },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

// Поиск пользователя по email
function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

// Поиск пользователя по ID
function findUserById(id) {
    return users.find(u => u.id === id);
}

// Поиск товара по ID
function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

// ===========================================
// МИДДЛВЭР ДЛЯ ПРОВЕРКИ ACCESS-ТОКЕНА
// ===========================================

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header. Expected: Bearer <token>"
        });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Access token expired" });
        }
        return res.status(401).json({ error: "Invalid access token" });
    }
}

// ===========================================
// SWAGGER КОНФИГУРАЦИЯ
// ===========================================

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Music Store API with Refresh Tokens',
            version: '3.0.0',
            description: 'API для музыкального магазина с JWT и refresh-токенами'
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Аутентификация' },
            { name: 'Products', description: 'Управление товарами' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Music Store API with Refresh Tokens'
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
 *       properties:
 *         id: { type: string, example: "abc123" }
 *         email: { type: string, example: "user@example.com" }
 *         first_name: { type: string, example: "Иван" }
 *         last_name: { type: string, example: "Петров" }
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken: { type: string, example: "eyJhbGciOiJIUzI1NiIs..." }
 *         refreshToken: { type: string, example: "eyJhbGciOiJIUzI1NiIs..." }
 *     RefreshRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken: { type: string, example: "eyJhbGciOiJIUzI1NiIs..." }
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string, example: "xyz789" }
 *         title: { type: string, example: "Fender Stratocaster" }
 *         category: { type: string, example: "Гитары" }
 *         description: { type: string, example: "Электрогитара" }
 *         price: { type: number, example: 89990 }
 */

// ===========================================
// АУТЕНТИФИКАЦИЯ
// ===========================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, first_name, last_name, password]
 *             properties:
 *               email: { type: string, example: "user@example.com" }
 *               first_name: { type: string, example: "Иван" }
 *               last_name: { type: string, example: "Петров" }
 *               password: { type: string, example: "qwerty123" }
 *     responses:
 *       201: { description: "Пользователь создан" }
 *       400: { description: "Ошибка валидации" }
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({
            error: "email, first_name, last_name and password are required"
        });
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
        id: nanoid(6),
        email: email.toLowerCase(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        hashedPassword: hashedPassword
    };

    users.push(newUser);

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
 *     summary: Вход в систему (возвращает access и refresh токены)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "user@example.com" }
 *               password: { type: string, example: "qwerty123" }
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401: { description: "Неверные данные" }
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    const user = findUserByEmail(email.toLowerCase());
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Генерируем оба токена
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Сохраняем refresh-токен в хранилище
    refreshTokens.add(refreshToken);

    res.json({
        accessToken: accessToken,
        refreshToken: refreshToken
    });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов (получение новой пары access/refresh)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400: { description: "Отсутствует refreshToken" }
 *       401: { description: "Невалидный или истекший refresh-токен" }
 */
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required" });
    }

    // Проверяем, существует ли токен в хранилище
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }

    try {
        // Верифицируем refresh-токен
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        // Находим пользователя
        const user = findUserById(payload.sub);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Удаляем старый refresh-токен (ротация)
        refreshTokens.delete(refreshToken);

        // Генерируем новую пару токенов
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Сохраняем новый refresh-токен
        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            // Удаляем истекший токен из хранилища
            refreshTokens.delete(refreshToken);
            return res.status(401).json({ error: "Refresh token expired" });
        }
        return res.status(401).json({ error: "Invalid refresh token" });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход из системы (удаление refresh-токена)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200: { description: "Успешный выход" }
 *       400: { description: "Отсутствует refreshToken" }
 */
app.post('/api/auth/logout', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required" });
    }

    // Удаляем токен из хранилища
    refreshTokens.delete(refreshToken);

    res.json({ message: "Logged out successfully" });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401: { description: "Не авторизован" }
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = findUserById(userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
    });
});

// ===========================================
// CRUD ДЛЯ ТОВАРОВ (без изменений)
// ===========================================

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создание товара
 *     tags: [Products]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price]
 *             properties:
 *               title: { type: string, example: "Новая гитара" }
 *               category: { type: string, example: "Гитары" }
 *               description: { type: string, example: "Описание" }
 *               price: { type: number, example: 15000 }
 *     responses:
 *       201: { description: "Товар создан" }
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
 *     security: []
 *     responses:
 *       200: { description: "Список товаров" }
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
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Данные товара" }
 *       404: { description: "Товар не найден" }
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
 *     summary: Обновление товара
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price]
 *             properties:
 *               title: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *     responses:
 *       200: { description: "Обновленный товар" }
 *       404: { description: "Товар не найден" }
 */
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }

    const { title, category, description, price } = req.body;

    if (!title || !price) {
        return res.status(400).json({ error: 'Title and price are required' });
    }

    products[index] = {
        id,
        title: title.trim(),
        category: category || products[index].category,
        description: description || products[index].description,
        price: Number(price)
    };

    res.json(products[index]);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаление товара
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: "Товар удален" }
 *       404: { description: "Товар не найден" }
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
    console.log('🚀 MUSIC STORE API WITH REFRESH TOKENS ЗАПУЩЕН!');
    console.log('='.repeat(60));
    console.log(`📡 API: http://localhost:${port}/api/products`);
    console.log(`🔐 Auth:`);
    console.log(`   POST   /api/auth/register  - регистрация`);
    console.log(`   POST   /api/auth/login     - вход (возвращает access + refresh)`);
    console.log(`   POST   /api/auth/refresh   - обновление токенов`);
    console.log(`   POST   /api/auth/logout    - выход (удаление refresh)`);
    console.log(`   GET    /api/auth/me        - текущий пользователь`);
    console.log(`⏱️  Access токен живет: ${ACCESS_EXPIRES_IN}`);
    console.log(`⏱️  Refresh токен живет: ${REFRESH_EXPIRES_IN}`);
    console.log(`📚 Swagger: http://localhost:${port}/api-docs`);
    console.log('='.repeat(60) + '\n');
});