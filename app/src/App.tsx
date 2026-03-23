import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// ========== 类型定义 ==========

// 简单模板的幻灯片数据
interface SimpleSlide {
  id: string;
  title: string;
  subtitle: string;
  points: string[];
  narration: string;
}

// 复杂模板的幻灯片数据（RichShow, TechShow）
interface ComplexSlide {
  id: string;
  type: string;
  data: Record<string, any>;
  narration?: string;
}

// 统一的 Slide 类型
type Slide = SimpleSlide & { type?: never; data?: never } | ComplexSlide & { title?: never; subtitle?: never; points?: never };

interface Project {
  id: string;
  rawText: string;
  slides: Slide[];
  template: string;
  contentPath: string;
}

interface NarrationInfo {
  audioPath: string;
  duration: number;
}

interface RemotionStartupResult {
  port: number;
  wasRunning: boolean;
  message: string;
}

const REMOTION_PREVIEW_URL = 'http://localhost:32123';

function normalizeSpeechRate(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0.5 || parsed > 2.0) {
    return 1;
  }
  return parsed;
}

const FPS = 30;
const MIN_SLIDE_DURATION_FRAMES = 45;
const MAX_SLIDE_DURATION_SECONDS = 8;
const COMPACT_UI = {
  navWidth: 176,
  sidePanelWidth: 220,
  previewWidth: 420,
  pagePadding: 16,
  cardPadding: 18,
  panelPadding: 12,
  sectionGap: 16,
  inputPadding: '9px 10px',
  buttonPadding: '10px 20px',
};

function getProjectContentPath(template: string): string {
  return `public/projects/${template}/content.json`;
}

function normalizeProject(project: Project | null): Project | null {
  if (!project) {
    return null;
  }

  return {
    ...project,
    contentPath: project.contentPath || getProjectContentPath(project.template),
  };
}

// ========== 持久化存储辅助函数 ==========
function saveProjectToStorage(project: Project | null) {
  if (project) {
    localStorage.setItem('videomaker-project', JSON.stringify(project));
  } else {
    localStorage.removeItem('videomaker-project');
  }
}

function loadProjectFromStorage(): Project | null {
  const saved = localStorage.getItem('videomaker-project');
  if (saved) {
    try {
      return normalizeProject(JSON.parse(saved) as Project);
    } catch {
      return null;
    }
  }
  return null;
}

// ========== 全局状态 ==========
const projectState: { project: Project | null; listeners: Set<() => void> } = {
  project: loadProjectFromStorage(), // 初始化时从 localStorage 加载
  listeners: new Set(),
};

function setProject(project: Project | null) {
  const normalized = normalizeProject(project);
  projectState.project = normalized;
  saveProjectToStorage(normalized);
  projectState.listeners.forEach(fn => fn());
}

function useProject() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    projectState.listeners.add(forceUpdate);
    return () => { projectState.listeners.delete(forceUpdate); };
  }, []);
  // 强制同步获取最新状态
  return projectState.project;
}

// ========== 错误边界 ==========
// 强制刷新
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: 'red', background: '#fff' }}>
          <h2>出错了：</h2>
          <pre>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ========== AI 提示词模板 ==========

// 简单模板提示词（SlideShow, GlassShow, NeuShow, AIShow, NeonShow, LuxeShow, LiquidShow, FrostedShow）
const SIMPLE_PROMPT = `你是一个短视频分镜策划专家。请根据完整口播文案、真实旁白时长和模板风格，为视频规划最终页面。

输入信息：
- 模板风格：{template_name}
- 旁白总时长：{duration_seconds} 秒
- 建议总页数：{target_pages} 页（可在 {min_pages}-{max_pages} 页之间调整）

任务目标：
1. 根据文案密度与总时长，先判断总页数，不要机械固定页数。
2. 再为每一页安排一个清晰的核心表达，保证整条口播从头到尾都被覆盖。
3. 每页输出：title、subtitle、points、narration。
4. narration 必须按口播顺序连续切分，不能跳段、不能遗漏、不能重复大段内容。
5. 如果旁白较长，必须明显增加页数，避免单页停留过久。
6. 每页信息密度适中，适合短视频节奏。
7. 任何一页的旁白时长都不要超过 8 秒，宁可增加页数，也不要让单页过长。

文案：
"""
{input_text}
"""

请只输出 JSON：
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

const RICH_PROMPT = `你是一个短视频分镜策划专家。请根据完整口播文案、真实旁白时长和 RichShow 模板风格，规划一组多版式页面。

输入信息：
- 模板风格：{template_name}
- 旁白总时长：{duration_seconds} 秒
- 建议总页数：{target_pages} 页（可在 {min_pages}-{max_pages} 页之间调整）

可用幻灯片类型：
1. title - 标题页：{ type: "title", data: { title, subtitle } }
2. list - 列表页：{ type: "list", data: { title, items: [{ icon: "emoji", text: "要点" }] } }
3. compare - 对比页：{ type: "compare", data: { title, left: { label, value }, right: { label, value } } }
4. quote - 引用页：{ type: "quote", data: { quote: "名言金句", author: "作者" } }
5. highlight - 高亮页：{ type: "highlight", data: { title, items: ["关键词1", "关键词2"] } }
6. progress - 进度页：{ type: "progress", data: { title, bars: [{ label, percent }] } }
7. stats - 数据页：{ type: "stats", data: { title, stats: [{ value, suffix, label }] } }
8. cta - 行动页：{ type: "cta", data: { title, subtitle, button: "按钮文字" } }

