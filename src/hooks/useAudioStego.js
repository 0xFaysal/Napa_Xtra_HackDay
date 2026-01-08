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
  detectEmotion,
  getEmotionMusicStyle,
  EMOTIONS,
} from '@/utils/steganography';

// End delimiter to mark the end of hidden data
const END_DELIMITER = '1111111111111110';

/**
 * Custom hook for Audio Steganography operations
 * Uses LSB encoding in PCM audio samples
 */
export function useAudioStego() {
  
  // ═══════════════════════════════════════════════════════════════
  // EMOTION-BASED SOUND GENERATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate music based on emotional content of text
   * WARM = Relaxing piano/guitar | COLD = Intense rock | NEUTRAL = Ambient
   */
  const generateSoundscape = useCallback((secretText, durationSeconds = 12) => {
    const sampleRate = 44100;
    const numSamples = sampleRate * durationSeconds;
    const samples = new Int16Array(numSamples);
    
    // Detect emotion and get music style
    const emotion = detectEmotion(secretText);
    const musicStyle = getEmotionMusicStyle(emotion);
    
    console.log(`🎵 Detected emotion: ${emotion} → Playing "${musicStyle.name}" style`);
    
    const seed = generateVisualSeed(secretText);
    
    // Seeded random
    let randomState = seed;
    const seededRandom = () => {
      randomState = (randomState * 1103515245 + 12345) & 0x7fffffff;
      return randomState / 0x7fffffff;
    };
    
    // ═══════════════════════════════════════════════════════════
    // SCALES BASED ON EMOTION
    // ═══════════════════════════════════════════════════════════
    
    const scales = {
      // WARM: Major keys (happy, peaceful)
      warm: {
        cMajor: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
        gMajor: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 369.99, 392.00],
        dMajor: [293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 554.37, 587.33],
      },
      // COLD: Minor keys (dark, intense)
      cold: {
        aMinor: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
        eMinor: [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63],
        dMinor: [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63, 293.66],
      },
      // NEUTRAL: Mix
      neutral: {
        cMajor: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
        aMinor: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
      },
    };
    
    const emotionScales = scales[emotion] || scales.neutral;
    const scaleNames = Object.keys(emotionScales);
    const selectedScale = emotionScales[scaleNames[seed % scaleNames.length]];
    
    // Tempo from music style
    const bpm = musicStyle.tempo + (seed % 15);
    const beatDuration = 60 / bpm;
    
    // ═══════════════════════════════════════════════════════════
    // INSTRUMENT SYNTHESIZERS
    // ═══════════════════════════════════════════════════════════
    
    // Warm Piano - soft, gentle
    const warmPiano = (freq, t, noteStart, noteDuration) => {
      const noteT = t - noteStart;
      if (noteT < 0 || noteT > noteDuration * 2.5) return 0;
      
      const attack = 0.02;
      const decay = 0.3;
      const sustain = 0.5;
      
      let envelope;
      if (noteT < attack) {
        envelope = noteT / attack;
      } else if (noteT < attack + decay) {
        envelope = 1 - (1 - sustain) * ((noteT - attack) / decay);
      } else {
        envelope = sustain * Math.exp(-(noteT - attack - decay) * 0.8);
      }
      
      let sound = 0;
      sound += Math.sin(2 * Math.PI * freq * noteT) * 1.0;
      sound += Math.sin(2 * Math.PI * freq * 2 * noteT) * 0.4;
      sound += Math.sin(2 * Math.PI * freq * 3 * noteT) * 0.2;
      sound += Math.sin(2 * Math.PI * freq * 1.002 * noteT) * 0.3;
      
      return sound * envelope * 0.12;
    };
    
    // Acoustic Guitar - warm strumming
    const acousticGuitar = (freq, t, noteStart, noteDuration) => {
      const noteT = t - noteStart;
      if (noteT < 0 || noteT > noteDuration * 2) return 0;
      
      const attack = 0.005;
      const decay = noteDuration * 0.8;
      
      let envelope = noteT < attack ? noteT / attack : Math.exp(-(noteT - attack) / decay);
      
      const brightness = Math.exp(-noteT * 6);
      let sound = 0;
      sound += Math.sin(2 * Math.PI * freq * noteT) * 1.0;
      sound += Math.sin(2 * Math.PI * freq * 2 * noteT) * (0.5 * brightness + 0.15);
      sound += Math.sin(2 * Math.PI * freq * 3 * noteT) * (0.3 * brightness + 0.08);
      sound += Math.sin(2 * Math.PI * freq * 4 * noteT) * (0.2 * brightness);
      
      return sound * envelope * 0.1;
    };
    
    // Rock/Distorted Guitar - aggressive
    const rockGuitar = (freq, t, noteStart, noteDuration) => {
      const noteT = t - noteStart;
      if (noteT < 0 || noteT > noteDuration * 1.5) return 0;
      
      const attack = 0.002;
      const sustain = 0.8;
      
      let envelope;
      if (noteT < attack) {
        envelope = noteT / attack;
      } else if (noteT < noteDuration) {
        envelope = sustain + (1 - sustain) * Math.exp(-(noteT - attack) * 3);
      } else {
        envelope = sustain * Math.exp(-(noteT - noteDuration) * 5);
      }
      
      // Create distortion effect
      let sound = 0;
      const fundamental = Math.sin(2 * Math.PI * freq * noteT);
      sound = Math.tanh(fundamental * 3) * 0.6; // Distortion
      sound += Math.sin(2 * Math.PI * freq * 2 * noteT) * 0.4;
      sound += Math.sin(2 * Math.PI * freq * 3 * noteT) * 0.3;
      sound += Math.sin(2 * Math.PI * freq * 0.5 * noteT) * 0.5; // Power chord fifth
      
      // Add grit
      const noise = (seededRandom() * 2 - 1) * 0.05;
      sound += noise * envelope;
      
      return sound * envelope * 0.15;
    };
    
    // Drums for rock
    const kickDrum = (t, noteStart) => {
      const noteT = t - noteStart;
      if (noteT < 0 || noteT > 0.3) return 0;
      
      const envelope = Math.exp(-noteT * 20);
      const pitch = 60 * Math.exp(-noteT * 30);
      return Math.sin(2 * Math.PI * pitch * noteT) * envelope * 0.4;
    };
    
    const snareDrum = (t, noteStart) => {
      const noteT = t - noteStart;
      if (noteT < 0 || noteT > 0.2) return 0;
      
      const envelope = Math.exp(-noteT * 15);
      const noise = (seededRandom() * 2 - 1);
      const tone = Math.sin(2 * Math.PI * 200 * noteT);
      return (noise * 0.6 + tone * 0.4) * envelope * 0.25;
    };
    
    const hihat = (t, noteStart) => {
      const noteT = t - noteStart;
      if (noteT < 0 || noteT > 0.08) return 0;
      
      const envelope = Math.exp(-noteT * 50);
      const noise = (seededRandom() * 2 - 1);
      return noise * envelope * 0.15;
    };
    
    // Ambient Pad - for neutral
    const ambientPad = (freq, t) => {
      const envelope = Math.min(1, t * 0.2) * Math.min(1, (durationSeconds - t) * 0.3);
      
      let sound = 0;
      sound += Math.sin(2 * Math.PI * freq * t) * 0.3;
      sound += Math.sin(2 * Math.PI * freq * 1.002 * t) * 0.25;
      sound += Math.sin(2 * Math.PI * freq * 2 * t) * 0.15;
      sound += Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.2;
      
      // Slow modulation
      const mod = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.1 * t);
      
      return sound * envelope * mod * 0.08;
    };
    
    // ═══════════════════════════════════════════════════════════
    // GENERATE NOTES BASED ON EMOTION
    // ═══════════════════════════════════════════════════════════
    
    const notes = [];
    
    if (emotion === EMOTIONS.WARM) {
      // ══════════════════════════════════════════════════════
      // WARM: Relaxing arpeggios, gentle piano/guitar
      // ══════════════════════════════════════════════════════
      const chordProgressions = [
        [[0, 2, 4], [3, 5, 7], [4, 6, 1], [0, 2, 4]],
        [[0, 2, 4], [5, 0, 2], [3, 5, 7], [4, 6, 1]],
      ];
      const progression = chordProgressions[seed % chordProgressions.length];
      const beatsPerChord = 8;
      const chordDuration = beatsPerChord * beatDuration;
      
      for (let chordNum = 0; chordNum < Math.ceil(durationSeconds / chordDuration); chordNum++) {
        const chordStartTime = chordNum * chordDuration;
        const chordIndices = progression[chordNum % progression.length];
        
        const patterns = [[0, 1, 2, 1], [0, 2, 1, 2], [2, 1, 0, 1]];
        const pattern = patterns[seed % patterns.length];
        
        for (let beat = 0; beat < beatsPerChord; beat++) {
          const noteIndex = pattern[beat % pattern.length];
          const scaleIndex = chordIndices[noteIndex % chordIndices.length];
          const freq = selectedScale[scaleIndex % selectedScale.length];
          
          notes.push({
            freq: freq * (seededRandom() > 0.8 ? 2 : 1),
            start: chordStartTime + beat * beatDuration,
            duration: beatDuration * 2,
            velocity: 0.6 + seededRandom() * 0.3,
            type: seededRandom() > 0.5 ? 'piano' : 'guitar',
          });
          
          if (beat === 0) {
            notes.push({
              freq: selectedScale[0] * 0.5,
              start: chordStartTime,
              duration: chordDuration,
              velocity: 0.4,
              type: 'piano',
            });
          }
        }
      }
      
    } else if (emotion === EMOTIONS.COLD) {
      // ══════════════════════════════════════════════════════
      // COLD: Rock/Metal style - power chords, drums
      // ══════════════════════════════════════════════════════
      const powerChords = [
        [0, 4], // Root + Fifth (power chord)
        [3, 0],
        [5, 2],
        [4, 0],
      ];
      
      const beatsPerBar = 4;
      const barDuration = beatsPerBar * beatDuration;
      
      for (let bar = 0; bar < Math.ceil(durationSeconds / barDuration); bar++) {
        const barStart = bar * barDuration;
        const chord = powerChords[bar % powerChords.length];
        
        for (let beat = 0; beat < beatsPerBar; beat++) {
          const beatStart = barStart + beat * beatDuration;
          
          // Rock guitar on each beat with syncopation
          if (beat === 0 || beat === 2 || (seededRandom() > 0.6)) {
            for (const noteIdx of chord) {
              const freq = selectedScale[noteIdx % selectedScale.length];
              notes.push({
                freq: freq * 0.5, // Lower octave for heaviness
                start: beatStart,
                duration: beatDuration * 0.8,
                velocity: 0.8 + seededRandom() * 0.2,
                type: 'rock',
              });
            }
          }
          
          // Drums
          notes.push({ start: beatStart, type: 'kick' });
          if (beat === 1 || beat === 3) {
            notes.push({ start: beatStart, type: 'snare' });
          }
          notes.push({ start: beatStart, type: 'hihat' });
          if (seededRandom() > 0.5) {
            notes.push({ start: beatStart + beatDuration * 0.5, type: 'hihat' });
          }
        }
        
        // Occasional fill
        if (bar % 4 === 3) {
          for (let i = 0; i < 4; i++) {
            notes.push({ 
              start: barStart + barDuration - beatDuration + i * beatDuration * 0.25, 
              type: 'snare' 
            });
          }
        }
      }
      
    } else {
      // ══════════════════════════════════════════════════════
      // NEUTRAL: Ambient pad with gentle piano
      // ══════════════════════════════════════════════════════
      const beatsPerChord = 16;
      const chordDuration = beatsPerChord * beatDuration;
      const chords = [[0, 2, 4], [3, 5, 7], [5, 0, 2], [4, 6, 1]];
      
      for (let chordNum = 0; chordNum < Math.ceil(durationSeconds / chordDuration); chordNum++) {
        const chordStart = chordNum * chordDuration;
        const chord = chords[chordNum % chords.length];
        
        // Ambient pad drone
        notes.push({
          freq: selectedScale[chord[0]],
          start: chordStart,
          duration: chordDuration,
          type: 'pad',
        });
        
        // Sparse piano notes
        for (let i = 0; i < 4; i++) {
          if (seededRandom() > 0.3) {
            const noteIdx = chord[Math.floor(seededRandom() * chord.length)];
            notes.push({
              freq: selectedScale[noteIdx] * (seededRandom() > 0.5 ? 2 : 1),
              start: chordStart + i * (chordDuration / 4) + seededRandom() * beatDuration,
              duration: beatDuration * 3,
              velocity: 0.4 + seededRandom() * 0.2,
              type: 'piano',
            });
          }
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════
    // RENDER AUDIO
    // ═══════════════════════════════════════════════════════════
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Render notes
      for (const note of notes) {
        if (note.type === 'piano' && t >= note.start - 0.01 && t <= note.start + note.duration * 3) {
          sample += warmPiano(note.freq, t, note.start, note.duration) * (note.velocity || 1);
        } else if (note.type === 'guitar' && t >= note.start - 0.01 && t <= note.start + note.duration * 2) {
          sample += acousticGuitar(note.freq, t, note.start, note.duration) * (note.velocity || 1);
        } else if (note.type === 'rock' && t >= note.start - 0.01 && t <= note.start + note.duration * 2) {
          sample += rockGuitar(note.freq, t, note.start, note.duration) * (note.velocity || 1);
        } else if (note.type === 'kick') {
          sample += kickDrum(t, note.start);
        } else if (note.type === 'snare') {
          sample += snareDrum(t, note.start);
        } else if (note.type === 'hihat') {
          sample += hihat(t, note.start);
        } else if (note.type === 'pad') {
          sample += ambientPad(note.freq, t);
        }
      }
      
      // Master processing
      const masterFadeIn = Math.min(1, t * 0.5);
      const masterFadeOut = Math.min(1, (durationSeconds - t) * 1);
      sample *= masterFadeIn * masterFadeOut;
      
      // Different limiting based on style
      if (emotion === EMOTIONS.COLD) {
        sample = Math.tanh(sample * 2) * 0.9; // Harder compression for rock
      } else {
        sample = Math.tanh(sample * 1.3) * 0.85;
      }
      
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

        // Step 3: Calculate dynamic duration based on data size
        // Each sample = 1 bit, sample rate = 44100 Hz
        // Min 20 seconds, Max 120 seconds (2 minutes)
        const minRequiredDuration = Math.ceil(fullBinary.length / 44100) + 5; // +5 seconds buffer
        
        // Scale duration based on message length for a nicer experience
        // Longer messages = longer, more immersive audio
        const scaledDuration = 20 + (encryptedText.length / 10); // Base 20s + 1s per 10 chars
        
        const duration = Math.min(120, Math.max(20, Math.max(minRequiredDuration, scaledDuration)));
        
        console.log(`🎵 Dynamic audio duration: ${duration.toFixed(1)}s (data: ${encryptedText.length} chars)`);
        
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
