import React from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
  navWidth: 76,
  sidePanelWidth: 210,
  previewWidth: 360,
  pagePadding: 12,
  panelPadding: 10,
  sectionGap: 12,
};

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

function DockIcon(props: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 22,
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {props.children}
    </span>
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: '首页',
    icon: (
      <DockIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.25 9.75V21h13.5V9.75" />
          <path d="M9.75 21v-6h4.5v6" />
        </svg>
      </DockIcon>
    ),
  },
  {
    path: '/editor',
    label: '编辑器',
    icon: (
      <DockIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.25V20h.75L17.8 6.95l-1.75-1.75L3 18.25V19Z" />
          <path d="m14.95 6.25 1.75 1.75" />
          <path d="M7 20h10" />
        </svg>
      </DockIcon>
    ),
  },
  {
    path: '/settings',
    label: '设置',
    icon: (
      <DockIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.05.05a1.85 1.85 0 0 1 0 2.62 1.85 1.85 0 0 1-2.62 0l-.05-.05a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.85 1.85 0 0 1-3.7 0v-.07a1 1 0 0 0-.67-.95 1 1 0 0 0-1.03.22l-.05.05a1.85 1.85 0 0 1-2.62 0 1.85 1.85 0 0 1 0-2.62l.05-.05a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.85 1.85 0 0 1 0-3.7h.07a1 1 0 0 0 .95-.67 1 1 0 0 0-.22-1.03l-.05-.05a1.85 1.85 0 0 1 0-2.62 1.85 1.85 0 0 1 2.62 0l.05.05a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.85 1.85 0 0 1 3.7 0v.07a1 1 0 0 0 .67.95 1 1 0 0 0 1.03-.22l.05-.05a1.85 1.85 0 0 1 2.62 0 1.85 1.85 0 0 1 0 2.62l-.05.05a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1.85 1.85 0 0 1 0 3.7h-.07a1 1 0 0 0-.95.67 1 1 0 0 0 .22 1.03l.05.05Z" />
        </svg>
      </DockIcon>
    ),
  },
] as const;

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

function dockLinkStyle(active: boolean): React.CSSProperties {
  return {
    width: 52,
    height: 52,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? '#2563eb' : '#5f6b82',
    textDecoration: 'none',
    borderRadius: 18,
    background: active
      ? 'linear-gradient(180deg, rgba(232,239,255,0.98) 0%, rgba(219,229,255,0.94) 100%)'
      : 'transparent',
    border: active ? '1px solid rgba(167,191,255,0.56)' : '1px solid transparent',
    boxShadow: active
      ? '0 10px 24px rgba(74, 117, 214, 0.16), inset 0 1px 0 rgba(255,255,255,0.8)'
      : 'none',
    transition:
      'transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
  };
}

const SOFT_CARD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 24,
  padding: 18,
  border: '1px solid rgba(224, 231, 240, 0.92)',
  boxShadow: '0 18px 40px rgba(148, 163, 184, 0.14), inset 0 1px 0 rgba(255,255,255,0.92)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

