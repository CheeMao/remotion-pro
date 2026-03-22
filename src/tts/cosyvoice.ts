import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { DEFAULT_SPEECH_RATE, normalizeSpeechRate, TTSConfig } from './types';

const PYTHON_SCRIPT = join(process.cwd(), 'scripts', 'tts_synthesize.py');
const FILE_READY_RETRY_MS = 200;
const FILE_READY_MAX_RETRIES = 15;

export class CosyVoiceClient {
  private config: Required<Omit<TTSConfig, 'voiceId'>> & Pick<TTSConfig, 'voiceId'>;

  constructor(config: TTSConfig) {
    this.config = {
      model: 'cosyvoice-v3.5-plus',
      sampleRate: 22050,
      speechRate: DEFAULT_SPEECH_RATE,
      format: 'mp3',
      ...config,
    };
  }

  async synthesize(
    text: string,
    voiceId?: string,
    speechRate?: number
  ): Promise<Buffer> {
    const outputPath = join(process.cwd(), 'audio-cache', `temp-${Date.now()}.mp3`);
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const voice = voiceId || this.config.voiceId || 'longxiaochun';
    const rate = normalizeSpeechRate(
      speechRate ?? this.config.speechRate ?? DEFAULT_SPEECH_RATE
    ) ?? DEFAULT_SPEECH_RATE;
    const result = execFileSync(
      'python',
      [
        PYTHON_SCRIPT,
        '--voice',
        voice,
        '--text',
        text,
        '--output',
        outputPath,
        '--model',
        this.config.model,
        '--speech-rate',
        String(rate),
      ],
      {
        env: { ...process.env, DASHSCOPE_API_KEY: this.config.apiKey },
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    try {
      const json = JSON.parse(result.trim());
      if (!json.success) {
        throw new Error(json.error || 'TTS synthesis failed');
      }

      for (let attempt = 0; attempt < FILE_READY_MAX_RETRIES; attempt++) {
        if (existsSync(outputPath)) {
          const stats = statSync(outputPath);
          if (stats.size > 0) {
            const { readFileSync } = await import('fs');
            return readFileSync(outputPath);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, FILE_READY_RETRY_MS));
      }

      throw new Error(`Audio file was not written: ${outputPath}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`TTS synthesis failed: ${error.message}`);
      }
      throw error;
    }
  }

  async synthesizeToFile(
    text: string,
    outputPath: string,
    voiceId?: string,
    speechRate?: number
  ): Promise<string> {
    const audioBuffer = await this.synthesize(text, voiceId, speechRate);
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outputPath, audioBuffer);
    return outputPath;
  }
}
