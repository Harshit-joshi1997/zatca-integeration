const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Automate Step 1 of ZATCA Onboarding (Submitting CSR)
 */
async function onboard() {
    const otp = process.argv[2];
    if (!otp) {
        console.log('\n--- ZATCA ONBOARDING (Step 1) ---');
        console.log('Usage: node src/onboard.js <6-DIGIT_OTP>');
        console.log('Example: node src/onboard.js 123456\n');
        process.exit(1);
    }

    // Use the newly generated CSR
    const csrPath = path.join(__dirname, '../../Output/Certificates/new-taxpayer.csr');

    if (!fs.existsSync(csrPath)) {
        console.error(`Error: CSR file not found at ${csrPath}`);
        process.exit(1);
    }

    const csrFile = fs.readFileSync(csrPath, 'utf8');

    // Clean up CSR: Remove headers/footers and newlines for JSON payload
    const csr = csrFile
        .replace('-----BEGIN CERTIFICATE REQUEST-----', '')
        .replace('-----END CERTIFICATE REQUEST-----', '')
        .replace(/\r?\n|\r/g, '')
        .trim();

    try {
        console.log('Submitting CSR to ZATCA Sandbox API...');

        // ZATCA API Endpoints
        // Option 1: Developer Portal (Sandbox) - Use this for initial testing
        const apiUrl = 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance';

        // Option 2: Simulation Environment (Fatoora Portal) - Use this for "Simulation" testing
        // const apiUrl = 'https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/compliance';

        // Option 3: Production Environment (Live)
        // const apiUrl = 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core/compliance';

        console.log(`URL: ${apiUrl}`);
        console.log(`Headers: Accept-Version: V2, OTP: ${otp}`);

        const response = await axios.post(apiUrl,
            { csr: csr },
            {
                headers: {
                    'Accept-Version': 'V2',
                    'Accept-Language': 'en',
                    'Accept': 'application/json',
                    'OTP': otp,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('\n✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('\nRESPONSE DATA:');
        console.log(JSON.stringify(response.data, null, 2));

        // Save the Compliance CSID to file
        const csidPath = path.join(__dirname, '../../Output/Certificates/compliance-csid.json');
        fs.writeFileSync(csidPath, JSON.stringify(response.data, null, 4));
        console.log(`\nCredentials saved to: ${csidPath}`);

        console.log('\n---------------------------------------------------------');
        console.log('IMPORTANT: Use the "binarySecurityToken" and "secret" from');
        console.log(csidPath);
        console.log('to Request the Production CSID (Step 2).');
        console.log('---------------------------------------------------------');

    } catch (error) {
        console.log('\n❌ FAILED');
        if (error.response) {
            console.log('Status Code:', error.response.status);
            console.log('Error Message:', error.response.data);

            if (error.response.status === 400) {
                console.log('\nTIP: This usually means the OTP is expired or the CSR content is invalid.');
            }
        } else {
            console.log('Error Details:', error.message);
        }
    }
}

onboard();
