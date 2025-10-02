# 🔊 GibberType

<div align="center">

**Transform your text into data-over-sound audio waves**
[![GitHub Views](https://komarev.com/ghpvc/?username=Patricklumowa&repo=GibberType&color=22d3ee&style=flat&label=views)](https://github.com/Patricklumowa/GibberType)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-5.4.20-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 🎯 Overview

**GibberType** is a sleek,web application that converts text messages into encrypted audio signals using the **ggwave** data-over-sound protocol. Designed to communicate with AI chatbots that understand ggwave encoding (like **[GibberLink](https://www.gbrl.ai/)**), this app transforms your text into audible data transmission with **real-time audio visualization**.

Type your message, click send, and let your AI assistant decode the audio signal. Perfect for demonstrating agent-to-agent communication, data-over-sound technology, or experiencing a unique way to transmit information to ggwave-enabled AI systems.

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gibbertype.git

# Navigate to project directory
cd gibbertype

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` and start generating audio!

## 📖 Usage

### Communicating with AI Chatbots

1. **Open a ggwave-enabled AI chatbot** like [GibberLink](https://www.gbrl.ai/) in another tab or device
2. **Type your message** in GibberType's input field
3. **Optional:** Toggle "Use Fastest Protocol" for quicker transmission
4. **Click the send button** (↑) or press `Enter`
5. **Watch the visualizer** display the audio waveform in real-time
6. **The AI chatbot** will decode and respond to your audio message

### Keyboard Shortcuts

- `Enter` - Send message (when input is focused)
- `Shift + Enter` - New line in input (if needed)

### Example Messages
- `Hello, can you help me?` - Start a conversation
- `What's the weather today?` - Ask questions
- `Book a meeting for 3pm` - Give instructions
- `Visit example.com for more info` - Share URLs
- Any text you want to transmit to your AI assistant

## 🛠️ Technology Stack

### Core Technologies

- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[React 18](https://reactjs.org/)** - UI framework with modern hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Audio & Visualization

- **[ggwave](https://github.com/ggerganov/ggwave)** - Data-over-sound transmission library (WebAssembly)
- **[AudioMotion-Analyzer](https://audiomotion.dev/)** - Real-time audio spectrum visualization
- **Web Audio API** - Browser-native audio processing (48kHz)

## 🏗️ Project Structure

```
gibbertype/
├── public/
│   └── ggwave/              # ggwave WebAssembly files
│       ├── ggwave.js        # ggwave library
│       └── ggwave.wasm      # WebAssembly binary
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Space-themed styles & animations
│   ├── audioService.ts      # Audio encoding & analyser service
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles & scrollbar
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```
## 🎯 How It Works

GibberType leverages the **ggwave** library to perform data-over-sound encoding:

1. **Initialization**: Loads ggwave WebAssembly module and creates AudioContext (48kHz)
2. **Encoding**: Text input is encoded into audio waveform samples using ggwave protocol
3. **Visualization**: AudioMotion-Analyzer processes audio through AnalyserNode for real-time display
4. **Playback**: Encoded waveform plays through Web Audio API with visual feedback
5. **Transmission**: Sound waves emit from your device's speakers
6. **AI Reception**: AI chatbots with ggwave integration (like GibberLink) decode the audio in real-time

The generated sounds can be:
- **Understood by AI chatbots** that have ggwave embedded (like GibberLink)
- Decoded by other devices running ggwave-compatible software
- Used for air-gapped data transmission
- Demonstrated with the [ggwave web demo](https://waver.ggerganov.com/)
- Transmitted between AI agents in real-time

## 🌟 Based On

This project is inspired by and references the [GibberLink](https://github.com/PennyroyalTea/gibberlink) demo - a viral AI agent communication system that won first place at the 11labs x a16z international hackathon.

## Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service.

## 🌐 Deployment

GibberType can be deployed to any static hosting platform:

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages
```bash
npm run build
# Push dist/ folder to gh-pages branch
```

## 🔧 Available Scripts

- `npm run dev` - Start development server (localhost:5173)
- `npm run build` - Build for production (outputs to dist/)
- `npm run preview` - Preview production build locally

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. The ggwave library is also open source - check the [ggwave repository](https://github.com/ggerganov/ggwave) for its license details.

## 🙏 Acknowledgments

- **[ggwave](https://github.com/ggerganov/ggwave)** by Georgi Gerganov - The incredible data-over-sound library
- **[AudioMotion-Analyzer](https://audiomotion.dev/)** by Henrique Avila Vianna - Beautiful real-time audio visualization
- **[GibberLink](https://github.com/PennyroyalTea/gibberlink)** by Anton Pidkuiko & Boris Starkov - Original inspiration (11labs x a16z hackathon winner)

## Related Projects

- [ggwave](https://github.com/ggerganov/ggwave) - The underlying data-over-sound protocol
- [gibberlink](https://github.com/PennyroyalTea/gibberlink) - Original AI-to-AI communication demo
- [ggwave web demo](https://waver.ggerganov.com/) - Try decoding GibberType audio!

## 💡 Use Cases

- **AI Chatbot Communication** - Talk to ggwave-enabled AI assistants like GibberLink using audio
- **Agent-to-Agent Protocol** - Enable seamless communication between AI agents
- **Air-gapped Data Transmission** - Send data through audio without network connectivity
- **Education** - Demonstrate data encoding and signal processing concepts
- **IoT** - Simple device-to-device communication without WiFi/Bluetooth
- **Privacy-focused Communication** - Alternative to text-based messaging

## 📧 Support

Have questions or suggestions? Feel free to:
Open an [issue](https://github.com/Patricklumowa/gibbertype/issues)

---
<div align="center">

⭐ Star this repo if you find it useful! 


</div>