要求：
- 第一张必须是 title 类型
- 最后一张必须是 cta 类型
- 中间根据内容和总时长动态决定页数与版式组合
- narration 必须覆盖整段口播，顺序连续
- 旁白较长时必须显著增加页数，不要让单页停留过久
- 每页都要有明确的内容重心和匹配的版式类型
- 任何一页的旁白时长都不要超过 8 秒，宁可增加页数，也不要让单页过长

文案：
"""
{input_text}
"""

请只输出 JSON：
{
  "slides": [
    { "type": "title", "data": { "title": "...", "subtitle": "..." }, "narration": "..." },
    { "type": "list", "data": { "title": "...", "items": [...] }, "narration": "..." }
  ]
}`;

const TECH_PROMPT = `你是一个短视频分镜策划专家。请根据完整口播文案、真实旁白时长和 TechShow 模板风格，规划一组科技风多版式页面。

输入信息：
- 模板风格：{template_name}
- 旁白总时长：{duration_seconds} 秒
- 建议总页数：{target_pages} 页（可在 {min_pages}-{max_pages} 页之间调整）

可用幻灯片类型：
1. title - 标题页：{ type: "title", data: { title, subtitle } }
2. list - 列表页：{ type: "list", data: { title, items: [{ icon: "01", text: "要点", desc: "描述" }] } }
3. stats - 数据页：{ type: "stats", data: { title, stats: [{ value: 数字, suffix: "单位", label }] } }
4. progress - 进度页：{ type: "progress", data: { title, bars: [{ label, percent: 0-100 }] } }
5. compare - 对比页：{ type: "compare", data: { title, left: { label, value }, right: { label, value } } }
6. quote - 引用页：{ type: "quote", data: { quote: "名言", author: "作者" } }
7. cta - 行动页：{ type: "cta", data: { title, subtitle, button: "按钮" } }

要求：
- 第一张必须是 title 类型
- 最后一张必须是 cta 类型
- icon 使用 "01", "02", "03" 这样的编号
- 数据要真实可信
- narration 必须覆盖整段口播，顺序连续
- 中间页数和版式都要根据总时长动态规划
- 长旁白需要更多页面，避免同一页停留太久
- 任何一页的旁白时长都不要超过 8 秒，宁可增加页数，也不要让单页过长

文案：
"""
{input_text}
"""

