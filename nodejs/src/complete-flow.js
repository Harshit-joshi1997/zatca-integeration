const ZatcaService = require('./zatca-service');
const { encodeInvoiceToBase64, decodeClearedInvoice } = require('./cleared-invoice-utils');
const path = require('path');
const fs = require('fs').promises;

/**
 * ZATCA Complete Flow Orchestrator
 * Performs: Validation -> Full Processing -> Base64 Encoding -> Response Decoding
 */
async function runCompleteFlow() {
    const zatca = new ZatcaService();
    const timestamp = () => `[${new Date().toISOString()}]`;

    console.log('='.repeat(80));
    console.log('   ZATCA COMPLETE WORKFLOW ORCHESTRATOR');
    console.log('='.repeat(80));

    try {
        // 1. Initial Validation
        const sampleInvoice = path.join(__dirname, '../../Data/Samples/Simplified/Invoice/Simplified_Invoice.xml');
        console.log(`\n${timestamp()} STEP 1: PRE-VALIDATION`);
        console.log(`Checking file: ${path.basename(sampleInvoice)}`);
        const valResult = await zatca.validate(sampleInvoice);
        if (!valResult.includes('GLOBAL VALIDATION RESULT = PASSED')) {
            throw new Error('Initial validation failed. Stopping flow.');
        }
        console.log(`${timestamp()} ✅ Pre-validation SUCCESSFUL`);

        // 2. Full Processing (Sign, Validate, QR, Request JSON)
        console.log(`\n${timestamp()} STEP 2: FULL PROCESSING (SIGN/QR/REQUEST)`);
        const jsonOutputPath = path.join(__dirname, '../../Apps/full-flow-request.json');
        const apiRequest = await zatca.generateInvoiceRequest(sampleInvoice, jsonOutputPath);
        console.log(`${timestamp()} ✅ Full processing SUCCESSFUL`);
        console.log(`   Request saved to: ${jsonOutputPath}`);

        // 3. Base64 Encoding
        console.log(`\n${timestamp()} STEP 3: BASE64 ENCODING (FOR API SUBMISSION)`);
        const signedInvoicePath = path.join(__dirname, '../../Apps/Simplified_Invoice_signed.xml');
        const base64 = await encodeInvoiceToBase64(signedInvoicePath);
        console.log(`${timestamp()} ✅ Base64 generated (length: ${base64.length})`);
        console.log(`--- BASE64 PREVIEW (First 50 chars) ---`);
        console.log(base64.substring(0, 50) + '...');
        console.log(`----------------------------------------`);

        // 4. Response Processing Simulation
        console.log(`\n${timestamp()} STEP 4: MOCK RESPONSE PROCESSING (DECODING)`);
        console.log('Simulating receiving a cleared invoice from ZATCA...');

        // Using the same base64 to simulate a successful response
        const clearedOutputPath = path.join(__dirname, '../../Apps/cleared_from_full_flow.xml');
        await decodeClearedInvoice(base64, clearedOutputPath);
        console.log(`${timestamp()} ✅ Response decoding SUCCESSFUL`);
        console.log(`   Official cleared invoice saved to: ${clearedOutputPath}`);

        console.log('\n' + '='.repeat(80));
        console.log(`${timestamp()} 🏆 ALL STEPS COMPLETED SUCCESSFULLY!`);
        console.log('='.repeat(80));

    } catch (error) {
        console.error(`\n${timestamp()} ❌ FLOW INTERRUPTED:`);
        console.error(error.message);
        process.exit(1);
    }
}

runCompleteFlow();
