declare global {
  interface Window {
    ggwave_factory: () => Promise<GGWaveModule>;
  }
}

export interface GGWaveParameters {
  sampleRateInp: number;
  sampleRateOut: number;
  soundMarkerThreshold: number;
  [key: string]: any;
}

export interface GGWaveInstance {
  [key: string]: any;
}

export interface GGWaveModule {
  getDefaultParameters(): GGWaveParameters;
  init(params: GGWaveParameters): GGWaveInstance;
  encode(instance: GGWaveInstance, message: string, protocol: number, volume: number): Int16Array;
  decode(instance: GGWaveInstance, samples: Int8Array): Uint8Array | null;
  ProtocolId: {
    GGWAVE_PROTOCOL_AUDIBLE_FAST: number;
    GGWAVE_PROTOCOL_AUDIBLE_FASTEST: number;
    [key: string]: number;
  };
}

export {};
