/**
 * NEBULA - Audio Steganography Hook
 * Hides encrypted data in audio sample LSBs (true audio steganography)
 */

'use client';

import { useCallback } from 'react';
import { WaveFile } from 'wavefile';
import {
  encryptText,
  decryptText,
  generateVisualSeed,
  stringToBinary,
  binaryToString,
} from '@/utils/steganography';

// End delimiter to mark the end of hidden data
const END_DELIMITER = '1111111111111110';

/**
 * Custom hook for Audio Steganography operations
 * Uses LSB encoding in PCM audio samples
 */
export function useAudioStego() {
  
  // ═══════════════════════════════════════════════════════════════
  // SYNTHETIC SOUND GENERATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate beautiful piano/guitar style ambient music
   * Sounds like lo-fi study music or ambient piano pieces
   * Returns 16-bit PCM samples directly
   */
  const generateSoundscape = useCallback((secretText, durationSeconds = 12) => {
    const sampleRate = 44100;
    const numSamples = sampleRate * durationSeconds;
    const samples = new Int16Array(numSamples);
    
    // Use the secret text to seed variations
    const seed = generateVisualSeed(secretText);
    
    // Seeded random for consistent output
    let randomState = seed;
    const seededRandom = () => {
      randomState = (randomState * 1103515245 + 12345) & 0x7fffffff;
      return randomState / 0x7fffffff;
    };
    
    // ═══════════════════════════════════════════════════════════
    // MUSICAL SCALES & NOTES (in Hz)
    // ═══════════════════════════════════════════════════════════
    
    // Beautiful piano/guitar friendly keys
    const scales = {
      // C Major (happy, peaceful)
      cMajor: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
      // A Minor (emotional, reflective)
      aMinor: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
      // G Major (warm, uplifting)
      gMajor: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 369.99, 392.00],
      // D Major (bright, joyful)
      dMajor: [293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 554.37, 587.33],
    };
    
    // Select scale based on seed
    const scaleNames = Object.keys(scales);
    const selectedScale = scales[scaleNames[seed % scaleNames.length]];
    
    // Chord progressions (indices into scale)
    const chordProgressions = [
      [[0, 2, 4], [3, 5, 7], [4, 6, 1], [0, 2, 4]], // I - IV - V - I
      [[0, 2, 4], [5, 0, 2], [3, 5, 7], [0, 2, 4]], // I - vi - IV - I
      [[0, 2, 4], [4, 6, 1], [5, 0, 2], [3, 5, 7]], // I - V - vi - IV
    ];
    
    const progression = chordProgressions[seed % chordProgressions.length];
    const beatsPerChord = 8;
    const bpm = 70 + (seed % 20); // 70-90 BPM (relaxed tempo)
    const beatDuration = 60 / bpm;
    const chordDuration = beatsPerChord * beatDuration;
    
    // ═══════════════════════════════════════════════════════════
    // PIANO NOTE SYNTHESIS
    // ═══════════════════════════════════════════════════════════
    
    const pianoNote = (freq, t, noteStart, noteDuration) => {
      const noteT = t - noteStart;
      if (noteT < 0 || noteT > noteDuration * 2) return 0;
      
      // Piano ADSR envelope
      const attack = 0.008;
      const decay = 0.15;
      const sustain = 0.4;
      const release = noteDuration * 0.8;
      
      let envelope;
      if (noteT < attack) {
        envelope = noteT / attack;
      } else if (noteT < attack + decay) {
        envelope = 1 - (1 - sustain) * ((noteT - attack) / decay);
      } else if (noteT < noteDuration) {
        envelope = sustain * Math.exp(-(noteT - attack - decay) * 1.5);
      } else {
        envelope = sustain * Math.exp(-(noteDuration - attack - decay) * 1.5) * 
                   Math.exp(-(noteT - noteDuration) / release);
      }
      
      // Piano harmonics (approximating real piano spectrum)
      let sound = 0;
      sound += Math.sin(2 * Math.PI * freq * noteT) * 1.0;           // Fundamental
      sound += Math.sin(2 * Math.PI * freq * 2 * noteT) * 0.5;       // 2nd harmonic
      sound += Math.sin(2 * Math.PI * freq * 3 * noteT) * 0.25;      // 3rd
      sound += Math.sin(2 * Math.PI * freq * 4 * noteT) * 0.15;      // 4th
      sound += Math.sin(2 * Math.PI * freq * 5 * noteT) * 0.08;      // 5th
      sound += Math.sin(2 * Math.PI * freq * 6 * noteT) * 0.04;      // 6th
      
      // Slight detuning for warmth
      sound += Math.sin(2 * Math.PI * freq * 1.002 * noteT) * 0.3;
      
      // High frequency decay (piano characteristic)
      const highDecay = Math.exp(-noteT * 3);
      sound += Math.sin(2 * Math.PI * freq * 7 * noteT) * 0.03 * highDecay;
      sound += Math.sin(2 * Math.PI * freq * 8 * noteT) * 0.02 * highDecay;
      
      return sound * envelope * 0.15;
    };
    
    // ═══════════════════════════════════════════════════════════
    // GUITAR STRING SYNTHESIS
    // ═══════════════════════════════════════════════════════════
    
    const guitarNote = (freq, t, noteStart, noteDuration) => {
      const noteT = t - noteStart;
      if (noteT < 0 || noteT > noteDuration * 1.5) return 0;
      
      // Guitar pluck envelope
      const attack = 0.003;
      const decay = noteDuration * 0.7;
      
      let envelope;
      if (noteT < attack) {
        envelope = noteT / attack;
      } else {
        envelope = Math.exp(-(noteT - attack) / decay);
      }
      
      // Karplus-Strong inspired (simplified)
      let sound = 0;
      const pluckBrightness = Math.exp(-noteT * 8); // Initial brightness fades
      
      sound += Math.sin(2 * Math.PI * freq * noteT) * 1.0;
      sound += Math.sin(2 * Math.PI * freq * 2 * noteT) * (0.6 * pluckBrightness + 0.2);
      sound += Math.sin(2 * Math.PI * freq * 3 * noteT) * (0.4 * pluckBrightness + 0.1);
      sound += Math.sin(2 * Math.PI * freq * 4 * noteT) * (0.3 * pluckBrightness);
      sound += Math.sin(2 * Math.PI * freq * 5 * noteT) * (0.15 * pluckBrightness);
      
      // String vibration character
      const vibrato = 1 + Math.sin(2 * Math.PI * 5 * noteT) * 0.003 * Math.min(1, noteT * 2);
      sound += Math.sin(2 * Math.PI * freq * vibrato * noteT) * 0.2;
      
      return sound * envelope * 0.12;
    };
    
    // ═══════════════════════════════════════════════════════════
    // PRE-GENERATE NOTE SCHEDULE
    // ═══════════════════════════════════════════════════════════
    
    const notes = [];
    const useGuitar = (seed % 3) === 0; // 1/3 chance guitar, 2/3 piano
    const useBoth = (seed % 5) === 0; // Sometimes use both!
    
    // Generate arpeggiated pattern
    for (let chordNum = 0; chordNum < Math.ceil(durationSeconds / chordDuration); chordNum++) {
      const chordStartTime = chordNum * chordDuration;
      const chordIndices = progression[chordNum % progression.length];
      
      // Arpeggio pattern variations
      const patterns = [
        [0, 1, 2, 1], // Up-down
        [0, 1, 2, 2, 1, 0], // Up-down full
        [0, 2, 1, 2], // Broken
        [2, 1, 0, 1], // Down-up
      ];
      const pattern = patterns[(seed + chordNum) % patterns.length];
      
      // Generate notes for this chord
      for (let beat = 0; beat < beatsPerChord; beat++) {
        const noteIndex = pattern[beat % pattern.length];
        const scaleIndex = chordIndices[noteIndex % chordIndices.length];
        const freq = selectedScale[scaleIndex % selectedScale.length];
        
        const noteStart = chordStartTime + beat * beatDuration;
        const noteDuration = beatDuration * (1.5 + seededRandom() * 0.5);
        
        // Add some velocity variation
        const velocity = 0.7 + seededRandom() * 0.3;
        
        // Occasionally add octave variation
        const octaveShift = seededRandom() > 0.85 ? 2 : (seededRandom() > 0.7 ? 0.5 : 1);
        
        notes.push({
          freq: freq * octaveShift,
          start: noteStart,
          duration: noteDuration,
          velocity,
          isGuitar: useGuitar || (useBoth && seededRandom() > 0.5),
        });
        
        // Sometimes add bass note on beat 1 and 5
        if (beat === 0 || beat === 4) {
          notes.push({
            freq: selectedScale[chordIndices[0]] * 0.5, // Bass octave
            start: noteStart,
            duration: beatDuration * 3,
            velocity: 0.5,
            isGuitar: false, // Bass always piano-like
          });
        }
      }
      
      // Add occasional chord stabs
      if (seededRandom() > 0.7) {
        const stabTime = chordStartTime + beatDuration * (4 + Math.floor(seededRandom() * 2));
        for (let i = 0; i < 3; i++) {
          const scaleIdx = chordIndices[i];
          notes.push({
            freq: selectedScale[scaleIdx] * (seededRandom() > 0.5 ? 1 : 2),
            start: stabTime,
            duration: beatDuration * 2,
            velocity: 0.4,
            isGuitar: useGuitar,
          });
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════
    // RENDER AUDIO
    // ═══════════════════════════════════════════════════════════
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Render all active notes
      for (const note of notes) {
        if (t >= note.start - 0.01 && t <= note.start + note.duration * 2) {
          if (note.isGuitar) {
            sample += guitarNote(note.freq, t, note.start, note.duration) * note.velocity;
          } else {
            sample += pianoNote(note.freq, t, note.start, note.duration) * note.velocity;
          }
        }
      }
      
      // ═══════════════════════════════════════════════════════
      // SUBTLE AMBIENT PAD (background warmth)
      // ═══════════════════════════════════════════════════════
      const padVolume = 0.03;
      const padFreq = selectedScale[0] * 0.5; // Root bass
      const padEnv = Math.min(1, t * 0.3) * Math.min(1, (durationSeconds - t) * 0.5);
      sample += Math.sin(2 * Math.PI * padFreq * t) * padVolume * padEnv;
      sample += Math.sin(2 * Math.PI * padFreq * 1.5 * t) * padVolume * 0.5 * padEnv;
      
      // ═══════════════════════════════════════════════════════
      // MASTER PROCESSING
      // ═══════════════════════════════════════════════════════
      
      // Soft reverb simulation (simple delay mix)
      const reverbSample = i > sampleRate * 0.1 ? samples[i - Math.floor(sampleRate * 0.1)] / 32767 : 0;
      sample += reverbSample * 0.15;
      
      // Master fade in/out
      const masterFadeIn = Math.min(1, t * 0.8);
      const masterFadeOut = Math.min(1, (durationSeconds - t) * 1.2);
      sample *= masterFadeIn * masterFadeOut;
      
      // Soft limiting
      sample = Math.tanh(sample * 1.5) * 0.85;
      
      // Convert to 16-bit
      samples[i] = Math.round(sample * 32767);
    }
    
    return samples;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // LSB AUDIO STEGANOGRAPHY - ENCODE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Encode secret text into audio samples using LSB steganography
   * Each audio sample hides 1 bit in its LSB
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

        // Step 2: Convert to binary with length header
        const binaryMessage = stringToBinary(encryptedText);
        const lengthBinary = binaryMessage.length.toString(2).padStart(32, '0');
        const fullBinary = lengthBinary + binaryMessage + END_DELIMITER;
        
        console.log('Binary data length:', fullBinary.length, 'bits');

        // Step 3: Generate soundscape (needs enough samples for the data)
        // Each sample = 1 bit, so we need at least fullBinary.length samples
        const minDuration = Math.ceil(fullBinary.length / 44100) + 3; // +3 seconds buffer
        const duration = Math.max(8, minDuration); // Minimum 8 seconds
        
        const samples = generateSoundscape(secretText, duration);
        
        // Check capacity
        if (fullBinary.length > samples.length) {
          reject(new Error(`Message too long! Max ~${Math.floor(samples.length / 8)} characters for ${duration}s audio.`));
          return;
        }

        console.log('Audio samples:', samples.length, '| Data bits:', fullBinary.length);

        // Step 4: Hide data in LSB of each sample
        for (let i = 0; i < fullBinary.length; i++) {
          const bit = parseInt(fullBinary[i], 10);
          // Clear LSB and set our bit
          // For 16-bit signed integers, we modify the least significant bit
          samples[i] = (samples[i] & 0xFFFE) | bit;
        }

        // Step 5: Create WAV file
        const wav = new WaveFile();
        wav.fromScratch(1, 44100, '16', samples);
        
        // Add innocent-looking metadata
        wav.setTag('INAM', 'Nebula Ambient');
        wav.setTag('IART', 'NEBULA Generator');
        wav.setTag('IGNR', 'Ambient/Electronic');
        
        // Step 6: Convert to blob
        const wavBuffer = wav.toBuffer();
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        
        console.log('WAV file created:', blob.size, 'bytes with LSB-hidden data');
        resolve(blob);

      } catch (error) {
        console.error('Audio encoding error:', error);
        reject(error);
      }
    });
  }, [generateSoundscape]);

  // ═══════════════════════════════════════════════════════════════
  // LSB AUDIO STEGANOGRAPHY - DECODE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Decode hidden text from audio samples using LSB extraction
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
          
          // Step 2: Get the audio samples
          const samples = wav.getSamples(false, Int16Array);
          
          // Handle mono or stereo (use first channel if stereo)
          const audioSamples = Array.isArray(samples) ? samples[0] : samples;
          
          console.log('Loaded audio samples:', audioSamples.length);
          
          if (audioSamples.length < 48) {
            reject(new Error('Audio file too short to contain hidden data'));
            return;
          }

          // Step 3: Extract LSBs from samples
          let binaryData = '';
          
          // First, read the length header (32 bits)
          for (let i = 0; i < 32; i++) {
            const lsb = audioSamples[i] & 1;
            binaryData += lsb.toString();
          }
          
          const dataLength = parseInt(binaryData, 2);
          console.log('Data length from header:', dataLength, 'bits');
          
          // Validate length
          if (dataLength <= 0 || dataLength > (audioSamples.length - 48) || dataLength > 1000000) {
            reject(new Error('No hidden data found or corrupted file'));
            return;
          }
          
          // Step 4: Extract the actual message bits
          let messageBinary = '';
          for (let i = 32; i < 32 + dataLength; i++) {
            if (i >= audioSamples.length) break;
            const lsb = audioSamples[i] & 1;
            messageBinary += lsb.toString();
          }
          
          console.log('Extracted binary length:', messageBinary.length);
          
          // Step 5: Convert binary to text (encrypted)
          const encryptedText = binaryToString(messageBinary);
          
          if (!encryptedText) {
            reject(new Error('Failed to extract hidden data'));
            return;
          }
          
          console.log('Extracted encrypted text:', encryptedText.length, 'chars');
          
          // Step 6: Decrypt with password
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
