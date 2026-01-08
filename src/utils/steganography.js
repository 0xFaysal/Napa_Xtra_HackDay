/**
 * NEBULA - Steganography Utilities
 * Core encryption/decryption and binary conversion functions
 */

import CryptoJS from 'crypto-js';

// ═══════════════════════════════════════════════════════════════
// ENCRYPTION / DECRYPTION (AES-256)
// ═══════════════════════════════════════════════════════════════

/**
 * Encrypt text using AES-256 with the given password
 * @param {string} plainText - The secret message to encrypt
 * @param {string} password - The encryption key
 * @returns {string} - Base64 encoded encrypted string
 */
export function encryptText(plainText, password) {
  if (!plainText || !password) {
    throw new Error('Both plainText and password are required');
  }
  
  // Add a marker to verify successful decryption later
  const markedText = `NEBULA::${plainText}::NEBULA`;
  
  // Encrypt using AES
  const encrypted = CryptoJS.AES.encrypt(markedText, password).toString();
  
  return encrypted;
}

/**
 * Decrypt AES-256 encrypted text with the given password
 * @param {string} encryptedText - The encrypted Base64 string
 * @param {string} password - The decryption key
 * @returns {string|null} - The original plaintext or null if decryption fails
 */
export function decryptText(encryptedText, password) {
  if (!encryptedText || !password) {
    throw new Error('Both encryptedText and password are required');
  }
  
  try {
    // Decrypt using AES
    const bytes = CryptoJS.AES.decrypt(encryptedText, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // Verify the marker
    if (decrypted.startsWith('NEBULA::') && decrypted.endsWith('::NEBULA')) {
      // Extract the original message
      return decrypted.slice(8, -8);
    }
    
    // Invalid password or corrupted data
    return null;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// BINARY CONVERSION UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a string to binary representation
 * @param {string} str - The string to convert
 * @returns {string} - Binary string (8 bits per character)
 */
export function stringToBinary(str) {
  let binary = '';
  
  for (let i = 0; i < str.length; i++) {
    // Get the character code
    const charCode = str.charCodeAt(i);
    // Convert to binary and pad to 8 bits
    const binaryChar = charCode.toString(2).padStart(8, '0');
    binary += binaryChar;
  }
  
  return binary;
}

/**
 * Convert binary string back to text
 * @param {string} binary - Binary string (must be multiple of 8)
 * @returns {string} - The decoded text
 */
export function binaryToString(binary) {
  let str = '';
  
  // Process 8 bits at a time
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    if (byte.length < 8) break;
    
    const charCode = parseInt(byte, 2);
    if (charCode === 0) break; // Null terminator
    
    str += String.fromCharCode(charCode);
  }
  
  return str;
}

// ═══════════════════════════════════════════════════════════════
// LSB STEGANOGRAPHY HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Delimiter to mark the end of hidden data in LSB steganography
 * Using a unique binary pattern that's unlikely to appear naturally
 */
export const END_DELIMITER = '1111111111111110'; // 16-bit marker

/**
 * Prepare data for LSB embedding
 * @param {string} encryptedText - The encrypted text to hide
 * @returns {string} - Binary string with length header and end delimiter
 */
export function prepareDataForEmbedding(encryptedText) {
  const binary = stringToBinary(encryptedText);
  
  // Add length header (32 bits for length up to ~4 billion chars)
  const lengthBinary = binary.length.toString(2).padStart(32, '0');
  
  return lengthBinary + binary + END_DELIMITER;
}

/**
 * Extract data from LSB binary stream
 * @param {string} binary - Raw binary extracted from image
 * @returns {string|null} - The extracted encrypted text or null
 */
export function extractDataFromBinary(binary) {
  try {
    // Read length header (first 32 bits)
    const lengthBinary = binary.slice(0, 32);
    const dataLength = parseInt(lengthBinary, 2);
    
    // Validate length
    if (dataLength <= 0 || dataLength > binary.length - 32) {
      return null;
    }
    
    // Extract the data
    const dataBinary = binary.slice(32, 32 + dataLength);
    
    return binaryToString(dataBinary);
  } catch (error) {
    console.error('Data extraction failed:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// CAPACITY CALCULATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate how much data can be hidden in an image
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {number} - Maximum characters that can be hidden
 */
export function calculateImageCapacity(width, height) {
  // Each pixel can hide 1 bit in the blue channel
  // 8 bits = 1 character
  // Reserve 48 bits for header and delimiter
  const totalBits = width * height;
  const usableBits = totalBits - 48;
  const maxChars = Math.floor(usableBits / 8);
  
  return Math.max(0, maxChars);
}

/**
 * Check if the message fits in the image
 * @param {string} encryptedText - The encrypted message
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {boolean} - Whether the message fits
 */
export function canFitInImage(encryptedText, width, height) {
  const capacity = calculateImageCapacity(width, height);
  return encryptedText.length <= capacity;
}

// ═══════════════════════════════════════════════════════════════
// HASH GENERATION (for visual seed)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a numeric hash from a string (for seeding visual patterns)
 * @param {string} str - Input string
 * @returns {number} - Numeric hash value
 */
export function generateVisualSeed(str) {
  const hash = CryptoJS.SHA256(str);
  // Convert first 8 hex chars to number
  const hexStr = hash.toString().slice(0, 8);
  return parseInt(hexStr, 16);
}

/**
 * Generate color values from a seed
 * @param {number} seed - Numeric seed
 * @returns {Object} - RGB color values
 */
export function seedToColors(seed) {
  const r = (seed >> 16) & 255;
  const g = (seed >> 8) & 255;
  const b = seed & 255;
  
  return { r, g, b };
}
