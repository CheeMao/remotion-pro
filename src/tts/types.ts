// TTS 服务类型定义

// TTS 配置
export interface TTSConfig {
  apiKey: string;
  model?: string;
  voiceId?: string;
  sampleRate?: number;
  speechRate?: number;
  format?: 'mp3' | 'wav' | 'pcm';
}

export const DEFAULT_SPEECH_RATE = 1.0;

export const normalizeSpeechRate = (speechRate?: number): number | undefined => {
  if (speechRate === undefined) {
    return undefined;
  }

  if (!Number.isFinite(speechRate) || speechRate < 0.5 || speechRate > 2.0) {
    throw new Error('Speech rate must be a number between 0.5 and 2.0.');
  }

  return speechRate;
};

// 音色复刻配置
export interface VoiceCloneConfig {
  apiKey: string;
  audioUrl: string;
  prefix: string;
}

// WebSocket 请求 - CosyVoice API
export interface TTSRequest {
  model: string;
  input: {
    text: string;
    voice?: string;
  };
  parameters?: {
    sample_rate?: number;
    format?: string;
  };
}

// WebSocket 响应
export interface TTSResponse {
  output?: {
    audio?: string;  // Base64 编码的音频数据
  };
  usage?: {
    characters: number;
  };
  code?: string;
  message?: string;
}

// 音色状态
export type VoiceStatus = 'DEPLOYING' | 'OK' | 'UNDEPLOYED';

export interface VoiceInfo {
  voiceId: string;
  status: VoiceStatus;
  createdAt?: string;
}

// 缓存条目
export interface AudioCacheEntry {
  text: string;
  voiceId: string;
  speechRate?: number;
  audioPath: string;
  duration: number;  // 秒
  createdAt: string;
}

// TTS 合成结果
export interface SynthesisResult {
  audioPath: string;
  duration: number;
  fromCache: boolean;
}
