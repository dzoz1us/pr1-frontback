const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// ===========================================
// КОНФИГУРАЦИЯ JWT
// ===========================================
const ACCESS_SECRET = 'music_store_access_secret_2024';
const REFRESH_SECRET = 'music_store_refresh_secret_2024';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// ===========================================
// ХРАНИЛИЩЕ REFRESH-ТОКЕНОВ
// ===========================================
const refreshTokens = new Set();

// ===========================================
// MIDDLEWARE
// ===========================================
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Логирование
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
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
        role: 'admin',
        isActive: true,
        hashedPassword: '$2b$10$2tCgsY0oINcJU14Dpab6w.GRurhDRZMKrb31KDFYc1eylGwseSS/.' // admin123
    },
    {
        id: nanoid(6),
        email: 'seller@musicstore.com',
        first_name: 'Seller',
        last_name: 'User',
        role: 'seller',
        isActive: true,
        hashedPassword: '$2b$10$k3Mcy.rVq7tdNjUUuFMS9uNQPJctGPMvE.zbtT44pj5ns0.khIWpS' // seller123
    },
    {
        id: nanoid(6),
        email: 'user@musicstore.com',
        first_name: 'Regular',
        last_name: 'User',
        role: 'user',
        isActive: true,
        hashedPassword: '$2b$10$ruDILEAgJez8HThij28u3uszL3YPHiyLb9o.xYQQWFgfzHRkgbh72' // user123
    }
];

// Товары
let products = [
    {
        id: nanoid(6),
        title: 'Fender Stratocaster',
        category: 'Гитары',
        description: 'Электрогитара, корпус ольха, гриф клен',
        price: 89990
    },
    {
        id: nanoid(6),
        title: 'Yamaha C40',
        category: 'Гитары',
        description: 'Классическая гитара',
        price: 8990
    },
    {
        id: nanoid(6),
        title: 'Roland TD-17KVX',
        category: 'Ударные',
        description: 'Электронная ударная установка',
        price: 119990
    },
    {
        id: nanoid(6),
        title: 'Yamaha P-45',
        category: 'Клавишные',
        description: 'Цифровое пианино',
        price: 45990
    },
    {
        id: nanoid(6),
        title: 'Shure SM58',
        category: 'Микрофоны',
        description: 'Вокальный микрофон',
        price: 12990
    }
];

// ===========================================
// ФУНКЦИИ
// ===========================================

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

function findUserById(id) {
    return users.find(u => u.id === id);
}

function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

// ===========================================
// MIDDLEWARE ДЛЯ ПРОВЕРКИ РОЛЕЙ
// ===========================================

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied. Insufficient permissions" });
        }
        next();
    };
}

// ===========================================
// API АУТЕНТИФИКАЦИИ
// ===========================================

// POST /api/auth/register - регистрация (Гость)
app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
        id: nanoid(6),
        email: email.toLowerCase(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: 'user',
        isActive: true,
        hashedPassword: hashedPassword
    };

    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role
    });
});

// POST /api/auth/login - вход (Гость)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const user = findUserByEmail(email.toLowerCase());
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    if (!user.isActive) {
        return res.status(403).json({ error: "Account is blocked" });
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    res.json({ accessToken, refreshToken });
});

// POST /api/auth/refresh - обновление токенов (Гость)
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required" });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = findUserById(payload.sub);

        if (!user || !user.isActive) {
            return res.status(401).json({ error: "User not found or blocked" });
        }

        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
});

// GET /api/auth/me - текущий пользователь (Пользователь)
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = findUserById(req.user.sub);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

// ===========================================
// API УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ (только Администратор)
// ===========================================

// GET /api/users - список всех пользователей (Администратор)
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const usersList = users.map(u => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        isActive: u.isActive
    }));
    res.json(usersList);
});

// GET /api/users/:id - получить пользователя по ID (Администратор)
app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

// PUT /api/users/:id - обновить пользователя (Администратор)
app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const { first_name, last_name, role, isActive, password } = req.body;

    if (first_name) user.first_name = first_name.trim();
    if (last_name) user.last_name = last_name.trim();
    if (role && ['admin', 'seller', 'user'].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.hashedPassword = await hashPassword(password);

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

// DELETE /api/users/:id - заблокировать пользователя (Администратор)
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Нельзя заблокировать самого себя
    if (user.id === req.user.sub) {
        return res.status(400).json({ error: "Cannot block yourself" });
    }

    user.isActive = false;
    res.json({ message: "User blocked successfully", user: { id: user.id, email: user.email, isActive: false } });
});

// ===========================================
// API УПРАВЛЕНИЯ ТОВАРАМИ
// ===========================================

// POST /api/products - создать товар (Продавец, Администратор)
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
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

// GET /api/products - все товары (Пользователь, Продавец, Администратор)
app.get('/api/products', authMiddleware, (req, res) => {
    res.json(products);
});

// GET /api/products/:id - товар по ID (Пользователь, Продавец, Администратор)
app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});

// PUT /api/products/:id - обновить товар (Продавец, Администратор)
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
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

// DELETE /api/products/:id - удалить товар (Администратор)
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
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

// Обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 MUSIC STORE API WITH RBAC ЗАПУЩЕН!');
    console.log('='.repeat(60));
    console.log(`📡 API: http://localhost:${port}/api/products`);
    console.log(`👥 Роли: admin, seller, user`);
    console.log('');
    console.log('📋 ДОСТУПНЫЕ МАРШРУТЫ:');
    console.log('');
    console.log('🔐 АУТЕНТИФИКАЦИЯ (Гость):');
    console.log('   POST   /api/auth/register  - регистрация');
    console.log('   POST   /api/auth/login     - вход');
    console.log('   POST   /api/auth/refresh   - обновление токенов');
    console.log('   GET    /api/auth/me        - текущий пользователь');
    console.log('');
    console.log('👥 ПОЛЬЗОВАТЕЛИ (Администратор):');
    console.log('   GET    /api/users          - список пользователей');
    console.log('   GET    /api/users/:id      - пользователь по ID');
    console.log('   PUT    /api/users/:id      - обновить пользователя');
    console.log('   DELETE /api/users/:id      - заблокировать пользователя');
    console.log('');
    console.log('🎸 ТОВАРЫ:');
    console.log('   POST   /api/products       - создать (seller, admin)');
    console.log('   GET    /api/products       - все (user, seller, admin)');
    console.log('   GET    /api/products/:id   - по ID (user, seller, admin)');
    console.log('   PUT    /api/products/:id   - обновить (seller, admin)');
    console.log('   DELETE /api/products/:id   - удалить (admin)');
    console.log('='.repeat(60) + '\n');
});