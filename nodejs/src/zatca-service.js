const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * ZATCA Service - Node.js wrapper for ZATCA SDK
 * This calls the Java SDK from Node.js
 */
class ZatcaService {
    constructor() {
        this.sdkPath = path.join(__dirname, '../../Apps/fatoora.bat');
        this.configPath = path.join(__dirname, '../../Configuration/config.json');
    }

    /**
     * Execute ZATCA SDK command
     */
    async executeCommand(args) {
        // Normalize paths in args for Windows
        const normalizedArgs = args.map(arg =>
            (typeof arg === 'string' && (arg.includes('/') || arg.includes('\\')))
                ? path.normalize(arg)
                : arg
        );

        return new Promise((resolve, reject) => {
            execFile('cmd.exe', ['/c', this.sdkPath, ...normalizedArgs], {
                env: {
                    ...process.env,
                    SDK_CONFIG: this.configPath,
                    FATOORA_HOME: path.join(__dirname, '../../Apps')
                }
            }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`SDK Error: ${error.message}\n${stderr}`));
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    /**
     * Sign and validate an invoice
     */
    async signAndValidate(invoicePath) {
        console.log('Signing and validating invoice...');
        const result = await this.executeCommand(['-sign', '-invoice', invoicePath, '-validate']);
        console.log(result);
        return result;
    }

    /**
     * Standalone validation of an invoice
     * Returns true if PASSED, throws error if FAILED
     */
    async validate(invoicePath) {
        console.log(`Validating invoice: ${path.basename(invoicePath)}...`);
        const result = await this.executeCommand(['-validate', '-invoice', invoicePath]);
        console.log(result);

        if (!result.includes('GLOBAL VALIDATION RESULT = PASSED')) {
            throw new Error(`Validation FAILED for ${path.basename(invoicePath)}`);
        }
        return true;
    }

    /**
     * Generate hash for an invoice
     */
    async generateHash(invoicePath) {
        console.log(`Generating hash for: ${path.basename(invoicePath)}...`);
        const result = await this.executeCommand(['-generateHash', '-invoice', invoicePath]);

        // Extract hash from result: " *** INVOICE HASH = ..."
        const match = result.match(/\*\*\* INVOICE HASH = (.*)/);
        if (match && match[1]) {
            const hash = match[1].trim();
            console.log(`✓ Generated Hash: ${hash}`);
            return hash;
        }
        throw new Error('Could not extract hash from SDK output');
    }

    /**
     * Generate CSR
     */
    async generateCSR(configPath, privateKeyPath, csrPath) {
        console.log('Generating CSR...');
        const result = await this.executeCommand([
            '-csr',
            '-csrConfig', configPath,
            '-privateKey', privateKeyPath,
            '-generatedCsr', csrPath,
            '-pem'
        ]);
        console.log(result);

        // Read and return CSR content
        const csrContent = await fs.readFile(csrPath, 'utf8');
        return csrContent;
    }

    /**
     * Generate QR code
     */
    async generateQR(invoicePath) {
        console.log('Generating QR code...');
        const result = await this.executeCommand(['-qr', '-invoice', invoicePath]);
        console.log(result);
        return result;
    }

    /**
     * Generate invoice request JSON for API submission
     */
    async generateInvoiceRequest(invoicePath, outputPath) {
        console.log('Generating invoice request JSON...');
        const result = await this.executeCommand([
            '-invoiceRequest',
            '-invoice', invoicePath,
            '-apiRequest', outputPath
        ]);
        console.log(result);

        // Read and return JSON content
        const jsonContent = await fs.readFile(outputPath, 'utf8');
        return JSON.parse(jsonContent);
    }
}

module.exports = ZatcaService;
