// TTS 服务统一入口 - 火山引擎版本
import { VolcEngineTTSClient } from './volcengine';
import { AudioCache } from './audio-cache';
import type {
  TTSConfig,
  SynthesisResult,
  WordTimestamp,
} from './types';

import {
  DEFAULT_SPEECH_RATE,
  normalizeSpeechRate,
  type TTSServiceOptions,
} from './types';

export { VolcEngineTTSClient } from './volcengine';
export { findCueInTimestamps, calculateDurationFromTimestamps } from './volcengine';
export { AudioCache } from './audio-cache';
export * from './types';

export class TTSService {
  private client: VolcEngineTTSClient;
  private cache: AudioCache;
  private enableCache: boolean;
  private defaultSpeechRate: number;

  constructor(options: TTSServiceOptions) {
    const config: TTSConfig = {
      appId: options.appId || process.env.VOLCENGINE_APP_ID,
      apiKey: options.apiKey || process.env.VOLCENGINE_ACCESS_KEY,
      accessKey: options.accessKey || process.env.VOLCENGINE_ACCESS_KEY,
      resourceId: options.resourceId || process.env.VOLCENGINE_RESOURCE_ID || 'seed-tts-1.0',
      voiceId: options.defaultVoiceId,
      speechRate: options.defaultSpeechRate,
      uid: options.uid || 'default-user',
    };

    this.client = new VolcEngineTTSClient(config);
    this.cache = new AudioCache(options.cacheDir);
    this.enableCache = options.enableCache !== false;
    this.defaultSpeechRate =
      normalizeSpeechRate(options.defaultSpeechRate) ?? DEFAULT_SPEECH_RATE;
  }

  /**
   * 合成语音（带缓存和时间戳）
   */
  async synthesize(
    text: string,
    voiceId?: string,
    speechRate?: number
  ): Promise<SynthesisResult & { timestamps?: WordTimestamp[] }> {
    const vid = voiceId || 'default';
    const rate =
      normalizeSpeechRate(speechRate) ?? this.defaultSpeechRate;

    // 检查缓存（注意：缓存现在也存储时间戳）
    if (this.enableCache) {
      const cached = this.cache.get(text, vid, rate);
      if (cached) {
        // 尝试读取缓存的时间戳
        const timestampPath = cached.audioPath.replace('.mp3', '_timestamps.json');
        let timestamps: WordTimestamp[] | undefined;

        try {
          const { readFileSync } = await import('fs');
          const tsData = JSON.parse(readFileSync(timestampPath, 'utf-8'));
          timestamps = tsData.timestamps;
        } catch {
          // 时间戳文件不存在，忽略
        }

        return {
          audioPath: cached.audioPath,
          duration: cached.duration,
          timestamps,
          fromCache: true,
        };
      }
    }

    // 调用 TTS
    const result = await this.client.synthesize(text, voiceId, speechRate);

    // 保存到缓存
    if (this.enableCache) {
      this.cache.set(text, vid, result.audioPath, result.duration, rate);

      // 同时保存时间戳
      if (result.timestamps) {
        const timestampPath = result.audioPath.replace('.mp3', '_timestamps.json');
        const { writeFileSync } = await import('fs');
        writeFileSync(
          timestampPath,
          JSON.stringify({
            timestamps: result.timestamps,
            duration: result.duration,
          }, null, 2),
          'utf-8'
        );
      }
    }

    return {
      ...result,
      fromCache: false,
    };
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
  const appId = options?.appId || process.env.VOLCENGINE_APP_ID;
  const accessKey = options?.apiKey || options?.accessKey || process.env.VOLCENGINE_ACCESS_KEY;

  if (!appId || !accessKey) {
    throw new Error(
      'VOLCENGINE_APP_ID and VOLCENGINE_ACCESS_KEY are required. Set them as environment variables or pass in options.'
    );
  }

  return new TTSService({
    appId,
    accessKey,
    resourceId: options?.resourceId || process.env.VOLCENGINE_RESOURCE_ID,
    ...options,
  });
}

// 导出默认配置
export { DEFAULT_SPEECH_RATE, normalizeSpeechRate } from './types';
