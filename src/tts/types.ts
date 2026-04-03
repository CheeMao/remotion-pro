// TTS 服务类型定义

// TTS 配置
export interface TTSConfig {
  apiKey?: string;
  model?: string;
  voiceId?: string;
  sampleRate?: number;
  speechRate?: number;
  format?: 'mp3' | 'wav' | 'pcm';
  // 火山引擎配置
  appId?: string;
  accessKey?: string;
  resourceId?: string;
  uid?: string;
}

export interface TTSServiceOptions {
  appId?: string;
  apiKey?: string;
  accessKey?: string;
  resourceId?: string;
  defaultVoiceId?: string;
  defaultSpeechRate?: number;
  uid?: string;
  cacheDir?: string;
  enableCache?: boolean;
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

// 字级时间戳（火山引擎返回）
export interface WordTimestamp {
  word: string;
  startTime: number;  // 秒
  endTime: number;    // 秒
  confidence: number;
}

// 句子时间戳信息
export interface SentenceTimestamp {
  text: string;
  words: WordTimestamp[];
}

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
  timestamps?: WordTimestamp[];  // 新增：字级时间戳
  createdAt: string;
}

// TTS 合成结果
export interface SynthesisResult {
  audioPath: string;
  duration: number;
  timestamps?: WordTimestamp[];  // 新增：字级时间戳
  fromCache: boolean;
}

// 火山引擎TTS请求参数
export interface VolcEngineTTSRequest {
  user: {
    uid: string;
  };
  req_params: {
    text: string;
    speaker: string;
    model?: string;
    audio_params: {
      format: 'mp3' | 'wav' | 'pcm';
      sample_rate: number;
      speech_rate?: number;
      enable_timestamp?: boolean;
      enable_subtitle?: boolean;
    };
  };
}

// 火山引擎TTS响应
export interface VolcEngineTTSResponse {
  code: number;
  message: string;
  data?: string;  // Base64音频数据
  sentence?: SentenceTimestamp;  // 时间戳信息
  usage?: {
    text_words: number;
  };
}
