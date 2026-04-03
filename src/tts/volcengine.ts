import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import type {
  TTSConfig,
  SynthesisResult,
  WordTimestamp,
  VolcEngineTTSRequest,
} from './types';

const PYTHON_SCRIPT = join(process.cwd(), 'scripts', 'volcengine_tts.py');

/**
 * 火山引擎TTS客户端
 * 支持字级时间戳返回
 */
export class VolcEngineTTSClient {
  private config: TTSConfig;

  constructor(config: TTSConfig) {
    this.config = {
      sampleRate: 24000,
      format: 'mp3',
      ...config,
    };
  }

  /**
   * 合成语音（带时间戳）
   */
  async synthesize(
    text: string,
    voiceId?: string,
    speechRate?: number
  ): Promise<SynthesisResult & { timestamps?: WordTimestamp[] }> {
    const normalizedText = text.trim();
    if (!normalizedText) {
      throw new Error('Cannot synthesize empty text.');
    }

    // 检查中文字符
    if (!/[\u4e00-\u9fa5a-zA-Z0-9]/.test(normalizedText)) {
      throw new Error('Cannot synthesize text without letters or numbers.');
    }

    const outputPath = join(
      process.cwd(),
      'audio-cache',
      `volc-${Date.now()}.mp3`
    );
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const speaker = voiceId || this.config.voiceId || 'zh_female_shuangkuaisisi_moon_bigtts';
    const rate = speechRate ?? this.config.speechRate ?? 1.0;

    // 构建请求参数
    const requestData: VolcEngineTTSRequest = {
      user: {
        uid: this.config.uid || 'default-user',
      },
      req_params: {
        text: normalizedText,
        speaker,
        model: this.config.model,
        audio_params: {
          format: (this.config.format as 'mp3' | 'wav' | 'pcm') || 'mp3',
          sample_rate: this.config.sampleRate || 24000,
          speech_rate: rate,
          enable_timestamp: true,  // 关键：启用时间戳
        },
      },
    };

    try {
      const result = await this.callPythonScript(requestData, outputPath);
      return result;
    } catch (error) {
      throw new Error(
        `VolcEngine TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 调用Python脚本进行TTS合成
   */
  private async callPythonScript(
    requestData: VolcEngineTTSRequest,
    outputPath: string
  ): Promise<SynthesisResult & { timestamps?: WordTimestamp[] }> {
    return new Promise((resolve, reject) => {
      const requestJson = JSON.stringify(requestData);

      const env = {
        ...process.env,
        VOLCENGINE_APP_ID: this.config.appId,
        VOLCENGINE_ACCESS_KEY: this.config.apiKey || this.config.accessKey,
        VOLCENGINE_RESOURCE_ID: this.config.resourceId || 'seed-tts-1.0',
      };

      if (!env.VOLCENGINE_APP_ID || !env.VOLCENGINE_ACCESS_KEY) {
        reject(new Error('VOLCENGINE_APP_ID and VOLCENGINE_ACCESS_KEY are required'));
        return;
      }

      const pythonProcess = spawn('python', [
        PYTHON_SCRIPT,
        '--request', requestJson,
        '--output', outputPath,
      ], {
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${stderr || stdout}`));
          return;
        }

        try {
          // 解析最后几行JSON输出
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);

          if (result.success) {
            resolve({
              audioPath: outputPath,
              duration: result.duration || 0,
              timestamps: result.timestamps,
              fromCache: false,
            });
          } else {
            reject(new Error(result.error || 'TTS synthesis failed'));
          }
        } catch {
          reject(new Error(`Failed to parse result: ${stdout}`));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to spawn Python: ${err.message}`));
      });
    });
  }

  /**
   * 合成到指定文件
   */
  async synthesizeToFile(
    text: string,
    outputPath: string,
    voiceId?: string,
    speechRate?: number
  ): Promise<string> {
    const result = await this.synthesize(text, voiceId, speechRate);

    // 如果输出路径不同，复制文件
    if (result.audioPath !== outputPath) {
      const { copyFileSync } = await import('fs');
      copyFileSync(result.audioPath, outputPath);
    }

    return outputPath;
  }
}

/**
 * 从时间戳计算音频时长
 */
export function calculateDurationFromTimestamps(timestamps: WordTimestamp[]): number {
  if (!timestamps || timestamps.length === 0) {
    return 0;
  }
  const lastWord = timestamps[timestamps.length - 1];
  return lastWord.endTime;
}

/**
 * 在时间戳中查找cue的起始和结束时间
 */
export function findCueInTimestamps(
  cue: string,
  timestamps: WordTimestamp[]
): { start: number; end: number } | null {
  if (!cue || !timestamps || timestamps.length === 0) {
    return null;
  }

  // 将cue拆分为字数组
  const cueChars = cue.split('').filter((c) => /[\u4e00-\u9fa5a-zA-Z0-9]/.test(c));

  if (cueChars.length === 0) {
    return null;
  }

  // 在时间戳中查找匹配
  for (let i = 0; i <= timestamps.length - cueChars.length; i++) {
    const window = timestamps.slice(i, i + cueChars.length);
    const windowText = window.map((t) => t.word).join('');

    // 模糊匹配：检查windowText是否包含cue的所有关键字
    if (windowText.includes(cue) || cue.includes(windowText)) {
      return {
        start: window[0].startTime,
        end: window[window.length - 1].endTime,
      };
    }
  }

  // 如果没有精确匹配，返回近似位置
  // 基于字数比例估算
  const cuePosition = timestamps.findIndex((t) =>
    cue.includes(t.word) || t.word.includes(cue[0])
  );

  if (cuePosition >= 0) {
    const endPosition = Math.min(cuePosition + cueChars.length, timestamps.length);
    return {
      start: timestamps[cuePosition].startTime,
      end: timestamps[endPosition - 1].endTime,
    };
  }

  return null;
}
