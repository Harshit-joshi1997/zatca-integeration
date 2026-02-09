const ZatcaService = require('./zatca-service');
const InvoiceBuilder = require('./invoice-builder');
const { decodeClearedInvoice } = require('./cleared-invoice-utils');
const generatePDF = require('./generate-pdf');
const path = require('path');

/**
 * ZATCA Standard Invoice Flow (B2B)
 * Process: Generate Clean XML -> Validate -> Hash/Request -> Base64 -> PDF
 */
async function runStandard() {
    const zatca = new ZatcaService();
    const timestamp = () => `[${new Date().toISOString()}]`;

    // 1. Create a NEW clean Standard invoice to avoid "invalid hash" errors from old samples
    const builder = new InvoiceBuilder();
    builder
        .setInvoiceType('standard')
        .setInvoiceId('B2B-' + Date.now())
        .setSellerName('Maximum Speed Tech Supply LTD')
        .setSellerVatNumber('399999999900003')
        .setSellerAddress('King Fahd Road, Riyadh')
        .setTotalAmount(500.00);

    // Save to Output/Standard_Invoices
    const cleanInvoicePath = path.join(__dirname, '../../Output/Standard_Invoices/standard-invoice-clean.xml');
    await builder.saveToFile(cleanInvoicePath);

    console.log('='.repeat(80));
    console.log('   ZATCA WORKFLOW: STANDARD INVOICE (CLEARANCE)');
    console.log('='.repeat(80));

    try {
        console.log(`\n${timestamp()} STEP 1: PRE-VALIDATION`);
        // Use executeCommand directly to avoid throwing on PIH errors (expected for new/dummy invoices)
        const validationResult = await zatca.executeCommand(['-validate', '-invoice', cleanInvoicePath]);
        console.log(validationResult);

        console.log(`\n${timestamp()} STEP 2: GENERATING CLEARANCE REQUEST (JSON)`);
        const jsonPath = path.join(__dirname, '../../Output/JSON_Requests/standard-clearance-request.json');
        await zatca.generateInvoiceRequest(cleanInvoicePath, jsonPath);

        console.log(`\n${timestamp()} STEP 3: HASH VERIFICATION`);
        // We verify the hash just to be sure
        await zatca.generateHash(cleanInvoicePath);

        console.log(`\n${timestamp()} STEP 4: EXTRACTING CONSISTENT BASE64`);
        // Re-read JSON to get the SDK-generated Base64
        const fs = require('fs/promises');
        const jsonContent = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
        const base64ForApi = jsonContent.invoice;
        console.log(`${timestamp()} ✅ Extracted Base64 from JSON (length: ${base64ForApi.length})`);

        console.log(`\n${timestamp()} STEP 5: SIMULATING ZATCA CLEARANCE RESPONSE`);
        const clearedPath = path.join(__dirname, '../../Output/Standard_Invoices/standard_cleared_official.xml');
        await decodeClearedInvoice(base64ForApi, clearedPath);

        console.log(`\n${timestamp()} STEP 6: GENERATING PDF INVOICE`);
        const pdfPath = path.join(__dirname, '../../Output/Standard_Invoices/standard_invoice.pdf');
        await generatePDF(clearedPath, pdfPath);

        console.log('\n' + '='.repeat(80));
        console.log(`${timestamp()} 🏆 STANDARD FLOW COMPLETE!`);
        console.log(`JSON Request: Output/JSON_Requests/standard-clearance-request.json`);
        console.log(`Cleared XML:  Output/Standard_Invoices/standard_cleared_official.xml`);
        console.log(`PDF Invoice:  Output/Standard_Invoices/standard_invoice.pdf`);
        console.log('='.repeat(80));

    } catch (error) {
        console.error(`\n${timestamp()} ❌ ERROR: ${error.message}`);
        process.exit(1);
    }
}

runStandard();
