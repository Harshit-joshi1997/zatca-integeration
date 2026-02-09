const ZatcaService = require('./zatca-service');
const path = require('path');
const fs = require('fs');

/**
 * Script to generate a new CSR and Private Key for ZATCA
 */
async function generateNewCredentials() {
    const zatca = new ZatcaService();

    // Paths
    const configPath = path.join(__dirname, '../../Data/Input/csr-config-template.properties');
    const privateKeyPath = path.join(__dirname, '../../Output/Certificates/new-private-key.pem');
    const csrPath = path.join(__dirname, '../../Output/Certificates/new-taxpayer.csr');

    // Ensure directory exists
    const certDir = path.dirname(privateKeyPath);
    if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
    }

    try {
        console.log('--- ZATCA Credential Generation ---');
        console.log(`Using config: ${configPath}`);

        const csrContent = await zatca.generateCSR(configPath, privateKeyPath, csrPath);

        // Save as JSON for Compliance API
        const jsonRequestPath = path.join(__dirname, '../../Output/JSON_Requests/compliance-request.json');
        const jsonContent = {
            csr: Buffer.from(csrContent).toString('base64'),
            otp: "123456" // Placeholder OTP
        };
        fs.writeFileSync(jsonRequestPath, JSON.stringify(jsonContent, null, 4));

        console.log('\nSUCCESS!');
        console.log(`New Private Key: ${privateKeyPath}`);
        console.log(`New CSR: ${csrPath}`);
        console.log(`Compliance Request JSON: ${jsonRequestPath}`);
        console.log('\n--- CSR CONTENT START ---');
        console.log(csrContent);
        console.log('--- CSR CONTENT END ---');
        console.log('\nNext Step: Replace "123456" in output json with real OTP from Fatoora Portal.');

    } catch (error) {
        console.error('\nFAILED to generate credentials:');
        console.error(error.message);
        process.exit(1);
    }
}

generateNewCredentials();
