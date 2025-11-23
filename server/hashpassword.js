// server/hashPassword.js
const bcrypt = require('bcryptjs');

const plainPassword = 'AdminPU@2024!';

// Generate a salt and then hash the password
bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(plainPassword, salt, (err, hash) => {
        if (err) throw err;
        console.log('--- YOUR NEW ADMIN PASSWORD HASH ---');
        console.log(hash);
        console.log('------------------------------------');
        console.log(`Use this hash in MongoDB for the password: "${plainPassword}"`);
    });
});