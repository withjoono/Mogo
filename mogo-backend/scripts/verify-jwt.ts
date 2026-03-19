
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(__dirname, '../.env') });

const secret = process.env.AUTH_SECRET;
console.log('Loaded AUTH_SECRET:', secret ? 'Yes' : 'No');
console.log('Secret value (first 10 chars):', secret?.substring(0, 10));

if (!secret) {
    console.error('Error: AUTH_SECRET is missing');
    process.exit(1);
}

// Decode Secret
const secretBuffer = Buffer.from(secret, 'base64');
console.log('Secret Buffer Length:', secretBuffer.length);
console.log('Secret Buffer (Hex):', secretBuffer.toString('hex').substring(0, 20) + '...');

// Create Token
const payload = {
    sub: 'ATK',
    jti: 123,
    permissions: {},
};

console.log('Signing token with HS512...');
const token = jwt.sign(payload, secretBuffer, {
    expiresIn: '1h',
    algorithm: 'HS512',
});

console.log('Generated Token:', token);

// Verify Token
console.log('Verifying token...');
try {
    const decoded = jwt.verify(token, secretBuffer, {
        algorithms: ['HS512'],
    });
    console.log('✅ Verification Successful!');
    console.log('Decoded Payload:', decoded);
} catch (error) {
    console.error('❌ Verification Failed:', error.message);
}
