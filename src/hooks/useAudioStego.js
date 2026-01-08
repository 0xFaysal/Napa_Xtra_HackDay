/**
 * NEBULA - Audio Steganography Hook
 * Hides encrypted data in WAV file metadata chunks
 */

'use client';

import { useCallback } from 'react';
import { WaveFile } from 'wavefile';
import {
  encryptText,
  decryptText,
  generateVisualSeed,
} from '@/utils/steganography';

/**
 * Custom hook for Audio Steganography operations
 */
export function useAudioStego() {
  
  // ═══════════════════════════════════════════════════════════════
  // SYNTHETIC SOUND GENERATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate a unique soundscape based on the secret text
   * Creates an ambient, mysterious sound that varies with the message
   */
  const generateSoundscape = useCallback((secretText, durationSeconds = 5) => {
    const sampleRate = 44100;
    const numSamples = sampleRate * durationSeconds;
    const samples = new Float32Array(numSamples);
    
    // Use the secret text to seed the sound generation
    const seed = generateVisualSeed(secretText);
    
    // Pseudo-random number generator (seeded)
    let randomState = seed;
    const seededRandom = () => {
      randomState = (randomState * 1103515245 + 12345) & 0x7fffffff;
      return randomState / 0x7fffffff;
    };
    
    // Generate base frequencies from seed
    const baseFreq = 100 + (seed % 200); // 100-300 Hz
    const harmonic1 = baseFreq * 1.5;
    const harmonic2 = baseFreq * 2;
    const modFreq = 0.5 + (seed % 100) / 100; // 0.5-1.5 Hz
    
    // Generate the soundscape
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      
      // Modulation envelope
      const modulation = 0.5 + 0.5 * Math.sin(2 * Math.PI * modFreq * t);
      
      // Fade in/out envelope
      const fadeIn = Math.min(1, t * 2);
      const fadeOut = Math.min(1, (durationSeconds - t) * 2);
      const envelope = fadeIn * fadeOut;
      
      // Base tone with harmonics
      let sample = 0;
      sample += 0.3 * Math.sin(2 * Math.PI * baseFreq * t);
      sample += 0.2 * Math.sin(2 * Math.PI * harmonic1 * t);
      sample += 0.1 * Math.sin(2 * Math.PI * harmonic2 * t);
      
      // Add subtle noise texture
      const noise = (seededRandom() * 2 - 1) * 0.05;
      sample += noise;
      
      // Add pulsing effect based on text length
      const pulseFreq = 1 + (secretText.length % 5);
      const pulse = 0.7 + 0.3 * Math.sin(2 * Math.PI * pulseFreq * t);
      
      // Apply modulation and envelope
      sample *= modulation * envelope * pulse * 0.5;
      
      samples[i] = sample;
    }
    
    return samples;
  }, []);

  /**
   * Convert Float32Array to 16-bit PCM samples
   */
  const floatTo16BitPCM = useCallback((floatSamples) => {
    const int16Samples = new Int16Array(floatSamples.length);
    
    for (let i = 0; i < floatSamples.length; i++) {
      // Clamp to [-1, 1] range
      const clamped = Math.max(-1, Math.min(1, floatSamples[i]));
      // Convert to 16-bit integer
      int16Samples[i] = clamped < 0 
        ? clamped * 0x8000 
        : clamped * 0x7FFF;
    }
    
    return int16Samples;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ENCODE (Hide data in WAV metadata)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Encode secret text into a WAV file using metadata chunks
   * @param {string} secretText - The message to hide
   * @param {string} password - Encryption password
   * @returns {Promise<Blob>} - WAV file blob with hidden data
   */
  const encode = useCallback(async (secretText, password) => {
    return new Promise((resolve, reject) => {
      try {
        // Step 1: Encrypt the text
        const encryptedText = encryptText(secretText, password);
        console.log('Encrypted text for audio:', encryptedText.length, 'chars');

        // Step 2: Generate soundscape
        const floatSamples = generateSoundscape(secretText, 5);
        const samples = floatTo16BitPCM(floatSamples);
        
        // Step 3: Create WAV file
        const wav = new WaveFile();
        wav.fromScratch(1, 44100, '16', samples);
        
        // Step 4: Hide encrypted data in LIST INFO metadata
        // Using ICRD (Creation Date) and ICMT (Comment) chunks
        // This is a safe place that survives most audio players
        
        // Split the encrypted text if it's very long
        const marker = 'NEBULA_SECRET:';
        const hiddenData = marker + encryptedText;
        
        // Set the secret in the comment tag
        wav.setTag('ICMT', hiddenData);
        
        // Also set some decoy metadata to make it look normal
        wav.setTag('INAM', 'Nebula Ambient');
        wav.setTag('IART', 'NEBULA Generator');
        wav.setTag('ICRD', new Date().toISOString().split('T')[0]);
        wav.setTag('IGNR', 'Ambient/Electronic');
        wav.setTag('ISFT', 'NEBULA Steganography Tool');
        
        // Step 5: Convert to buffer and create blob
        const wavBuffer = wav.toBuffer();
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        
        console.log('WAV file created:', blob.size, 'bytes');
        resolve(blob);

      } catch (error) {
        console.error('Audio encoding error:', error);
        reject(error);
      }
    });
  }, [generateSoundscape, floatTo16BitPCM]);

  // ═══════════════════════════════════════════════════════════════
  // DECODE (Extract data from WAV metadata)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Decode hidden text from a WAV file
   * @param {File} audioFile - The WAV file to decode
   * @param {string} password - Decryption password
   * @returns {Promise<string>} - The revealed secret text
   */
  const decode = useCallback(async (audioFile, password) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Step 1: Read the WAV file
          const arrayBuffer = e.target.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          const wav = new WaveFile(uint8Array);
          
          // Step 2: Extract the hidden data from metadata
          const comment = wav.getTag('ICMT');
          
          console.log('Extracted comment tag:', comment ? 'Found' : 'Not found');
          
          if (!comment) {
            reject(new Error('No hidden data found in this audio file'));
            return;
          }
          
          // Step 3: Check for our marker
          const marker = 'NEBULA_SECRET:';
          if (!comment.startsWith(marker)) {
            reject(new Error('This audio file does not contain NEBULA data'));
            return;
          }
          
          // Step 4: Extract encrypted text
          const encryptedText = comment.slice(marker.length);
          console.log('Found encrypted data:', encryptedText.length, 'chars');
          
          // Step 5: Decrypt with password
          const decryptedText = decryptText(encryptedText, password);
          
          if (!decryptedText) {
            reject(new Error('Invalid password or corrupted data'));
            return;
          }
          
          resolve(decryptedText);
          
        } catch (error) {
          console.error('Audio decoding error:', error);
          reject(new Error('Failed to read audio file. Make sure it\'s a valid NEBULA WAV file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };
      
      reader.readAsArrayBuffer(audioFile);
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // DOWNLOAD HELPER
  // ═══════════════════════════════════════════════════════════════

  /**
   * Trigger download of the encoded audio file
   * @param {Blob} blob - The audio blob
   * @param {string} filename - Download filename
   */
  const downloadAudio = useCallback((blob, filename = 'nebula-secret.wav') => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // AUDIO PLAYBACK
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create an audio URL for playback
   * @param {Blob} blob - The audio blob
   * @returns {string} - Object URL for audio playback
   */
  const createAudioURL = useCallback((blob) => {
    return URL.createObjectURL(blob);
  }, []);

  return {
    generateSoundscape,
    encode,
    decode,
    downloadAudio,
    createAudioURL,
  };
}

export default useAudioStego;
