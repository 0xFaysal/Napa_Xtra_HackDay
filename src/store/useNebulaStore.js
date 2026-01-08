/**
 * NEBULA - Global State Store
 * Zustand store for managing the encryption/decryption flow
 */

import { create } from 'zustand';

/**
 * Application modes
 */
export const MODES = {
  ENCRYPT: 'encrypt',
  DECRYPT: 'decrypt',
};

/**
 * Medium types for steganography
 */
export const MEDIUMS = {
  IMAGE: 'image',
  AUDIO: 'audio',
};

/**
 * Process states
 */
export const PROCESS_STATES = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Main Nebula Store
 */
export const useNebulaStore = create((set, get) => ({
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════
  
  // Current mode (encrypt or decrypt)
  mode: MODES.ENCRYPT,
  
  // Selected medium (image or audio)
  medium: MEDIUMS.IMAGE,
  
  // Secret text input
  secretText: '',
  
  // Password input
  password: '',
  
  // Confirm password (for encryption)
  confirmPassword: '',
  
  // Uploaded file for decryption
  uploadedFile: null,
  
  // Generated output (Blob)
  generatedOutput: null,
  
  // Generated output URL (for preview/download)
  outputURL: null,
  
  // Process state
  processState: PROCESS_STATES.IDLE,
  
  // Error message
  errorMessage: '',
  
  // Revealed secret (after decryption)
  revealedSecret: '',
  
  // Animation trigger states
  showSuccess: false,
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS - Mode & Medium
  // ═══════════════════════════════════════════════════════════════
  
  setMode: (mode) => {
    // Clean up previous output URL
    const currentURL = get().outputURL;
    if (currentURL) {
      URL.revokeObjectURL(currentURL);
    }
    
    set({
      mode,
      // Reset state on mode change
      secretText: '',
      password: '',
      confirmPassword: '',
      uploadedFile: null,
      generatedOutput: null,
      outputURL: null,
      processState: PROCESS_STATES.IDLE,
      errorMessage: '',
      revealedSecret: '',
      showSuccess: false,
    });
  },
  
  setMedium: (medium) => set({ medium }),
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS - Form Inputs
  // ═══════════════════════════════════════════════════════════════
  
  setSecretText: (secretText) => set({ secretText }),
  
  setPassword: (password) => set({ password }),
  
  setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
  
  setUploadedFile: (uploadedFile) => set({ 
    uploadedFile,
    processState: PROCESS_STATES.IDLE,
    errorMessage: '',
    revealedSecret: '',
  }),
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS - Process State
  // ═══════════════════════════════════════════════════════════════
  
  setProcessing: () => set({
    processState: PROCESS_STATES.PROCESSING,
    errorMessage: '',
    showSuccess: false,
  }),
  
  setSuccess: (output, url = null) => set({
    processState: PROCESS_STATES.SUCCESS,
    generatedOutput: output,
    outputURL: url,
    errorMessage: '',
    showSuccess: true,
  }),
  
  setError: (message) => set({
    processState: PROCESS_STATES.ERROR,
    errorMessage: message,
    showSuccess: false,
  }),
  
  setRevealedSecret: (secret) => set({
    revealedSecret: secret,
    processState: PROCESS_STATES.SUCCESS,
    showSuccess: true,
  }),
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS - Validation
  // ═══════════════════════════════════════════════════════════════
  
  validateEncryptForm: () => {
    const { secretText, password, confirmPassword } = get();
    
    if (!secretText.trim()) {
      return { valid: false, error: 'Please enter a secret message' };
    }
    
    if (secretText.length > 5000) {
      return { valid: false, error: 'Secret message is too long (max 5000 characters)' };
    }
    
    if (!password) {
      return { valid: false, error: 'Please enter a password' };
    }
    
    if (password.length < 4) {
      return { valid: false, error: 'Password must be at least 4 characters' };
    }
    
    if (password !== confirmPassword) {
      return { valid: false, error: 'Passwords do not match' };
    }
    
    return { valid: true, error: '' };
  },
  
  validateDecryptForm: () => {
    const { uploadedFile, password, medium } = get();
    
    if (!uploadedFile) {
      return { valid: false, error: 'Please upload a file' };
    }
    
    // Validate file type
    if (medium === MEDIUMS.IMAGE) {
      if (!uploadedFile.type.startsWith('image/')) {
        return { valid: false, error: 'Please upload an image file (PNG recommended)' };
      }
    } else if (medium === MEDIUMS.AUDIO) {
      if (!uploadedFile.type.includes('audio/') && !uploadedFile.name.endsWith('.wav')) {
        return { valid: false, error: 'Please upload a WAV audio file' };
      }
    }
    
    if (!password) {
      return { valid: false, error: 'Please enter the password' };
    }
    
    return { valid: true, error: '' };
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS - Reset
  // ═══════════════════════════════════════════════════════════════
  
  reset: () => {
    // Clean up previous output URL
    const currentURL = get().outputURL;
    if (currentURL) {
      URL.revokeObjectURL(currentURL);
    }
    
    set({
      secretText: '',
      password: '',
      confirmPassword: '',
      uploadedFile: null,
      generatedOutput: null,
      outputURL: null,
      processState: PROCESS_STATES.IDLE,
      errorMessage: '',
      revealedSecret: '',
      showSuccess: false,
    });
  },
  
  resetSuccess: () => set({ showSuccess: false }),
}));

export default useNebulaStore;
