const { encodeInvoiceToBase64 } = require('./cleared-invoice-utils');
const path = require('path');

/**
 * CLI tool to encode a ZATCA invoice XML to Base64
 * Usage: node src/encode-invoice.js <path_to_invoice>
 */
async function run() {
    const invoicePath = process.argv[2];

    if (!invoicePath) {
        console.log('\n--- ZATCA Base64 Encoder ---');
        console.log('Usage: node src/encode-invoice.js <path_to_invoice>');
        console.log('Example: node src/encode-invoice.js ../Data/Samples/Simplified/Invoice/Simplified_Invoice.xml\n');
        process.exit(1);
    }

    try {
        const absolutePath = path.resolve(process.cwd(), invoicePath);
        const base64 = await encodeInvoiceToBase64(absolutePath);

        console.log('\n--- BASE64 ENCODED INVOICE ---');
        console.log(base64);
        console.log('-------------------------------\n');
        console.log('✓ Success! You can copy the code above for your API request.');

    } catch (error) {
        console.error('\n❌ ERROR encoding invoice:');
        console.error(error.message);
        process.exit(1);
    }
}

run();
