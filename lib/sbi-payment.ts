/**
 * SBI Payment Gateway Integration Utilities
 * 
 * This module handles encryption, decryption, and checksum generation
 * for SBI payment gateway integration.
 * 
 * Based on the existing cards_backend implementation.
 */

import crypto from 'crypto';

/**
 * Configuration for SBI Payment Gateway
 * IMPORTANT: These values must match the SBI merchant account settings
 */
export const SBI_CONFIG = {
  MERCHANT_ID: process.env.SBI_MERCHANT_ID || '1003121',
  ENCRYPTION_KEY: process.env.SBI_ENCRYPTION_KEY || 'V5csjV4nMM8pz6uWaSp1Iw==',
  GATEWAY_URL: 'https://epay.sbi.bank.in/secure/AggregatorHostedListener',
  STATUS_QUERY_URL: 'https://epay.sbi.bank.in/payagg/statusQuery/getStatusQuery',
  AGGREGATOR_ID: 'SBIEPAY',
  CHECKSUM_TYPE: 'SHA256' as const,
  // Callback URL - Alcher Store will be deployed at store.alcheringa.co.in
  // This URL needs to be whitelisted with SBI
  CALLBACK_URL: process.env.SBI_CALLBACK_URL || 'https://store.alcheringa.co.in/api/payment/sbi-callback',
  // Cards portal URL (alcheringa.iitg.ac.in/store)
  CARDS_PORTAL_URL: process.env.CARDS_PORTAL_URL || 'https://alcheringa.iitg.ac.in/store',
};

/**
 * Payment modes supported by SBI gateway
 */
export const PAYMENT_MODES = {
  'NET_BANKING': 'NB',
  'DEBIT_CARD': 'DC',
  'CREDIT_CARD': 'CC',
  'UPI': 'UPI',
} as const;

/**
 * AES Encryption - pad byte array to multiple of BLOCK_SIZE bytes
 */
function pad(buffer: Buffer): Buffer {
  const BLOCK_SIZE = 16;
  const padLen = BLOCK_SIZE - (buffer.length % BLOCK_SIZE);
  const padding = Buffer.alloc(padLen, padLen);
  return Buffer.concat([buffer, padding]);
}

/**
 * Remove padding at end of byte array
 */
function unpad(buffer: Buffer): Buffer {
  const lastByte = buffer[buffer.length - 1];
  return buffer.slice(0, buffer.length - lastByte);
}

/**
 * Encrypt data using AES encryption for SBI gateway
 * 
 * @param key - Encryption key (base64 encoded)
 * @param message - Plain text message to encrypt
 * @param shaType - Checksum type (SHA256 or SHA512)
 * @returns Base64 encoded encrypted string
 */
