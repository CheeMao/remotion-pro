import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { EmbeddedPreview, PreviewProjectData } from './remotion-preview/EmbeddedPreview';

type SimpleSlide = {
  id: string;
  title: string;
  subtitle: string;
  points: string[];
  narration: string;
  durationInFrames?: number;
  audioDuration?: number;
};

type ComplexSlide = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  narration?: string;
  durationInFrames?: number;
  audioDuration?: number;
};

type Slide = SimpleSlide | ComplexSlide;

type Project = {
  id: string;
  rawText: string;
  slides: Slide[];
  template: string;
  contentPath: string;
};

type SettingsData = {
  voiceId: string;
  voiceModel: string;
  voiceApiKey: string;
  voiceSpeechRate: number;
  aiUrl: string;
  aiApiKey: string;
  aiModel: string;
};

type NarrationInfo = {
  audioPath: string;
  duration: number;
};

type PreviewProjectResponse = {
  template: string;
  slides: Array<Record<string, unknown>>;
  soundtrackFile?: string;
  soundtrackDataUrl?: string;
  soundtrackDuration?: number;
};

const FPS = 30;
const MIN_SLIDE_DURATION_FRAMES = 45;
const MAX_SLIDE_DURATION_SECONDS = 8;

const STORAGE_KEYS = {
  project: 'videomaker-project',
  settings: 'videomaker-settings',
} as const;

const COMPACT_UI = {
  navWidth: 180,
  sidePanelWidth: 240,
  previewWidth: 440,
  pagePadding: 16,
  panelPadding: 12,
  sectionGap: 16,
};

const TEMPLATE_OPTIONS = [
  { label: '科技风', value: 'SlideShow' },
  { label: '玻璃风', value: 'GlassShow' },
  { label: '新拟态', value: 'NeuShow' },
  { label: '富效果', value: 'RichShow' },
  { label: '科技信息流', value: 'TechShow' },
  { label: 'AI 风格', value: 'AIShow' },
  { label: '霓虹风', value: 'NeonShow' },
  { label: '奢华风', value: 'LuxeShow' },
  { label: '液态玻璃', value: 'LiquidShow' },
  { label: '液态玻璃 2', value: 'LiquidShow-1' },
  { label: '磨砂玻璃', value: 'FrostedShow' },
] as const;

const DEFAULT_SETTINGS: SettingsData = {
  voiceId: '',
  voiceModel: 'cosyvoice-v2',
  voiceApiKey: '',
  voiceSpeechRate: 1,
  aiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  aiApiKey: '',
  aiModel: 'qwen-plus',
};

const SIMPLE_PROMPT = `你是短视频分镜策划助手。请根据完整口播文案、真实音频时长和模板风格，输出最终分页结果。

要求：
1. 根据总时长和内容密度动态决定总页数。
2. 单页目标时长 4-6.5 秒，任何页面不要超过 8 秒。
3. 每页输出 title、subtitle、points、narration。
4. narration 必须连续覆盖原文，不能跳段、不能重复大段内容。
5. 页面内容适合知识干货类短视频，表达清晰、重点明确。

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整

文案：
"""
{input_text}
"""

只输出 JSON：
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

const RICH_PROMPT = `你是短视频分镜策划助手。请根据完整口播文案、真实音频时长和 RichShow 模板风格，输出多版式分镜。

要求：
1. 第一页必须是 title，最后一页必须是 cta。
2. 中间页面可以使用：list、compare、quote、highlight、progress、stats。
3. 单页目标时长 4-6.5 秒，任何页面不要超过 8 秒。
4. narration 必须连续覆盖原文，不能跳段、不能重复大段内容。
5. 每页版式要和内容类型匹配。

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整

文案：
"""
{input_text}
"""

只输出 JSON：
{
  "slides": [
    { "type": "title", "data": { "title": "...", "subtitle": "..." }, "narration": "..." },
    { "type": "list", "data": { "title": "...", "items": [{ "icon": "•", "text": "..." }] }, "narration": "..." }
  ]
}`;

const TECH_PROMPT = `你是短视频分镜策划助手。请根据完整口播文案、真实音频时长和 TechShow 模板风格，输出科技信息流分镜。