const SOFT_INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: 11,
  borderRadius: 14,
  border: '1px solid #d9e1ee',
  background: 'rgba(255,255,255,0.96)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.86)',
  fontSize: 13,
};

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, #1f67ff 0%, #3c8cff 100%)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  boxShadow: '0 10px 22px rgba(53, 113, 231, 0.22)',
};

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
      <h2 style={{ marginTop: 0, marginBottom: 12, color: '#1d2129', fontSize: 24, letterSpacing: '-0.02em' }}>生成项目</h2>
      <div style={SOFT_CARD_STYLE}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#1d2129' }}>
            口播文案
          </label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={14}
            style={{
              resize: 'vertical',
              ...SOFT_INPUT_STYLE,
              fontSize: 14,
              lineHeight: 1.6,
              minHeight: 260,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <label style={{ fontWeight: 600, color: '#1d2129' }}>模板</label>
          <select
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
            style={{ ...SOFT_INPUT_STYLE, width: 220, minWidth: 180, padding: '10px 12px' }}
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
            ...PRIMARY_BUTTON_STYLE,
            background: loading ? '#94b8ff' : '#165dff',
            cursor: loading ? 'not-allowed' : 'pointer',
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
  const editorWorkspaceHeight = 'min(760px, calc(100vh - 88px))';
  const editorMainWidth = 560;
  const editorSingleWidth = 680;
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
    <div style={{ display: 'flex', height: editorWorkspaceHeight, gap: 12, padding: COMPACT_UI.pagePadding, width: 'fit-content', maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ width: COMPACT_UI.sidePanelWidth, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(224,231,240,0.92)', borderRadius: 22, boxShadow: '0 16px 36px rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #edf1f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>页面 ({project.slides.length})</span>
          <button onClick={handleAddSlide} style={{ ...PRIMARY_BUTTON_STYLE, padding: '6px 10px', borderRadius: 12, cursor: 'pointer', boxShadow: '0 8px 18px rgba(53, 113, 231, 0.16)' }}>
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
                  margin: '4px 6px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: safeIndex === index ? 'linear-gradient(180deg, rgba(232,239,255,0.98) 0%, rgba(219,229,255,0.9) 100%)' : 'transparent',
                  border: safeIndex === index ? '1px solid rgba(167,191,255,0.56)' : '1px solid transparent',
                  borderRadius: 14,
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
                    style={{ padding: '2px 6px', borderRadius: 10, border: '1px solid #f53f3f', color: '#f53f3f', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
                  >
                    删除
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid #edf1f7' }}>
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            style={{ ...PRIMARY_BUTTON_STYLE, width: '100%', marginBottom: 8, background: previewLoading ? '#94b8ff' : 'linear-gradient(135deg, #07b36d 0%, #19c37d 100%)', cursor: previewLoading ? 'not-allowed' : 'pointer' }}
          >
            {previewLoading ? '准备中...' : '应用内预览'}
          </button>
          <button
            onClick={handleRender}
            disabled={rendering}
            style={{ ...PRIMARY_BUTTON_STYLE, width: '100%', background: rendering ? '#94b8ff' : PRIMARY_BUTTON_STYLE.background, cursor: rendering ? 'not-allowed' : 'pointer' }}
          >
            {rendering ? '导出中...' : '导出视频'}
          </button>
          {renderProgress ? <p style={{ fontSize: 12, color: '#86909c' }}>{renderProgress}</p> : null}
        </div>
      </div>

      <div style={{ width: showPreview ? editorMainWidth : editorSingleWidth, overflow: 'auto', minWidth: 0 }}>
        <div style={{ ...SOFT_CARD_STYLE, maxWidth: 'none', minHeight: '100%' }}>
          <div style={{ marginBottom: COMPACT_UI.sectionGap, padding: 12, background: 'linear-gradient(180deg, rgba(232,243,255,0.96) 0%, rgba(224,236,255,0.92) 100%)', borderRadius: 14 }}>
            <span style={{ color: '#4e5969' }}>当前模板:</span>
            <span style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 999, background: '#fff', border: '1px solid #165dff', color: '#165dff', fontSize: 12 }}>
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
        <div style={{ width: COMPACT_UI.previewWidth, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(224,231,240,0.92)', borderRadius: 22, boxShadow: '0 16px 36px rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 10, borderBottom: '1px solid #edf1f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>预览</span>
            <button
              onClick={() => setShowPreview(false)}
              style={{ padding: '6px 12px', fontSize: 12, background: '#f3f6fb', color: '#4e5969', border: '1px solid #e1e8f2', borderRadius: 999, cursor: 'pointer' }}
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
      <h2 style={{ marginTop: 0, marginBottom: 12, color: '#1d2129', fontSize: 24, letterSpacing: '-0.02em' }}>设置</h2>

      <div style={SOFT_CARD_STYLE}>
        <h3 style={{ marginTop: 0, color: '#1d2129' }}>配音</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>API Key</label>
          <input
            type="password"
            value={settings.voiceApiKey}
            onChange={(event) => updateField('voiceApiKey', event.target.value)}
            style={SOFT_INPUT_STYLE}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>模型</label>
          <input
            value={settings.voiceModel}
            onChange={(event) => updateField('voiceModel', event.target.value)}
            style={SOFT_INPUT_STYLE}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>语音 ID</label>
          <input
            value={settings.voiceId}
            onChange={(event) => updateField('voiceId', event.target.value)}
            style={SOFT_INPUT_STYLE}
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
            style={SOFT_INPUT_STYLE}
          />
        </div>

        <h3 style={{ color: '#1d2129' }}>AI 生成</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>API Base URL</label>
          <input
            value={settings.aiUrl}
            onChange={(event) => updateField('aiUrl', event.target.value)}
            style={SOFT_INPUT_STYLE}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>API Key</label>
          <input
            type="password"
            value={settings.aiApiKey}
            onChange={(event) => updateField('aiApiKey', event.target.value)}
            style={SOFT_INPUT_STYLE}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>模型名</label>
          <input
            value={settings.aiModel}
            onChange={(event) => updateField('aiModel', event.target.value)}
            style={SOFT_INPUT_STYLE}
          />
        </div>

        <button
          onClick={handleSave}
          style={{ ...PRIMARY_BUTTON_STYLE, cursor: 'pointer' }}
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
    <div
      style={{
        display: 'flex',
        height: '100vh',
        padding: '12px 14px 12px 6px',
        gap: 14,
        background:
          'radial-gradient(circle at 16% 18%, rgba(214,228,255,0.94) 0%, rgba(214,228,255,0) 32%), radial-gradient(circle at 84% 12%, rgba(222,244,241,0.82) 0%, rgba(222,244,241,0) 26%), linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)',
      }}
    >
      <a
        href="#app-main"
        className="skip-link"
      >
        跳到主内容
      </a>
      <div
        style={{
          width: COMPACT_UI.navWidth,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <nav
          aria-label="主导航"
          className="dock-nav"
          style={{
            width: 60,
            padding: '10px 6px',
            borderRadius: 30,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.96) 100%)',
            border: '1px solid rgba(223, 230, 240, 0.95)',
            boxShadow:
              '0 30px 60px rgba(148, 163, 184, 0.24), inset 0 1px 0 rgba(255,255,255,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #1e63ff 0%, #16b6d6 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(45, 103, 218, 0.24)',
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M5 16c0-4.5 2.7-8 7.2-9.6l3.6-.9-.9 3.6C13.3 13.6 9.8 16.3 5.3 16.3H5V16Z" />
              <path d="M8 18c0-1.7.5-3 1.5-4" />
              <path d="M14 10 18 6" />
            </svg>
          </div>

          {NAV_ITEMS.map((item, index) => {
            const active = location.pathname === item.path;
            const isLast = index === NAV_ITEMS.length - 1;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="dock-nav__link"
                style={{
                  ...dockLinkStyle(active),
                  marginTop: isLast ? 8 : 0,
                }}
                aria-label={item.label}
                title={item.label}
              >
                <span style={{ display: 'inline-flex' }}>{item.icon}</span>
                <span className="dock-nav__tooltip" role="tooltip">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      <main
        id="app-main"
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          paddingRight: 4,
        }}
      >
        <div
          style={{
            minHeight: '100%',
            borderRadius: 28,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.64) 100%)',
            border: '1px solid rgba(255,255,255,0.82)',
            boxShadow: '0 24px 52px rgba(148, 163, 184, 0.14), inset 0 1px 0 rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}
        >
          {props.children}
        </div>
      </main>
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