请只输出 JSON：
{
  "slides": [
    { "type": "title", "data": { "title": "...", "subtitle": "..." }, "narration": "..." }
  ]
}`;

const DYNAMIC_PROMPT = SIMPLE_PROMPT;

function getPagePlan(durationSeconds: number, template: string) {
  const isComplexTemplate = template === 'RichShow' || template === 'TechShow';
  const secondsPerPage = isComplexTemplate ? 6.2 : 5.4;
  const baseMinPages = isComplexTemplate ? 5 : 4;
  const minPages = Math.max(
    baseMinPages,
    Math.ceil(durationSeconds / 7),
    Math.ceil(durationSeconds / MAX_SLIDE_DURATION_SECONDS)
  );
  const maxPages = isComplexTemplate ? 20 : 24;
  const targetPages = Math.max(
    minPages,
    Math.min(maxPages, Math.ceil(durationSeconds / secondsPerPage))
  );

  return { targetPages, minPages, maxPages };
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
    parts.push(...slide.points.filter((point): point is string => typeof point === 'string'));
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

  if (totalFrames <= minTotalFrames) {
    const rawFrames = weights.map((weight) => (weight / weightSum) * totalFrames);
    const baseFrames = rawFrames.map((value) => Math.max(1, Math.floor(value)));
    let assignedFrames = baseFrames.reduce((sum, value) => sum + value, 0);
    const remainders = rawFrames.map((value, index) => ({
      index,
      remainder: value - baseFrames[index],
    }));

    remainders.sort((left, right) => right.remainder - left.remainder);
    let cursor = 0;
    while (assignedFrames < totalFrames) {
      baseFrames[remainders[cursor % remainders.length].index] += 1;
      assignedFrames += 1;
      cursor += 1;
    }

    return baseFrames;
  }

  const remainingFrames = totalFrames - minTotalFrames;
  const rawFrames = weights.map(
    (weight) => MIN_SLIDE_DURATION_FRAMES + (weight / weightSum) * remainingFrames
  );
  const baseFrames = rawFrames.map((value) => Math.floor(value));
  let assignedFrames = baseFrames.reduce((sum, value) => sum + value, 0);
  const remainders = rawFrames.map((value, index) => ({
    index,
    remainder: value - baseFrames[index],
  }));

  remainders.sort((left, right) => right.remainder - left.remainder);
  let cursor = 0;
  while (assignedFrames < totalFrames) {
    baseFrames[remainders[cursor % remainders.length].index] += 1;
    assignedFrames += 1;
    cursor += 1;
  }

  return baseFrames;
}

function estimateSlideDurations(
  slides: Slide[],
  durationSeconds: number
): number[] {
  const totalFrames = Math.max(1, Math.ceil(durationSeconds * FPS));
  return allocateEstimatedFrames(
    slides as unknown as Array<Record<string, unknown>>,
    totalFrames
  ).map((frames) => frames / FPS);
}

function getPromptForTemplate(template: string, durationSeconds: number): string {
  const plan = getPagePlan(durationSeconds, template);
  const replacePrompt = (prompt: string) =>
    prompt
      .replaceAll('{template_name}', template)
      .replaceAll('{duration_seconds}', durationSeconds.toFixed(2))
      .replaceAll('{target_pages}', String(plan.targetPages))
      .replaceAll('{min_pages}', String(plan.minPages))
      .replaceAll('{max_pages}', String(plan.maxPages));

  switch (template) {
    case 'RichShow':
      return replacePrompt(RICH_PROMPT);
    case 'TechShow':
      return replacePrompt(TECH_PROMPT);
    case 'DynamicSlideShow':
    case 'GeneratedVideo':
      return replacePrompt(DYNAMIC_PROMPT);
    default:
      return replacePrompt(SIMPLE_PROMPT);
  }
}

async function generateNarration(
  text: string,
  contentPath: string
): Promise<NarrationInfo> {
  const settings = JSON.parse(localStorage.getItem('videomaker-settings') || '{}');
  if (!settings.voiceId || !settings.voiceApiKey) {
    throw new Error('请先在设置中配置音色 ID 和 DashScope API Key');
  }

  const { invoke } = await import('@tauri-apps/api/core');
  const result = await invoke<string>('generate_narration', {
    rawText: text,
    voiceId: settings.voiceId,
    apiKey: settings.voiceApiKey,
    speechRate: normalizeSpeechRate(settings.voiceSpeechRate),
    contentPath,
  });

  return JSON.parse(result) as NarrationInfo;
}

async function generateSlides(
  text: string,
  template: string,
  durationSeconds: number
): Promise<Slide[]> {
  const settings = JSON.parse(localStorage.getItem('videomaker-settings') || '{}');
  const apiKey = settings.aiApiKey || '';
  const apiUrl = settings.aiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const model = settings.aiModel || 'qwen-plus';

  if (!apiKey) {
    throw new Error('请先在设置中配置 AI API Key');
  }

  const isComplexTemplate = template === 'RichShow' || template === 'TechShow';
  const plan = getPagePlan(durationSeconds, template);
  const { invoke } = await import('@tauri-apps/api/core');

  const normalizeSlides = (rawSlides: Array<Record<string, unknown>>): Slide[] =>
    rawSlides.map((s: Record<string, unknown>, i: number) => {
      if (isComplexTemplate) {
        return {
          id: `slide-${i}`,
          type: typeof s.type === 'string' ? s.type : 'title',
          data: typeof s.data === 'object' && s.data ? s.data as Record<string, unknown> : {},
          narration: typeof s.narration === 'string' ? s.narration : '',
        };
      }

      return {
        title: typeof s.title === 'string' ? s.title : `幻灯片 ${i + 1}`,
        subtitle: typeof s.subtitle === 'string' ? s.subtitle : '',
        points: Array.isArray(s.points)
          ? s.points.filter((point): point is string => typeof point === 'string')
          : [],
        narration: typeof s.narration === 'string' ? s.narration : '',
        id: `slide-${i}`,
      };
    });

  const requestSlides = async (strictPageTarget: boolean): Promise<Slide[]> => {
    const extraInstruction = strictPageTarget
      ? `\n\n补充硬性要求：\n- 本次必须输出至少 ${plan.targetPages} 页\n- 任何一页都不要超过 ${MAX_SLIDE_DURATION_SECONDS} 秒\n- 如果内容较密，优先多拆页，不要减少页数`
      : '';
    const prompt = `${getPromptForTemplate(template, durationSeconds)}${extraInstruction}`;
    const result = await invoke<string>('generate_slides', {
      apiUrl,
      apiKey,
      model,
      prompt: prompt.replace('{input_text}', text),
    });
    const data = JSON.parse(result);

    if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error('AI 返回数据格式错误，请重试');
    }

    return normalizeSlides(data.slides as Array<Record<string, unknown>>);
  };

  const isTooLong = (slides: Slide[]) => {
    const estimatedDurations = estimateSlideDurations(slides, durationSeconds);
    const maxEstimatedDuration = Math.max(...estimatedDurations);
    return (
      slides.length < plan.targetPages ||
      maxEstimatedDuration > MAX_SLIDE_DURATION_SECONDS
    );
  };

  let slides = await requestSlides(false);
  if (isTooLong(slides)) {
    slides = await requestSlides(true);
  }

  if (isTooLong(slides)) {
    throw new Error('当前分镜页数仍然不足，无法保证单页不超过 8 秒，请重试。');
  }

  return slides.map((s: any, i: number) => {
    if (isComplexTemplate) {
      return { ...s, id: `slide-${i}` };
    }

    return { ...s, id: `slide-${i}` };
  });
}

// ========== 模板列表 ==========
const TEMPLATES = [
  { label: '生成的视频', value: 'GeneratedVideo' },
  { label: '科技风', value: 'SlideShow' },
  { label: '毛玻璃', value: 'GlassShow' },
  { label: '新拟态', value: 'NeuShow' },
  { label: '丰富特效', value: 'RichShow' },
  { label: '科技感特效', value: 'TechShow' },
  { label: 'AI 科技风', value: 'AIShow' },
  { label: '赛博朋克霓虹', value: 'NeonShow' },
  { label: '暗黑奢华', value: 'LuxeShow' },
  { label: '液态玻璃', value: 'LiquidShow' },
  { label: '磨砂玻璃', value: 'FrostedShow' },
];

const USER_TEMPLATES = TEMPLATES.filter((templateOption) => {
  return templateOption.value !== 'GeneratedVideo';
});

function Home() {
  const navigate = useNavigate();
  const project = useProject();
  const [text, setText] = React.useState(project?.rawText || '');
  const [template, setTemplate] = React.useState(
    USER_TEMPLATES.some((item) => item.value === project?.template)
      ? project!.template
      : 'SlideShow'
  );
  const [loading, setLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('请输入口播文案');
      return;
    }
    setError('');
    setLoading(true);

    try {
      setLoadingMessage('正在生成整段语音...');
      const contentPath = getProjectContentPath(template);
      const narration = await generateNarration(text, contentPath);

      setLoadingMessage(
        `正在根据 ${narration.duration.toFixed(1)} 秒旁白规划页面...`
      );
      const slides = await generateSlides(text, template, narration.duration);

      // 2. 保存幻灯片到 JSON
      setLoadingMessage('正在保存幻灯片...');
      const settings = JSON.parse(localStorage.getItem('videomaker-settings') || '{}');
      const { invoke } = await import('@tauri-apps/api/core');

      const isComplexTemplate = template === 'RichShow' || template === 'TechShow';
      let slidesData: any[];
      if (isComplexTemplate) {
        slidesData = slides.map((s: any) => ({
          type: s.type,
          data: s.data,
          narration: s.narration || '',
        }));
      } else {
        slidesData = slides.map((s: any) => ({
          title: s.title,
          subtitle: s.subtitle,
          points: s.points,
          narration: s.narration,
        }));
      }

      await invoke<string>('save_slides', {
        template: template,
        voiceId: settings.voiceId || '',
        rawText: text,
        slides: slidesData,
        contentPath,
      });

      // 3. 用已经生成好的 narration.mp3 同步页面时间线
      setLoadingMessage('正在同步页面时长...');
      await invoke<string>('sync_timeline', {
        voiceId: settings.voiceId || '',
        contentPath,
      });

      setProject({
        id: Date.now().toString(),
        rawText: text,
        slides,
        template,
        contentPath,
      });
      navigate('/editor');
    } catch (e: any) {
      console.error('生成失败:', e);
      const errorMsg = e?.message || e?.toString() || '未知错误';
      setError('生成失败: ' + errorMsg);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div style={{ padding: COMPACT_UI.pagePadding, maxWidth: 820, margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: COMPACT_UI.cardPadding, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#1d2129' }}>口播文案</h2>
        <p style={{ color: '#86909c', margin: '0 0 16px 0' }}>粘贴你的口播文案，AI 将自动拆分为幻灯片</p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"在此粘贴口播文案...\n\n示例：\nClaude Code 是一款革命性的 AI 编程助手，它在命令行中运行，能够理解你的整个代码库并进行智能编辑。\n你只需要用自然语言描述需求，就能完成各种开发任务。"}
          style={{
            width: '100%',
            height: 176,
            padding: 10,
            border: '1px solid #e5e6eb',
            borderRadius: 4,
            fontSize: 13,
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />

        {error && <p style={{ color: '#f53f3f', margin: '8px 0' }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#4e5969' }}>模板风格：</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              style={{ padding: '7px 10px', border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13 }}
            >
              {USER_TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: COMPACT_UI.buttonPadding,
              background: loading ? '#94b8ff' : '#165dff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            {loading ? (loadingMessage || '生成中...') : '生成幻灯片'}
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', padding: COMPACT_UI.cardPadding, borderRadius: 8, marginTop: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1d2129' }}>使用说明</h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#86909c' }}>
          <li>先生成整段口播语音，再根据真实时长自动规划页面数量</li>
          <li>AI 会按文案内容和模板风格决定每页讲什么</li>
          <li>生成后可在编辑器中修改内容</li>
          <li>选择不同的模板风格会影响视频的视觉效果</li>
        </ul>
      </div>
    </div>
  );
}

// ========== 编辑器 ==========
function Editor() {
  const globalProject = useProject();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [rendering, setRendering] = React.useState(false);
  const [renderProgress, setRenderProgress] = React.useState('');
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [remotionStarting, setRemotionStarting] = React.useState(false);

  // 优先使用全局状态，否则从 localStorage 加载
  const project = globalProject || loadProjectFromStorage();

  if (!project || project.slides.length === 0) {
    return (
      <div style={{ padding: COMPACT_UI.pagePadding, textAlign: 'center', color: '#86909c' }}>
        <p>请先在首页生成幻灯片</p>
        <a href="/" style={{ color: '#165dff' }}>返回首页</a>
      </div>
    );
  }

  const slide = project.slides[activeIndex];

  // 判断是否是复杂模板
  const isComplexTemplate = project.template === 'RichShow' || project.template === 'TechShow';

  const updateSlide = (field: string, value: any) => {
    project.slides[activeIndex] = { ...slide, [field]: value } as any;
    forceUpdate();
  };

  const addSlide = () => {
    if (isComplexTemplate) {
      project.slides.push({
        id: `slide-${Date.now()}`,
        type: 'title',
        data: { title: '新幻灯片', subtitle: '' },
      } as any);
    } else {
      project.slides.push({
        id: `slide-${Date.now()}`,
        title: '新幻灯片',
        subtitle: '',
        points: ['要点 1'],
        narration: '',
      } as any);
    }
    forceUpdate();
  };

  const deleteSlide = (index: number) => {
    if (project.slides.length <= 1) return;
    project.slides.splice(index, 1);
    if (activeIndex >= project.slides.length) {
      setActiveIndex(project.slides.length - 1);
    }
    forceUpdate();
  };

  // 保存幻灯片
  const saveSlides = async () => {
    const settings = JSON.parse(localStorage.getItem('videomaker-settings') || '{}');
    try {
      const { invoke } = await import('@tauri-apps/api/core');

      // 根据模板类型处理数据
      let slidesData: any[];
      if (isComplexTemplate) {
        slidesData = project.slides.map(s => ({
          type: (s as any).type,
          data: (s as any).data,
          narration: (s as any).narration || '',
        }));
      } else {
        slidesData = project.slides.map(s => ({
          title: (s as any).title,
          subtitle: (s as any).subtitle,
          points: (s as any).points,
          narration: (s as any).narration,
        }));
      }

      await invoke<string>('save_slides', {
        template: project.template,
        voiceId: settings.voiceId || '',
        rawText: project.rawText || '',
        slides: slidesData,
        contentPath: project.contentPath,
      });
      console.log('幻灯片已保存');
    } catch (e) {
      console.error('保存失败:', e);
    }
  };

  // 启动并显示预览
  const syncAudio = async () => {
    const settings = JSON.parse(localStorage.getItem('videomaker-settings') || '{}');
    if (!settings.voiceId || !settings.voiceApiKey) {
      return;
    }

    const { invoke } = await import('@tauri-apps/api/core');
    try {
      await invoke<string>('sync_timeline', {
        voiceId: settings.voiceId,
        contentPath: project.contentPath,
      });
    } catch {
      await invoke<string>('generate_audio', {
        voiceId: settings.voiceId,
        apiKey: settings.voiceApiKey,
        speechRate: normalizeSpeechRate(settings.voiceSpeechRate),
        contentPath: project.contentPath,
      });
    }
  };

  const startPreview = async () => {
    console.log('Starting embedded preview...');
    setRemotionStarting(true);
    setShowPreview(true);
    setPreviewUrl(`${REMOTION_PREVIEW_URL}/GeneratedVideo?t=${Date.now()}`);

    try {
      await saveSlides();
      console.log('Slides are ready for preview.', project.template);

      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke<RemotionStartupResult>('ensure_remotion_running');

      console.log('Remotion preview server:', result);
      setPreviewUrl(`http://localhost:${result.port}/GeneratedVideo?t=${Date.now()}`);

      // Preview should appear immediately. Audio sync can continue in the background.
      void syncAudio().catch((e: any) => {
        console.warn('Background audio sync failed:', e);
      });
    } catch (e: any) {
      console.error('Unable to prepare Remotion preview:', e);
      setPreviewUrl(`${REMOTION_PREVIEW_URL}/GeneratedVideo?t=${Date.now()}`);
    } finally {
      setRemotionStarting(false);
    }

    return;
    /*
    console.log('开始启动预览...');
    await saveSlides();
    try {
      await syncAudio();
    } catch (e: any) {
      alert('语音生成失败: ' + (e?.message || e?.toString() || '未知错误'));
      return;
    }
    console.log('幻灯片已保存，模板:', project.template);

    // 检测是否在 Tauri 环境中
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      console.log('Tauri 环境检测成功');

      // 检查 Remotion 是否运行
      setRenderProgress('Starting Remotion Studio...');
      await invoke<RemotionStartupResult>('ensure_remotion_running');
      console.log('Remotion 运行状态:', isRunning);

        setRemotionStarting(true);
        try {
          console.log('正在启动 Remotion...');
          await invoke<string>('start_remotion');
          console.log('Remotion 启动成功');
        } catch (e: any) {
          console.error('启动 Remotion 失败:', e);
          alert('启动 Remotion 失败: ' + (e.message || e) + '\n\n请手动在终端运行: npm run dev');
          setRemotionStarting(false);
          return;
        }
      }
    } catch (e) {
      console.log('非 Tauri 环境，直接连接 Remotion');
    }

    // 尝试多个端口连接 Remotion
    const ports = [3002, 3000, 3004];
    let found = false;

    for (const port of ports) {
      try {
        console.log(`尝试连接端口 ${port}...`);
        // 使用 no-cors 模式检测端口（因为 CORS 可能阻止正常请求）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        await fetch(`http://localhost:${port}`, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        console.log(`端口 ${port} 可用`);
        // 直接打开用户选择的模板
        setPreviewUrl(`http://localhost:${port}/GeneratedVideo`);
        setShowPreview(true);
        found = true;
        break;
      } catch (e: any) {
        console.log(`端口 ${port} 连接失败:`, e.message || e);
      }
    }

    if (!found) {
      alert('无法连接 Remotion Studio。\n\n请确保 Remotion 正在运行:\n1. 打开终端\n2. 运行: npm run dev\n3. 等待启动完成后重试');
    }

    setRemotionStarting(false);
    */
  };

  // 渲染视频
  const renderVideo = async () => {
    setRendering(true);
    setRenderProgress('正在准备...');

    await saveSlides();

    try {
      const { invoke } = await import('@tauri-apps/api/core');

      setRenderProgress('正在生成语音...');
      await syncAudio();

      // 确保 Remotion 可用
      setRenderProgress('Starting Remotion Studio...');
      await invoke<RemotionStartupResult>('ensure_remotion_running');
      if (false) {
        setRenderProgress('正在启动 Remotion...');
        await invoke<string>('start_remotion');
        await new Promise(r => setTimeout(r, 5000));
      }

      setRenderProgress('正在渲染视频...');
      const result = await invoke<string>('render_video', {
        template: project.template,
        contentPath: project.contentPath,
      });
      setRenderProgress('渲染完成: ' + result);
    } catch (e) {
      setRenderProgress('');
      alert(`渲染失败: ${e}\n\n请确保 Remotion 正在运行，然后重试。`);
    } finally {
      setRendering(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* 左侧列表 */}
      <div style={{ width: COMPACT_UI.sidePanelWidth, background: '#fff', borderRight: '1px solid #e5e6eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: COMPACT_UI.panelPadding, borderBottom: '1px solid #e5e6eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>幻灯片 ({project.slides.length})</span>
          <button onClick={addSlide} style={{ padding: '4px 8px', fontSize: 11, background: '#165dff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>+ 添加</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {project.slides.map((s, i) => {
            // 根据模板类型获取显示标题
            const displayTitle = isComplexTemplate
              ? ((s as any).data?.title || (s as any).data?.quote || `类型: ${(s as any).type}`)
              : (s as any).title;

            return (
              <div
                key={s.id}
                onClick={() => setActiveIndex(i)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: activeIndex === i ? '#e8f3ff' : 'transparent',
                  borderLeft: activeIndex === i ? '3px solid #165dff' : '3px solid transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: '#1d2129' }}>
                  {displayTitle || `幻灯片 ${i + 1}`}
                </span>
                {project.slides.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                    style={{ padding: '2px 6px', fontSize: 12, color: '#f53f3f', background: 'none', border: '1px solid #f53f3f', borderRadius: 4, cursor: 'pointer' }}
                  >删除</button>
                )}
              </div>
            );
          })}
        </div>

        {/* 操作按钮 */}
        <div style={{ padding: COMPACT_UI.panelPadding, borderTop: '1px solid #e5e6eb' }}>
          <button
            onClick={startPreview}
            disabled={remotionStarting}
            style={{ width: '100%', padding: '9px', marginBottom: 8, background: remotionStarting ? '#94b8ff' : '#00b42a', color: '#fff', border: 'none', borderRadius: 4, cursor: remotionStarting ? 'not-allowed' : 'pointer', fontSize: 13 }}
          >{remotionStarting ? '启动中...' : '📺 内嵌预览'}</button>
          <button
            onClick={renderVideo}
            disabled={rendering}
            style={{ width: '100%', padding: '9px', marginBottom: 8, background: rendering ? '#94b8ff' : '#165dff', color: '#fff', border: 'none', borderRadius: 4, cursor: rendering ? 'not-allowed' : 'pointer', fontSize: 13 }}
          >🎬 {rendering ? '渲染中...' : '导出视频'}</button>
          {renderProgress && <p style={{ fontSize: 12, color: '#86909c', marginTop: 8 }}>{renderProgress}</p>}
        </div>
      </div>

      {/* 中间编辑区 */}
      <div style={{ flex: 1, padding: COMPACT_UI.pagePadding, overflow: 'auto', borderRight: showPreview ? '1px solid #e5e6eb' : 'none' }}>
        <div style={{ maxWidth: 560 }}>
          {/* 模板选择 */}
          <div style={{ marginBottom: COMPACT_UI.sectionGap, padding: 12, background: '#e8f3ff', borderRadius: 8 }}>
            <span style={{ color: '#4e5969' }}>当前模板：</span>
            <span style={{ marginLeft: 8, padding: '5px 10px', border: '1px solid #165dff', borderRadius: 4, fontSize: 13, color: '#165dff', background: '#fff', display: 'inline-block' }}>
              {project.template}
            </span>
            <span style={{ marginLeft: 12, fontSize: 12, color: '#86909c' }}>
              当前项目已绑定模板，不能切换。
            </span>
            {isComplexTemplate && (
              <span style={{ marginLeft: 12, fontSize: 12, color: '#86909c' }}>
                (复杂模板，支持多种幻灯片类型)
              </span>
            )}
          </div>

          {isComplexTemplate ? (
            // 复杂模板编辑器
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>幻灯片类型</label>
                <select
                  value={(slide as any).type || 'title'}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let defaultData: any = {};
                    switch (newType) {
                      case 'title':
                        defaultData = { title: '标题', subtitle: '副标题' };
                        break;
                      case 'list':
                        defaultData = { title: '列表标题', items: [{ icon: '📌', text: '要点1' }] };
                        break;
                      case 'compare':
                        defaultData = { title: '对比标题', left: { label: '左侧', value: '值1' }, right: { label: '右侧', value: '值2' } };
                        break;
                      case 'quote':
                        defaultData = { quote: '名言金句', author: '作者' };
                        break;
                      case 'stats':
                        defaultData = { title: '数据统计', stats: [{ value: 100, suffix: '%', label: '指标' }] };
                        break;
                      case 'progress':
                        defaultData = { title: '进度展示', bars: [{ label: '项目', percent: 80 }] };
                        break;
                      case 'highlight':
                        defaultData = { title: '高亮展示', items: ['关键词1', '关键词2'] };
                        break;
                      case 'cta':
                        defaultData = { title: '行动号召', subtitle: '副标题', button: '点击按钮' };
                        break;
                    }
                    (slide as any).type = newType;
                    (slide as any).data = defaultData;
                    forceUpdate();
                    saveSlides();
                  }}
                  style={{ width: '100%', padding: 9, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
                >
                  <option value="title">标题页</option>
                  <option value="list">列表页</option>
                  <option value="compare">对比页</option>
                  <option value="quote">引用页</option>
                  <option value="stats">数据页</option>
                  <option value="progress">进度页</option>
                  <option value="highlight">高亮页</option>
                  <option value="cta">行动号召页</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>内容数据 (JSON)</label>
                <textarea
                  value={JSON.stringify((slide as any).data || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      (slide as any).data = JSON.parse(e.target.value);
                      forceUpdate();
                    } catch (err) {
                      // JSON 解析错误，忽略
                    }
                  }}
                  onBlur={saveSlides}
                  rows={10}
                  style={{ width: '100%', padding: 10, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>旁白</label>
                <textarea
                  value={(slide as any).narration || ''}
                  onChange={(e) => { (slide as any).narration = e.target.value; forceUpdate(); }}
                  onBlur={saveSlides}
                  rows={4}
                  style={{ width: '100%', padding: 9, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </>
          ) : (
            // 简单模板编辑器
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>标题</label>
                <input
                  value={(slide as any).title || ''}
                  onChange={(e) => updateSlide('title', e.target.value)}
                  onBlur={saveSlides}
                  style={{ width: '100%', padding: 9, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>副标题</label>
                <input
                  value={(slide as any).subtitle || ''}
                  onChange={(e) => updateSlide('subtitle', e.target.value)}
                  onBlur={saveSlides}
                  style={{ width: '100%', padding: 9, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>要点</label>
                {((slide as any).points || []).map((p: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      value={p}
                      onChange={(e) => { (slide as any).points[i] = e.target.value; forceUpdate(); }}
                      onBlur={saveSlides}
                      style={{ flex: 1, padding: 9, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13 }}
                    />
                    <button
                      onClick={() => { (slide as any).points.splice(i, 1); forceUpdate(); saveSlides(); }}
                      style={{ padding: '0 12px', color: '#f53f3f', background: 'none', border: '1px solid #f53f3f', borderRadius: 4, cursor: 'pointer' }}
                    >删除</button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    if (!(slide as any).points) (slide as any).points = [];
                    (slide as any).points.push('新要点');
                    forceUpdate();
                    saveSlides();
                  }}
                  style={{ padding: '8px 16px', background: '#f2f3f5', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#4e5969' }}
                >+ 添加要点</button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>旁白</label>
                <textarea
                  value={(slide as any).narration || ''}
                  onChange={(e) => updateSlide('narration', e.target.value)}
                  onBlur={saveSlides}
                  rows={4}
                  style={{ width: '100%', padding: 9, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 右侧预览面板 */}
      {showPreview && (
        <div style={{ width: COMPACT_UI.previewWidth, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 10, borderBottom: '1px solid #e5e6eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>预览</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { if (previewUrl) window.open(previewUrl, '_blank'); }}
                style={{ padding: '4px 10px', fontSize: 12, background: '#165dff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >新窗口</button>
              <button
                onClick={() => setShowPreview(false)}
                style={{ padding: '4px 10px', fontSize: 12, background: '#f2f3f5', color: '#4e5969', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >关闭</button>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {previewUrl ? (
              <iframe
                key={previewUrl}
                src={previewUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#86909c' }}>
                正在启动 Remotion...
              </div>
            )}
          </div>
          <div style={{ padding: 8, borderTop: '1px solid #e5e6eb', fontSize: 12, color: '#86909c', textAlign: 'center' }}>
            当前模板: {project.template} | 点击播放按钮预览动画
          </div>
        </div>
      )}
    </div>
  );
}

// ========== 设置 ==========
function Settings() {
  const [activeTab, setActiveTab] = React.useState<'voice' | 'ai'>('voice');
  const [saved, setSaved] = React.useState(false);

  // 配音设置
  const [voiceId, setVoiceId] = React.useState('');
  const [voiceModel, setVoiceModel] = React.useState('cosyvoice-v2');
  const [voiceApiKey, setVoiceApiKey] = React.useState('');
  const [voiceSpeechRate, setVoiceSpeechRate] = React.useState(1);

  // AI 生成设置
  const [aiUrl, setAiUrl] = React.useState('https://dashscope.aliyuncs.com/compatible-mode/v1');
  const [aiApiKey, setAiApiKey] = React.useState('');
  const [aiModel, setAiModel] = React.useState('qwen-plus');

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('videomaker-settings');
    if (savedSettings) {
      const data = JSON.parse(savedSettings);
      // 配音设置
      setVoiceId(data.voiceId || '');
      setVoiceModel(data.voiceModel || 'cosyvoice-v2');
      setVoiceApiKey(data.voiceApiKey || '');
      setVoiceSpeechRate(normalizeSpeechRate(data.voiceSpeechRate));
      // AI 设置
      setAiUrl(data.aiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1');
      setAiApiKey(data.aiApiKey || '');
      setAiModel(data.aiModel || 'qwen-plus');
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('videomaker-settings', JSON.stringify({
      // 配音设置
      voiceId,
      voiceModel,
      voiceApiKey,
      voiceSpeechRate,
      // AI 设置
      aiUrl,
      aiApiKey,
      aiModel,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabStyle = (active: boolean) => ({
    padding: '10px 18px',
    background: active ? '#fff' : 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #165dff' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 500 : 400,
    color: active ? '#165dff' : '#4e5969',
  });

  return (
    <div style={{ padding: COMPACT_UI.pagePadding, maxWidth: 640 }}>
      <h2 style={{ color: '#1d2129', marginBottom: 16 }}>设置</h2>

      {/* Tab 切换 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e6eb', marginBottom: 20 }}>
        <button style={tabStyle(activeTab === 'voice')} onClick={() => setActiveTab('voice')}>
          🎙️ 配音设置
        </button>
        <button style={tabStyle(activeTab === 'ai')} onClick={() => setActiveTab('ai')}>
          🤖 AI 生成设置
        </button>
      </div>

      {/* 配音设置 Tab */}
      {activeTab === 'voice' && (
        <div>
          <div style={{ background: '#fff8e6', border: '1px solid #ffcb45', borderRadius: 4, padding: 12, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#7d6608' }}>
              💡 配音使用阿里云百炼 CosyVoice 服务，需要在百炼控制台复刻声音后获得声音ID
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>百炼 API Key</label>
            <input
              type="password"
              value={voiceApiKey}
              onChange={(e) => setVoiceApiKey(e.target.value)}
              placeholder="sk-..."
              style={{ width: '100%', padding: 10, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
            />
            <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>在阿里云百炼控制台获取</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>声音模型</label>
            <input
              type="text"
              value={voiceModel}
              onChange={(e) => setVoiceModel(e.target.value)}
              placeholder="cosyvoice-v2"
              style={{ width: '100%', padding: 10, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
            />
            <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>如 cosyvoice-v1, cosyvoice-v2, cosyvoice-v3 等</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>声音 ID</label>
            <input
              type="text"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              placeholder="cosyvoice-v3.5-plus-bailian-xxx"
              style={{ width: '100%', padding: 10, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
            />
            <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>在百炼控制台复刻声音后获得的 ID</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>语速</label>
            <input
              type="number"
              min={0.5}
              max={2}
              step={0.1}
              value={voiceSpeechRate}
              onChange={(e) => setVoiceSpeechRate(normalizeSpeechRate(e.target.value))}
              placeholder="1.0"
              style={{ width: '100%', padding: 10, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
            />
            <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>范围 0.5 - 2.0，1.0 为默认语速</p>
          </div>
        </div>
      )}

      {/* AI 生成设置 Tab */}
      {activeTab === 'ai' && (
        <div>
          <div style={{ background: '#e8f3ff', border: '1px solid #94b8ff', borderRadius: 4, padding: 12, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#1d39c4' }}>
              💡 支持 OpenAI 协议的平台，默认使用百炼 DashScope，可替换为其他兼容平台
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>API Base URL</label>
            <input
              type="text"
              value={aiUrl}
              onChange={(e) => setAiUrl(e.target.value)}
              placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
              style={{ width: '100%', padding: 10, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
            />
            <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>
              默认百炼，可替换为 OpenAI、DeepSeek 等兼容平台
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>API Key</label>
            <input
              type="password"
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
              placeholder="sk-..."
              style={{ width: '100%', padding: 10, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
            />
            <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>对应平台的 API Key</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#1d2129' }}>模型名称</label>
            <input
              type="text"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder="qwen-plus"
              style={{ width: '100%', padding: 10, border: '1px solid #e5e6eb', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
            />
            <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>如 qwen-plus, gpt-4, deepseek-chat 等</p>
          </div>

          <div style={{ background: '#f7f8fa', borderRadius: 4, padding: 12, marginTop: 16 }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#1d2129' }}>常用平台配置参考：</p>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#4e5969', fontSize: 13 }}>
              <li>百炼: URL=https://dashscope.aliyuncs.com/compatible-mode/v1, 模型=qwen-plus</li>
              <li>OpenAI: URL=https://api.openai.com/v1, 模型=gpt-4</li>
              <li>DeepSeek: URL=https://api.deepseek.com/v1, 模型=deepseek-chat</li>
              <li>硅基流动: URL=https://api.siliconflow.cn/v1, 模型=Qwen/Qwen2.5-72B-Instruct</li>
            </ul>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        style={{ padding: '10px 24px', background: '#165dff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginTop: 12 }}
      >保存设置</button>

      {saved && <span style={{ marginLeft: 16, color: '#00b42a' }}>已保存！</span>}
    </div>
  );
}

// ========== 布局 ==========
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/editor', label: '编辑器' },
    { path: '/settings', label: '设置' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f5f5' }}>
      <nav style={{ width: COMPACT_UI.navWidth, background: '#fff', padding: 12, borderRight: '1px solid #e5e6eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 'bold', fontSize: 16, color: '#165dff', marginBottom: 16, padding: '6px 0' }}>AI 视频生成器</div>
        {navItems.map(item => (
          <a
            key={item.path}
            href={item.path}
            style={{
              display: 'block',
              padding: '8px 10px',
              color: location.pathname === item.path ? '#165dff' : '#4e5969',
              textDecoration: 'none',
              borderRadius: 4,
              background: location.pathname === item.path ? '#e8f3ff' : 'transparent',
              marginBottom: 4,
            }}
          >{item.label}</a>
        ))}
      </nav>
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

// ========== 主应用 ==========
export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}
