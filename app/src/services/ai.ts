import { Slide } from '../stores/project';

// 动态导入 Tauri API，避免在非 Tauri 环境中报错
async function invokeTauri<T>(cmd: string, args: Record<string, unknown>): Promise<T> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(cmd, args);
  } catch {
    console.warn('Tauri API not available');
    throw new Error('Tauri API not available');
  }
}

const AI_PROMPT = `你是一个短视频内容策划专家。请将以下口播文案拆分为 4-8 张幻灯片。

要求：
1. 每张幻灯片包含：title(标题, 4-10字)、subtitle(副标题, 8-15字)、points(要点, 3-5条, 每条8-20字)、narration(旁白, 对应原文片段)
2. 标题要吸引眼球，适合抖音/视频号风格
3. 要点用简洁的语言概括核心信息
4. 旁白从原文中提取，保持口语化，每条旁白要完整表达一个意思

文案：
"""
{input_text}
"""

请以 JSON 格式输出，不要包含其他内容：
{
  "slides": [
    {
      "title": "...",
      "subtitle": "...",
      "points": ["...", "..."],
      "narration": "..."
    }
  ]
}`;

export async function generateSlides(text: string): Promise<Omit<Slide, 'id'>[]> {
  try {
    // 调用 Tauri 后端命令
    const result = await invokeTauri<string>('generate_slides', {
      content: text,
      prompt: AI_PROMPT.replace('{input_text}', text),
    });

    const data = JSON.parse(result);

    if (data.slides && Array.isArray(data.slides)) {
      return data.slides;
    }

    throw new Error('AI 返回格式错误');
  } catch (error) {
    // 如果 Tauri 命令不可用，使用模拟数据
    console.warn('Tauri command not available, using mock data:', error);
    return generateMockSlides(text);
  }
}

// 模拟数据（开发时使用）
function generateMockSlides(text: string): Omit<Slide, 'id'>[] {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  return paragraphs.slice(0, 5).map((p, i) => ({
    title: `幻灯片 ${i + 1}`,
    subtitle: '请编辑此处',
    points: ['要点 1', '要点 2', '要点 3'],
    narration: p.slice(0, 100),
  }));
}