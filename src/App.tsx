import { useEffect, useRef, useState } from 'react';
import { generateGibberlink, createAnalyserNode, getAnalyserNode, getAudioContext, startListening, stopListening } from './audioService';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import './App.css';

interface ChatMessage {
  id: string;
  text: string;
  type: 'sent' | 'received';
  timestamp: number;
}

function App() {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [useFastest, setUseFastest] = useState(false);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioMotionRef = useRef<AudioMotionAnalyzer | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isListeningState, setIsListeningState] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    setStatus('');
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  const handleStartAudio = async () => {
    try {
      const success = await startListening((text) => {
        setChatHistory(prev => [...prev, {
          id: Date.now().toString() + Math.random().toString(),
          text,
          type: 'received',
          timestamp: Date.now()
        }]);
      });
      setIsListeningState(success);
      setIsAudioReady(true);
    } catch (e) {
      console.error("Failed to start listening", e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Initialize AudioMotion-Analyzer when generating starts
  useEffect(() => {
    if (isGenerating) {
      const context = getAudioContext();
      if (!context) {
        console.log('No audio context available');
        return;
      }

      // Create analyser node if not exists
      createAnalyserNode();
      const analyserNode = getAnalyserNode();
      if (!analyserNode) {
        console.log('Failed to create analyser node');
        return;
      }

      // Initialize AudioMotion-Analyzer
      if (!audioMotionRef.current) {
        const container = document.getElementById('audio-visualizer');
        if (!container) return;

        audioMotionRef.current = new AudioMotionAnalyzer(container, {
          source: analyserNode,
          width: 400,
          height: 300,
          mode: 6, // Oscilloscope mode like original
          fillAlpha: 0.7,
          lineWidth: 2,
          showScaleX: false,
          showScaleY: false,
          reflexRatio: 0.2,
          showBgColor: false,
          showPeaks: true,
          gradient: 'steelblue',
          smoothing: 0.7,
        });
      }

      return () => {
        if (audioMotionRef.current) {
          audioMotionRef.current.destroy();
          audioMotionRef.current = null;
        }
      };
    }
  }, [isGenerating]);

  const showTransientStatus = (message: string, duration = 3200) => {
    setStatus(message);
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }
    statusTimerRef.current = setTimeout(() => {
      setStatus('');
      statusTimerRef.current = null;
    }, duration);
  };

  const handleGenerate = async () => {
    if (!message.trim()) {
      showTransientStatus('⚠️ Please enter a message');
      return;
    }

    // Add to history immediately
    setChatHistory(prev => [...prev, {
      id: Date.now().toString() + Math.random().toString(),
      text: message,
      type: 'sent',
      timestamp: Date.now()
    }]);

    setIsGenerating(true);
    setStatus('');
    
    // Stop listening while speaking
    stopListening();
    setIsListeningState(false);

    try {
      // Wait for sound generation AND playback to complete
      const success = await generateGibberlink(message, useFastest);
      if (!success) {
        showTransientStatus('❌ Failed to generate sound. Check console for details.');
      }
    } catch (error) {
      console.error('Error:', error);
      showTransientStatus('❌ Error generating sound');
    } finally {
      // Animation will stop only after sound finishes playing
      setIsGenerating(false);
      setMessage(''); // Clear input after sending
      
      // Resume listening
      try {
        const success = await startListening((text) => {
          setChatHistory(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(),
            text,
            type: 'received',
            timestamp: Date.now()
          }]);
        });
        setIsListeningState(success);
      } catch (e) {
        console.error("Failed to resume listening", e);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="app-container">
      {!isAudioReady && (
        <div className="audio-init-overlay">
          <div className="audio-init-content">
            <div className="welcome-icon">🔇</div>
            <h2 className="welcome-title">System Offline</h2>
            <p className="welcome-subtitle">Audio transmission requires user authorization.</p>
            <button className="init-button" onClick={handleStartAudio}>
              Initialize System
            </button>
          </div>
        </div>
      )}
      {/* Left Sidebar - Chat Interface */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Transmission Log</h2>
          <div className={`connection-status ${isListeningState ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isListeningState ? 'Receiving' : 'Offline'}
          </div>
        </div>
        
        <div className="chat-history">
          {chatHistory.length === 0 ? (
            <div className="empty-state">
              <p>No transmissions yet...</p>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Links moved to sidebar */}
        <div className="sidebar-footer">
          <a 
            href="https://github.com/Patricklumowa/GibberType" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-button github-link"
            title="View source code on GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="link-icon">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a 
            href="https://www.gbrl.ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-button gibberlink-link"
            title="Run GibberLink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="link-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            GBRL.ai
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1 className="title">
            <span className="title-icon">🔊</span>
            GibberType
          </h1>
          <p className="subtitle">
            Transform your text into data-over-sound audio waves
          </p>
        </div>

        <div className="visualizer-container">
          {/* Welcome Message */}
          {!status && !isGenerating && (
            <div className="welcome-section">
              <div className="welcome-icon">🔊</div>
              <h2 className="welcome-title">Talk to the clanker🤖?</h2>
              <p className="welcome-subtitle">Type a message to generate gibberlink sound</p>
            </div>
          )}

          {/* Audio Visualizer - Original Gibberlink Style */}
          {isGenerating && (
            <div className="visualizer-stage" role="status" aria-live="polite" aria-label="Generating audio">
              <div id="audio-visualizer" className="audio-visualizer" />
              <p className="loader-caption">Transmitting encrypted audio...</p>
            </div>
          )}

          {/* Status Display */}
          {status && !isGenerating && (
            <div className="message-display">
              <div className="assistant-message">
                {status}
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              id="message-input"
              className="text-input"
              placeholder="Message GibberType..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !message.trim()}
              className={`send-button ${isGenerating || !message.trim() ? 'disabled' : ''}`}
              title="Generate Sound"
            >
              {isGenerating ? (
                <span className="spinner-small"></span>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="send-icon">
                  <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
          <div className="input-footer">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useFastest}
                onChange={(e) => setUseFastest(e.target.checked)}
                className="toggle-checkbox"
                disabled={isGenerating}
              />
              <span className="toggle-text">
                Fastest Protocol {useFastest ? '⚡' : ''}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


