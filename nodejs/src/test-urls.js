const axios = require('axios');

async function testUrls() {
    const urls = [
        'https://gw-fatoora.zatca.gov.sa/ins/gw/registration/1-1/compliance',
        'https://gw-fatoora.zatca.gov.sa/ins/gw/registration/compliance',
        'https://gw-fatoora.zatca.gov.sa/ins/gw/itp/registration/compliance',
        'https://sandbox.zatca.gov.sa/compliance',
        'https://sandbox.zatca.gov.sa/ins/compliance',
        'https://sandbox.zatca.gov.sa/registration/compliance',
        'https://gw-fatoora.zatca.gov.sa/ins/gw/itp/compliance',
    ];

    console.log('--- Testing ZATCA Sandbox URLs ---');

    for (const url of urls) {
        try {
            console.log(`Testing: ${url}`);
            // We use a dummy request to see if we get a 404 or a 400/401/405
            // 405 (Method Not Allowed) or 415 (Unsupported Media Type) or 400 (Bad Request)
            // would mean the URL EXISTS. 404 means it doesn't.
            const response = await axios.post(url, {}, {
                headers: { 'Accept-Version': 'V2' },
                validateStatus: () => true
            });

            console.log(`  Result: ${response.status}`);
            if (response.status !== 404) {
                console.log(`  >>> POTENTIAL MATCH: ${url} (Status ${response.status})`);
            }
        } catch (error) {
            console.log(`  Error: ${error.message}`);
        }
    }
}

testUrls();
