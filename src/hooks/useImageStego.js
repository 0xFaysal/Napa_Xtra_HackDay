/**
 * NEBULA - Image Steganography Hook
 * LSB (Least Significant Bit) encoding in the Blue channel
 */

'use client';

import { useCallback, useRef } from 'react';
import {
  encryptText,
  decryptText,
  prepareDataForEmbedding,
  extractDataFromBinary,
  generateVisualSeed,
  seedToColors,
} from '@/utils/steganography';

/**
 * Custom hook for Image Steganography operations
 */
export function useImageStego() {
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════
  // GENERATIVE ART PATTERN
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate a unique visual pattern based on the secret text
   * This creates a nebula-like pattern that looks beautiful
   */
  const generatePattern = useCallback((p5, width, height, secretText) => {
    const seed = generateVisualSeed(secretText);
    p5.randomSeed(seed);
    p5.noiseSeed(seed);

    // Dark background
    p5.background(5, 5, 8);

    // Create nebula effect with multiple layers
    const colors = seedToColors(seed);
    
    // Layer 1: Background nebula clouds
    for (let i = 0; i < 2000; i++) {
      const x = p5.random(width);
      const y = p5.random(height);
      const noiseVal = p5.noise(x * 0.01, y * 0.01, i * 0.001);
      
      const r = colors.r * noiseVal;
      const g = colors.g * noiseVal * 0.5;
      const b = 200 + (55 * noiseVal);
      const alpha = noiseVal * 30;
      
      p5.noStroke();
      p5.fill(r, g, b, alpha);
      p5.ellipse(x, y, noiseVal * 20, noiseVal * 20);
    }

    // Layer 2: Flowing lines (data streams)
    const numLines = 50 + (secretText.length % 50);
    for (let i = 0; i < numLines; i++) {
      const startX = p5.random(width);
      const startY = p5.random(height);
      
      p5.stroke(
        100 + p5.random(100),
        150 + p5.random(105),
        255,
        50
      );
      p5.strokeWeight(0.5);
      p5.noFill();
      
      p5.beginShape();
      let x = startX;
      let y = startY;
      
      for (let j = 0; j < 100; j++) {
        const angle = p5.noise(x * 0.01, y * 0.01) * p5.TWO_PI * 2;
        x += p5.cos(angle) * 3;
        y += p5.sin(angle) * 3;
        p5.vertex(x, y);
      }
      p5.endShape();
    }

    // Layer 3: Star field
    for (let i = 0; i < 500; i++) {
      const x = p5.random(width);
      const y = p5.random(height);
      const brightness = p5.random(100, 255);
      const size = p5.random(0.5, 2);
      
      p5.noStroke();
      p5.fill(brightness, brightness, 255, brightness);
      p5.ellipse(x, y, size, size);
    }

    // Layer 4: Central glow
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let r = 200; r > 0; r -= 2) {
      const alpha = p5.map(r, 0, 200, 30, 0);
      p5.noStroke();
      p5.fill(colors.r * 0.5, colors.g * 0.3, 255, alpha);
      p5.ellipse(centerX, centerY, r * 2, r * 2);
    }

    // Layer 5: Geometric patterns based on text
    const numShapes = secretText.length % 10 + 5;
    for (let i = 0; i < numShapes; i++) {
      const angle = (p5.TWO_PI / numShapes) * i;
      const radius = 80 + p5.random(40);
      const x = centerX + p5.cos(angle) * radius;
      const y = centerY + p5.sin(angle) * radius;
      
      p5.stroke(0, 212, 255, 100);
      p5.strokeWeight(1);
      p5.noFill();
      p5.ellipse(x, y, 20, 20);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ENCODE (Hide data in image)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Encode secret text into an image using LSB steganography
   * @param {string} secretText - The message to hide
   * @param {string} password - Encryption password
   * @param {HTMLCanvasElement} canvas - Canvas with the pattern
   * @returns {Promise<Blob>} - PNG image blob with hidden data
   */
  const encode = useCallback(async (secretText, password, canvas) => {
    return new Promise((resolve, reject) => {
      try {
        // Step 1: Encrypt the text
        const encryptedText = encryptText(secretText, password);
        console.log('Encrypted text length:', encryptedText.length);

        // Step 2: Prepare binary data
        const binaryData = prepareDataForEmbedding(encryptedText);
        console.log('Binary data length:', binaryData.length);

        // Step 3: Get canvas context and image data
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Check capacity
        const maxBits = canvas.width * canvas.height;
        if (binaryData.length > maxBits) {
          reject(new Error(`Message too long! Max ${Math.floor(maxBits / 8)} characters.`));
          return;
        }

        // Step 4: Hide data in LSB of Blue channel
        for (let i = 0; i < binaryData.length; i++) {
          const bit = parseInt(binaryData[i], 10);
          const pixelIndex = i * 4; // RGBA = 4 values per pixel
          const blueIndex = pixelIndex + 2; // Blue is at offset 2

          if (blueIndex < pixels.length) {
            // Clear the LSB and set it to our bit
            pixels[blueIndex] = (pixels[blueIndex] & 0xFE) | bit;
          }
        }

        // Step 5: Put modified image data back
        ctx.putImageData(imageData, 0, 0);

        // Step 6: Export as PNG blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png');

      } catch (error) {
        reject(error);
      }
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // DECODE (Extract data from image)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Decode hidden text from an image
   * @param {File} imageFile - The image file to decode
   * @param {string} password - Decryption password
   * @returns {Promise<string>} - The revealed secret text
   */
  const decode = useCallback(async (imageFile, password) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Create hidden canvas for decoding
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Step 1: Extract LSB from Blue channel
          let binaryData = '';
          const maxBits = canvas.width * canvas.height;
          
          for (let i = 0; i < maxBits; i++) {
            const blueIndex = i * 4 + 2;
            if (blueIndex < pixels.length) {
              const lsb = pixels[blueIndex] & 1;
              binaryData += lsb.toString();
            }
          }
          
          console.log('Extracted binary length:', binaryData.length);
          
          // Step 2: Extract encrypted text from binary
          const encryptedText = extractDataFromBinary(binaryData);
          
          if (!encryptedText) {
            reject(new Error('No hidden data found in this image'));
            return;
          }
          
          console.log('Extracted encrypted text');
          
          // Step 3: Decrypt with password
          const decryptedText = decryptText(encryptedText, password);
          
          if (!decryptedText) {
            reject(new Error('Invalid password or corrupted data'));
            return;
          }
          
          resolve(decryptedText);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Load image from file
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(imageFile);
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // DOWNLOAD HELPER
  // ═══════════════════════════════════════════════════════════════

  /**
   * Trigger download of the encoded image
   * @param {Blob} blob - The image blob
   * @param {string} filename - Download filename
   */
  const downloadImage = useCallback((blob, filename = 'nebula-secret.png') => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    canvasRef,
    hiddenCanvasRef,
    generatePattern,
    encode,
    decode,
    downloadImage,
  };
}

export default useImageStego;