要求：
1. 第一页必须是 title，最后一页必须是 cta。
2. 中间页面可以使用：list、stats、progress、compare、quote。
3. 单页目标时长 4-6.5 秒，任何页面不要超过 8 秒。
4. narration 必须连续覆盖原文，不能跳段、不能重复大段内容。
5. 列表项可使用 "01"、"02"、"03" 这类编号。

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整

文案：
"""
{input_text}
"""

只输出 JSON：
{
  "slides": [
    { "type": "title", "data": { "title": "...", "subtitle": "..." }, "narration": "..." }
  ]
}`;

function isComplexTemplate(template: string): boolean {
  return template === 'RichShow' || template === 'TechShow';
}

function isComplexSlide(slide: Slide): slide is ComplexSlide {
  return 'type' in slide && 'data' in slide;
}

function getProjectContentPath(template: string): string {
  return `public/projects/${template}/content.json`;
}

function normalizeSpeechRate(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0.5 || parsed > 2) {
    return 1;
  }
  return parsed;
}

function loadSettings(): SettingsData {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SettingsData>;
    return {
      voiceId: parsed.voiceId || '',
      voiceModel: parsed.voiceModel || DEFAULT_SETTINGS.voiceModel,
      voiceApiKey: parsed.voiceApiKey || '',
      voiceSpeechRate: normalizeSpeechRate(parsed.voiceSpeechRate),
      aiUrl: parsed.aiUrl || DEFAULT_SETTINGS.aiUrl,
      aiApiKey: parsed.aiApiKey || '',
      aiModel: parsed.aiModel || DEFAULT_SETTINGS.aiModel,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: SettingsData) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function loadProject(): Project | null {
  const raw = localStorage.getItem(STORAGE_KEYS.project);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Project;
    return {
      ...parsed,
      contentPath: parsed.contentPath || getProjectContentPath(parsed.template),
    };
  } catch {
    return null;
  }
}

function saveProject(project: Project | null) {
  if (!project) {
    localStorage.removeItem(STORAGE_KEYS.project);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.project, JSON.stringify(project));
}

function getPagePlan(durationSeconds: number, template: string) {
  const complex = isComplexTemplate(template);
  const targetSecondsPerPage = complex ? 6.2 : 5.4;
  const minPages = Math.max(
    complex ? 5 : 4,
    Math.ceil(durationSeconds / 7),
    Math.ceil(durationSeconds / MAX_SLIDE_DURATION_SECONDS)
  );
  const maxPages = complex ? 20 : 24;
  const targetPages = Math.max(
    minPages,
    Math.min(maxPages, Math.ceil(durationSeconds / targetSecondsPerPage))
  );

  return {
    minPages,
    maxPages,
    targetPages,
  };
}

function getSlideWeight(slide: Record<string, unknown>): number {
  const parts: string[] = [];

  if (typeof slide.narration === 'string') {
    parts.push(slide.narration);
  }
  if (typeof slide.title === 'string') {
    parts.push(slide.title);
  }
  if (Array.isArray(slide.points)) {
    parts.push(...slide.points.filter((item): item is string => typeof item === 'string'));
  }
  if (slide.data && typeof slide.data === 'object') {
    parts.push(JSON.stringify(slide.data));
  }

  return Math.max(1, parts.join(' ').replace(/\s+/g, '').length);
}

function allocateEstimatedFrames(
  slides: Array<Record<string, unknown>>,
  totalFrames: number
): number[] {
  const minTotalFrames = slides.length * MIN_SLIDE_DURATION_FRAMES;
  const weights = slides.map(getSlideWeight);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || slides.length;

  const rawFrames =
    totalFrames <= minTotalFrames
      ? weights.map((weight) => (weight / weightSum) * totalFrames)
      : weights.map(
          (weight) =>
            MIN_SLIDE_DURATION_FRAMES +
            (weight / weightSum) * (totalFrames - minTotalFrames)
        );

  const baseFrames = rawFrames.map((value) =>
    totalFrames <= minTotalFrames ? Math.max(1, Math.floor(value)) : Math.floor(value)
  );

  let assignedFrames = baseFrames.reduce((sum, value) => sum + value, 0);
  const remainders = rawFrames
    .map((value, index) => ({ index, remainder: value - baseFrames[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  let cursor = 0;
  while (assignedFrames < totalFrames && remainders.length > 0) {
    baseFrames[remainders[cursor % remainders.length].index] += 1;
    assignedFrames += 1;
    cursor += 1;
  }

  return baseFrames;
}

function estimateSlideDurations(slides: Slide[], durationSeconds: number): number[] {
  const totalFrames = Math.max(1, Math.ceil(durationSeconds * FPS));
  return allocateEstimatedFrames(
    slides as Array<Record<string, unknown>>,
    totalFrames
  ).map((frames) => frames / FPS);
}

function getPrompt(template: string, durationSeconds: number, strict: boolean): string {
  const plan = getPagePlan(durationSeconds, template);
  const basePrompt = isComplexTemplate(template)
    ? template === 'RichShow'
      ? RICH_PROMPT
      : TECH_PROMPT
    : SIMPLE_PROMPT;

  const prompt = basePrompt
    .replaceAll('{template_name}', template)
    .replaceAll('{duration_seconds}', durationSeconds.toFixed(2))
    .replaceAll('{target_pages}', String(plan.targetPages))
    .replaceAll('{min_pages}', String(plan.minPages))
    .replaceAll('{max_pages}', String(plan.maxPages));

  if (!strict) {
    return prompt;
  }

  return `${prompt}

