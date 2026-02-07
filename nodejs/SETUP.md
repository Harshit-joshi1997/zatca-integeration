# Node.js ZATCA Integration - Quick Setup Guide

## ✅ What I've Created

A complete Node.js solution for all ZATCA operations:

### Files Created:
```
nodejs/
├── package.json                      # Dependencies
├── index.js                          # Main entry point
├── README.md                         # Full documentation
└── src/
    ├── zatca-service.js              # ZATCA SDK wrapper
    ├── invoice-builder.js            # Invoice generator
    ├── cleared-invoice-utils.js      # Decode cleared invoices
    └── pdf-generator.js              # PDF with QR code
```

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd d:\zatca_app\nodejs
npm install
```

This installs:
- `node-forge` - Cryptographic operations
- `qrcode` - QR code generation  
- `pdfkit` - PDF generation
- `xml2js` - XML parsing
- `axios` - HTTP requests
- `uuid` - UUID generation

### Step 2: Run the Example

```bash
npm start
```

## 📋 Available Operations

### 1. Create and Sign Invoice

```javascript
const { InvoiceBuilder, ZatcaService } = require('./index');

// Create invoice
const invoice = new InvoiceBuilder();
invoice
  .setInvoiceId('INV-2024-001')
  .setSellerName('Your Company Name LTD')
  .setSellerVatNumber('300000000000003')
  .setSellerAddress('King Fahd Road, Riyadh')
  .setTotalAmount(1000.00);

await invoice.saveToFile('../Data/Input/my-invoice.xml');

// Sign and validate
const zatca = new ZatcaService();
await zatca.signAndValidate('../Data/Input/my-invoice.xml');
```

### 2. Generate QR Code

```javascript
await zatca.generateQR('../Data/Input/my-invoice.xml');
```

### 3. Generate CSR

```javascript
await zatca.generateCSR(
  '../Data/Input/csr-config-template.properties',
  '../Data/Input/ec-secp256k1-priv-key.pem',
  '../Data/Input/csr.pem'
);
```

### 4. Decode Cleared Invoice

```javascript
const { decodeClearedInvoice } = require('./index');

const clearedBase64 = 'PD94bWwgdmVyc2lvbj0iMS4wIi...';
await decodeClearedInvoice(
  clearedBase64,
  '../Data/Output/cleared-invoice.xml'
);
```

### 5. Generate PDF

```javascript
const { generatePDF } = require('./index');

await generatePDF(
  '../Data/Output/cleared-invoice.xml',
  '../Data/Output/invoice.pdf'
);
```

### 6. Submit to ZATCA API

```javascript
const axios = require('axios');

// Generate API request
const requestPath = '../Apps/my-request.json';
const apiRequest = await zatca.generateInvoiceRequest(
  '../Data/Input/my-invoice.xml',
  requestPath
);

// Submit to ZATCA
const response = await axios.post(
  'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal',
  apiRequest,
  {
    headers: {
      'Accept-Version': 'V2',
      'Accept-Language': 'en',
      'Content-Type': 'application/json'
    },
    auth: {
      username: 'your-certificate-base64',
      password: 'your-secret'
    }
  }
);

console.log('ZATCA Response:', response.data);
```

## 🔧 How It Works

### Architecture

```
Node.js Application
       ↓
  zatca-service.js (wrapper)
       ↓
  child_process.execFile()
       ↓
  fatoora.bat (ZATCA SDK)
       ↓
  Java SDK Operations
```

The Node.js code **wraps** the existing Java ZATCA SDK, so you get:
- ✅ JavaScript/TypeScript syntax
- ✅ Promises and async/await
- ✅ npm package management
- ✅ All ZATCA SDK features
- ✅ No need to rewrite cryptographic operations

## 📦 NPM Scripts

```bash
npm start              # Run complete workflow
npm run sign           # Sign an invoice
npm run validate       # Validate an invoice
npm run generate-csr   # Generate CSR
npm run generate-qr    # Generate QR code
npm run decode-cleared # Decode cleared invoice
npm run generate-pdf   # Generate PDF
```

## 🎯 Complete Workflow Example

```javascript
const path = require('path');
const { 
  ZatcaService, 
  InvoiceBuilder, 
  decodeClearedInvoice, 
  generatePDF 
} = require('./index');

async function completeWorkflow() {
  // 1. Create invoice
  const invoice = new InvoiceBuilder();
  invoice
    .setInvoiceId('INV-001')
    .setSellerName('My Company')
    .setSellerVatNumber('300000000000003')
    .setTotalAmount(1000);
  
  const invoicePath = path.join(__dirname, '../Data/Input/invoice.xml');
  await invoice.saveToFile(invoicePath);
  
  // 2. Sign and validate
  const zatca = new ZatcaService();
  await zatca.signAndValidate(invoicePath);
  
  // 3. Generate QR code
  await zatca.generateQR(invoicePath);
  
  // 4. Generate API request
  const requestPath = path.join(__dirname, '../Apps/request.json');
  await zatca.generateInvoiceRequest(invoicePath, requestPath);
  
  // 5. Submit to ZATCA (using axios or fetch)
  // ... submit and get response ...
  
  // 6. Process cleared invoice
  const clearedBase64 = response.data.clearedInvoice;
  const clearedPath = path.join(__dirname, '../Data/Output/cleared.xml');
  await decodeClearedInvoice(clearedBase64, clearedPath);
  
  // 7. Generate PDF
  const pdfPath = path.join(__dirname, '../Data/Output/invoice.pdf');
  await generatePDF(clearedPath, pdfPath);
  
  console.log('✓ Complete workflow finished!');
}

completeWorkflow().catch(console.error);
```

## 🔑 Key Differences from Java

| Operation | Java | Node.js |
|-----------|------|---------|
| **Syntax** | `service.signAndValidate(path)` | `await zatca.signAndValidate(path)` |
| **Async** | Synchronous | Promises/async-await |
| **Errors** | try-catch | try-catch or .catch() |
| **File I/O** | `FileWriter` | `fs.promises` |
| **XML Parsing** | DOM Parser | xml2js |
| **PDF** | PDFBox/iText | pdfkit |

## 🎨 Advantages of Node.js

✅ **Modern syntax** - async/await, arrow functions  
✅ **npm ecosystem** - Thousands of packages  
✅ **JSON native** - Easy API integration  
✅ **Fast development** - No compilation needed  
✅ **Web integration** - Easy to build APIs/web apps  

## 📝 Next Steps

1. **Install dependencies**: `npm install`
2. **Test the workflow**: `npm start`
3. **Customize for your needs**: Edit `index.js`
4. **Build your app**: Use the modules in your Node.js application

## 🆘 Support

Check `README.md` for full API documentation and examples!
