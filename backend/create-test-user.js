const bcrypt = require('bcrypt');

async function createTestUser() {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Тестовый пользователь:');
    console.log('Email: admin@musicstore.com');
    console.log('Password: admin123');
    console.log('Hashed password for code:');
    console.log(hashedPassword);
}

createTestUser();