const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); // You might need specific options for A-3
const xml2js = require('xml2js');
const QRCode = require('qrcode');

async function generatePDF(xmlPath, outputPath) {
    if (!xmlPath || !outputPath) {
        console.error('Usage: node src/generate-pdf.js <xml_file> <output_pdf>');
        process.exit(1);
    }

    try {
        console.log(`Reading XML: ${xmlPath}`);
        const xmlContent = fs.readFileSync(xmlPath, 'utf8');

        // 1. Parse XML
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlContent);

        // Helper to safely access nested properties
        const get = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

        // Extract Data
        const invoice = result.Invoice;
        const id = get(invoice, 'cbc:ID.0');
        const issueDate = get(invoice, 'cbc:IssueDate.0');
        const issueTime = get(invoice, 'cbc:IssueTime.0');
        const total = get(invoice, 'cac:LegalMonetaryTotal.0.cbc:TaxInclusiveAmount.0._');

        // Supplier
        const supplierName = get(invoice, 'cac:AccountingSupplierParty.0.cac:Party.0.cac:PartyLegalEntity.0.cbc:RegistrationName.0');
        const supplierVat = get(invoice, 'cac:AccountingSupplierParty.0.cac:Party.0.cac:PartyTaxScheme.0.cbc:CompanyID.0');

        // Customer
        const customerName = get(invoice, 'cac:AccountingCustomerParty.0.cac:Party.0.cac:PartyLegalEntity.0.cbc:RegistrationName.0') || 'N/A';

        // QR Code extraction (it's in an AdditionalDocumentReference)
        // We need to find the one with ID='QR'
        let qrBase64 = '';
        const refs = get(invoice, 'cac:AdditionalDocumentReference') || [];
        for (const ref of refs) {
            if (get(ref, 'cbc:ID.0') === 'QR') {
                qrBase64 = get(ref, 'cac:Attachment.0.cbc:EmbeddedDocumentBinaryObject.0._');
                break;
            }
        }

        if (!qrBase64) {
            console.warn('Warning: QR Code not found in XML!');
        }

        // 2. Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // --- Header ---
        doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
        doc.moveDown();

        doc.fontSize(10);
        doc.text(`Invoice Number: ${id}`);
        doc.text(`Date: ${issueDate} ${issueTime}`);
        doc.moveDown();

        // --- Parties ---
        doc.text(`Seller: ${supplierName}`);
        doc.text(`VAT Number: ${supplierVat}`);
        doc.moveDown();

        doc.text(`Buyer: ${customerName}`);
        doc.moveDown();

        // --- QR Code ---
        if (qrBase64) {
            // Generate QR Image Data URL
            const qrImage = await QRCode.toDataURL(qrBase64);
            doc.image(qrImage, 400, 50, { width: 150 });
        }

        // --- Line Items (Simplified) ---
        doc.moveDown();
        doc.text('--------------------------------------------------------------------------------');
        doc.text('Description                                      Qty      Price     Total');
        doc.text('--------------------------------------------------------------------------------');

        const lines = get(invoice, 'cac:InvoiceLine') || [];
        for (const line of lines) {
            const name = get(line, 'cac:Item.0.cbc:Name.0');
            const qty = get(line, 'cbc:InvoicedQuantity.0._');
            const price = get(line, 'cac:Price.0.cbc:PriceAmount.0._');
            const lineTotal = get(line, 'cbc:LineExtensionAmount.0._');

            doc.text(`${name.substring(0, 40).padEnd(45)} ${qty.padEnd(8)} ${price.padEnd(9)} ${lineTotal}`);
        }

        doc.text('--------------------------------------------------------------------------------');
        doc.moveDown();
        doc.fontSize(14).text(`TOTAL (Inc. VAT): ${total} SAR`, { align: 'right' });

        // --- Embed XML (PDF/A-3 Skeleton) ---
        // Note: Real PDF/A-3 compliance requires more metadata in the catalog.
        // PDFKit supports file attachments, which is the visual part of A-3.
        doc.file(xmlPath, {
            name: path.basename(xmlPath),
            desc: 'ZATCA XML Invoice',
            hidden: false,
            // subtype: 'text/xml' // pdfkit might not support subtype easily without plugins
        });

        doc.end();
        console.log(`✓ PDF Generated: ${outputPath}`);

    } catch (error) {
        console.error('Error in generate-pdf.js:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        // Do NOT print the whole error object as it might contain the huge XML
    }
}

// Check if running directly
if (require.main === module) {
    const xml = process.argv[2];
    const pdf = process.argv[3] || xml.replace('.xml', '.pdf');
    generatePDF(xml, pdf);
}

module.exports = generatePDF;
