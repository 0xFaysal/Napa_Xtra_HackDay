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
   * Generate a stunning artistic pattern based on the secret text
   * Creates award-winning generative art that looks gallery-worthy
   */
  const generatePattern = useCallback((p5, width, height, secretText) => {
    const seed = generateVisualSeed(secretText);
    p5.randomSeed(seed);
    p5.noiseSeed(seed);
    
    // Color palettes - all beautiful combinations
    const palettes = [
      // Aurora Borealis
      { bg: [8, 12, 24], colors: [[0, 255, 180], [100, 200, 255], [180, 100, 255], [255, 100, 200]] },
      // Sunset Dreams
      { bg: [15, 8, 20], colors: [[255, 100, 80], [255, 150, 50], [255, 80, 150], [200, 50, 255]] },
      // Ocean Depths
      { bg: [5, 15, 25], colors: [[0, 200, 255], [0, 150, 200], [100, 255, 220], [50, 100, 255]] },
      // Cosmic Purple
      { bg: [12, 5, 20], colors: [[180, 80, 255], [255, 100, 180], [100, 150, 255], [220, 180, 255]] },
      // Emerald Night
      { bg: [5, 18, 15], colors: [[0, 255, 150], [100, 255, 180], [0, 200, 100], [150, 255, 200]] },
      // Fire & Ice
      { bg: [10, 10, 18], colors: [[255, 80, 50], [0, 200, 255], [255, 150, 80], [100, 220, 255]] },
    ];
    
    const palette = palettes[seed % palettes.length];
    const [bgR, bgG, bgB] = palette.bg;
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 0: Deep gradient background
    // ═══════════════════════════════════════════════════════════
    for (let y = 0; y < height; y++) {
      const inter = y / height;
      const r = p5.lerp(bgR, bgR * 0.3, inter);
      const g = p5.lerp(bgG, bgG * 0.3, inter);
      const b = p5.lerp(bgB * 1.5, bgB * 0.5, inter);
      p5.stroke(r, g, b);
      p5.line(0, y, width, y);
    }
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 1: Organic flowing aurora waves
    // ═══════════════════════════════════════════════════════════
    const numWaves = 5 + (seed % 4);
    for (let w = 0; w < numWaves; w++) {
      const baseY = height * (0.2 + (w / numWaves) * 0.6);
      const color = palette.colors[w % palette.colors.length];
      const waveOffset = (seed + w * 1000) * 0.01;
      
      for (let layer = 0; layer < 20; layer++) {
        const alpha = p5.map(layer, 0, 20, 3, 0);
        const spread = layer * 8;
        
        p5.noFill();
        p5.stroke(color[0], color[1], color[2], alpha);
        p5.strokeWeight(2);
        
        p5.beginShape();
        for (let x = 0; x <= width; x += 4) {
          const noiseVal = p5.noise(x * 0.003 + waveOffset, w * 0.5, layer * 0.1);
          const y = baseY + Math.sin(x * 0.008 + w) * 50 + noiseVal * 100 - 50 + spread * (noiseVal - 0.5);
          p5.vertex(x, y);
        }
        p5.endShape();
      }
    }
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 2: Particle constellation field
    // ═══════════════════════════════════════════════════════════
    const particles = [];
    const numParticles = 150 + (seed % 100);
    
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: p5.random(width),
        y: p5.random(height),
        size: p5.random(1, 4),
        brightness: p5.random(150, 255),
        color: palette.colors[Math.floor(p5.random(palette.colors.length))],
      });
    }
    
    // Draw connecting lines (constellation effect)
    const connectionDistance = 60;
    p5.strokeWeight(0.5);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = p5.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
        if (d < connectionDistance) {
          const alpha = p5.map(d, 0, connectionDistance, 40, 0);
          const col = particles[i].color;
          p5.stroke(col[0], col[1], col[2], alpha);
          p5.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
        }
      }
    }
    
    // Draw particles with glow
    for (const particle of particles) {
      // Outer glow
      for (let r = particle.size * 4; r > 0; r -= 2) {
        const alpha = p5.map(r, 0, particle.size * 4, particle.brightness * 0.5, 0);
        p5.noStroke();
        p5.fill(particle.color[0], particle.color[1], particle.color[2], alpha);
        p5.ellipse(particle.x, particle.y, r, r);
      }
      // Core
      p5.fill(255, 255, 255, particle.brightness);
      p5.ellipse(particle.x, particle.y, particle.size, particle.size);
    }
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 3: Elegant geometric sacred geometry
    // ═══════════════════════════════════════════════════════════
    const centerX = width / 2;
    const centerY = height / 2;
    const numRings = 3 + (seed % 3);
    
    for (let ring = 0; ring < numRings; ring++) {
      const ringRadius = 80 + ring * 50;
      const numPoints = 6 + ring * 2;
      const rotation = (seed + ring * 30) * 0.02;
      const color = palette.colors[(ring + 1) % palette.colors.length];
      
      // Draw ring glow
      for (let g = 30; g > 0; g -= 5) {
        p5.noFill();
        p5.stroke(color[0], color[1], color[2], g * 0.3);
        p5.strokeWeight(1 + g * 0.1);
        p5.ellipse(centerX, centerY, ringRadius * 2 + g, ringRadius * 2 + g);
      }
      
      // Draw geometric shape
      p5.stroke(color[0], color[1], color[2], 80);
      p5.strokeWeight(1.5);
      
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (p5.TWO_PI / numPoints) * i + rotation;
        points.push({
          x: centerX + Math.cos(angle) * ringRadius,
          y: centerY + Math.sin(angle) * ringRadius,
        });
      }
      
      // Connect all points (creates beautiful star patterns)
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 2; j < points.length; j++) {
          if (j !== (i + points.length - 1) % points.length) {
            const alpha = 30 + (ring * 10);
            p5.stroke(color[0], color[1], color[2], alpha);
            p5.line(points[i].x, points[i].y, points[j].x, points[j].y);
          }
        }
      }
      
      // Draw vertices with glow
      for (const point of points) {
        for (let s = 15; s > 0; s -= 3) {
          p5.noStroke();
          p5.fill(color[0], color[1], color[2], s * 2);
          p5.ellipse(point.x, point.y, s, s);
        }
        p5.fill(255);
        p5.ellipse(point.x, point.y, 3, 3);
      }
    }
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 4: Central energy core
    // ═══════════════════════════════════════════════════════════
    const coreColor = palette.colors[0];
    
    // Outer energy rings
    for (let i = 0; i < 8; i++) {
      const radius = 30 + i * 15;
      const alpha = p5.map(i, 0, 8, 50, 10);
      const wobble = Math.sin(seed * 0.1 + i * 0.5) * 10;
      
      p5.noFill();
      p5.stroke(coreColor[0], coreColor[1], coreColor[2], alpha);
      p5.strokeWeight(2);
      p5.ellipse(centerX, centerY, radius * 2 + wobble, radius * 2 - wobble * 0.5);
    }
    
    // Core glow
    for (let r = 60; r > 0; r -= 2) {
      const alpha = p5.map(r, 0, 60, 80, 0);
      const mixRatio = r / 60;
      p5.noStroke();
      p5.fill(
        p5.lerp(255, coreColor[0], mixRatio),
        p5.lerp(255, coreColor[1], mixRatio),
        p5.lerp(255, coreColor[2], mixRatio),
        alpha
      );
      p5.ellipse(centerX, centerY, r * 2, r * 2);
    }
    
    // Bright center
    p5.fill(255, 255, 255, 200);
    p5.ellipse(centerX, centerY, 20, 20);
    p5.fill(255, 255, 255);
    p5.ellipse(centerX, centerY, 8, 8);
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 5: Floating orbs with trails
    // ═══════════════════════════════════════════════════════════
    const numOrbs = 8 + (seed % 6);
    for (let i = 0; i < numOrbs; i++) {
      const angle = (p5.TWO_PI / numOrbs) * i + seed * 0.05;
      const distance = 120 + p5.noise(i, seed * 0.01) * 100;
      const orbX = centerX + Math.cos(angle) * distance;
      const orbY = centerY + Math.sin(angle) * distance;
      const color = palette.colors[i % palette.colors.length];
      const orbSize = 8 + p5.random(8);
      
      // Trail
      p5.noFill();
      p5.strokeWeight(2);
      for (let t = 0; t < 30; t++) {
        const trailAngle = angle - t * 0.03;
        const trailDist = distance - t * 1;
        const tx = centerX + Math.cos(trailAngle) * trailDist;
        const ty = centerY + Math.sin(trailAngle) * trailDist;
        const alpha = p5.map(t, 0, 30, 60, 0);
        p5.stroke(color[0], color[1], color[2], alpha);
        p5.point(tx, ty);
      }
      
      // Orb glow
      for (let g = orbSize * 3; g > 0; g -= 2) {
        const alpha = p5.map(g, 0, orbSize * 3, 50, 0);
        p5.noStroke();
        p5.fill(color[0], color[1], color[2], alpha);
        p5.ellipse(orbX, orbY, g, g);
      }
      
      // Orb core
      p5.fill(255, 255, 255, 200);
      p5.ellipse(orbX, orbY, orbSize * 0.5, orbSize * 0.5);
    }
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 6: Subtle light rays from center
    // ═══════════════════════════════════════════════════════════
    const numRays = 12 + (seed % 8);
    for (let i = 0; i < numRays; i++) {
      const angle = (p5.TWO_PI / numRays) * i + seed * 0.02;
      const rayLength = 200 + p5.noise(i) * 150;
      const color = palette.colors[i % palette.colors.length];
      
      const gradient = p5.drawingContext.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(angle) * rayLength,
        centerY + Math.sin(angle) * rayLength
      );
      gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.15)`);
      gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
      
      p5.drawingContext.strokeStyle = gradient;
      p5.drawingContext.lineWidth = 20 + p5.random(20);
      p5.drawingContext.beginPath();
      p5.drawingContext.moveTo(centerX, centerY);
      p5.drawingContext.lineTo(
        centerX + Math.cos(angle) * rayLength,
        centerY + Math.sin(angle) * rayLength
      );
      p5.drawingContext.stroke();
    }
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 7: Sparkle overlay
    // ═══════════════════════════════════════════════════════════
    for (let i = 0; i < 100; i++) {
      const x = p5.random(width);
      const y = p5.random(height);
      const sparkleSize = p5.random(1, 3);
      const brightness = p5.random(180, 255);
      
      // 4-point star sparkle
      p5.stroke(255, 255, 255, brightness);
      p5.strokeWeight(1);
      const len = sparkleSize * 3;
      p5.line(x - len, y, x + len, y);
      p5.line(x, y - len, x, y + len);
      
      // Center dot
      p5.noStroke();
      p5.fill(255, 255, 255, brightness);
      p5.ellipse(x, y, sparkleSize, sparkleSize);
    }
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 8: Vignette effect
    // ═══════════════════════════════════════════════════════════
    const vignette = p5.drawingContext.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, width * 0.7
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    
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
