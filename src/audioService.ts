// Helper function to convert array types
function convertTypedArray(src: any, type: any) {
  const buffer = new ArrayBuffer(src.byteLength);
  new src.constructor(buffer).set(src);
  return new type(buffer);
}

// Global audio context and ggwave instance
let context: AudioContext | null = null;
let ggwave: any = null;
let instance: any = null;
let analyserNode: AnalyserNode | null = null;
let captureStream: MediaStream | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let scriptNode: ScriptProcessorNode | null = null;
let isListening = false;

// Initialize audio context and ggwave instance
export async function initAudio(): Promise<boolean> {
  try {
    if (!context) {
      try {
        context = new AudioContext({ sampleRate: 48000 });
      } catch (e) {
        console.warn('Failed to create AudioContext with 48k sample rate, trying default', e);
        context = new AudioContext();
      }
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    if (context.sampleRate === 0) {
      console.warn('AudioContext sampleRate is 0, waiting for it to populate...');
      // Try to force a resume again or wait
      await context.resume();
      await new Promise(r => setTimeout(r, 100));
    }

    if (!ggwave) {
      // Retry finding factory if not immediately available
      let factory = (window as any).ggwave_factory;
      if (!factory) {
        console.log('ggwave_factory not found immediately, waiting...');
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 100));
          factory = (window as any).ggwave_factory;
          if (factory) {
            console.log('ggwave_factory found after wait');
            break;
          }
        }
      }

      if (factory) {
        try {
          ggwave = await factory();
          // IMPORTANT: Reset instance when we get a new ggwave module
          instance = null;
          // Give WASM a moment to settle
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {
          console.error('Failed to load ggwave factory:', e);
          return false;
        }
      } else {
        console.error('ggwave_factory not found on window. Script might not be loaded.');
        return false;
      }
    }

    if (ggwave && !instance) {
      const parameters = ggwave.getDefaultParameters();
      parameters.sampleRateInp = context.sampleRate;
      parameters.sampleRateOut = context.sampleRate;
      parameters.soundMarkerThreshold = 4;

      console.log('Initializing ggwave with params:', parameters);

      // Attempt to initialize with retries
      for (let i = 0; i < 5; i++) {
        instance = ggwave.init(parameters);
        if (instance) {
          break;
        }
        console.warn(`ggwave.init() attempt ${i + 1} failed, retrying...`);
        await new Promise(r => setTimeout(r, 200));
      }
      
      if (instance) {
        console.log('ggwave initialized successfully', { instance, ggwave });
      } else {
        console.error('ggwave.init() returned null/undefined after retries');
      
        ggwave = null; 
        return false;
      }
    }

    return !!(context && ggwave && instance);
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
}

export async function startListening(onMessage: (text: string) => void): Promise<boolean> {
  if (isListening) return true;

  try {
    if (!await initAudio() || !context || !ggwave || !instance) {
      console.error('Audio not initialized');
      return false;
    }

    // Request microphone access with specific constraints for data-over-sound
    const constraints = {
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
      },
    };
    captureStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (context.state === 'suspended') {
      console.log('AudioContext is suspended, resuming...');
      await context.resume();
    }
    
    sourceNode = context.createMediaStreamSource(captureStream);
    scriptNode = context.createScriptProcessor(1024, 1, 1);
    
    let hasLogged = false;
    scriptNode.onaudioprocess = (e) => {
      if (!hasLogged) {
        console.log('Audio processing started - microphone is active');
        hasLogged = true;
      }

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Pass Float32 data directly to ggwave as Int8Array bytes
      // This matches the implementation in gibberlink
      const res = ggwave.decode(
        instance, 
        convertTypedArray(new Float32Array(inputData), Int8Array)
      );
      
      if (res && res.length > 0) {
        try {
          let text = new TextDecoder("utf-8").decode(res);
          if (text) {
             // Remove any 2-character prefix followed by $ (e.g. NM$, FD$, FR$, GH$)
             // This strips the prefix but keeps the message content
             text = text.replace(/^.{2}\$/, '');

             if (text.length > 0) {
                console.log('Decoded message:', text);
                onMessage(text);
             }
          }
        } catch (err) {
          console.error('Error decoding text:', err);
        }
      }
    };

    // Create a mute gain node to prevent feedback but keep the processing chain alive
    const mute = context.createGain();
    mute.gain.value = 0;
    
    sourceNode.connect(scriptNode);
    scriptNode.connect(mute);
    mute.connect(context.destination);

    isListening = true;
    return true;
  } catch (error) {
    console.error('Failed to start listening:', error);
    return false;
  }
}

export function stopListening() {
  if (!isListening) return;

  if (scriptNode) {
    scriptNode.disconnect();
    scriptNode.onaudioprocess = null;
    scriptNode = null;
  }
  
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }

  if (captureStream) {
    captureStream.getTracks().forEach(track => track.stop());
    captureStream = null;
  }

  isListening = false;
}

// Send an audio message with gibberlink encoding
export async function generateGibberlink(message: string, fastest: boolean = false): Promise<boolean> {
  console.log('Generating gibberlink sound for:', message);
  
  try {
    if (!await initAudio() || !context || !ggwave) {
      console.error('Failed to generate sound: audio context or ggwave not initialized');
      return false;
    }

    // Encode message to waveform using ggwave
    const waveform = ggwave.encode(
      instance,
      message,
      fastest ? ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_FASTEST : ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_FAST,
      10 // volume level
    );

    // Convert to Float32Array for Web Audio API
    const buf = convertTypedArray(waveform, Float32Array);
    
    // Create audio buffer
    const buffer = context.createBuffer(1, buf.length, context.sampleRate);
    buffer.getChannelData(0).set(buf);
    
    // Create and play audio source
    const source = context.createBufferSource();
    source.buffer = buffer;
    
    // Connect through analyser if available for visualization
    if (analyserNode) {
      source.connect(analyserNode);
      analyserNode.connect(context.destination);
    } else {
      source.connect(context.destination);
    }
    
    // Return a Promise that resolves when the sound finishes playing
    return new Promise((resolve) => {
      source.onended = () => {
        console.log('Gibberlink sound playback completed!');
        resolve(true);
      };
      
      source.start(0);
      console.log('Gibberlink sound generated and playing!');
    });
  } catch (error) {
    console.error('Failed to generate gibberlink sound:', error);
    return false;
  }
}

// Get audio context state for UI display
export function getAudioContextState(): string {
  return context?.state || 'not-initialized';
}

// Get audio context for external use
export function getAudioContext(): AudioContext | null {
  return context;
}

// Create analyser node for visualization
export function createAnalyserNode(): AnalyserNode | null {
  if (!context) {
    console.error('Cannot create analyser: audio context not initialized');
    return null;
  }

  if (!analyserNode) {
    analyserNode = context.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;
  }

  return analyserNode;
}

// Get existing analyser node
export function getAnalyserNode(): AnalyserNode | null {
  return analyserNode;
}