export function encrypt(key: string, message: string, shaType: 'SHA256' | 'SHA512' = 'SHA256'): string {
  try {
    // Generate checksum (currently not used in the encrypted data, but kept for compatibility)
    const hash = shaType === 'SHA512' 
      ? crypto.createHash('sha512').update(message).digest()
      : crypto.createHash('sha256').update(message).digest();

    // Prepare message for encryption
    const messageBuffer = Buffer.from(message, 'utf-8');
    const paddedBuffer = pad(messageBuffer);
    
    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);
    
    // Key is used as UTF-8 encoded string (24 bytes = AES-192)
    // This matches Python's key.encode("UTF-8") behavior
    const keyBuffer = Buffer.from(key, 'utf-8');
    
    // Create cipher with AES-192-CBC (24-byte key)
    const cipher = crypto.createCipheriv('aes-192-cbc', keyBuffer, iv);
    cipher.setAutoPadding(false); // We handle padding manually
    
    // Encrypt
    const encrypted = Buffer.concat([cipher.update(paddedBuffer), cipher.final()]);
    
    // Prepend IV to encrypted message
    const result = Buffer.concat([iv, encrypted]);
    
    return result.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data received from SBI gateway
 * 
 * @param key - Encryption key (base64 encoded)
 * @param encryptedMessage - Base64 encoded encrypted message
 * @returns Decrypted plain text string
 */
export function decrypt(key: string, encryptedMessage: string): string {
  try {
    const byteArray = Buffer.from(encryptedMessage, 'base64');
    
    // Extract IV (first 16 bytes)
    const iv = byteArray.slice(0, 16);
    
    // Extract encrypted message
    const encryptedData = byteArray.slice(16);
    
    // Key is used as UTF-8 encoded string (24 bytes = AES-192)
    // This matches Python's key.encode("UTF-8") behavior
    const keyBuffer = Buffer.from(key, 'utf-8');
    
    // Create decipher with AES-192-CBC (24-byte key)
    const decipher = crypto.createDecipheriv('aes-192-cbc', keyBuffer, iv);
    decipher.setAutoPadding(false); // We handle padding manually
    
    // Decrypt
    const decryptedPadded = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    
    // Remove padding
    const decrypted = unpad(decryptedPadded);
    
    return decrypted.toString('utf-8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate encrypted transaction data for SBI payment gateway
 * 
 * @param transactionId - Unique transaction ID
 * @param amount - Transaction amount in INR
 * @param paymentMode - Payment mode (UPI, NB, DC, CC)
 * @returns Encrypted transaction string
 */
export function generateEncryptedTransaction(
  transactionId: string,
  amount: number,
  paymentMode: keyof typeof PAYMENT_MODES = 'UPI'
): string {
  /**
   * SBI Gateway expects data in this format (pipe-separated):
   * merchantId|DOM|IN|INR|amount|NA|returnUrl|returnUrl|SBIEPAY|merchantTxnId|merchantTxnId|paymentMode|ONLINE|ONLINE
   * 
   * Field descriptions:
   * 1. merchantId - Merchant ID provided by SBI
   * 2. DOM - Transaction type (DOM = Domestic)
   * 3. IN - Country code
   * 4. INR - Currency code
   * 5. amount - Transaction amount
   * 6. NA - Other details (not used)
   * 7. returnUrl - Success callback URL
   * 8. returnUrl - Failure callback URL (same as success)
   * 9. SBIEPAY - Aggregator ID
   * 10. merchantTxnId - Merchant transaction ID
   * 11. merchantTxnId - Reference number (same as txn ID)
   * 12. paymentMode - Payment mode code
   * 13. ONLINE - Transaction category
   * 14. ONLINE - Transaction sub-category
   */
  const plainText = [
    SBI_CONFIG.MERCHANT_ID,
    'DOM',
    'IN',
    'INR',
    amount.toString(),
    'NA',
    SBI_CONFIG.CALLBACK_URL,
    SBI_CONFIG.CALLBACK_URL,
    SBI_CONFIG.AGGREGATOR_ID,
    transactionId,
    transactionId,
    PAYMENT_MODES[paymentMode] || 'UPI',
    'ONLINE',
    'ONLINE',
  ].join('|');

  console.log('[SBI Encryption] Plain text before encryption:', plainText);
  const encrypted = encrypt(SBI_CONFIG.ENCRYPTION_KEY, plainText, SBI_CONFIG.CHECKSUM_TYPE);
  console.log('[SBI Encryption] Encrypted data length:', encrypted.length);
  console.log('[SBI Encryption] First 50 chars:', encrypted.substring(0, 50));
  
  return encrypted;
}

/**
 * Parse decrypted payment response from SBI gateway
 * 
 * @param decryptedData - Decrypted response string (pipe-separated)
 * @returns Parsed payment response object
 */
export interface SBIPaymentResponse {
  transactionId: string;
  atrn: string;
  status: string;
  amount: string;
  bankRefNo: string;
  transactionDate: string;
  challanNo: string;
  totalFee: string;
  gst: string;
}

export function parseSBIResponse(decryptedData: string): SBIPaymentResponse {
  /**
   * SBI Gateway response format (pipe-separated):
   * txnId|atrnNo|status|amount|...|bankRef|txnDate|...|challanNo|...|totalFee^gst
   */
  const parts = decryptedData.split('|');
  
  const feeGst = parts[14]?.split('^') || ['0', '0'];
  
  return {
    transactionId: parts[0] || '',
    atrn: parts[1] || '',
    status: parts[2] || '',
    amount: parts[3] || '',
    bankRefNo: parts[9] || '',
    transactionDate: parts[10] || '',
    challanNo: parts[12] || '',
    totalFee: feeGst[0] || '0',
    gst: feeGst[1] || '0',
  };
}

/**
 * Double verification with SBI gateway
 * Used to verify payment status independently
 * 
 * @param transactionId - Merchant transaction ID
 * @param amount - Transaction amount
 * @returns Payment status from SBI
 */
export async function doubleVerifySBIPayment(
  transactionId: string,
  amount: number
): Promise<{ success: boolean; status: string; message?: string }> {
  try {
    const queryRequest = `|${SBI_CONFIG.MERCHANT_ID}| ${transactionId}| ${amount}`;
    
    const response = await fetch(SBI_CONFIG.STATUS_QUERY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        queryRequest,
        aggregatorId: SBI_CONFIG.AGGREGATOR_ID,
        merchantId: SBI_CONFIG.MERCHANT_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(`SBI status query failed: ${response.status}`);
    }

    const responseText = await response.text();
    const parts = responseText.split('|');
    const status = parts[2] || 'UNKNOWN';

    return {
      success: true,
      status,
      message: responseText,
    };
  } catch (error) {
    console.error('Double verification error:', error);
    return {
      success: false,
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate SBI payment response
 * 
 * @param encryptedData - Encrypted data from SBI callback
 * @param expectedTransactionId - Expected transaction ID
 * @param expectedAmount - Expected amount
 * @returns Validation result with parsed response
 */
export async function validateSBICallback(
  encryptedData: string,
  expectedTransactionId: string,
  expectedAmount: number
): Promise<{
  valid: boolean;
  response?: SBIPaymentResponse;
  error?: string;
}> {
  try {
    // Decrypt the response
    const decryptedData = decrypt(SBI_CONFIG.ENCRYPTION_KEY, encryptedData);
    const response = parseSBIResponse(decryptedData);

    // Validate transaction ID
    if (response.transactionId !== expectedTransactionId) {
      return {
        valid: false,
        error: 'Transaction ID mismatch',
      };
    }

    // Validate amount (allow small differences due to fees)
    const receivedAmount = parseFloat(response.amount);
    if (Math.abs(receivedAmount - expectedAmount) > 1) {
      return {
        valid: false,
        error: 'Amount mismatch',
      };
    }

    // Double verification with SBI
    const verification = await doubleVerifySBIPayment(expectedTransactionId, expectedAmount);
    
    if (!verification.success) {
      return {
        valid: false,
        error: 'Double verification failed',
      };
    }

    // Use the status from double verification for final decision
    response.status = verification.status;

    return {
      valid: true,
      response,
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}
