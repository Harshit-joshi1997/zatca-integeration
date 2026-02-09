const ZatcaService = require('./zatca-service');
const path = require('path');

/**
 * CLI tool to validate a ZATCA invoice XML
 * Usage: node src/validate-invoice.js <path_to_invoice>
 */
async function validateInvoice() {
    const invoicePath = process.argv[2];

    if (!invoicePath) {
        console.log('\n--- ZATCA Invoice Validator ---');
        console.log('Usage: node src/validate-invoice.js <path_to_invoice>');
        console.log('Example: node src/validate-invoice.js ../Data/Samples/Simplified/Invoice/Simplified_Invoice.xml\n');
        process.exit(1);
    }

    const zatca = new ZatcaService();
    const absolutePath = path.resolve(process.cwd(), invoicePath);

    console.log(`[${new Date().toISOString()}] Starting validation for: ${path.basename(absolutePath)}`);
    console.log('-'.repeat(80));

    try {
        const result = await zatca.validate(absolutePath);

        // Final Summary based on SDK output
        if (result.includes('GLOBAL VALIDATION RESULT = PASSED')) {
            console.log('\n' + '='.repeat(80));
            console.log(`[${new Date().toISOString()}] ✅ VALIDATION SUCCESSFUL!`);
            console.log('='.repeat(80));
        } else {
            console.log('\n' + '='.repeat(80));
            console.log(`[${new Date().toISOString()}] ❌ VALIDATION FAILED!`);
            console.log('='.repeat(80));
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n[${new Date().toISOString()}] ERROR during validation:`);
        console.error(error.message);
        process.exit(1);
    }
}

validateInvoice();
