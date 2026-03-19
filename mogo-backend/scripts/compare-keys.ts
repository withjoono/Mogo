
const hubSecretHex = '04ca023b39512e46d0c2cf4b48d5aac61d34302994c87ed4eff225dcf3b0a218739f3897051a057f9b846a69ea2927a587044164b7bae5e1306219d50b588cb1';
const susiSecretBase64 = 'AIetry5Dr+7rPJBj01hYdoKT0gxBk28JD8PPJVEQSa4MBnPGMAwH7tkSUx0BLaBRSysleQlcuSXLLeox0nVhTg==';

console.log('Comparing Secrets...');

// 1. Check if Hex string -> Buffer -> Base64 matches Susi
try {
    const bufferFromHex = Buffer.from(hubSecretHex, 'hex');
    const base64FromHex = bufferFromHex.toString('base64');
    console.log('Hub Hex -> Base64:', base64FromHex);
    console.log('Matches Susi?', base64FromHex === susiSecretBase64);
} catch (e) {
    console.error('Error converting hex:', e);
}

// 2. Check if Hub code (Buffer.from(hex, 'base64')) matches Susi (Buffer.from(base64, 'base64'))
try {
    const hubKeyInCode = Buffer.from(hubSecretHex, 'base64');
    const susiKeyInCode = Buffer.from(susiSecretBase64, 'base64');
    console.log('Hub Code Key (Hex as Base64) matches Susi Code Key?', hubKeyInCode.equals(susiKeyInCode));
} catch (e) { console.log(e); }
