/**
 * NEBULA - Ultra Modern Steganography UI
 * Award-winning design with audio visualization
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import dynamic from 'next/dynamic';
import {
  Lock,
  Unlock,
  Image as ImageIcon,
  Music,
  Download,
  Upload,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Zap,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  FileImage,
  FileAudio,
  Play,
  Pause,
  Volume2,
  Waves,
  Star,
  Heart,
  Snowflake,
} from 'lucide-react';

import { useNebulaStore, MODES, MEDIUMS, PROCESS_STATES } from '@/store/useNebulaStore';
import { useImageStego } from '@/hooks/useImageStego';
import { useAudioStego } from '@/hooks/useAudioStego';
import { detectEmotion } from '@/utils/steganography';

// Dynamic imports
const Sketch = dynamic(() => import('react-p5').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square rounded-2xl flex items-center justify-center bg-gradient-to-br from-dark-surface to-dark-void">
      <div className="loading-spinner" />
    </div>
  ),
});

const AudioVisualizer = dynamic(() => import('@/components/AudioVisualizer').then(mod => mod.AudioVisualizer), {
  ssr: false,
});

gsap.registerPlugin(useGSAP);

export default function NebulaPage() {
  // ═══════════════════════════════════════════════════════════════
  // REFS & STATE
  // ═══════════════════════════════════════════════════════════════
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const mainCardRef = useRef(null);
  const p5CanvasRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const audioRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const uploadedAudioRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════
  // STORE
  // ═══════════════════════════════════════════════════════════════
  const {
    mode,
    medium,
    secretText,
    password,
    confirmPassword,
    uploadedFile,
    processState,
    errorMessage,
    revealedSecret,
    showSuccess,
    outputURL,
    generatedOutput,
    setMode,
    setMedium,
    setSecretText,
    setPassword,
    setConfirmPassword,
    setUploadedFile,
    setProcessing,
    setSuccess,
    setError,
    setRevealedSecret,
    validateEncryptForm,
    validateDecryptForm,
    reset,
  } = useNebulaStore();

  // ═══════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════
  const { generatePattern, encode: encodeImage, decode: decodeImage, downloadImage } = useImageStego();
  const { encode: encodeAudio, decode: decodeAudio, downloadAudio, createAudioURL } = useAudioStego();

  // Update emotion when text changes
  useEffect(() => {
    if (secretText) {
      const emotion = detectEmotion(secretText);
      setCurrentEmotion(emotion);
    }
  }, [secretText]);

  // ═══════════════════════════════════════════════════════════════
  // GSAP ANIMATIONS
  // ═══════════════════════════════════════════════════════════════
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    gsap.set([heroRef.current, mainCardRef.current], {
      opacity: 0,
      y: 40,
    });

    tl.to(heroRef.current, { opacity: 1, y: 0, duration: 1 })
      .to(mainCardRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');

  }, { scope: containerRef });

  // Mode switch animation
  const handleModeSwitch = useCallback((newMode) => {
    if (mode === newMode) return;

    gsap.to('.card-content', {
      opacity: 0,
      scale: 0.98,
      duration: 0.2,
      onComplete: () => {
        setMode(newMode);
        gsap.to('.card-content', { opacity: 1, scale: 1, duration: 0.3 });
      },
    });
  }, [mode, setMode]);

  // ═══════════════════════════════════════════════════════════════
  // P5.JS CANVAS
  // ═══════════════════════════════════════════════════════════════
  const p5Setup = useCallback((p5, canvasParentRef) => {
    const canvas = p5.createCanvas(512, 512);
    canvas.parent(canvasParentRef);
    p5CanvasRef.current = canvas.canvas;
    p5InstanceRef.current = p5;
    p5.noLoop();
    setCanvasReady(true);
  }, []);

  const p5Draw = useCallback((p5) => {
    if (secretText && mode === MODES.ENCRYPT && medium === MEDIUMS.IMAGE) {
      generatePattern(p5, 512, 512, secretText);
    } else {
      // Beautiful placeholder
      p5.background(8, 8, 12);
      
      // Animated stars placeholder
      for (let i = 0; i < 200; i++) {
        const x = p5.random(512);
        const y = p5.random(512);
        const size = p5.random(1, 3);
        const alpha = p5.random(50, 150);
        p5.noStroke();
        p5.fill(150, 150, 200, alpha);
        p5.ellipse(x, y, size);
      }

      // Center glow
      for (let r = 100; r > 0; r -= 5) {
        const alpha = p5.map(r, 0, 100, 30, 0);
        p5.fill(100, 100, 200, alpha);
        p5.ellipse(256, 256, r * 2);
      }

      p5.fill(100, 100, 140);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(13);
      p5.text('Type your secret message...', 256, 256);
    }
  }, [secretText, mode, medium, generatePattern]);

  useEffect(() => {
    if (p5InstanceRef.current && canvasReady) {
      p5InstanceRef.current.redraw();
    }
  }, [secretText, canvasReady]);

  // ═══════════════════════════════════════════════════════════════
  // AUDIO PLAYER CONTROLS
  // ═══════════════════════════════════════════════════════════════
  const toggleAudioPlay = async () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsAudioPlaying(true);
        } catch (error) {
          // Ignore AbortError when play is interrupted
          if (error.name !== 'AbortError') {
            console.error('Audio playback failed:', error);
          }
        }
      }
    }
  };

  const toggleUploadedAudioPlay = async () => {
    if (uploadedAudioRef.current) {
      if (isAudioPlaying) {
        uploadedAudioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        try {
          await uploadedAudioRef.current.play();
          setIsAudioPlaying(true);
        } catch (error) {
          // Ignore AbortError when play is interrupted
          if (error.name !== 'AbortError') {
            console.error('Audio playback failed:', error);
          }
        }
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════
  const handleEncrypt = async () => {
    const validation = validateEncryptForm();
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setProcessing();

    try {
      if (medium === MEDIUMS.IMAGE) {
        if (p5InstanceRef.current) {
          p5InstanceRef.current.redraw();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!p5CanvasRef.current) throw new Error('Canvas not ready');

        const blob = await encodeImage(secretText, password, p5CanvasRef.current);
        const url = URL.createObjectURL(blob);
        setSuccess(blob, url);
        
      } else if (medium === MEDIUMS.AUDIO) {
        const blob = await encodeAudio(secretText, password);
        const url = createAudioURL(blob);
        setSuccess(blob, url);
      }
    } catch (error) {
      console.error('Encryption error:', error);
      setError(error.message || 'Encryption failed');
    }
  };

  const handleDecrypt = async () => {
    const validation = validateDecryptForm();
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setProcessing();

    try {
      let revealed;
      
      if (medium === MEDIUMS.IMAGE) {
        revealed = await decodeImage(uploadedFile, password);
      } else if (medium === MEDIUMS.AUDIO) {
        revealed = await decodeAudio(uploadedFile, password);
      }

      if (revealed) {
        setRevealedSecret(revealed);
      } else {
        throw new Error('Failed to decrypt');
      }
    } catch (error) {
      // User-friendly error messages
      let message = 'Decryption failed. Please check your password.';
      if (error.message?.includes('Invalid password')) {
        message = 'Wrong password. Please try again.';
      } else if (error.message?.includes('No hidden data')) {
        message = 'No hidden message found in this file.';
      } else if (error.message?.includes('corrupted')) {
        message = 'Wrong password or the file is corrupted.';
      }
      setError(message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Create URL for preview
      if (file.type.startsWith('audio/') || file.name.endsWith('.wav')) {
        const url = URL.createObjectURL(file);
        setUploadedAudioUrl(url);
        setUploadedImageUrl(null);
      } else if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setUploadedImageUrl(url);
        setUploadedAudioUrl(null);
      } else {
        setUploadedAudioUrl(null);
        setUploadedImageUrl(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Create URL for preview
      if (file.type.startsWith('audio/') || file.name.endsWith('.wav')) {
        const url = URL.createObjectURL(file);
        setUploadedAudioUrl(url);
        setUploadedImageUrl(null);
      } else if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setUploadedImageUrl(url);
        setUploadedAudioUrl(null);
      } else {
        setUploadedAudioUrl(null);
        setUploadedImageUrl(null);
      }
    }
  };

  const handleDownload = () => {
    if (!generatedOutput) return;
    const timestamp = Date.now();
    if (medium === MEDIUMS.IMAGE) {
      downloadImage(generatedOutput, `nebula-${timestamp}.png`);
    } else {
      downloadAudio(generatedOutput, `nebula-${timestamp}.wav`);
    }
  };

  const copyToClipboard = async () => {
    if (revealedSecret) {
      await navigator.clipboard.writeText(revealedSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get emotion icon
  const EmotionIcon = currentEmotion === 'warm' ? Heart : currentEmotion === 'cold' ? Snowflake : Star;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <main ref={containerRef} className="nebula-app">
      {/* Animated Background */}
      <div className="nebula-background">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="grid-overlay" />
        <div className="noise-overlay" />
      </div>

      {/* Hero Section */}
      <header ref={heroRef} className="hero-section">
        <div className="hero-badge">
          <Sparkles className="w-4 h-4" />
          <span>Steganography Tool</span>
        </div>
        <h1 className="hero-title">
          <span className="title-gradient">NEBULA</span>
        </h1>
        <p className="hero-subtitle">
          Hide secrets in plain sight. Transform messages into beautiful art & music.
        </p>
        
        {/* Feature Pills */}
        <div className="feature-pills">
          <div className="pill">
            <Shield className="w-3.5 h-3.5" />
            <span>AES-256</span>
          </div>
          <div className="pill">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>LSB Stego</span>
          </div>
          <div className="pill">
            <Waves className="w-3.5 h-3.5" />
            <span>Audio Hide</span>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <div ref={mainCardRef} className="main-card">
        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === MODES.ENCRYPT ? 'active' : ''}`}
            onClick={() => handleModeSwitch(MODES.ENCRYPT)}
          >
            <Lock className="w-4 h-4" />
            <span>Encrypt</span>
          </button>
          <button
            className={`mode-btn ${mode === MODES.DECRYPT ? 'active' : ''}`}
            onClick={() => handleModeSwitch(MODES.DECRYPT)}
          >
            <Unlock className="w-4 h-4" />
            <span>Decrypt</span>
          </button>
          <div className={`mode-indicator ${mode === MODES.DECRYPT ? 'right' : ''}`} />
        </div>

        {/* Content */}
        <div className="card-content">
          {/* Medium Selection */}
          <div className="medium-selection">
            <button
              className={`medium-btn ${medium === MEDIUMS.IMAGE ? 'active' : ''}`}
              onClick={() => {
                setMedium(MEDIUMS.IMAGE);
                // Clear uploaded file when switching medium in decrypt mode
                if (mode === MODES.DECRYPT) {
                  setUploadedFile(null);
                  setUploadedAudioUrl(null);
                  setUploadedImageUrl(null);
                  setIsAudioPlaying(false);
                }
              }}
            >
              <div className="medium-icon image-icon">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="medium-info">
                <h3>Image</h3>
                <p>Generative Art</p>
              </div>
            </button>
            <button
              className={`medium-btn ${medium === MEDIUMS.AUDIO ? 'active' : ''}`}
              onClick={() => {
                setMedium(MEDIUMS.AUDIO);
                // Clear uploaded file when switching medium in decrypt mode
                if (mode === MODES.DECRYPT) {
                  setUploadedFile(null);
                  setUploadedAudioUrl(null);
                  setUploadedImageUrl(null);
                  setIsAudioPlaying(false);
                }
              }}
            >
              <div className="medium-icon audio-icon">
                <Music className="w-6 h-6" />
              </div>
              <div className="medium-info">
                <h3>Audio</h3>
                <p>Emotion Music</p>
              </div>
            </button>
          </div>

          {/* ENCRYPT MODE */}
          {mode === MODES.ENCRYPT && (
            <div className="encrypt-section">
              {/* Secret Text */}
              <div className="input-group">
                <label>
                  <Shield className="w-4 h-4" />
                  <span>Secret Message</span>
                  {secretText && (
                    <span className={`emotion-badge ${currentEmotion}`}>
                      <EmotionIcon className="w-3 h-3" />
                      {currentEmotion}
                    </span>
                  )}
                </label>
                <textarea
                  className="secret-input"
                  placeholder="Type your secret message here..."
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                  maxLength={5000}
                />
                <div className="char-count">{secretText.length} / 5000</div>
              </div>

              {/* Preview Area */}
              <div className="preview-section">
                <label>
                  <Sparkles className="w-4 h-4" />
                  <span>Preview</span>
                </label>
                
                {medium === MEDIUMS.IMAGE ? (
                  <div className="image-preview">
                    <Sketch setup={p5Setup} draw={p5Draw} />
                    <div className="preview-overlay">
                      <span>Generated Pattern</span>
                    </div>
                  </div>
                ) : (
                  <div className="audio-preview">
                    {outputURL ? (
                      <>
                        <div className="visualizer-wrapper">
                          <AudioVisualizer 
                            audioUrl={outputURL} 
                            isPlaying={isAudioPlaying}
                            emotion={currentEmotion}
                          />
                        </div>
                        <div className="audio-controls">
                          <button className="play-btn" onClick={toggleAudioPlay}>
                            {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>
                          <div className="audio-progress">
                            <div className="time">{formatTime(audioCurrentTime)}</div>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${(audioCurrentTime / audioDuration) * 100 || 0}%` }}
                              />
                            </div>
                            <div className="time">{formatTime(audioDuration)}</div>
                          </div>
                          <Volume2 className="w-4 h-4 text-text-muted" />
                        </div>
                        <audio
                          ref={audioRef}
                          src={outputURL}
                          onTimeUpdate={handleAudioTimeUpdate}
                          onLoadedMetadata={handleAudioLoadedMetadata}
                          onEnded={() => setIsAudioPlaying(false)}
                        />
                      </>
                    ) : (
                      <div className="audio-placeholder">
                        <div className="wave-animation">
                          {[...Array(20)].map((_, i) => (
                            <div 
                              key={i} 
                              className="wave-bar"
                              style={{ animationDelay: `${i * 0.05}s` }}
                            />
                          ))}
                        </div>
                        <p>Audio will appear here after encryption</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password Fields */}
              <div className="password-grid">
                <div className="input-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="toggle-visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="action-buttons">
                <button
                  className="primary-btn"
                  onClick={handleEncrypt}
                  disabled={processState === PROCESS_STATES.PROCESSING}
                >
                  {processState === PROCESS_STATES.PROCESSING ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Generate & Encrypt</span>
                    </>
                  )}
                </button>
                
                {processState === PROCESS_STATES.SUCCESS && (
                  <button className="secondary-btn" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>

              {/* Success State */}
              {processState === PROCESS_STATES.SUCCESS && outputURL && medium === MEDIUMS.IMAGE && (
                <div className="success-preview">
                  <div className="success-badge">
                    <Check className="w-4 h-4" />
                    <span>Secret hidden successfully!</span>
                  </div>
                  <img src={outputURL} alt="Encoded" className="result-image" />
                </div>
              )}
            </div>
          )}

          {/* DECRYPT MODE */}
          {mode === MODES.DECRYPT && (
            <div className="decrypt-section">
              {/* File Upload */}
              <div className="input-group">
                <label>
                  <Upload className="w-4 h-4" />
                  <span>Upload {medium === MEDIUMS.IMAGE ? 'Image' : 'Audio'}</span>
                </label>
                <div
                  className={`drop-zone ${isDragOver ? 'active' : ''} ${uploadedFile ? 'has-file' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept={medium === MEDIUMS.IMAGE ? 'image/*' : 'audio/wav,.wav'}
                    onChange={handleFileChange}
                  />
                  {uploadedFile ? (
                    <div className="file-info">
                      {medium === MEDIUMS.IMAGE ? (
                        <FileImage className="w-10 h-10 text-neon-blue" />
                      ) : (
                        <FileAudio className="w-10 h-10 text-neon-purple" />
                      )}
                      <div>
                        <p className="file-name">{uploadedFile.name}</p>
                        <p className="file-size">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="drop-prompt">
                      <Upload className="w-10 h-10" />
                      <p>Drop file here or click to browse</p>
                      <span>{medium === MEDIUMS.IMAGE ? 'PNG, JPG' : 'WAV'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Preview for uploaded file */}
              {medium === MEDIUMS.IMAGE && uploadedFile && uploadedImageUrl && (
                <div className="uploaded-image-preview">
                  <label>
                    <ImageIcon className="w-4 h-4" />
                    <span>Uploaded Image</span>
                  </label>
                  <div className="image-preview-container">
                    <img 
                      src={uploadedImageUrl} 
                      alt="Uploaded for decryption" 
                      className="preview-img"
                    />
                  </div>
                </div>
              )}

              {/* Audio Preview for uploaded file */}
              {medium === MEDIUMS.AUDIO && uploadedFile && uploadedAudioUrl && (
                <div className="audio-preview">
                  <div className="visualizer-wrapper">
                    <AudioVisualizer 
                      audioUrl={uploadedAudioUrl} 
                      isPlaying={isAudioPlaying}
                      emotion="neutral"
                    />
                  </div>
                  <div className="audio-controls">
                    <button className="play-btn" onClick={toggleUploadedAudioPlay}>
                      {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="audio-progress">
                      <span className="time">{formatTime(audioCurrentTime)}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${audioDuration ? (audioCurrentTime / audioDuration) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="time">{formatTime(audioDuration)}</span>
                    </div>
                  </div>
                  <audio 
                    ref={uploadedAudioRef}
                    src={uploadedAudioUrl}
                    onTimeUpdate={(e) => setAudioCurrentTime(e.target.currentTime)}
                    onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
                    onEnded={() => setIsAudioPlaying(false)}
                    onError={(e) => console.error('Audio load error:', e.target.error)}
                    className="hidden"
                  />
                </div>
              )}

              {/* Password */}
              <div className="input-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter decryption password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="toggle-visibility">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Decrypt Button */}
              <button
                className="primary-btn full-width"
                onClick={handleDecrypt}
                disabled={processState === PROCESS_STATES.PROCESSING}
              >
                {processState === PROCESS_STATES.PROCESSING ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Decrypting...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Decrypt & Reveal</span>
                  </>
                )}
              </button>

              {/* Revealed Secret */}
              {processState === PROCESS_STATES.SUCCESS && revealedSecret && (
                <div className="revealed-section">
                  <div className="revealed-header">
                    <div className="success-badge">
                      <Check className="w-4 h-4" />
                      <span>Secret Revealed!</span>
                    </div>
                    <button className="copy-btn" onClick={copyToClipboard}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="revealed-content">
                    {revealedSecret}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {processState === PROCESS_STATES.ERROR && errorMessage && (
            <div className="error-message">
              <AlertCircle className="w-5 h-5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Reset Button */}
          {(processState === PROCESS_STATES.SUCCESS || processState === PROCESS_STATES.ERROR) && (
            <button className="reset-btn" onClick={reset}>
              <RefreshCw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>Built with 💜 for Hackathon 2026</p>
        <p className="security-note">
          <Shield className="w-3 h-3" />
          <span>100% Client-side encryption. Nothing sent to servers.</span>
        </p>
      </footer>
    </main>
  );
}
