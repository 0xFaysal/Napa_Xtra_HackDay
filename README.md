# 🌌 NEBULA - Steganography Web Application

<div align="center">

![NEBULA](https://img.shields.io/badge/NEBULA-Steganography-8B5CF6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjwvc3ZnPg==)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![AES-256](https://img.shields.io/badge/Encryption-AES--256-green?style=for-the-badge&logo=shield)
![LSB](https://img.shields.io/badge/Steganography-LSB-blue?style=for-the-badge)

**Hide your secrets in plain sight with beautiful generative art and emotion-based music**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [How It Works](#how-it-works) • [Tech Stack](#tech-stack)

</div>

---

## 🎯 Overview

**NEBULA** is a modern, award-winning steganography web application that allows users to hide encrypted messages inside images and audio files. Unlike traditional steganography tools, NEBULA generates beautiful, unique artwork and emotion-based music to conceal your secrets.

### What Makes NEBULA Special?

- 🎨 **Generative Art** - Creates stunning flower mandalas, cosmic blooms, aurora gardens, and crystal lotus patterns
- 🎵 **Emotion-Based Music** - Generates piano, guitar, or rock music based on the emotional tone of your message
- 🔐 **Military-Grade Encryption** - AES-256 encryption before hiding data
- 🌊 **True LSB Steganography** - Hides data in the least significant bits, invisible to the naked eye
- ✨ **Modern UI** - Glassmorphism design with neon accents and smooth animations

---

## ✨ Features

### 🔒 Encryption Mode
- Type your secret message
- Set a strong password
- Choose your medium (Image or Audio)
- Generate unique artwork or music with your hidden message
- Download the result

### 🔓 Decryption Mode
- Upload an image or audio file containing hidden data
- Enter the correct password
- Reveal the hidden secret message

### 🎨 Image Steganography
- **4 Unique Art Styles:**
  - 🌸 **Flower Mandala** - Intricate petal patterns in circular arrangements
  - 🌌 **Cosmic Bloom** - Galaxy-inspired swirling formations
  - 🌈 **Aurora Garden** - Northern lights-inspired flowing waves
  - 💎 **Crystal Lotus** - Geometric crystalline structures

- **Emotion-Based Palettes:**
  - ☀️ **Warm** - Golden, rose, amber tones for hopeful messages
  - ❄️ **Cold** - Blue, purple, cyan tones for melancholic messages
  - ⚪ **Neutral** - Silver, white, grey tones for balanced messages

### 🎵 Audio Steganography
- **Dynamic Duration** - 20 seconds to 2 minutes based on data size
- **Emotion-Based Music Styles:**
  - 🎹 **Warm → Piano & Guitar** - Relaxing, soothing melodies
  - 🎸 **Cold → Rock** - Intense, powerful with drums
  - 🌊 **Neutral → Ambient** - Balanced pad sounds

- **Real-Time Visualization** - Beautiful waveform display with frequency bars

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/nebula-steganography.git
cd nebula-steganography

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🔬 How It Works

### Encryption Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Message   │ ──▶ │   AES-256   │ ──▶ │   Binary    │ ──▶ │     LSB     │
│   + Pass    │     │  Encrypt    │     │  Encoding   │     │  Embedding  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
                                                            ┌─────────────┐
                                                            │   Output    │
                                                            │ Image/Audio │
                                                            └─────────────┘
```

### Technical Details

#### Image Steganography (LSB)
1. Message is encrypted using **AES-256** with PBKDF2 key derivation
2. Encrypted data is converted to binary
3. A 32-bit length header is prepended
4. Binary data is embedded in the **Blue channel** of each pixel
5. Only the **least significant bit** is modified (invisible change)

#### Audio Steganography (LSB)
1. Message is encrypted using **AES-256**
2. Music is synthesized based on emotion detection
3. Binary data is embedded in **16-bit PCM samples**
4. LSB modification is imperceptible to human hearing
5. Output is a standard WAV file

#### Emotion Detection
The system analyzes your message for emotional keywords:
- **Warm words**: love, hope, sunshine, happy, dream, family...
- **Cold words**: sad, dark, alone, pain, tears, shadow...
- The dominant emotion determines color palette and music style

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16.1.1** | React framework with App Router |
| **Tailwind CSS v4** | Utility-first styling |
| **GSAP** | Smooth animations |
| **Zustand** | State management |
| **crypto-js** | AES-256 encryption |
| **react-p5** | Canvas-based generative art |
| **wavefile** | WAV audio file generation |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Ultra-modern CSS with neon theme
│   ├── layout.js        # Root layout with metadata
│   └── page.jsx         # Main application UI
├── components/
│   └── AudioVisualizer.jsx  # Canvas-based audio visualization
├── hooks/
│   ├── useImageStego.js # Image steganography with generative art
│   ├── useAudioStego.js # Audio steganography with music synthesis
│   └── useNebulaStore.js # Zustand state management
├── lib/
│   └── utils.js         # Utility functions
└── utils/
    └── steganography.js # Core encryption & emotion detection
```

---

## 🎮 Usage Examples

### Hiding a Secret in an Image

1. Select **Encrypt** mode
2. Choose **Image** medium
3. Type: `"I love you, my sunshine! ☀️"`
4. Enter password: `mySecretPass123`
5. Watch the warm-colored flower mandala generate
6. Click **Generate & Encrypt**
7. Download your beautiful artwork with hidden message!

### Hiding a Secret in Audio

1. Select **Encrypt** mode
2. Choose **Audio** medium
3. Type: `"The night is dark and full of shadows..."`
4. Enter password: `darkSecret456`
5. Listen to the rock music preview
6. Click **Generate & Encrypt**
7. Download your WAV file with hidden message!

### Revealing a Secret

1. Select **Decrypt** mode
2. Upload your image or audio file
3. Enter the correct password
4. Click **Decrypt & Reveal**
5. See your hidden message!

---

## 🔐 Security Notes

- **AES-256 Encryption** - Military-grade encryption standard
- **Client-Side Only** - All processing happens in your browser
- **No Data Sent** - Your secrets never leave your device
- **Password Required** - Without the password, extraction is impossible
- **Tamper Resistant** - Modifying the file destroys the hidden data

---

## 🎨 Screenshots

### Encrypt Mode - Image
Beautiful generative art with hidden secrets

### Encrypt Mode - Audio  
Emotion-based music with waveform visualization

### Decrypt Mode
Clean interface for revealing hidden messages

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for **Hackathon 2026**
- Inspired by the beauty of generative art and the power of cryptography
- Special thanks to the open-source community

---

<div align="center">

**🌌 NEBULA - Where Secrets Become Art 🎨**

Made with ❤️ by the NEBULA Team

</div>
