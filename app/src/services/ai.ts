import { Slide } from '../stores/project';
import { generateAIPrompt, normalizeAISlides } from '../../../src/templates/templateRegistry';
import { parseJsonWithRepair } from '@remotion-root/utils/json-repair';

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

export async function generateSlides(
  text: string,
  templateId: string = 'GlassShow'
): Promise<Omit<Slide, 'id'>[]> {
  try {
    // 根据模板生成对应的prompt
    const prompt = generateAIPrompt(templateId, text);

    // 调用 Tauri 后端命令
    const result = await invokeTauri<string>('generate_slides', {
      content: text,
      prompt,
      templateId,
    });

    const data = parseJsonWithRepair<{ slides?: Array<Record<string, unknown>> }>(
      result,
      'generate_slides'
    ).data;

    if (data.slides && Array.isArray(data.slides)) {
      // 规范化slides（新格式 -> 旧格式）
      const normalizedSlides = normalizeAISlides(data.slides);
      return normalizedSlides.map((slide) => ({
        title: slide.title || '',
        subtitle: slide.subtitle,
        // 将新格式的字段也包含进来
        layout: slide.layout || slide.type,
        points: slide.points,
        stats: slide.stats,
        compare: slide.compare,
        steps: slide.steps,
        items: slide.items,
        chart: slide.chart,
        timeline: slide.timeline,
        highlights: slide.highlights,
        quote: slide.quote,
        author: slide.author,
        badge: slide.badge,
        cta: slide.cta,
        narration: slide.narration,
      })) as Omit<Slide, 'id'>[];
    }

    throw new Error('AI 返回格式错误');
  } catch (error) {
    // 如果 Tauri 命令不可用，使用模拟数据
    console.warn('Tauri command not available, using mock data:', error);
    return generateMockSlides(text, templateId);
  }
}

// 模拟数据（开发时使用）
function generateMockSlides(text: string, _templateId: string): Omit<Slide, 'id'>[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

  return paragraphs.slice(0, 5).map((p, i) => ({
    title: `幻灯片 ${i + 1}`,
    subtitle: '请编辑此处',
    points: ['要点 1', '要点 2', '要点 3'],
    narration: p.slice(0, 100),
  }));
}
