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
    this.invoiceType = 'simplified'; // 'simplified' or 'standard'
    this.pih = 'NWZlY2ViYjdmYTMzZWFjMDFmMThiZGI4OWMwMDVhMWQzMTNkZmE3MjNlMmFhYzc2Y2ZjZGM3NGMxZjc2ZWE5Yw=='; // Default dummy PIH
    this.sellerName = '';
    this.sellerVatNumber = '';
    this.sellerAddress = '';
    this.totalAmount = 0;
    this.vatAmount = 0;
  }

  setInvoiceType(type) {
    this.invoiceType = type;
    return this;
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

    const typeCode = this.invoiceType === 'standard' ? '0100000' : '0200000';

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${this.invoiceId}</cbc:ID>
  <cbc:UUID>${this.uuid}</cbc:UUID>
  <cbc:IssueDate>${dateStr}</cbc:IssueDate>
  <cbc:IssueTime>${timeStr}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${typeCode}">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>23</cbc:UUID>
  </cac:AdditionalDocumentReference>

  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${this.pih}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">1010010000</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>Prince Sultan</cbc:StreetName>
        <cbc:BuildingNumber>2322</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>Al-Murabba</cbc:CitySubdivisionName>
        <cbc:CityName>Riyadh</cbc:CityName>
        <cbc:PostalZone>23333</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${this.sellerVatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${this.sellerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PostalAddress>
        <cbc:StreetName>Salah Al-Din</cbc:StreetName>
        <cbc:BuildingNumber>1111</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>Al-Murooj</cbc:CitySubdivisionName>
        <cbc:CityName>Riyadh</cbc:CityName>
        <cbc:PostalZone>12222</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>Sample Customer</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <cac:Delivery>
    <cbc:ActualDeliveryDate>${dateStr}</cbc:ActualDeliveryDate>
  </cac:Delivery>

  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>10</cbc:PaymentMeansCode>
  </cac:PaymentMeans>

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${this.vatAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${this.totalAmount.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${this.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
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
