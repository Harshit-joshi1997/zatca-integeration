const fs = require('fs');
const crypto = require('crypto');

function verifyHash() {
    const jsonPath = 'd:/zatca_app/Apps/standard-clearance-request.json';
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const invoiceBase64 = json.invoice;
    const providedHash = json.invoiceHash;

    // Decode base64 to binary
    const binaryContent = Buffer.from(invoiceBase64, 'base64');

    // Calculate SHA-256 hash
    const calculatedHash = crypto.createHash('sha256').update(binaryContent).digest('base64');

    console.log('--- Hash Verification ---');
    console.log('Provided Hash:  ', providedHash);
    console.log('Calculated Hash:', calculatedHash);
    console.log('Match:          ', providedHash === calculatedHash ? '✅ YES' : '❌ NO');
}

verifyHash();
