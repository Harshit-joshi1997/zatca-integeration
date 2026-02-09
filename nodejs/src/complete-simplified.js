const ZatcaService = require('./zatca-service');
const { encodeInvoiceToBase64, decodeClearedInvoice } = require('./cleared-invoice-utils');
const generatePDF = require('./generate-pdf');
const path = require('path');
const fs = require('fs').promises;

async function runSimplified() {
    const zatca = new ZatcaService();
    const timestamp = () => `[${new Date().toISOString()}]`;
    const sampleInvoice = path.join(__dirname, '../../Data/Samples/Simplified/Invoice/Simplified_Invoice.xml');

    console.log('='.repeat(80));
    console.log('   ZATCA WORKFLOW: SIMPLIFIED INVOICE (REPORTING)');
    console.log('='.repeat(80));

    try {
        console.log(`\n${timestamp()} STEP 1: PRE-VALIDATION`);
        await zatca.executeCommand(['-validate', '-invoice', sampleInvoice]);

        console.log(`\n${timestamp()} STEP 2: GENERATING SIGNED REQUEST & QR`);
        const jsonPath = path.join(__dirname, '../../Output/JSON_Requests/simplified-request.json');
        const apiRequest = await zatca.generateInvoiceRequest(sampleInvoice, jsonPath);

        console.log(`\n${timestamp()} STEP 3: EXTRACTING CONSISTENT BASE64`);
        // We use the base64 from the JSON to ensure it matches the hash/signature exactly
        const base64ForApi = apiRequest.invoice;
        console.log(`${timestamp()} ✅ Extracted Base64 from JSON (length: ${base64ForApi.length})`);

        console.log(`\n${timestamp()} STEP 4: GENERATING SIGNED PDF`);
        const signedXmlPath = path.join(__dirname, '../../Output/Simplified_Invoices/simplified_signed_final.xml');
        // Save the signed XML so we can generate PDF from it
        await decodeClearedInvoice(base64ForApi, signedXmlPath);

        const pdfPath = path.join(__dirname, '../../Output/Simplified_Invoices/simplified_invoice.pdf');
        await generatePDF(signedXmlPath, pdfPath);

        console.log('\n' + '='.repeat(80));
        console.log(`${timestamp()} 🏆 SIMPLIFIED FLOW COMPLETE!`);
        console.log('NEXT: Submit the JSON in "Output/JSON_Requests/simplified-request.json" to /reporting API');
        console.log(`PDF Copy: ${pdfPath}`);
        console.log('='.repeat(80));

    } catch (error) {
        console.error(`\n${timestamp()} ❌ ERROR: ${error.message}`);
        process.exit(1);
    }
}

runSimplified();
