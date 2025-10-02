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

// Initialize audio context and ggwave instance
export async function initAudio(): Promise<boolean> {
  try {
    if (!context) {
      context = new AudioContext({ sampleRate: 48000 });
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    if (!ggwave && window && (window as any).ggwave_factory) {
      ggwave = await (window as any).ggwave_factory();
      const parameters = ggwave.getDefaultParameters();
      parameters.sampleRateInp = context.sampleRate;
      parameters.sampleRateOut = context.sampleRate;
      parameters.soundMarkerThreshold = 4;

      instance = ggwave.init(parameters);
      console.log('ggwave initialized successfully', { instance, ggwave });
    }

    return !!(context && ggwave);
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
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