补充硬性要求：
- 本次输出至少 ${plan.targetPages} 页
- 任何页面时长都不要超过 ${MAX_SLIDE_DURATION_SECONDS} 秒
- 如果内容偏密，请优先拆成更多页`;
}

async function invokeTauri<T>(command: string, args: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

async function generateNarration(rawText: string, contentPath: string): Promise<NarrationInfo> {
  const settings = loadSettings();
  if (!settings.voiceId || !settings.voiceApiKey) {
    throw new Error('请先在设置中配置语音 ID 和 API Key');
  }

  const result = await invokeTauri<string>('generate_narration', {
    rawText,
    voiceId: settings.voiceId,
    apiKey: settings.voiceApiKey,
    speechRate: normalizeSpeechRate(settings.voiceSpeechRate),
    contentPath,
  });

  return JSON.parse(result) as NarrationInfo;
}

function normalizeSlides(
  rawSlides: Array<Record<string, unknown>>,
  template: string
): Slide[] {
  const complex = isComplexTemplate(template);

  return rawSlides.map((item, index) => {
    if (complex) {
      return {
        id: `slide-${index}`,
        type: typeof item.type === 'string' ? item.type : 'title',
        data:
          item.data && typeof item.data === 'object'
            ? (item.data as Record<string, unknown>)
            : {},
        narration: typeof item.narration === 'string' ? item.narration : '',
      };
    }

    return {
      id: `slide-${index}`,
      title: typeof item.title === 'string' ? item.title : `第 ${index + 1} 页`,
      subtitle: typeof item.subtitle === 'string' ? item.subtitle : '',
      points: Array.isArray(item.points)
        ? item.points.filter((point): point is string => typeof point === 'string')
        : [],
      narration: typeof item.narration === 'string' ? item.narration : '',
    };
  });
}

async function generateSlidesWithAi(
  rawText: string,
  template: string,
  durationSeconds: number
): Promise<Slide[]> {
  const settings = loadSettings();
  if (!settings.aiApiKey) {
    throw new Error('请先在设置中配置 AI API Key');
  }

  const requestSlides = async (strict: boolean): Promise<Slide[]> => {
    const result = await invokeTauri<string>('generate_slides', {
      apiUrl: settings.aiUrl,
      apiKey: settings.aiApiKey,
      model: settings.aiModel,
      prompt: getPrompt(template, durationSeconds, strict).replace('{input_text}', rawText),
    });
    const parsed = JSON.parse(result) as { slides?: Array<Record<string, unknown>> };

    if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
      throw new Error('AI 返回的 JSON 不包含 slides');
    }

    return normalizeSlides(parsed.slides, template);
  };

  const plan = getPagePlan(durationSeconds, template);
  const shouldRetry = (slides: Slide[]) => {
    const maxDuration = Math.max(...estimateSlideDurations(slides, durationSeconds));
    return slides.length < plan.targetPages || maxDuration > MAX_SLIDE_DURATION_SECONDS;
  };

  let slides = await requestSlides(false);
  if (shouldRetry(slides)) {
    slides = await requestSlides(true);
  }

  return slides;
}

async function saveSlidesToProject(project: Project) {
  const settings = loadSettings();
  const slides = project.slides.map((slide) => {
    if (isComplexSlide(slide)) {
      return {
        type: slide.type,
        data: slide.data,
        narration: slide.narration || '',
      };
    }

    return {
      title: slide.title,
      subtitle: slide.subtitle,
      points: slide.points,
      narration: slide.narration,
    };
  });

  await invokeTauri<string>('save_slides', {
    template: project.template,
    voiceId: settings.voiceId,
    rawText: project.rawText,
    slides,
    contentPath: project.contentPath,
  });
}

async function syncAudio(project: Project) {
  const settings = loadSettings();
  if (!settings.voiceId || !settings.voiceApiKey) {
    return;
  }

  try {
    await invokeTauri<string>('sync_timeline', {
      voiceId: settings.voiceId,
      contentPath: project.contentPath,
    });
  } catch {
    await invokeTauri<string>('generate_audio', {
      voiceId: settings.voiceId,
      apiKey: settings.voiceApiKey,
      speechRate: normalizeSpeechRate(settings.voiceSpeechRate),
      contentPath: project.contentPath,
    });
  }
}

function layoutStyle(active: boolean): React.CSSProperties {
  return {
    display: 'block',
    padding: '9px 12px',
    color: active ? '#165dff' : '#4e5969',
    textDecoration: 'none',
    borderRadius: 6,
    background: active ? '#e8f3ff' : 'transparent',
    marginBottom: 6,
    fontSize: 14,
  };
}

function HomePage(props: {
  project: Project | null;
  onProjectChange: (project: Project | null) => void;
}) {
  const navigate = useNavigate();
  const [text, setText] = React.useState(props.project?.rawText || '');
  const [template, setTemplate] = React.useState(props.project?.template || 'SlideShow');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState('');

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('请输入完整口播文案');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const contentPath = getProjectContentPath(template);
      setStatus('正在生成整段旁白...');
      const narration = await generateNarration(text, contentPath);

      setStatus('正在规划最终分页...');
      const slides = await generateSlidesWithAi(text, template, narration.duration);

      const project: Project = {
        id: `${Date.now()}`,
        rawText: text,
        slides,
        template,
        contentPath,
      };

      setStatus('正在保存项目...');
      await saveSlidesToProject(project);
      await syncAudio(project);

      props.onProjectChange(project);
      navigate('/editor');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div style={{ padding: COMPACT_UI.pagePadding, maxWidth: 920 }}>
      <h2 style={{ marginTop: 0, marginBottom: 12, color: '#1d2129' }}>生成项目</h2>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 6px 20px rgba(15,23,42,0.06)' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#1d2129' }}>
            口播文案
          </label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={14}
            style={{
              width: '100%',
              resize: 'vertical',
              boxSizing: 'border-box',
              padding: 12,
              border: '1px solid #d9dde7',
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <label style={{ fontWeight: 600, color: '#1d2129' }}>模板</label>
          <select
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
            style={{ minWidth: 220, padding: '9px 10px', borderRadius: 8, border: '1px solid #d9dde7' }}
          >
            {TEMPLATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            background: loading ? '#94b8ff' : '#165dff',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {loading ? '生成中...' : '开始生成'}
        </button>

        {status ? <p style={{ marginBottom: 0, color: '#4e5969' }}>{status}</p> : null}
        {error ? <p style={{ marginBottom: 0, color: '#f53f3f' }}>{error}</p> : null}
      </div>
    </div>
  );
}

function EditorPage(props: {
  project: Project | null;
  onProjectChange: (project: Project | null) => void;
}) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<PreviewProjectData | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [rendering, setRendering] = React.useState(false);
  const [renderProgress, setRenderProgress] = React.useState('');

  const project = props.project;

  React.useEffect(() => {
    setActiveIndex(0);
  }, [project?.id]);

  if (!project) {
    return (
      <div style={{ padding: COMPACT_UI.pagePadding }}>
        <p style={{ color: '#4e5969' }}>当前还没有项目，请先生成。</p>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '10px 14px', border: 'none', borderRadius: 8, background: '#165dff', color: '#fff', cursor: 'pointer' }}
        >
          返回首页
        </button>
      </div>
    );
  }

  const complex = isComplexTemplate(project.template);
  const safeIndex = Math.min(activeIndex, Math.max(0, project.slides.length - 1));
  const slide = project.slides[safeIndex];

  const updateProject = (updater: (current: Project) => Project) => {
    const next = updater(project);
    props.onProjectChange(next);
  };

  const updateSlide = (index: number, updater: (current: Slide) => Slide) => {
    updateProject((current) => ({
      ...current,
      slides: current.slides.map((item, itemIndex) =>
        itemIndex === index ? updater(item) : item
      ),
    }));
  };

  const saveCurrentProject = async () => {
    await saveSlidesToProject(project);
  };

  const handleAddSlide = () => {
    const nextSlide: Slide = complex
      ? {
          id: `slide-${Date.now()}`,
          type: 'title',
          data: { title: '新页面', subtitle: '' },
          narration: '',
        }
      : {
          id: `slide-${Date.now()}`,
          title: '新页面',
          subtitle: '',
          points: ['要点 1'],
          narration: '',
        };

    updateProject((current) => ({
      ...current,
      slides: [...current.slides, nextSlide],
    }));
    setActiveIndex(project.slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (project.slides.length <= 1) {
      return;
    }

    updateProject((current) => ({
      ...current,
      slides: current.slides.filter((_, itemIndex) => itemIndex !== index),
    }));

    if (safeIndex >= project.slides.length - 1) {
      setActiveIndex(project.slides.length - 2);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setShowPreview(true);
    setPreviewData(null);

    try {
      await saveCurrentProject();
      await syncAudio(project);

      const { convertFileSrc } = await import('@tauri-apps/api/core');
      const result = await invokeTauri<string>('load_preview_project', {
        contentPath: project.contentPath,
      });
      const preview = JSON.parse(result) as PreviewProjectResponse;

      setPreviewData({
        template: preview.template || project.template,
        slides: preview.slides || [],
        soundtrackUrl: preview.soundtrackDataUrl || (preview.soundtrackFile
          ? convertFileSrc(preview.soundtrackFile)
          : undefined),
      });
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : String(cause));
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRender = async () => {
    setRendering(true);
    setRenderProgress('正在保存项目...');

    try {
      await saveCurrentProject();
      setRenderProgress('正在同步音频...');
      await syncAudio(project);

      setRenderProgress('正在渲染视频...');
      const result = await invokeTauri<string>('render_video', {
        template: project.template,
        contentPath: project.contentPath,
      });
      setRenderProgress(`渲染完成: ${result}`);
    } catch (cause) {
      setRenderProgress('');
      alert(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRendering(false);
    }
  };

  const panelTitle = isComplexSlide(slide)
    ? String((slide.data.title || slide.data.quote || slide.type) ?? `第 ${safeIndex + 1} 页`)
    : slide.title || `第 ${safeIndex + 1} 页`;

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: COMPACT_UI.sidePanelWidth, background: '#fff', borderRight: '1px solid #e5e6eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: COMPACT_UI.panelPadding, borderBottom: '1px solid #e5e6eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>页面 ({project.slides.length})</span>
          <button onClick={handleAddSlide} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#165dff', color: '#fff', cursor: 'pointer' }}>
            + 新增
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {project.slides.map((item, index) => {
            const title = isComplexSlide(item)
              ? String((item.data.title || item.data.quote || item.type) ?? `第 ${index + 1} 页`)
              : item.title || `第 ${index + 1} 页`;

            return (
              <div
                key={item.id}
                onClick={() => setActiveIndex(index)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: safeIndex === index ? '#e8f3ff' : 'transparent',
                  borderLeft: safeIndex === index ? '3px solid #165dff' : '3px solid transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 13, color: '#1d2129' }}>{title}</span>
                {project.slides.length > 1 ? (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteSlide(index);
                    }}
                    style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #f53f3f', color: '#f53f3f', background: 'transparent', cursor: 'pointer' }}
                  >
                    删除
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ padding: COMPACT_UI.panelPadding, borderTop: '1px solid #e5e6eb' }}>
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            style={{ width: '100%', padding: '10px', marginBottom: 8, border: 'none', borderRadius: 8, background: previewLoading ? '#94b8ff' : '#00b42a', color: '#fff', cursor: previewLoading ? 'not-allowed' : 'pointer' }}
          >
            {previewLoading ? '准备中...' : '应用内预览'}
          </button>
          <button
            onClick={handleRender}
            disabled={rendering}
            style={{ width: '100%', padding: '10px', border: 'none', borderRadius: 8, background: rendering ? '#94b8ff' : '#165dff', color: '#fff', cursor: rendering ? 'not-allowed' : 'pointer' }}
          >
            {rendering ? '导出中...' : '导出视频'}
          </button>
          {renderProgress ? <p style={{ fontSize: 12, color: '#86909c' }}>{renderProgress}</p> : null}
        </div>
      </div>

      <div style={{ flex: 1, padding: COMPACT_UI.pagePadding, overflow: 'auto', borderRight: showPreview ? '1px solid #e5e6eb' : 'none' }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ marginBottom: COMPACT_UI.sectionGap, padding: 12, background: '#e8f3ff', borderRadius: 8 }}>
            <span style={{ color: '#4e5969' }}>当前模板:</span>
            <span style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 6, background: '#fff', border: '1px solid #165dff', color: '#165dff' }}>
              {project.template}
            </span>
            <span style={{ marginLeft: 12, fontSize: 12, color: '#86909c' }}>
              当前项目已锁定模板，不支持跨模板切换
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 6, color: '#1d2129' }}>{panelTitle}</h3>
            <p style={{ marginTop: 0, color: '#86909c' }}>第 {safeIndex + 1} 页 / 共 {project.slides.length} 页</p>
          </div>

          {isComplexSlide(slide) ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>版式类型</label>
                <select
                  value={slide.type}
                  onChange={(event) => {
                    const nextType = event.target.value;
                    updateSlide(safeIndex, (current) => ({
                      ...(current as ComplexSlide),
                      type: nextType,
                    }));
                  }}
                  onBlur={() => {
                    void saveCurrentProject();
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #d9dde7' }}
                >
                  {['title', 'list', 'compare', 'quote', 'highlight', 'progress', 'stats', 'cta'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>内容 JSON</label>
                <textarea
                  value={JSON.stringify(slide.data, null, 2)}
                  onChange={(event) => {
                    try {
                      const parsed = JSON.parse(event.target.value) as Record<string, unknown>;
                      updateSlide(safeIndex, (current) => ({
                        ...(current as ComplexSlide),
                        data: parsed,
                      }));
                    } catch {
                      return;
                    }
                  }}
                  onBlur={() => {
                    void saveCurrentProject();
                  }}
                  rows={14}
                  style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 8, border: '1px solid #d9dde7', fontFamily: 'monospace', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>旁白</label>
                <textarea
                  value={slide.narration || ''}
                  onChange={(event) => {
                    updateSlide(safeIndex, (current) => ({
                      ...(current as ComplexSlide),
                      narration: event.target.value,
                    }));
                  }}
                  onBlur={() => {
                    void saveCurrentProject();
                  }}
                  rows={5}
                  style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 8, border: '1px solid #d9dde7', fontSize: 14 }}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>标题</label>
                <input
                  value={slide.title}
                  onChange={(event) => {
                    updateSlide(safeIndex, (current) => ({
                      ...(current as SimpleSlide),
                      title: event.target.value,
                    }));
                  }}
                  onBlur={() => {
                    void saveCurrentProject();
                  }}
                  style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>副标题</label>
                <input
                  value={slide.subtitle}
                  onChange={(event) => {
                    updateSlide(safeIndex, (current) => ({
                      ...(current as SimpleSlide),
                      subtitle: event.target.value,
                    }));
                  }}
                  onBlur={() => {
                    void saveCurrentProject();
                  }}
                  style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>要点</label>
                {slide.points.map((point, pointIndex) => (
                  <div key={`${slide.id}-${pointIndex}`} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      value={point}
                      onChange={(event) => {
                        const nextPoints = slide.points.map((item, itemIndex) =>
                          itemIndex === pointIndex ? event.target.value : item
                        );
                        updateSlide(safeIndex, (current) => ({
                          ...(current as SimpleSlide),
                          points: nextPoints,
                        }));
                      }}
                      onBlur={() => {
                        void saveCurrentProject();
                      }}
                      style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
                    />
                    <button
                      onClick={() => {
                        const nextPoints = slide.points.filter((_, itemIndex) => itemIndex !== pointIndex);
                        updateSlide(safeIndex, (current) => ({
                          ...(current as SimpleSlide),
                          points: nextPoints,
                        }));
                      }}
                      style={{ padding: '0 12px', borderRadius: 8, border: '1px solid #f53f3f', background: 'transparent', color: '#f53f3f', cursor: 'pointer' }}
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    updateSlide(safeIndex, (current) => ({
                      ...(current as SimpleSlide),
                      points: [...(current as SimpleSlide).points, '新要点'],
                    }));
                  }}
                  style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#f2f3f5', color: '#4e5969', cursor: 'pointer' }}
                >
                  + 添加要点
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>旁白</label>
                <textarea
                  value={slide.narration}
                  onChange={(event) => {
                    updateSlide(safeIndex, (current) => ({
                      ...(current as SimpleSlide),
                      narration: event.target.value,
                    }));
                  }}
                  onBlur={() => {
                    void saveCurrentProject();
                  }}
                  rows={5}
                  style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 8, border: '1px solid #d9dde7', fontSize: 14 }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {showPreview ? (
        <div style={{ width: COMPACT_UI.previewWidth, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 10, borderBottom: '1px solid #e5e6eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>预览</span>
            <button
              onClick={() => setShowPreview(false)}
              style={{ padding: '4px 10px', fontSize: 12, background: '#f2f3f5', color: '#4e5969', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              关闭
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            {previewLoading || !previewData ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#86909c' }}>
                正在准备预览...
              </div>
            ) : (
              <EmbeddedPreview previewData={previewData} />
            )}
          </div>

          <div style={{ padding: 8, borderTop: '1px solid #e5e6eb', fontSize: 12, color: '#86909c', textAlign: 'center' }}>
            当前模板: {project.template} | 预览在应用内直接播放
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = React.useState<SettingsData>(loadSettings());
  const [saved, setSaved] = React.useState(false);

  const updateField = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div style={{ padding: COMPACT_UI.pagePadding, maxWidth: 760 }}>
      <h2 style={{ marginTop: 0, marginBottom: 12, color: '#1d2129' }}>设置</h2>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 6px 20px rgba(15,23,42,0.06)' }}>
        <h3 style={{ marginTop: 0, color: '#1d2129' }}>配音</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>API Key</label>
          <input
            type="password"
            value={settings.voiceApiKey}
            onChange={(event) => updateField('voiceApiKey', event.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>模型</label>
          <input
            value={settings.voiceModel}
            onChange={(event) => updateField('voiceModel', event.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>语音 ID</label>
          <input
            value={settings.voiceId}
            onChange={(event) => updateField('voiceId', event.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>语速</label>
          <input
            type="number"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.voiceSpeechRate}
            onChange={(event) => updateField('voiceSpeechRate', normalizeSpeechRate(event.target.value))}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
          />
        </div>

        <h3 style={{ color: '#1d2129' }}>AI 生成</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>API Base URL</label>
          <input
            value={settings.aiUrl}
            onChange={(event) => updateField('aiUrl', event.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>API Key</label>
          <input
            type="password"
            value={settings.aiApiKey}
            onChange={(event) => updateField('aiApiKey', event.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>模型名</label>
          <input
            value={settings.aiModel}
            onChange={(event) => updateField('aiModel', event.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d9dde7' }}
          />
        </div>

        <button
          onClick={handleSave}
          style={{ padding: '10px 18px', border: 'none', borderRadius: 8, background: '#165dff', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
        >
          保存设置
        </button>
        {saved ? <span style={{ marginLeft: 12, color: '#00b42a' }}>已保存</span> : null}
      </div>
    </div>
  );
}

function Layout(props: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6f8' }}>
      <nav style={{ width: COMPACT_UI.navWidth, background: '#fff', padding: 12, borderRight: '1px solid #e5e6eb', boxSizing: 'border-box' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#165dff', marginBottom: 16 }}>
          AI 视频生成器
        </div>
        <a href="/" style={layoutStyle(location.pathname === '/')}>首页</a>
        <a href="/editor" style={layoutStyle(location.pathname === '/editor')}>编辑器</a>
        <a href="/settings" style={layoutStyle(location.pathname === '/settings')}>设置</a>
      </nav>
      <main style={{ flex: 1, overflow: 'auto' }}>{props.children}</main>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  public constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  public static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  public render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <h2>应用出错</h2>
          <pre>{this.state.error}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [project, setProject] = React.useState<Project | null>(() => loadProject());

  React.useEffect(() => {
    saveProject(project);
  }, [project]);

  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage project={project} onProjectChange={setProject} />} />
          <Route path="/editor" element={<EditorPage project={project} onProjectChange={setProject} />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}
