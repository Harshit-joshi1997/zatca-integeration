const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Invoice Builder - Generate ZATCA-compliant invoice XMLs
 */
class InvoiceBuilder {
    constructor() {
        this.invoiceId = '';
        this.uuid = uuidv4();
        this.issueDate = new Date();
        this.sellerName = '';
        this.sellerVatNumber = '';
        this.sellerAddress = '';
        this.totalAmount = 0;
        this.vatAmount = 0;
    }

    setInvoiceId(id) {
        this.invoiceId = id;
        return this;
    }

    setSellerName(name) {
        this.sellerName = name;
        return this;
    }

    setSellerVatNumber(vat) {
        this.sellerVatNumber = vat;
        return this;
    }

    setSellerAddress(address) {
        this.sellerAddress = address;
        return this;
    }

    setTotalAmount(amount) {
        this.totalAmount = amount;
        this.vatAmount = amount * 0.15; // 15% VAT
        return this;
    }

    /**
     * Build the XML invoice
     */
    buildXML() {
        const dateStr = this.issueDate.toISOString().split('T')[0];
        const timeStr = this.issueDate.toISOString().split('T')[1].split('.')[0];
        const taxExclusiveAmount = this.totalAmount;
        const taxInclusiveAmount = this.totalAmount + this.vatAmount;

        return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${this.invoiceId}</cbc:ID>
  <cbc:UUID>${this.uuid}</cbc:UUID>
  <cbc:IssueDate>${dateStr}</cbc:IssueDate>
  <cbc:IssueTime>${timeStr}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0200000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">1010010000</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${this.sellerAddress}</cbc:StreetName>
        <cbc:CityName>Riyadh</cbc:CityName>
        <cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${this.sellerVatNumber}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${this.sellerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${this.vatAmount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="SAR">${taxExclusiveAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${taxInclusiveAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${taxInclusiveAmount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;
    }

    /**
     * Save invoice to file
     */
    async saveToFile(filePath) {
        const xml = this.buildXML();
        await fs.writeFile(filePath, xml, 'utf8');
        console.log(`Invoice saved to: ${filePath}`);
        return filePath;
    }
}

module.exports = InvoiceBuilder;
