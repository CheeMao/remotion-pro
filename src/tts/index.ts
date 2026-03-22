// TTS 服务统一入口
import { CosyVoiceClient } from './cosyvoice';
import { VoiceCloneClient } from './voice-clone';
import { AudioCache } from './audio-cache';
import {
  DEFAULT_SPEECH_RATE,
  normalizeSpeechRate,
  TTSConfig,
  SynthesisResult,
} from './types';

export { CosyVoiceClient } from './cosyvoice';
export { VoiceCloneClient } from './voice-clone';
export { AudioCache } from './audio-cache';
export * from './types';

export interface TTSServiceOptions {
  apiKey: string;
  defaultVoiceId?: string;
  defaultSpeechRate?: number;
  enableCache?: boolean;
  cacheDir?: string;
}

export class TTSService {
  private client: CosyVoiceClient;
  private voiceClone: VoiceCloneClient;
  private cache: AudioCache;
  private enableCache: boolean;
  private defaultSpeechRate: number;

  constructor(options: TTSServiceOptions) {
    const config: TTSConfig = {
      apiKey: options.apiKey,
      voiceId: options.defaultVoiceId,
      speechRate: options.defaultSpeechRate,
    };

    this.client = new CosyVoiceClient(config);
    this.voiceClone = new VoiceCloneClient(options.apiKey);
    this.cache = new AudioCache(options.cacheDir);
    this.enableCache = options.enableCache !== false;
    this.defaultSpeechRate =
      normalizeSpeechRate(options.defaultSpeechRate) ?? DEFAULT_SPEECH_RATE;
  }

  /**
   * 合成语音（带缓存）
   */
  async synthesize(
    text: string,
    voiceId?: string,
    speechRate?: number
  ): Promise<SynthesisResult> {
    const vid = voiceId || 'default';
    const rate =
      normalizeSpeechRate(speechRate) ?? this.defaultSpeechRate;

    // 检查缓存
    if (this.enableCache) {
      const cached = this.cache.get(text, vid, rate);
      if (cached) {
        return {
          audioPath: cached.audioPath,
          duration: cached.duration,
          fromCache: true,
        };
      }
    }

    // 调用 TTS
    const audioBuffer = await this.client.synthesize(text, voiceId, speechRate);
    const entry = this.cache.set(text, vid, audioBuffer, undefined, rate);

    return {
      audioPath: entry.audioPath,
      duration: entry.duration,
      fromCache: false,
    };
  }

  /**
   * 创建自定义音色
   */
  async createVoice(audioUrl: string, prefix: string): Promise<string> {
    const voiceId = await this.voiceClone.createVoice(audioUrl, prefix);
    await this.voiceClone.waitForVoiceReady(voiceId);
    return voiceId;
  }

  /**
   * 查询音色状态
   */
  async queryVoice(voiceId: string) {
    return this.voiceClone.queryVoice(voiceId);
  }

  /**
   * 获取缓存实例
   */
  getCache(): AudioCache {
    return this.cache;
  }
}

/**
 * 从环境变量创建 TTS 服务
 */
export function createTTSService(options?: Partial<TTSServiceOptions>): TTSService {
  const apiKey = options?.apiKey || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is required. Set it as environment variable or pass in options.');
  }

  return new TTSService({
    apiKey,
    ...options,
  });
}
