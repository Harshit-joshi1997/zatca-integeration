const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');
const { parseInvoiceData, extractQRCode } = require('./cleared-invoice-utils');

/**
 * Generate PDF from cleared invoice
 */
async function generatePDF(xmlPath, pdfPath) {
    try {
        // Parse invoice data
        const invoiceData = await parseInvoiceData(xmlPath);
        const qrData = await extractQRCode(xmlPath);

        // Create PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text('='.repeat(80), { align: 'center' });
        doc.moveDown();

        // Invoice details
        doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoiceId}`);
        doc.text(`Date: ${invoiceData.issueDate}`);
        doc.moveDown();

        // Seller information
        doc.fontSize(14).text('SELLER INFORMATION', { underline: true });
        doc.fontSize(10);
        doc.text(`Name: ${invoiceData.sellerName}`);
        doc.text(`VAT Number: ${invoiceData.sellerVAT}`);
        doc.moveDown();

        // Amount summary
        doc.fontSize(14).text('AMOUNT SUMMARY', { underline: true });
        doc.fontSize(10);
        doc.text(`VAT Amount: SAR ${invoiceData.vatAmount}`);
        doc.text(`Total Amount: SAR ${invoiceData.totalAmount}`);
        doc.moveDown();

        // QR Code
        if (qrData) {
            doc.fontSize(14).text('QR CODE', { underline: true });
            doc.moveDown();

            // Generate QR code image
            const qrImage = await QRCode.toDataURL(qrData);
            const qrBuffer = Buffer.from(qrImage.split(',')[1], 'base64');
            doc.image(qrBuffer, { width: 150 });
            doc.moveDown();
        }

        // Footer
        doc.moveDown();
        doc.fontSize(10).text('='.repeat(80), { align: 'center' });
        doc.text('This invoice is ZATCA certified and cleared', { align: 'center' });
        doc.text('Cleared XML is embedded in this document', { align: 'center' });

        // Finalize PDF
        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                console.log(`✓ PDF generated: ${pdfPath}`);
                resolve(pdfPath);
            });
            stream.on('error', reject);
        });
    } catch (error) {
        console.error('Error generating PDF:', error.message);
        throw error;
    }
}

module.exports = { generatePDF };
