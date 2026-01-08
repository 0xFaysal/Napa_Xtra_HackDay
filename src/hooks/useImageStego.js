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
  detectEmotion,
  getEmotionPalette,
  EMOTIONS,
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
   * Generate stunning artistic patterns with multiple styles
   * FLOWER MANDALA, COSMIC BLOOM, AURORA GARDEN, CRYSTAL LOTUS
   */
  const generatePattern = useCallback((p5, width, height, secretText) => {
    const seed = generateVisualSeed(secretText);
    p5.randomSeed(seed);
    p5.noiseSeed(seed);
    
    // Detect emotion for color palette
    const emotion = detectEmotion(secretText);
    const palette = getEmotionPalette(emotion);
    
    // Choose art style based on seed (4 different beautiful styles)
    const artStyles = ['flower_mandala', 'cosmic_bloom', 'aurora_garden', 'crystal_lotus'];
    const artStyle = artStyles[seed % artStyles.length];
    
    console.log(`🎨 Emotion: ${emotion} | Style: ${artStyle} | Palette: ${palette.name}`);
    
    // Shuffle palette for variety
    const colors = [...palette.colors].sort(() => p5.random() - 0.5);
    const [bgR, bgG, bgB] = palette.bg;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // ═══════════════════════════════════════════════════════════
    // BACKGROUND - Radial gradient
    // ═══════════════════════════════════════════════════════════
    const bgGradient = p5.drawingContext.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, width * 0.8
    );
    bgGradient.addColorStop(0, `rgb(${bgR * 2}, ${bgG * 2}, ${bgB * 2})`);
    bgGradient.addColorStop(0.5, `rgb(${bgR}, ${bgG}, ${bgB})`);
    bgGradient.addColorStop(1, `rgb(${bgR * 0.3}, ${bgG * 0.3}, ${bgB * 0.3})`);
    p5.drawingContext.fillStyle = bgGradient;
    p5.drawingContext.fillRect(0, 0, width, height);
    
    // ═══════════════════════════════════════════════════════════
    // HELPER FUNCTIONS FOR BEAUTIFUL SHAPES
    // ═══════════════════════════════════════════════════════════
    
    // Draw a beautiful flower petal
    const drawPetal = (x, y, petalLength, petalWidth, angle, color, alpha = 255) => {
      p5.push();
      p5.translate(x, y);
      p5.rotate(angle);
      
      // Petal gradient
      const gradient = p5.drawingContext.createLinearGradient(0, 0, petalLength, 0);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha / 255})`);
      gradient.addColorStop(0.3, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha / 255})`);
      gradient.addColorStop(1, `rgba(${color[0] * 0.6}, ${color[1] * 0.6}, ${color[2] * 0.6}, ${alpha / 255 * 0.5})`);
      
      p5.drawingContext.fillStyle = gradient;
      p5.drawingContext.beginPath();
      p5.drawingContext.moveTo(0, 0);
      p5.drawingContext.bezierCurveTo(
        petalLength * 0.3, -petalWidth * 0.5,
        petalLength * 0.7, -petalWidth * 0.3,
        petalLength, 0
      );
      p5.drawingContext.bezierCurveTo(
        petalLength * 0.7, petalWidth * 0.3,
        petalLength * 0.3, petalWidth * 0.5,
        0, 0
      );
      p5.drawingContext.fill();
      
      // Petal edge glow
      p5.drawingContext.strokeStyle = `rgba(255, 255, 255, ${alpha / 255 * 0.3})`;
      p5.drawingContext.lineWidth = 1;
      p5.drawingContext.stroke();
      
      p5.pop();
    };
    
    // Draw a complete flower
    const drawFlower = (x, y, size, numPetals, color, innerColor, rotation = 0) => {
      // Outer glow
      for (let g = size * 1.5; g > 0; g -= size * 0.1) {
        const alpha = p5.map(g, 0, size * 1.5, 40, 0);
        p5.noStroke();
        p5.fill(color[0], color[1], color[2], alpha);
        p5.ellipse(x, y, g * 2, g * 2);
      }
      
      // Petals
      for (let i = 0; i < numPetals; i++) {
        const angle = (p5.TWO_PI / numPetals) * i + rotation;
        const petalLength = size * (0.8 + p5.noise(i, seed * 0.01) * 0.4);
        const petalWidth = size * 0.35;
        drawPetal(x, y, petalLength, petalWidth, angle, color, 200);
      }
      
      // Inner petals (smaller, different color)
      for (let i = 0; i < numPetals; i++) {
        const angle = (p5.TWO_PI / numPetals) * i + rotation + p5.PI / numPetals;
        const petalLength = size * 0.5;
        const petalWidth = size * 0.2;
        drawPetal(x, y, petalLength, petalWidth, angle, innerColor, 180);
      }
      
      // Center
      const centerGradient = p5.drawingContext.createRadialGradient(x, y, 0, x, y, size * 0.25);
      centerGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
      centerGradient.addColorStop(0.5, `rgba(${innerColor[0]}, ${innerColor[1]}, ${innerColor[2]}, 1)`);
      centerGradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`);
      p5.drawingContext.fillStyle = centerGradient;
      p5.drawingContext.beginPath();
      p5.drawingContext.arc(x, y, size * 0.25, 0, p5.TWO_PI);
      p5.drawingContext.fill();
      
      // Center sparkle
      p5.fill(255, 255, 255, 200);
      p5.noStroke();
      p5.ellipse(x - size * 0.05, y - size * 0.05, size * 0.08, size * 0.08);
    };
    
    // Draw a lotus/water lily
    const drawLotus = (x, y, size, color) => {
      const numLayers = 4;
      for (let layer = numLayers - 1; layer >= 0; layer--) {
        const layerSize = size * (0.4 + layer * 0.2);
        const numPetals = 8 + layer * 4;
        const rotation = layer * 0.15;
        const layerColor = [
          p5.lerp(255, color[0], layer / numLayers),
          p5.lerp(255, color[1], layer / numLayers),
          p5.lerp(255, color[2], layer / numLayers),
        ];
        
        for (let i = 0; i < numPetals; i++) {
          const angle = (p5.TWO_PI / numPetals) * i + rotation;
          drawPetal(x, y, layerSize, layerSize * 0.3, angle, layerColor, 180 + layer * 20);
        }
      }
      
      // Golden center
      const centerGrad = p5.drawingContext.createRadialGradient(x, y, 0, x, y, size * 0.15);
      centerGrad.addColorStop(0, 'rgba(255, 250, 200, 1)');
      centerGrad.addColorStop(1, 'rgba(255, 200, 100, 0.8)');
      p5.drawingContext.fillStyle = centerGrad;
      p5.drawingContext.beginPath();
      p5.drawingContext.arc(x, y, size * 0.15, 0, p5.TWO_PI);
      p5.drawingContext.fill();
    };
    
    // ═══════════════════════════════════════════════════════════
    // ART STYLE: FLOWER MANDALA
    // ═══════════════════════════════════════════════════════════
    if (artStyle === 'flower_mandala') {
      // Background floral pattern
      for (let i = 0; i < 30; i++) {
        const x = p5.random(width);
        const y = p5.random(height);
        const size = 15 + p5.random(25);
        const color = colors[Math.floor(p5.random(colors.length))];
        const numPetals = 5 + Math.floor(p5.random(4));
        
        for (let p = 0; p < numPetals; p++) {
          const angle = (p5.TWO_PI / numPetals) * p;
          drawPetal(x, y, size, size * 0.3, angle, color, 40);
        }
      }
      
      // Mandala rings with flowers
      const numRings = 4;
      for (let ring = numRings - 1; ring >= 0; ring--) {
        const ringRadius = 50 + ring * 60;
        const numFlowers = 6 + ring * 4;
        const flowerSize = 35 - ring * 5;
        const color = colors[ring % colors.length];
        const innerColor = colors[(ring + 2) % colors.length];
        
        for (let i = 0; i < numFlowers; i++) {
          const angle = (p5.TWO_PI / numFlowers) * i + ring * 0.2;
          const fx = centerX + Math.cos(angle) * ringRadius;
          const fy = centerY + Math.sin(angle) * ringRadius;
          drawFlower(fx, fy, flowerSize, 6 + ring, color, innerColor, angle);
        }
      }
      
      // Central lotus
      drawLotus(centerX, centerY, 80, colors[0]);
    }
    
    // ═══════════════════════════════════════════════════════════
    // ART STYLE: COSMIC BLOOM
    // ═══════════════════════════════════════════════════════════
    else if (artStyle === 'cosmic_bloom') {
      // Nebula clouds
      for (let i = 0; i < 500; i++) {
        const angle = p5.random(p5.TWO_PI);
        const dist = p5.random(width * 0.6);
        const x = centerX + Math.cos(angle) * dist * (0.5 + p5.noise(i * 0.1) * 0.5);
        const y = centerY + Math.sin(angle) * dist * (0.5 + p5.noise(i * 0.1, 100) * 0.5);
        const size = 3 + p5.random(8);
        const color = colors[Math.floor(p5.random(colors.length))];
        const alpha = 10 + p5.random(30);
        
        p5.noStroke();
        p5.fill(color[0], color[1], color[2], alpha);
        p5.ellipse(x, y, size, size);
      }
      
      // Spiral galaxy flowers
      const numSpirals = 3;
      for (let spiral = 0; spiral < numSpirals; spiral++) {
        const spiralOffset = (p5.TWO_PI / numSpirals) * spiral;
        const spiralColor = colors[spiral % colors.length];
        
        for (let i = 0; i < 40; i++) {
          const t = i / 40;
          const angle = spiralOffset + t * p5.TWO_PI * 2.5;
          const dist = 30 + t * 180;
          const x = centerX + Math.cos(angle) * dist;
          const y = centerY + Math.sin(angle) * dist;
          const size = 10 + (1 - t) * 25;
          
          // Small cosmic flowers
          const numPetals = 5;
          for (let p = 0; p < numPetals; p++) {
            const petalAngle = (p5.TWO_PI / numPetals) * p + angle;
            drawPetal(x, y, size, size * 0.35, petalAngle, spiralColor, 150 + t * 100);
          }
          
          // Flower center glow
          p5.noStroke();
          for (let g = size * 0.4; g > 0; g -= 2) {
            const a = p5.map(g, 0, size * 0.4, 200, 0);
            p5.fill(255, 255, 255, a);
            p5.ellipse(x, y, g, g);
          }
        }
      }
      
      // Central starburst flower
      const starColor = colors[0];
      for (let layer = 0; layer < 3; layer++) {
        const layerPetals = 12 - layer * 2;
        const layerSize = 60 - layer * 15;
        for (let i = 0; i < layerPetals; i++) {
          const angle = (p5.TWO_PI / layerPetals) * i + layer * 0.2;
          drawPetal(centerX, centerY, layerSize, layerSize * 0.25, angle, starColor, 200);
        }
      }
      
      // Bright center
      const centerBurst = p5.drawingContext.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
      centerBurst.addColorStop(0, 'rgba(255, 255, 255, 1)');
      centerBurst.addColorStop(0.3, `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, 0.8)`);
      centerBurst.addColorStop(1, 'rgba(255, 255, 255, 0)');
      p5.drawingContext.fillStyle = centerBurst;
      p5.drawingContext.beginPath();
      p5.drawingContext.arc(centerX, centerY, 40, 0, p5.TWO_PI);
      p5.drawingContext.fill();
    }
    
    // ═══════════════════════════════════════════════════════════
    // ART STYLE: AURORA GARDEN
    // ═══════════════════════════════════════════════════════════
    else if (artStyle === 'aurora_garden') {
      // Flowing aurora waves
      for (let wave = 0; wave < 8; wave++) {
        const waveColor = colors[wave % colors.length];
        const baseY = height * (0.3 + wave * 0.08);
        
        for (let layer = 0; layer < 15; layer++) {
          const alpha = p5.map(layer, 0, 15, 20, 2);
          p5.noFill();
          p5.stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
          p5.strokeWeight(3);
          
          p5.beginShape();
          for (let x = 0; x <= width; x += 5) {
            const noiseVal = p5.noise(x * 0.005 + wave, wave * 0.3, layer * 0.1);
            const y = baseY + Math.sin(x * 0.01 + wave * 0.5) * 40 + noiseVal * 80 - 40 + layer * 5;
            p5.vertex(x, y);
          }
          p5.endShape();
        }
      }
      
      // Floating garden flowers
      for (let i = 0; i < 25; i++) {
        const x = p5.random(width * 0.1, width * 0.9);
        const y = p5.random(height * 0.2, height * 0.8);
        const size = 20 + p5.random(35);
        const color = colors[Math.floor(p5.random(colors.length))];
        const innerColor = colors[Math.floor(p5.random(colors.length))];
        const numPetals = 5 + Math.floor(p5.random(4));
        
        drawFlower(x, y, size, numPetals, color, innerColor, p5.random(p5.TWO_PI));
      }
      
      // Dreamy particles
      for (let i = 0; i < 80; i++) {
        const x = p5.random(width);
        const y = p5.random(height);
        const size = 2 + p5.random(4);
        const color = colors[Math.floor(p5.random(colors.length))];
        
        for (let g = size * 3; g > 0; g -= 1) {
          const alpha = p5.map(g, 0, size * 3, 100, 0);
          p5.noStroke();
          p5.fill(color[0], color[1], color[2], alpha);
          p5.ellipse(x, y, g, g);
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════
    // ART STYLE: CRYSTAL LOTUS
    // ═══════════════════════════════════════════════════════════
    else if (artStyle === 'crystal_lotus') {
      // Crystalline background pattern
      for (let i = 0; i < 60; i++) {
        const x = p5.random(width);
        const y = p5.random(height);
        const size = 20 + p5.random(40);
        const color = colors[Math.floor(p5.random(colors.length))];
        const numSides = 6;
        
        // Crystal shape
        p5.noFill();
        p5.stroke(color[0], color[1], color[2], 30);
        p5.strokeWeight(1);
        p5.beginShape();
        for (let j = 0; j < numSides; j++) {
          const angle = (p5.TWO_PI / numSides) * j;
          const px = x + Math.cos(angle) * size;
          const py = y + Math.sin(angle) * size;
          p5.vertex(px, py);
        }
        p5.endShape(p5.CLOSE);
        
        // Inner lines
        for (let j = 0; j < numSides; j++) {
          const angle = (p5.TWO_PI / numSides) * j;
          p5.stroke(color[0], color[1], color[2], 15);
          p5.line(x, y, x + Math.cos(angle) * size, y + Math.sin(angle) * size);
        }
      }
      
      // Geometric mandala rings
      for (let ring = 0; ring < 5; ring++) {
        const radius = 40 + ring * 45;
        const numPoints = 12 + ring * 6;
        const color = colors[ring % colors.length];
        
        // Ring glow
        p5.noFill();
        for (let g = 20; g > 0; g -= 4) {
          p5.stroke(color[0], color[1], color[2], g * 1.5);
          p5.strokeWeight(1);
          p5.ellipse(centerX, centerY, radius * 2 + g, radius * 2 + g);
        }
        
        // Points with flowers
        for (let i = 0; i < numPoints; i++) {
          const angle = (p5.TWO_PI / numPoints) * i + ring * 0.1;
          const px = centerX + Math.cos(angle) * radius;
          const py = centerY + Math.sin(angle) * radius;
          
          if (ring < 3) {
            // Small flowers on inner rings
            const flowerSize = 12 - ring * 2;
            for (let p = 0; p < 5; p++) {
              const petalAngle = (p5.TWO_PI / 5) * p + angle;
              drawPetal(px, py, flowerSize, flowerSize * 0.4, petalAngle, color, 180);
            }
            p5.fill(255, 255, 200);
            p5.noStroke();
            p5.ellipse(px, py, 4, 4);
          } else {
            // Crystal points on outer rings
            p5.fill(color[0], color[1], color[2], 150);
            p5.noStroke();
            p5.ellipse(px, py, 6, 6);
          }
        }
        
        // Connect points
        p5.stroke(color[0], color[1], color[2], 40);
        p5.strokeWeight(0.5);
        for (let i = 0; i < numPoints; i++) {
          const a1 = (p5.TWO_PI / numPoints) * i + ring * 0.1;
          const a2 = (p5.TWO_PI / numPoints) * ((i + 2) % numPoints) + ring * 0.1;
          p5.line(
            centerX + Math.cos(a1) * radius,
            centerY + Math.sin(a1) * radius,
            centerX + Math.cos(a2) * radius,
            centerY + Math.sin(a2) * radius
          );
        }
      }
      
      // Central multi-layer lotus
      drawLotus(centerX, centerY, 70, colors[0]);
      
      // Crown jewel at center
      p5.noStroke();
      const jewelGrad = p5.drawingContext.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
      jewelGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      jewelGrad.addColorStop(0.5, 'rgba(255, 255, 200, 0.8)');
      jewelGrad.addColorStop(1, `rgba(${colors[0][0]}, ${colors[0][1]}, ${colors[0][2]}, 0)`);
      p5.drawingContext.fillStyle = jewelGrad;
      p5.drawingContext.beginPath();
      p5.drawingContext.arc(centerX, centerY, 15, 0, p5.TWO_PI);
      p5.drawingContext.fill();
    }
    
    // ═══════════════════════════════════════════════════════════
    // FINAL TOUCHES: Sparkles & Vignette
    // ═══════════════════════════════════════════════════════════
    
    // Sparkle overlay
    for (let i = 0; i < 60; i++) {
      const x = p5.random(width);
      const y = p5.random(height);
      const size = p5.random(1, 2.5);
      const brightness = p5.random(200, 255);
      
      // 4-point star sparkle
      p5.stroke(255, 255, 255, brightness);
      p5.strokeWeight(0.8);
      const len = size * 4;
      p5.line(x - len, y, x + len, y);
      p5.line(x, y - len, x, y + len);
      
      p5.noStroke();
      p5.fill(255, 255, 255, brightness);
      p5.ellipse(x, y, size, size);
    }
    
    // Soft vignette
    const vignette = p5.drawingContext.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, width * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    
    p5.drawingContext.fillStyle = vignette;
    p5.drawingContext.fillRect(0, 0, width, height);
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
