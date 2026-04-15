import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import type {
  TTSConfig,
  SynthesisResult,
  WordTimestamp,
  VolcEngineTTSRequest,
} from './types';

const VOLCENGINE_TTS_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';

type ParsedVolcEngineStream = {
  audio: Buffer;
  duration: number;
  timestamps: WordTimestamp[];
};

const normalizeResponseLine = (line: string): string => {
  const trimmed = line.trim();
  return trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
};

const parseVolcEngineStreamResponse = (payload: string): ParsedVolcEngineStream => {
  const trimmedPayload = payload.trim();
  if (!trimmedPayload) {
    throw new Error('VolcEngine returned an empty response.');
  }

  const lines = trimmedPayload
    .split(/\r?\n/)
    .map(normalizeResponseLine)
    .filter(Boolean);
  const audioChunks: Buffer[] = [];
  const timestamps: WordTimestamp[] = [];
  let duration = 0;
  let upstreamError: unknown = null;

  for (const line of lines) {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }

    const code =
      typeof data.code === 'number'
        ? data.code
        : typeof data.code === 'string'
          ? Number(data.code)
          : 0;

    if (code === 0 && typeof data.data === 'string' && data.data.length > 0) {
      audioChunks.push(Buffer.from(data.data, 'base64'));
      continue;
    }

    const sentence =
      data.sentence && typeof data.sentence === 'object'
        ? (data.sentence as { words?: unknown })
        : null;
    if (code === 0 && Array.isArray(sentence?.words)) {
      for (const word of sentence.words) {
        if (!word || typeof word !== 'object') {
          continue;
        }

        const normalizedWord = word as Record<string, unknown>;
        const timestamp: WordTimestamp = {
          word: typeof normalizedWord.word === 'string' ? normalizedWord.word : '',
          startTime:
            typeof normalizedWord.startTime === 'number' ? normalizedWord.startTime : 0,
          endTime: typeof normalizedWord.endTime === 'number' ? normalizedWord.endTime : 0,
          confidence:
            typeof normalizedWord.confidence === 'number' ? normalizedWord.confidence : 1,
        };
        timestamps.push(timestamp);
        duration = Math.max(duration, timestamp.endTime);
      }
      continue;
    }

    if (code === 20000000) {
      break;
    }

    if (code > 0) {
      upstreamError = data;
      break;
    }
  }

  if (audioChunks.length === 0) {
    if (upstreamError !== null) {
      throw new Error(
        `No audio data received. Upstream error: ${JSON.stringify(upstreamError)}`
      );
    }

    throw new Error(`No audio data received. Raw response: ${trimmedPayload.slice(0, 500)}`);
  }

  return {
    audio: Buffer.concat(audioChunks),
    duration,
    timestamps,
  };
};

export class VolcEngineTTSClient {
  private config: TTSConfig;

  constructor(config: TTSConfig) {
    this.config = {
      sampleRate: 24000,
      format: 'mp3',
      ...config,
    };
  }

  async synthesize(
    text: string,
    voiceId?: string,
    speechRate?: number
  ): Promise<SynthesisResult & { timestamps?: WordTimestamp[] }> {
    const normalizedText = text.trim();
    if (!normalizedText) {
      throw new Error('Cannot synthesize empty text.');
    }

    if (!/[\u4e00-\u9fa5a-zA-Z0-9]/.test(normalizedText)) {
      throw new Error('Cannot synthesize text without letters or numbers.');
    }

    const outputPath = join(process.cwd(), 'audio-cache', `volc-${Date.now()}.mp3`);
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const speaker = voiceId || this.config.voiceId || 'zh_female_shuangkuaisisi_moon_bigtts';
    const rate = speechRate ?? this.config.speechRate ?? 1.0;

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
          enable_timestamp: true,
        },
      },
    };

    try {
      return await this.callVolcEngineApi(requestData, outputPath);
    } catch (error) {
      throw new Error(
        `VolcEngine TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async callVolcEngineApi(
    requestData: VolcEngineTTSRequest,
    outputPath: string
  ): Promise<SynthesisResult & { timestamps?: WordTimestamp[] }> {
    const appId = this.config.appId;
    const accessKey = this.config.apiKey || this.config.accessKey;
    const resourceId = this.config.resourceId || 'seed-tts-1.0';

    if (!appId || !accessKey) {
      throw new Error('VOLCENGINE_APP_ID and VOLCENGINE_ACCESS_KEY are required');
    }

    const controller = new AbortController();
    const timeoutMs = Number(process.env.VOLCENGINE_TTS_TIMEOUT_MS || 60_000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const textPreview = requestData.req_params.text.slice(0, 30).replace(/\s+/g, ' ');
    console.error(`[tts] synthesize start (${requestData.req_params.text.length} chars): ${textPreview}...`);
    const t0 = Date.now();

    let response: Response;
    try {
      response = await fetch(VOLCENGINE_TTS_URL, {
        method: 'POST',
        headers: {
          'X-Api-App-Id': appId,
          'X-Api-Access-Key': accessKey,
          'X-Api-Resource-Id': resourceId,
          'Content-Type': 'application/json',
          Connection: 'keep-alive',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `VolcEngine TTS timed out after ${timeoutMs}ms on text: "${textPreview}..."`
        );
      }
      throw error;
    }
    clearTimeout(timeout);
    console.error(`[tts] synthesize response received in ${Date.now() - t0}ms`);

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} - ${responseText.slice(0, 500)}`
      );
    }

    const result = parseVolcEngineStreamResponse(responseText);
    const { writeFileSync } = await import('fs');
    writeFileSync(outputPath, result.audio);
    writeFileSync(
      outputPath.replace('.mp3', '_timestamps.json'),
      JSON.stringify(
        {
          timestamps: result.timestamps,
          duration: result.duration,
        },
        null,
        2
      ),
      'utf-8'
    );

    return {
      audioPath: outputPath,
      duration: result.duration,
      timestamps: result.timestamps,
      fromCache: false,
    };
  }

  async synthesizeToFile(
    text: string,
    outputPath: string,
    voiceId?: string,
    speechRate?: number
  ): Promise<string> {
    const result = await this.synthesize(text, voiceId, speechRate);

    if (result.audioPath !== outputPath) {
      const { copyFileSync } = await import('fs');
      copyFileSync(result.audioPath, outputPath);
    }

    return outputPath;
  }
}

export function calculateDurationFromTimestamps(timestamps: WordTimestamp[]): number {
  if (!timestamps || timestamps.length === 0) {
    return 0;
  }
  const lastWord = timestamps[timestamps.length - 1];
  return lastWord.endTime;
}

export function findCueInTimestamps(
  cue: string,
  timestamps: WordTimestamp[]
): { start: number; end: number } | null {
  if (!cue || !timestamps || timestamps.length === 0) {
    return null;
  }

  const cueChars = cue.split('').filter((c) => /[\u4e00-\u9fa5a-zA-Z0-9]/.test(c));

  if (cueChars.length === 0) {
    return null;
  }

  for (let i = 0; i <= timestamps.length - cueChars.length; i += 1) {
    const window = timestamps.slice(i, i + cueChars.length);
    const windowText = window.map((t) => t.word).join('');

    if (windowText.includes(cue) || cue.includes(windowText)) {
      return {
        start: window[0].startTime,
        end: window[window.length - 1].endTime,
      };
    }
  }

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
