const bcrypt = require('bcrypt');

async function createDifferentUsers() {
    // Разные пароли для разных ролей
    const adminPass = 'admin123';
    const sellerPass = 'seller123';
    const userPass = 'user123';
    
    // Генерируем разные хеши
    const adminHash = await bcrypt.hash(adminPass, 10);
    const sellerHash = await bcrypt.hash(sellerPass, 10);
    const userHash = await bcrypt.hash(userPass, 10);
    
    console.log('='.repeat(60));
    console.log('🔐 ВСТАВЬТЕ ЭТИ ДАННЫЕ В МАССИВ users:');
    console.log('='.repeat(60));
    console.log(`
let users = [
    {
        id: nanoid(6),
        email: 'admin@musicstore.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        isActive: true,
        hashedPassword: '${adminHash}'
    },
    {
        id: nanoid(6),
        email: 'seller@musicstore.com',
        first_name: 'Seller',
        last_name: 'User',
        role: 'seller',
        isActive: true,
        hashedPassword: '${sellerHash}'
    },
    {
        id: nanoid(6),
        email: 'user@musicstore.com',
        first_name: 'Regular',
        last_name: 'User',
        role: 'user',
        isActive: true,
        hashedPassword: '${userHash}'
    }
];
    `);
    console.log('='.repeat(60));
    console.log('📋 ПАРОЛИ ДЛЯ ВХОДА:');
    console.log('   admin@musicstore.com  →  admin123');
    console.log('   seller@musicstore.com →  seller123');
    console.log('   user@musicstore.com   →  user123');
    console.log('='.repeat(60));
}

createDifferentUsers();