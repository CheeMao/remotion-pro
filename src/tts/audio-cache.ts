// 音频缓存管理
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { AudioCacheEntry } from './types';

const DEFAULT_CACHE_DIR = 'audio-cache';

export class AudioCache {
  private cacheDir: string;

  constructor(baseDir?: string) {
    this.cacheDir = join(baseDir || process.cwd(), DEFAULT_CACHE_DIR);
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(
    text: string,
    voiceId: string,
    speechRate?: number
  ): string {
    return createHash('md5')
      .update(`${text}:${voiceId}:${speechRate ?? 'default'}`)
      .digest('hex');
  }

  /**
   * 检查缓存
   */
  get(text: string, voiceId: string, speechRate?: number): AudioCacheEntry | null {
    const key = this.getCacheKey(text, voiceId, speechRate);
    const metaPath = join(this.cacheDir, `${key}.json`);
    const audioPath = join(this.cacheDir, `${key}.mp3`);

    if (existsSync(metaPath) && existsSync(audioPath)) {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as AudioCacheEntry;
      return {
        ...meta,
        audioPath,
      };
    }

    return null;
  }

  /**
   * 保存缓存（支持时间戳）
   */
  set(
    text: string,
    voiceId: string,
    audioPathOrBuffer: string | Buffer,
    duration?: number,
    speechRate?: number,
    timestamps?: Array<{ word: string; startTime: number; endTime: number; confidence: number }>
  ): AudioCacheEntry {
    const key = this.getCacheKey(text, voiceId, speechRate);
    const metaPath = join(this.cacheDir, `${key}.json`);
    const audioPath = typeof audioPathOrBuffer === 'string'
      ? audioPathOrBuffer
      : join(this.cacheDir, `${key}.mp3`);

    // 如果是Buffer，保存音频
    if (Buffer.isBuffer(audioPathOrBuffer)) {
      writeFileSync(audioPath, audioPathOrBuffer);
    }

    // 估算时长（如果没有提供）
    const estimatedDuration = duration ?? this.estimateDuration(text);

    // 保存元数据
    const entry: AudioCacheEntry = {
      text,
      voiceId,
      speechRate,
      audioPath,
      duration: estimatedDuration,
      timestamps,
      createdAt: new Date().toISOString(),
    };

    writeFileSync(metaPath, JSON.stringify(entry, null, 2));

    // 同时保存时间戳到独立文件
    if (timestamps) {
      const timestampPath = audioPath.replace('.mp3', '_timestamps.json');
      writeFileSync(
        timestampPath,
        JSON.stringify({ timestamps, duration: estimatedDuration }, null, 2),
        'utf-8'
      );
    }

    return entry;
  }

  /**
   * 估算音频时长（基于文本长度）
   * 假设平均语速约 4 字符/秒
   */
  private estimateDuration(text: string): number {
    return Math.max(1, text.length / 4);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    const files = readdirSync(this.cacheDir);
    for (const file of files) {
      unlinkSync(join(this.cacheDir, file));
    }
  }

  /**
   * 获取缓存目录路径
   */
  getCacheDir(): string {
    return this.cacheDir;
  }
}
