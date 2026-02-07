const fs = require('fs').promises;
const xml2js = require('xml2js');

/**
 * Decode cleared invoice from ZATCA response
 */
async function decodeClearedInvoice(base64String, outputPath) {
    try {
        // Decode from Base64
        const xmlContent = Buffer.from(base64String, 'base64').toString('utf8');

        // Save to file
        await fs.writeFile(outputPath, xmlContent, 'utf8');

        console.log(`✓ Cleared invoice saved to: ${outputPath}`);
        console.log('  This is the OFFICIAL version - use this for audits!');

        return xmlContent;
    } catch (error) {
        console.error('Error decoding cleared invoice:', error.message);
        throw error;
    }
}

/**
 * Extract QR code from cleared invoice XML
 */
async function extractQRCode(xmlPath) {
    try {
        const xmlContent = await fs.readFile(xmlPath, 'utf8');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlContent);

        // Navigate to QR code element
        const additionalRefs = result.Invoice['cac:AdditionalDocumentReference'];
        if (additionalRefs) {
            for (const ref of additionalRefs) {
                if (ref['cbc:ID'] && ref['cbc:ID'][0] === 'QR') {
                    const qrData = ref['cac:Attachment'][0]['cbc:EmbeddedDocumentBinaryObject'][0]['_'];
                    console.log('✓ QR code extracted successfully');
                    return qrData;
                }
            }
        }

        console.log('⚠ QR code not found in XML');
        return null;
    } catch (error) {
        console.error('Error extracting QR code:', error.message);
        return null;
    }
}

/**
 * Parse invoice data from XML
 */
async function parseInvoiceData(xmlPath) {
    try {
        const xmlContent = await fs.readFile(xmlPath, 'utf8');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlContent);

        const invoice = result.Invoice;

        return {
            invoiceId: invoice['cbc:ID'] ? invoice['cbc:ID'][0] : '',
            issueDate: invoice['cbc:IssueDate'] ? invoice['cbc:IssueDate'][0] : '',
            sellerName: invoice['cac:AccountingSupplierParty']?.[0]?.['cac:Party']?.[0]?.['cac:PartyLegalEntity']?.[0]?.['cbc:RegistrationName']?.[0] || '',
            sellerVAT: invoice['cac:AccountingSupplierParty']?.[0]?.['cac:Party']?.[0]?.['cac:PartyTaxScheme']?.[0]?.['cbc:CompanyID']?.[0] || '',
            totalAmount: invoice['cac:LegalMonetaryTotal']?.[0]?.['cbc:PayableAmount']?.[0]?.['_'] || '0',
            vatAmount: invoice['cac:TaxTotal']?.[0]?.['cbc:TaxAmount']?.[0]?.['_'] || '0'
        };
    } catch (error) {
        console.error('Error parsing invoice data:', error.message);
        return {};
    }
}

module.exports = {
    decodeClearedInvoice,
    extractQRCode,
    parseInvoiceData
};
