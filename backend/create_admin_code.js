const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const VerificationCode = require('./models/VerificationCode');

dotenv.config({ path: path.join(__dirname, '.env') });

const createAdminCode = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const code = 'MEC-ADMIN-2024';
        
        // Remove any existing one first to be sure
        await VerificationCode.deleteMany({ code: code });

        await VerificationCode.create({
            code: code,
            type: 'admin_registration',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            used: false
        });

        console.log(`Verification code created: ${code}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdminCode();
