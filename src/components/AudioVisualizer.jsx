/**
 * NEBULA - Audio Waveform Visualizer
 * Beautiful animated audio visualization with canvas
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// Hex to RGB helper (moved outside component to avoid hoisting issues)
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
};

export function AudioVisualizer({ audioUrl, isPlaying, emotion = 'neutral' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioElementRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Emotion-based colors
  const getColors = useCallback(() => {
    switch (emotion) {
      case 'warm':
        return {
          primary: '#FFD700',
          secondary: '#FF6B6B',
          tertiary: '#FFA07A',
          bg: 'rgba(255, 200, 100, 0.1)',
        };
      case 'cold':
        return {
          primary: '#00D4FF',
          secondary: '#8B5CF6',
          tertiary: '#06B6D4',
          bg: 'rgba(0, 212, 255, 0.1)',
        };
      default:
        return {
          primary: '#A855F7',
          secondary: '#00D4FF',
          tertiary: '#F472B6',
          bg: 'rgba(168, 85, 247, 0.1)',
        };
    }
  }, [emotion]);

  // Unified draw function that handles both active and idle states
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const drawFrame = () => {
      const colors = getColors();
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const analyser = analyserRef.current;

      // Check if we have audio data to visualize
      if (analyser && isPlaying) {
        // Draw frequency bars
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Clear with fade effect
        ctx.fillStyle = 'rgba(5, 5, 8, 0.15)';
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.8;
          
          // Create gradient for each bar
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, colors.primary);
          gradient.addColorStop(0.5, colors.secondary);
          gradient.addColorStop(1, colors.tertiary);

          ctx.fillStyle = gradient;
          
          // Draw bars (fallback for roundRect)
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [barWidth / 2, barWidth / 2, 0, 0]);
          } else {
            ctx.rect(x, height - barHeight, barWidth - 2, barHeight);
          }
          ctx.fill();

          // Add glow effect
          ctx.shadowColor = colors.primary;
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Mirror effect (smaller)
          ctx.fillStyle = `rgba(${hexToRgb(colors.primary)}, 0.2)`;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, height, barWidth - 2, barHeight * 0.3, [0, 0, barWidth / 2, barWidth / 2]);
          } else {
            ctx.rect(x, height, barWidth - 2, barHeight * 0.3);
          }
          ctx.fill();

          x += barWidth;
        }
      } else {
        // Draw idle wave animation
        const time = Date.now() * 0.002;

        // Clear
        ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
        ctx.fillRect(0, 0, width, height);

        // Draw multiple wave layers
        for (let layer = 0; layer < 3; layer++) {
          ctx.beginPath();
          ctx.moveTo(0, height / 2);

          for (let xPos = 0; xPos <= width; xPos += 2) {
            const frequency = 0.02 + layer * 0.005;
            const amplitude = 20 + layer * 10;
            const y = height / 2 + Math.sin(xPos * frequency + time + layer * 2) * amplitude;
            ctx.lineTo(xPos, y);
          }

          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, colors.primary + '40');
          gradient.addColorStop(0.5, colors.secondary + '60');
          gradient.addColorStop(1, colors.tertiary + '40');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2 - layer * 0.5;
          ctx.stroke();
        }

        // Draw center line glow
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = `${colors.primary}20`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [getColors, isPlaying]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Initialize audio when URL changes
  useEffect(() => {
    if (!audioUrl || isInitializedRef.current) return;

    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;

        // Create audio element
        const audio = new Audio(audioUrl);
        audio.crossOrigin = 'anonymous';
        audioElementRef.current = audio;

        // Connect to analyser
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);

        isInitializedRef.current = true;
      } catch (error) {
        console.error('Audio init error:', error);
      }
    };

    initAudio();

    return () => {
      // Cleanup audio resources
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [audioUrl]);

  // Handle play/pause
  useEffect(() => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioContextRef.current?.resume();
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="audio-visualizer-container">
      <canvas ref={canvasRef} className="audio-visualizer-canvas" />
      <div className="visualizer-overlay" />
    </div>
  );
}

/**
 * Simple Waveform Display (static visualization)
 */
export function WaveformDisplay({ audioUrl, emotion = 'neutral' }) {
  const canvasRef = useRef(null);
  const [waveformData, setWaveformData] = useState([]);

  const getColors = useCallback(() => {
    switch (emotion) {
      case 'warm':
        return { primary: '#FFD700', secondary: '#FF6B6B' };
      case 'cold':
        return { primary: '#00D4FF', secondary: '#8B5CF6' };
      default:
        return { primary: '#A855F7', secondary: '#00D4FF' };
    }
  }, [emotion]);

  // Generate waveform data
  useEffect(() => {
    if (!audioUrl) return;

    const generateWaveform = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const rawData = audioBuffer.getChannelData(0);
        const samples = 100;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        
        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          filteredData.push(sum / blockSize);
        }
        
        // Normalize
        const max = Math.max(...filteredData);
        const normalized = filteredData.map(n => n / max);
        
        setWaveformData(normalized);
        audioContext.close();
      } catch (error) {
        console.error('Waveform generation error:', error);
        // Generate fake waveform for display
        const fakeData = Array(100).fill(0).map(() => Math.random() * 0.5 + 0.2);
        setWaveformData(fakeData);
      }
    };

    generateWaveform();
  }, [audioUrl]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const colors = getColors();
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    waveformData.forEach((value, index) => {
      const barHeight = value * (height * 0.8);
      const x = index * barWidth;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(0.5, colors.secondary);
      gradient.addColorStop(1, colors.primary);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(
        x + 1,
        centerY - barHeight / 2,
        barWidth - 2,
        barHeight,
        2
      );
      ctx.fill();
    });
  }, [waveformData, getColors]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="waveform-container">
      <canvas ref={canvasRef} className="waveform-canvas" />
    </div>
  );
}

export default AudioVisualizer;
