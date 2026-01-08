/**
 * NEBULA - Main Page Component
 * Multi-media Steganography Tool with Awwwards-worthy design
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
} from 'lucide-react';

import { useNebulaStore, MODES, MEDIUMS, PROCESS_STATES } from '@/store/useNebulaStore';
import { useImageStego } from '@/hooks/useImageStego';
import { useAudioStego } from '@/hooks/useAudioStego';

// Dynamic import for p5 (client-side only)
const Sketch = dynamic(() => import('react-p5').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square bg-dark-surface rounded-2xl flex items-center justify-center">
      <div className="text-text-muted">Loading canvas...</div>
    </div>
  ),
});

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

export default function NebulaPage() {
  // ═══════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const cardRef = useRef(null);
  const footerRef = useRef(null);
  const tabIndicatorRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const p5CanvasRef = useRef(null);
  const p5InstanceRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

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

  // ═══════════════════════════════════════════════════════════════
  // GSAP ENTRANCE ANIMATION
  // ═══════════════════════════════════════════════════════════════
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Initial states
    gsap.set([logoRef.current, cardRef.current, footerRef.current], {
      opacity: 0,
      y: 30,
    });

    // Staggered entrance
    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
    })
    .to(cardRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.4')
    .to(footerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
    }, '-=0.3');

  }, { scope: containerRef });

  // ═══════════════════════════════════════════════════════════════
  // TAB SWITCH ANIMATION
  // ═══════════════════════════════════════════════════════════════
  const handleModeSwitch = useCallback((newMode) => {
    if (mode === newMode) return;

    // Animate content out
    gsap.to(cardRef.current?.querySelector('.card-content'), {
      opacity: 0,
      x: newMode === MODES.DECRYPT ? -20 : 20,
      duration: 0.2,
      onComplete: () => {
        setMode(newMode);
        // Animate content in
        gsap.fromTo(
          cardRef.current?.querySelector('.card-content'),
          { opacity: 0, x: newMode === MODES.DECRYPT ? 20 : -20 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      },
    });
  }, [mode, setMode]);

  // ═══════════════════════════════════════════════════════════════
  // SUCCESS ANIMATION
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (showSuccess && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { boxShadow: '0 0 0px rgba(34, 197, 94, 0)' },
        {
          boxShadow: '0 0 40px rgba(34, 197, 94, 0.5), 0 0 80px rgba(34, 197, 94, 0.3)',
          duration: 0.5,
          yoyo: true,
          repeat: 3,
          ease: 'power2.inOut',
        }
      );
    }
  }, [showSuccess]);

  // ═══════════════════════════════════════════════════════════════
  // P5.JS SETUP
  // ═══════════════════════════════════════════════════════════════
  const p5Setup = useCallback((p5, canvasParentRef) => {
    const size = 512;
    const canvas = p5.createCanvas(size, size);
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
      // Default nebula pattern
      p5.background(5, 5, 8);
      
      // Draw placeholder nebula
      for (let i = 0; i < 1000; i++) {
        const x = p5.random(512);
        const y = p5.random(512);
        const alpha = p5.random(10, 50);
        p5.noStroke();
        p5.fill(0, 150, 255, alpha);
        p5.ellipse(x, y, p5.random(2, 10));
      }
      
      // Center text
      p5.fill(100, 100, 120);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(14);
      p5.text('Enter your secret to generate pattern', 256, 256);
    }
  }, [secretText, mode, medium, generatePattern]);

  // Redraw canvas when secret changes
  useEffect(() => {
    if (p5InstanceRef.current && canvasReady) {
      p5InstanceRef.current.redraw();
    }
  }, [secretText, canvasReady]);

  // ═══════════════════════════════════════════════════════════════
  // ENCRYPTION HANDLER
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
        // Make sure canvas has the pattern
        if (p5InstanceRef.current) {
          p5InstanceRef.current.redraw();
          
          // Small delay to ensure canvas is rendered
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!p5CanvasRef.current) {
          throw new Error('Canvas not ready');
        }

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

  // ═══════════════════════════════════════════════════════════════
  // DECRYPTION HANDLER
  // ═══════════════════════════════════════════════════════════════
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
      console.error('Decryption error:', error);
      setError(error.message || 'Decryption failed. Check your password.');
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // FILE HANDLERS
  // ═══════════════════════════════════════════════════════════════
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // ═══════════════════════════════════════════════════════════════
  // DOWNLOAD HANDLER
  // ═══════════════════════════════════════════════════════════════
  const handleDownload = () => {
    if (!generatedOutput) return;

    const timestamp = Date.now();
    if (medium === MEDIUMS.IMAGE) {
      downloadImage(generatedOutput, `nebula-${timestamp}.png`);
    } else {
      downloadAudio(generatedOutput, `nebula-${timestamp}.wav`);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // COPY TO CLIPBOARD
  // ═══════════════════════════════════════════════════════════════
  const copyToClipboard = async () => {
    if (revealedSecret) {
      await navigator.clipboard.writeText(revealedSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <main
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden"
    >
      {/* Background Nebula Effect */}
      <div className="nebula-bg">
        <div className="nebula-orb nebula-orb-1" />
        <div className="nebula-orb nebula-orb-2" />
        <div className="nebula-orb nebula-orb-3" />
      </div>

      {/* Logo Section */}
      <header ref={logoRef} className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-3">
          <span className="text-gradient">NEBULA</span>
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-md mx-auto">
          Hide your secrets in plain sight. Encrypt messages into images and audio.
        </p>
      </header>

      {/* Main Card */}
      <div
        ref={cardRef}
        className={`glass-card-elevated w-full max-w-2xl transition-all duration-300 ${
          showSuccess ? 'success-glow' : ''
        }`}
      >
        {/* Tab Navigation */}
        <div className="p-4 md:p-6 border-b border-glass-border">
          <div className="tab-container">
            <button
              className={`tab-button ${mode === MODES.ENCRYPT ? 'active' : ''}`}
              onClick={() => handleModeSwitch(MODES.ENCRYPT)}
            >
              <Lock className="inline-block w-4 h-4 mr-2" />
              Encrypt
            </button>
            <button
              className={`tab-button ${mode === MODES.DECRYPT ? 'active' : ''}`}
              onClick={() => handleModeSwitch(MODES.DECRYPT)}
            >
              <Unlock className="inline-block w-4 h-4 mr-2" />
              Decrypt
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="card-content p-4 md:p-6 space-y-6">
          
          {/* Medium Selection */}
          <div>
            <label className="block text-text-secondary text-sm mb-3">
              Choose Medium
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                className={`medium-card ${medium === MEDIUMS.IMAGE ? 'selected' : ''}`}
                onClick={() => setMedium(MEDIUMS.IMAGE)}
              >
                <div className="relative z-10">
                  <ImageIcon className="w-8 h-8 mb-2 text-neon-blue" />
                  <h3 className="font-semibold text-text-primary">Image</h3>
                  <p className="text-xs text-text-muted mt-1">LSB Steganography</p>
                </div>
              </button>
              <button
                className={`medium-card ${medium === MEDIUMS.AUDIO ? 'selected' : ''}`}
                onClick={() => setMedium(MEDIUMS.AUDIO)}
              >
                <div className="relative z-10">
                  <Music className="w-8 h-8 mb-2 text-neon-purple" />
                  <h3 className="font-semibold text-text-primary">Audio</h3>
                  <p className="text-xs text-text-muted mt-1">WAV Metadata</p>
                </div>
              </button>
            </div>
          </div>

          {/* ENCRYPT MODE */}
          {mode === MODES.ENCRYPT && (
            <>
              {/* Secret Text Input */}
              <div>
                <label className="block text-text-secondary text-sm mb-2">
                  <Shield className="inline-block w-4 h-4 mr-1" />
                  Secret Message
                </label>
                <textarea
                  className="glass-input min-h-[100px] resize-none"
                  placeholder="Enter your secret message..."
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                  maxLength={5000}
                />
                <div className="text-right text-xs text-text-muted mt-1">
                  {secretText.length} / 5000
                </div>
              </div>

              {/* Preview Canvas (Image mode only) */}
              {medium === MEDIUMS.IMAGE && (
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    <Sparkles className="inline-block w-4 h-4 mr-1" />
                    Generated Pattern Preview
                  </label>
                  <div ref={canvasContainerRef} className="canvas-container">
                    <Sketch setup={p5Setup} draw={p5Draw} />
                  </div>
                </div>
              )}

              {/* Audio Preview */}
              {medium === MEDIUMS.AUDIO && outputURL && (
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    <Music className="inline-block w-4 h-4 mr-1" />
                    Generated Audio
                  </label>
                  <audio controls src={outputURL} className="w-full" />
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="glass-input pr-10"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="glass-input pr-10"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  className="btn-neon flex-1 flex items-center justify-center gap-2"
                  onClick={handleEncrypt}
                  disabled={processState === PROCESS_STATES.PROCESSING}
                >
                  {processState === PROCESS_STATES.PROCESSING ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate & Encrypt
                    </>
                  )}
                </button>
                
                {processState === PROCESS_STATES.SUCCESS && generatedOutput && (
                  <button
                    className="btn-ghost flex items-center gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>

              {/* Success Preview */}
              {processState === PROCESS_STATES.SUCCESS && outputURL && medium === MEDIUMS.IMAGE && (
                <div className="mt-4">
                  <p className="text-neon-green text-sm mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Secret successfully hidden in image!
                  </p>
                  <img
                    src={outputURL}
                    alt="Encoded image"
                    className="w-full max-w-[256px] rounded-lg border border-dark-border"
                  />
                </div>
              )}
            </>
          )}

          {/* DECRYPT MODE */}
          {mode === MODES.DECRYPT && (
            <>
              {/* File Upload */}
              <div>
                <label className="block text-text-secondary text-sm mb-2">
                  <Upload className="inline-block w-4 h-4 mr-1" />
                  Upload {medium === MEDIUMS.IMAGE ? 'Image' : 'Audio'} File
                </label>
                <div
                  className={`drop-zone ${isDragOver ? 'dragover' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
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
                    <div className="flex flex-col items-center gap-2">
                      {medium === MEDIUMS.IMAGE ? (
                        <FileImage className="w-12 h-12 text-neon-blue" />
                      ) : (
                        <FileAudio className="w-12 h-12 text-neon-purple" />
                      )}
                      <p className="text-text-primary font-medium">{uploadedFile.name}</p>
                      <p className="text-text-muted text-sm">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-text-muted" />
                      <p className="text-text-secondary">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-text-muted text-sm">
                        {medium === MEDIUMS.IMAGE ? 'PNG, JPG' : 'WAV'} files only
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-text-secondary text-sm mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="glass-input pr-10"
                    placeholder="Enter the password to decrypt"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Decrypt Button */}
              <button
                className="btn-neon w-full flex items-center justify-center gap-2"
                onClick={handleDecrypt}
                disabled={processState === PROCESS_STATES.PROCESSING}
              >
                {processState === PROCESS_STATES.PROCESSING ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Decrypt & Reveal
                  </>
                )}
              </button>

              {/* Revealed Secret */}
              {processState === PROCESS_STATES.SUCCESS && revealedSecret && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-neon-green text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Secret Revealed!
                    </p>
                    <button
                      className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 text-sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-neon-green" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="glass-input bg-dark-surface/50 min-h-[100px] whitespace-pre-wrap break-words">
                    {revealedSecret}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {processState === PROCESS_STATES.ERROR && errorMessage && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Reset Button */}
          {(processState === PROCESS_STATES.SUCCESS || processState === PROCESS_STATES.ERROR) && (
            <button
              className="btn-ghost w-full flex items-center justify-center gap-2"
              onClick={reset}
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer ref={footerRef} className="mt-8 text-center">
        <p className="text-text-muted text-sm">
          Built with 💜 for Hackathon 2026
        </p>
        <p className="text-text-muted text-xs mt-1">
          Your secrets are encrypted client-side. Nothing is sent to any server.
        </p>
      </footer>
    </main>
  );
}
