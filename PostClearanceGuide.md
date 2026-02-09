# Post-Clearance Workflow Guide

## Overview
After ZATCA clears your invoice, you must follow these steps to complete the e-invoicing process.

## Step 1: Save the Cleared Invoice ✅

**Why**: The `clearedInvoice` from ZATCA is the **official version**. You must use this for audits, not your original draft.

**How**:
```java
ClearanceResponseHandler.saveClearedInvoice(
    clearedInvoiceBase64,  // From ZATCA response
    "d:/zatca_app/Data/Output/cleared-invoice.xml"
);
```

**Important**: 
- ❌ Do NOT use your original XML anymore
- ✅ Always use the cleared version ZATCA returned
- 💾 Store this in your database/archive

## Step 2: Generate PDF/A-3 with Embedded XML

**Why**: For Standard (B2B) invoices, buyers need a human-readable PDF with the machine-readable XML embedded.

### Requirements:
1. **PDF/A-3 format** - Long-term archival standard
2. **Embed the cleared XML** - Attach the XML file inside the PDF
3. **Include QR code** - Display the QR code on the PDF

### Implementation Options:

#### Option A: Using Apache PDFBox (Recommended)

Add to your project:
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>2.0.29</version>
</dependency>
```

#### Option B: Using iText

```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
</dependency>
```

### Basic PDF Generation Flow:

```java
// 1. Create PDF with invoice data
PDDocument document = new PDDocument();
PDPage page = new PDPage();
document.addPage(page);

// 2. Add invoice content (company info, line items, totals)
PDPageContentStream content = new PDPageContentStream(document, page);
content.beginText();
content.setFont(PDType1Font.HELVETICA_BOLD, 16);
content.newLineAtOffset(50, 750);
content.showText("INVOICE");
// ... add more content

// 3. Add QR code image
PDImageXObject qrImage = PDImageXObject.createFromFile("qr-code.png", document);
content.drawImage(qrImage, 450, 50, 100, 100);

// 4. Embed the cleared XML as attachment
PDEmbeddedFilesNameTreeNode efTree = new PDEmbeddedFilesNameTreeNode();
PDComplexFileSpecification fs = new PDComplexFileSpecification();
fs.setFile("invoice.xml");
fs.setEmbeddedFile(new PDEmbeddedFile(document, 
    new FileInputStream("cleared-invoice.xml")));
efTree.setNames(Collections.singletonMap("invoice.xml", fs));
document.getDocumentCatalog().setNames(new PDDocumentNameDictionary(catalog));

// 5. Save as PDF/A-3
document.save("invoice.pdf");
```

## Step 3: Update the QR Code

The QR code on your PDF must match the data in the cleared invoice.

**Extract QR from cleared XML**:
```java
// The QR code is in the cleared XML at:
// <cac:AdditionalDocumentReference>
//   <cbc:ID>QR</cbc:ID>
//   <cac:Attachment>
//     <cbc:EmbeddedDocumentBinaryObject>BASE64_QR_DATA</cbc:EmbeddedDocumentBinaryObject>
```

**Generate QR image**:
```java
// Use ZXing library
import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;

QRCodeWriter qrCodeWriter = new QRCodeWriter();
BitMatrix bitMatrix = qrCodeWriter.encode(qrData, BarcodeFormat.QR_CODE, 200, 200);

// Convert to image and add to PDF
BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
ImageIO.write(qrImage, "PNG", new File("qr-code.png"));
```

## Step 4: Workflow Summary

```
1. Submit invoice → ZATCA API
2. Receive clearance response
3. Extract clearedInvoice (Base64)
4. Decode and save cleared XML ✓
5. Generate PDF/A-3
   ├─ Add invoice content
   ├─ Embed cleared XML
   └─ Add QR code
6. Send PDF to customer
7. Archive both XML and PDF
```

## Important Notes

> [!CAUTION]
> **Never modify the cleared invoice!** Any changes will invalidate ZATCA's signature.

> [!IMPORTANT]
> **For Simplified (B2C) invoices**: PDF generation is optional. The QR code alone is sufficient.

> [!TIP]
> **Storage**: Keep both the cleared XML and PDF for at least 6 years (ZATCA requirement).

## Quick Start

**Decode your cleared invoice now**:
```powershell
# Create output directory
New-Item -ItemType Directory -Force -Path "d:/zatca_app/Data/Output"

# Compile and run
javac Lib/ClearanceResponseHandler.java
java -cp Lib ClearanceResponseHandler
```

Then paste your `clearedInvoice` Base64 string from the ZATCA response.

## Next Steps

1. ✅ Decode and save cleared invoice (use `ClearanceResponseHandler.java`)
2. ⏳ Set up PDF generation library (PDFBox or iText)
3. ⏳ Create PDF template with your branding
4. ⏳ Implement XML embedding in PDF
5. ⏳ Add QR code to PDF

## Resources

- [PDF/A-3 Standard](https://www.pdfa.org/pdfa-3/)
- [Apache PDFBox Documentation](https://pdfbox.apache.org/)
- [ZXing QR Code Library](https://github.com/zxing/zxing)
