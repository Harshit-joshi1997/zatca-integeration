const ZatcaService = require('./src/zatca-service');
const InvoiceBuilder = require('./src/invoice-builder');
const { decodeClearedInvoice, extractQRCode } = require('./src/cleared-invoice-utils');
const { generatePDF } = require('./src/pdf-generator');
const path = require('path');

/**
 * Complete ZATCA workflow example
 */
async function main() {
    console.log('='.repeat(60));
    console.log('   ZATCA E-Invoicing - Node.js Integration');
    console.log('='.repeat(60));
    console.log();

    try {
        const zatca = new ZatcaService();

        // Example 1: Use SDK's working sample invoice
        console.log('Example 1: Testing with SDK sample invoice...');
        console.log('-'.repeat(60));

        // Use the SDK's pre-signed sample invoice
        const sampleInvoicePath = path.join(__dirname, '../Data/Samples/Simplified/Invoice/Simplified_Invoice.xml');

        console.log('Using sample invoice:', sampleInvoicePath);

        // Validate the sample (already signed)
        console.log('\n1. Validating sample invoice...');
        await zatca.signAndValidate(sampleInvoicePath);

        // Generate QR code (should work with sample)
        console.log('\n2. Generating QR code...');
        await zatca.generateQR(sampleInvoicePath);

        // Generate API request
        console.log('\n3. Generating API request...');
        const requestPath = path.join(__dirname, '../Apps/sample-request.json');
        const apiRequest = await zatca.generateInvoiceRequest(sampleInvoicePath, requestPath);

        console.log('\n✓ Sample invoice processed successfully!');
        console.log('✓ QR code generated');
        console.log('✓ API request ready at:', requestPath);
        console.log();

        // Example 2: Create your own invoice (for reference)
        console.log('Example 2: Creating custom invoice template...');
        console.log('-'.repeat(60));

        const invoice = new InvoiceBuilder();
        invoice
            .setInvoiceId('INV-2024-001')
            .setSellerName('Your Company Name LTD')
            .setSellerVatNumber('300000000000003')
            .setSellerAddress('King Fahd Road, Riyadh')
            .setTotalAmount(1000.00);

        const customInvoicePath = path.join(__dirname, '../Data/Input/my-invoice.xml');
        await invoice.saveToFile(customInvoicePath);

        console.log('✓ Custom invoice template created');
        console.log('  Note: To sign this, you need production certificates');
        console.log('  See CertificateSetup.md for certificate setup');
        console.log();

        // Example 3: Process cleared invoice (when you have one)
        console.log('Example 3: Processing cleared invoice...');
        console.log('-'.repeat(60));
        console.log('To process a cleared invoice from ZATCA:');
        console.log('1. Uncomment the code below');
        console.log('2. Replace clearedBase64 with your actual response');
        console.log('3. Run: npm start');
        console.log();
        console.log('Example code:');
        console.log('  const clearedBase64 = response.data.clearedInvoice;');
        console.log('  await decodeClearedInvoice(clearedBase64, "cleared.xml");');
        console.log('  await generatePDF("cleared.xml", "invoice.pdf");');
        console.log();

        console.log('='.repeat(60));
        console.log('   Workflow Complete!');
        console.log('='.repeat(60));
        console.log();
        console.log('Next steps:');
        console.log('1. Check Apps/sample-request.json for API payload');
        console.log('2. Submit to ZATCA using Postman or axios');
        console.log('3. Process the cleared invoice response');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { ZatcaService, InvoiceBuilder, decodeClearedInvoice, generatePDF };
