const express = require('express');
const { nanoid } = require('nanoid');
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

// ===== ДАННЫЕ =====
let products = [
    {
        id: nanoid(6),
        name: 'Fender Stratocaster',
        category: 'Гитары',
        description: 'Электрогитара, корпус ольха, гриф клен, 3 сингла',
        price: 89990,
        stock: 5,
        rating: 4.9
    },
    {
        id: nanoid(6),
        name: 'Yamaha C40',
        category: 'Гитары',
        description: 'Классическая гитара, для начинающих, нейлоновые струны',
        price: 8990,
        stock: 15,
        rating: 4.7
    },
    {
        id: nanoid(6),
        name: 'Roland TD-17KVX',
        category: 'Ударные',
        description: 'Электронная ударная установка, Bluetooth, USB',
        price: 119990,
        stock: 3,
        rating: 4.8
    },
    {
        id: nanoid(6),
        name: 'Yamaha P-45',
        category: 'Клавишные',
        description: 'Цифровое пианино, 88 молоточковых клавиш',
        price: 45990,
        stock: 7,
        rating: 4.8
    },
    {
        id: nanoid(6),
        name: 'Shure SM58',
        category: 'Микрофоны',
        description: 'Вокальный микрофон, кардиоида, легендарный звук',
        price: 12990,
        stock: 20,
        rating: 4.9
    },
    {
        id: nanoid(6),
        name: 'Gibson Les Paul',
        category: 'Гитары',
        description: 'Электрогитара, махагони, хамбакеры, винтажный звук',
        price: 189990,
        stock: 2,
        rating: 5.0
    },
    {
        id: nanoid(6),
        name: 'Korg Volca Beats',
        category: 'Синтезаторы',
        description: 'Аналоговый драм-машина, секвенсор 16 шагов',
        price: 13990,
        stock: 8,
        rating: 4.5
    },
    {
        id: nanoid(6),
        name: 'Focusrite Scarlett 2i2',
        category: 'Звуковые карты',
        description: 'USB аудиоинтерфейс, 2 входа, 48V фантомное питание',
        price: 15990,
        stock: 12,
        rating: 4.7
    },
    {
        id: nanoid(6),
        name: 'Zildjian A Custom',
        category: 'Тарелки',
        description: 'Набор тарелок: 14" хай-хэт, 16" и 18" крэш, 20" райд',
        price: 45990,
        stock: 4,
        rating: 4.8
    },
    {
        id: nanoid(6),
        name: 'Ibanez SR300',
        category: 'Бас-гитары',
        description: '4-струнная бас-гитара, активные звукосниматели',
        price: 32990,
        stock: 6,
        rating: 4.6
    }
];

// Функция-помощник для поиска товара
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

// Описание основного API
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Music Store API',
            version: '1.0.0',
            description: 'API для управления музыкальными инструментами в интернет-магазине',
            contact: {
                name: 'Разработчик',
                email: 'developer@musicstore.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер разработки'
            }
        ],
        tags: [
            {
                name: 'Products',
                description: 'Операции с товарами (музыкальными инструментами)'
            }
        ]
    },
    // Путь к файлам, в которых мы будем писать JSDoc-комментарии
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Music Store API Documentation'
}));

// ===========================================
// ДОКУМЕНТАЦИЯ СХЕМ
// ===========================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара (генерируется автоматически)
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: Название музыкального инструмента
 *           example: "Fender Stratocaster"
 *         category:
 *           type: string
 *           description: Категория инструмента
 *           example: "Гитары"
 *         description:
 *           type: string
 *           description: Подробное описание инструмента
 *           example: "Электрогитара, корпус ольха, гриф клен, 3 сингла"
 *         price:
 *           type: number
 *           description: Цена в рублях
 *           example: 89990
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *           example: 5
 *         rating:
 *           type: number
 *           format: float
 *           description: Рейтинг товара (0-5)
 *           example: 4.9
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Сообщение об ошибке
 *           example: "Product not found"
 */

// ===========================================
// CRUD ОПЕРАЦИИ С ДОКУМЕНТАЦИЕЙ
// ===========================================

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создание нового товара
 *     tags: [Products]
 *     description: Добавляет новый музыкальный инструмент в каталог
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название инструмента
 *                 example: "Fender Stratocaster"
 *               category:
 *                 type: string
 *                 description: Категория
 *                 example: "Гитары"
 *               description:
 *                 type: string
 *                 description: Описание
 *                 example: "Электрогитара, корпус ольха"
 *               price:
 *                 type: number
 *                 description: Цена
 *                 example: 89990
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *                 example: 5
 *               rating:
 *                 type: number
 *                 description: Рейтинг
 *                 example: 4.9
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации (не указаны обязательные поля)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock, rating } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ 
            error: 'Название и цена обязательны' 
        });
    }
    
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category || 'Разное',
        description: description || 'Описание отсутствует',
        price: Number(price),
        stock: Number(stock) || 0,
        rating: Number(rating) || 0
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
 *     description: Возвращает список всех музыкальных инструментов в каталоге
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
 *     description: Возвращает информацию о конкретном музыкальном инструменте
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Уникальный ID товара
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *   patch:
 *     summary: Обновление товара
 *     tags: [Products]
 *     description: Обновляет информацию о музыкальном инструменте
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара для обновления
 *         example: "abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Новое название
 *                 example: "Fender Stratocaster Deluxe"
 *               category:
 *                 type: string
 *                 description: Новая категория
 *                 example: "Электрогитары"
 *               description:
 *                 type: string
 *                 description: Новое описание
 *               price:
 *                 type: number
 *                 description: Новая цена
 *                 example: 94990
 *               stock:
 *                 type: integer
 *                 description: Новое количество
 *                 example: 8
 *               rating:
 *                 type: number
 *                 description: Новый рейтинг
 *                 example: 4.8
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.patch('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Nothing to update" });
    }
    
    const { name, category, description, price, stock, rating } = req.body;
    
    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);
    
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаление товара
 *     tags: [Products]
 *     description: Удаляет музыкальный инструмент из каталога
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара для удаления
 *         example: "abc123"
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const exists = products.some(p => p.id === id);
    
    if (!exists) {
        return res.status(404).json({ error: "Product not found" });
    }
    
    products = products.filter(p => p.id !== id);
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
    console.log('🚀 MUSIC STORE API ЗАПУЩЕН!');
    console.log('='.repeat(60));
    console.log(`📡 API: http://localhost:${port}/api/products`);
    console.log(`📚 Swagger документация: http://localhost:${port}/api-docs`);
    console.log(`🔑 Используется nanoid для ID`);
    console.log('\n📦 Доступные эндпоинты:');
    console.log('   GET    /api/products');
    console.log('   GET    /api/products/:id');
    console.log('   POST   /api/products');
    console.log('   PATCH  /api/products/:id');
    console.log('   DELETE /api/products/:id');
    console.log('='.repeat(60) + '\n');
});