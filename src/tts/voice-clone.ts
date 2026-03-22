// 音色复刻 API 客户端
import { VoiceStatus, VoiceInfo } from './types';

const HTTP_BASE = 'https://dashscope.aliyuncs.com/api/v1';

export class VoiceCloneClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 创建音色
   * @param audioUrl 参考音频的公开 URL
   * @param prefix 音色前缀标识 (仅允许数字和小写字母，小于10个字符)
   * @returns voiceId
   */
  async createVoice(audioUrl: string, prefix: string): Promise<string> {
    const response = await fetch(`${HTTP_BASE}/voices/enrollments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'cosyvoice-v2',
        input: {
          ref_audio_url: audioUrl,
          prefix,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create voice: ${error}`);
    }

    const data = await response.json() as { output?: { voice_id?: string }; voice_id?: string };
    return data.output?.voice_id || data.voice_id || '';
  }

  /**
   * 查询音色状态
   */
  async queryVoice(voiceId: string): Promise<VoiceInfo> {
    const response = await fetch(`${HTTP_BASE}/voices/enrollments/${voiceId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to query voice: ${error}`);
    }

    const data = await response.json() as {
      output?: { status?: VoiceStatus; created_at?: string };
      status?: VoiceStatus;
      created_at?: string;
    };

    return {
      voiceId,
      status: data.output?.status || data.status || 'DEPLOYING',
      createdAt: data.output?.created_at || data.created_at,
    };
  }

  /**
   * 等待音色就绪
   */
  async waitForVoiceReady(
    voiceId: string,
    maxWaitMs = 300000,
    pollIntervalMs = 10000
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const info = await this.queryVoice(voiceId);

      if (info.status === 'OK') {
        return;
      }

      if (info.status === 'UNDEPLOYED') {
        throw new Error(`Voice clone failed for ${voiceId}`);
      }

      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Voice clone timeout for ${voiceId} (waited ${maxWaitMs / 1000}s)`);
  }

  /**
   * 删除音色
   */
  async deleteVoice(voiceId: string): Promise<void> {
    const response = await fetch(`${HTTP_BASE}/voices/enrollments/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete voice: ${error}`);
    }
  }
}