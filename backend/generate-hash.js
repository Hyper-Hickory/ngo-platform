import bcrypt from 'bcryptjs';

const password = 'Admin@123';
const saltRounds = 12;

bcrypt.hash(password, saltRounds).then(hash => {
    console.log('\n===========================================');
    console.log('Password Hash Generated for: Admin@123');
    console.log('===========================================\n');
    console.log(hash);
    console.log('\n===========================================');
    console.log('Run this SQL in Supabase:');
    console.log('===========================================\n');
    console.log(`UPDATE users`);
    console.log(`SET password_hash = '${hash}'`);
    console.log(`WHERE email = 'admin@ngo.com';`);
    console.log('\n===========================================\n');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
