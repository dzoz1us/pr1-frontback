const bcrypt = require('bcrypt');

async function createTestUser() {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('='.repeat(60));
    console.log('🔐 ТЕСТОВЫЙ ПОЛЬЗОВАТЕЛЬ');
    console.log('='.repeat(60));
    console.log('📧 Email:    admin@musicstore.com');
    console.log('🔑 Password: admin123');
    console.log('='.repeat(60));
    console.log('📝 Скопируйте этот хеш в массив users в app.js:');
    console.log(hashedPassword);
    console.log('='.repeat(60));
}

createTestUser();