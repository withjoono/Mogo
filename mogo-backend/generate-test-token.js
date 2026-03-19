// JWT 테스트 토큰 생성 스크립트
const jwt = require('jsonwebtoken');

// ExamHub의 AUTH_SECRET과 동일해야 함
const AUTH_SECRET = process.env.AUTH_SECRET || '04ca023b39512e46d0c2cf4b48d5aac61d34302994c87ed4eff225dcf3b0a218739f3897051a057f9b846a69ea2927a587044164b7bae5e1306219d50b588cb1';

// 테스트 토큰 1: Premium 플랜 (모든 권한)
const premiumToken = jwt.sign(
  {
    sub: 'test-user-1',
    jti: '12345',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24시간
    email: 'premium@test.com',
    permissions: {
      examhub: {
        plan: 'premium',
        expires: '2027-12-31T23:59:59Z',
        features: ['mock-exam', 'analysis', 'prediction', 'statistics', 'export']
      }
    }
  },
  AUTH_SECRET,
  { algorithm: 'HS512' }
);

// 테스트 토큰 2: Basic 플랜 (제한된 권한)
const basicToken = jwt.sign(
  {
    sub: 'test-user-2',
    jti: '12346',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24시간
    email: 'basic@test.com',
    permissions: {
      examhub: {
        plan: 'basic',
        expires: '2027-12-31T23:59:59Z',
        features: ['mock-exam']
      }
    }
  },
  AUTH_SECRET,
  { algorithm: 'HS512' }
);

// 테스트 토큰 3: Free 플랜 (권한 없음)
const freeToken = jwt.sign(
  {
    sub: 'test-user-3',
    jti: '12347',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24시간
    email: 'free@test.com',
    permissions: {
      examhub: {
        plan: 'free',
        features: []
      }
    }
  },
  AUTH_SECRET,
  { algorithm: 'HS512' }
);

// 테스트 토큰 4: ExamHub 권한 없음
const noPermissionToken = jwt.sign(
  {
    sub: 'test-user-4',
    jti: '12348',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24시간
    email: 'noperm@test.com',
    permissions: {}
  },
  AUTH_SECRET,
  { algorithm: 'HS512' }
);

console.log('='.repeat(80));
console.log('ExamHub SSO 테스트 토큰');
console.log('='.repeat(80));
console.log('');

console.log('1. Premium 플랜 (모든 권한):');
console.log(premiumToken);
console.log('');

console.log('2. Basic 플랜 (mock-exam만):');
console.log(basicToken);
console.log('');

console.log('3. Free 플랜 (권한 없음):');
console.log(freeToken);
console.log('');

console.log('4. ExamHub 권한 없음:');
console.log(noPermissionToken);
console.log('');

console.log('='.repeat(80));
console.log('테스트 방법:');
console.log('='.repeat(80));
console.log('');
console.log('PowerShell에서:');
console.log('$TOKEN = "위의 토큰"');
console.log('Invoke-RestMethod -Uri "http://localhost:4003/api/mock-exams/test/detailed" -Headers @{"Authorization"="Bearer $TOKEN"}');
console.log('');
console.log('curl에서:');
console.log('curl -H "Authorization: Bearer <TOKEN>" http://localhost:4003/api/mock-exams/test/detailed');
console.log('');
