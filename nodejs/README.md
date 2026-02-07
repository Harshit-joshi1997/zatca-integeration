# ZATCA E-Invoicing - Node.js Integration

Complete Node.js implementation for ZATCA e-invoicing operations.

## Features

✅ **Invoice Generation** - Create ZATCA-compliant XML invoices  
✅ **Signing & Validation** - Sign invoices using ZATCA SDK  
✅ **CSR Generation** - Generate certificate signing requests  
✅ **QR Code Generation** - Create QR codes for invoices  
✅ **Cleared Invoice Processing** - Decode and process ZATCA responses  
✅ **PDF Generation** - Create PDFs with embedded QR codes  
✅ **API Integration** - Generate JSON requests for ZATCA API  

## Installation

```bash
cd nodejs
npm install
```

## Dependencies

- **node-forge**: Cryptographic operations
- **qrcode**: QR code generation
- **pdfkit**: PDF generation
- **xml2js**: XML parsing
- **axios**: HTTP requests
- **uuid**: UUID generation

## Usage

### Quick Start

```bash
# Run complete workflow
npm start

# Or run individual operations:
npm run sign              # Sign an invoice
npm run generate-qr       # Generate QR code
npm run decode-cleared    # Decode cleared invoice
npm run generate-pdf      # Generate PDF
```

### Programmatic Usage

```javascript
const { ZatcaService, InvoiceBuilder, decodeClearedInvoice, generatePDF } = require('./index');

// Create invoice
const invoice = new InvoiceBuilder();
invoice
  .setInvoiceId('INV-001')
  .setSellerName('My Company')
  .setSellerVatNumber('300000000000003')
  .setTotalAmount(1000);

await invoice.saveToFile('invoice.xml');

// Sign and validate
const zatca = new ZatcaService();
await zatca.signAndValidate('invoice.xml');

// Generate QR code
await zatca.generateQR('invoice.xml');

// Process cleared invoice
await decodeClearedInvoice(base64String, 'cleared.xml');
await generatePDF('cleared.xml', 'invoice.pdf');
```

## Project Structure

```
nodejs/
├── package.json
├── index.js                      # Main entry point
├── src/
│   ├── zatca-service.js          # ZATCA SDK wrapper
│   ├── invoice-builder.js        # Invoice XML generator
│   ├── cleared-invoice-utils.js  # Cleared invoice processing
│   └── pdf-generator.js          # PDF generation
└── README.md
```

## API Reference

### ZatcaService

```javascript
const zatca = new ZatcaService();

// Sign and validate invoice
await zatca.signAndValidate(invoicePath);

// Generate CSR
await zatca.generateCSR(configPath, privateKeyPath, csrPath);

// Generate QR code
await zatca.generateQR(invoicePath);

// Generate API request JSON
await zatca.generateInvoiceRequest(invoicePath, outputPath);
```

### InvoiceBuilder

```javascript
const invoice = new InvoiceBuilder();

invoice
  .setInvoiceId('INV-001')
  .setSellerName('Company Name')
  .setSellerVatNumber('300000000000003')
  .setSellerAddress('Address')
  .setTotalAmount(1000);

const xml = invoice.buildXML();
await invoice.saveToFile('invoice.xml');
```

### Cleared Invoice Utils

```javascript
const { decodeClearedInvoice, extractQRCode, parseInvoiceData } = require('./src/cleared-invoice-utils');

// Decode cleared invoice
await decodeClearedInvoice(base64String, 'cleared.xml');

// Extract QR code
const qrData = await extractQRCode('cleared.xml');

// Parse invoice data
const data = await parseInvoiceData('cleared.xml');
```

### PDF Generator

```javascript
const { generatePDF } = require('./src/pdf-generator');

await generatePDF('cleared.xml', 'invoice.pdf');
```

## Environment Variables

Set these if needed:

```bash
SDK_CONFIG=path/to/config.json
FATOORA_HOME=path/to/Apps
```

## Notes

- The Node.js implementation wraps the Java ZATCA SDK using `child_process`
- All cryptographic operations are handled by the SDK
- PDF generation includes QR code as an image
- For production, consider implementing proper error handling and logging

## Troubleshooting

**Issue**: SDK command fails  
**Solution**: Ensure Java is installed and ZATCA SDK is properly configured

**Issue**: QR code not found  
**Solution**: Verify the cleared invoice XML contains the QR element

**Issue**: PDF generation fails  
**Solution**: Check that pdfkit is properly installed: `npm install pdfkit`

## License

MIT
