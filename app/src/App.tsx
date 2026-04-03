import React from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { EmbeddedPreview, PreviewProjectData } from './remotion-preview/EmbeddedPreview';

type SimpleSlide = {
  id: string;
  title: string;
  subtitle: string;
  points: string[];
  narration: string;
  segmentIds?: string[];
  audioStart?: number;
  audioEnd?: number;
  durationInFrames?: number;
  audioDuration?: number;
};

type ComplexSlide = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  title?: string;
  subtitle?: string;
  points?: string[];
  badge?: string;
  items?: Array<Record<string, unknown>>;
  narration?: string;
  segmentIds?: string[];
  audioStart?: number;
  audioEnd?: number;
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
  volcengineAppId: string;
  volcengineResourceId: string;
  voiceSpeechRate: number;
  aiUrl: string;
  aiApiKey: string;
  aiModel: string;
  rewriteStyles: RewriteStyle[];
  defaultRewriteStyleId: string;
};

type NarrationSegment = {
  id: string;
  text: string;
  start: number;
  end: number;
  duration: number;
  audioPath?: string;
};

type NarrationTimeline = {
  audioPath: string;
  duration: number;
  segments: NarrationSegment[];
};

type RewriteStyle = {
  id: string;
  name: string;
  prompt: string;
};

type PromptMode = 'simple' | 'structured';

type TemplatePromptConfig = {
  mode: PromptMode;
  role: string;
  objective: string;
  allowedTypes?: string[];
  styleGoals: string[];
  pageRules: string[];
  typeGuidelines?: string[];
  fieldRules: string[];
  outputExample: string;
};

type PreviewProjectResponse = {
  template: string;
  slides: Array<Record<string, unknown>>;
  soundtrackFile?: string;
  soundtrackDataUrl?: string;
  soundtrackDuration?: number;
};

type HomeDraft = {
  douyinLink: string;
  originalText: string;
  editedText: string;
  template: string;
  selectedRewriteStyleId: string;
};

const FPS = 30;
const MAX_SLIDE_DURATION_SECONDS = 8;

const STORAGE_KEYS = {
  project: 'videomaker-project',
  settings: 'videomaker-settings',
  homeDraft: 'videomaker-home-draft',
} as const;

const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

const COMPACT_UI = {
  navWidth: 86,
  shellMaxWidth: 1380,
  pageMaxWidth: 980,
  sidePanelWidth: 420,
  pagePadding: SPACING.lg,
  panelPadding: SPACING.md,
  sectionGap: SPACING.md,
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
  { label: '横屏基础版', value: 'SlideShowWide' },
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

const DEFAULT_REWRITE_STYLES: RewriteStyle[] = [
  {
    id: 'rewrite-natural',
    name: '系统默认',
    prompt: `你是短视频二创文案助手。请把用户提供的原文案改写成适合中文短视频口播的成稿。

要求：
1. 保留原意，不要编造事实。
2. 语言更自然、更顺口，读出来要像真人在讲，而不是书面总结。
3. 可以优化原文里的重复、停顿词、口语病和不够顺的句子。
4. 不要写成列表，不要加标题，不要加解释，不要加引号，只输出最终文案正文。
5. 如果原文开头不够抓人，可以适度优化开场，但不要夸张标题党。
6. 尽量保留原文的信息密度和节奏，适合直接用于配音。
7. 输出必须是完整、通顺、可直接配音的中文口播文案。`,
  },
  {
    id: 'rewrite-viral',
    name: '短视频感',
    prompt: `你是短视频爆款口播文案助手。请把输入文案改写成更适合短视频传播的版本。

要求：
1. 保留原意，不要编造事实。
2. 开头更抓人，节奏更紧凑，但不要浮夸。
3. 输出纯文本，不要加解释、标题、序号和引号。
4. 语言更像真人口播，更有镜头感。
5. 适度加强停顿感和重点句，但不要写成网络烂梗。

原文案：
{{text}}`,
  },
  {
    id: 'rewrite-professional',
    name: '专业清晰',
    prompt: `你是知识类短视频口播编辑。请把输入文案改写成更专业、更清晰、更有条理的讲解文案。

要求：
1. 保留原意，不要编造事实。
2. 表达要准确、清楚，避免过度口语化。
3. 输出纯文本，不要加解释、标题、序号和引号。
4. 适合知识分享、老师讲解、方法拆解类视频。
5. 句子之间衔接自然，便于直接配音。

原文案：
{{text}}`,
  },
];

const DEFAULT_SETTINGS: SettingsData = {
  voiceId: '',
  voiceModel: 'cosyvoice-v2',
  voiceApiKey: '',
  volcengineAppId: '',
  volcengineResourceId: 'seed-icl-2.0',
  voiceSpeechRate: 1,
  aiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  aiApiKey: '',
  aiModel: 'qwen-plus',
  rewriteStyles: DEFAULT_REWRITE_STYLES,
  defaultRewriteStyleId: DEFAULT_REWRITE_STYLES[0].id,
};

const COMMON_SEGMENT_RULES = `
硬性要求：
1. 你必须根据 segments 做分页，不能自己虚构时间。
2. 每页必须输出 segmentIds，且 segmentIds 只能来自输入。
3. 所有 segments 必须按原顺序被完整覆盖一次，不能遗漏，不能重复，不能倒序。
4. 每页时长由该页 segmentIds 覆盖的真实时间决定，所以不要把过多 segments 塞进一页。
5. narration 必须与该页 segmentIds 覆盖的原文一致，只能做轻微口语化整理，不能跨页挪内容。
`;

const MASTER_SIMPLE_PROMPT = `你是{role}。请根据模板风格和语义片段时间轴，{objective}。
${COMMON_SEGMENT_RULES}

整体目标：
{style_goals}

页面要求：
{page_rules}

字段约定：
{field_rules}

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{output_example}`;

const MASTER_STRUCTURED_PROMPT = `你是{role}。请根据模板风格和语义片段时间轴，{objective}。
${COMMON_SEGMENT_RULES}

整体目标：
{style_goals}

导演编排要求：
{director_brief}

允许的页面类型：
{allowed_types}

页面要求：
{page_rules}

版式判断准则：
{type_guidelines}

字段约定：
{field_rules}

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{output_example}`;

const DEFAULT_TEMPLATE_PROMPT_CONFIG: TemplatePromptConfig = {
  mode: 'simple',
  role: '短视频分镜策划助手',
  objective: '输出最终分页结果',
  styleGoals: [
    '页面内容适合知识干货类短视频，表达清晰、重点明确。',
    '优先保证信息顺序自然、口播匹配、分页合理。',
  ],
  pageRules: [
    '每页输出 title、subtitle、points、narration、segmentIds。',
    '不要把过多信息挤进同一页，宁可自然拆页。',
  ],
  fieldRules: [
    'title：页面标题',
    'subtitle：可选补充说明',
    'points：核心要点数组',
    'narration：与本页内容对应的口播',
  ],
  outputExample: `{
  "slides": [
    {
      "segmentIds": ["segment-1", "segment-2"],
      "title": "...",
      "subtitle": "...",
      "points": ["...", "..."],
      "narration": "..."
    }
  ]
}`,
};

const TEMPLATE_PROMPT_CONFIGS: Record<string, TemplatePromptConfig> = {
  RichShow: {
    mode: 'structured',
    role: '短视频分镜策划助手',
    objective: '输出多版式分镜',
    allowedTypes: ['title', 'list', 'compare', 'quote', 'highlight', 'progress', 'stats', 'cta'],
    styleGoals: [
      '整体节奏要有起承转合，开场立题，中段展开，结尾收口。',
      '版式要服务信息表达，不要只为了变化而变化。',
    ],
    pageRules: [
      '第一页必须是 title，最后一页必须是 cta。',
      '中间页面优先选择最能表达内容关系的版式。',
      '不要让相邻两页使用同一种版式。',
    ],
    typeGuidelines: [
      'title：开场立题、抛出主题',
      'list：并列要点、建议整理、原因拆分',
      'compare：明确的前后方案或两种路径对照',
      'quote：一句值得单独强调的核心结论',
      'highlight：少量关键词强化',
      'progress：有阶段推进或完成度时使用',
      'stats：有真实数字、占比、规模时使用',
      'cta：结尾总结与行动引导',
    ],
    fieldRules: [
      'title: data = { title, subtitle? }',
      'compare: data = { title, left: { label, value }, right: { label, value } }',
      'stats: data = { title, stats: [{ value, suffix?, label }] }',
      'progress: data = { title, bars: [{ label, percent }] }',
      'list: data = { title, items: [{ icon?, text, desc? }] }',
      'quote: data = { quote, author }',
      'highlight: data = { title?, items: ["关键词"] }',
      'cta: data = { title, subtitle?, button }',
    ],
    outputExample: `{
  "slides": [
    {
      "segmentIds": ["segment-1"],
      "type": "title",
      "data": { "title": "...", "subtitle": "..." },
      "narration": "..."
    }
  ]
}`,
  },
  TechShow: {
    mode: 'structured',
    role: '短视频分镜策划助手',
    objective: '输出科技信息流分镜',
    allowedTypes: ['title', 'list', 'stats', 'progress', 'compare', 'quote', 'cta'],
    styleGoals: [
      '页面要像科技信息流短片，信息干净、判断明确、节奏利落。',
      '普通讲解优先使用 list，避免无依据的数据页和进度页。',
    ],
    pageRules: [
      '第一页必须是 title，最后一页必须是 cta。',
      '不要让相邻两页使用同一种版式，但也不要为了凑变化硬切版式。',
      '当内容只是普通讲解时，请优先使用 list。',
    ],
    typeGuidelines: [
      'title：开场立题或问题抛出',
      'list：并列要点、建议整理、结论拆分，是默认优先版式',
      'stats：只适合文本里明确出现数字、占比、规模、效果时',
      'progress：只适合阶段、路径、成熟度、完成度、步骤推进',
      'compare：只适合前后方案、旧新方法、常见误区 vs 正确做法',
      'quote：只适合一句关键结论、提醒、收口',
      'cta：结尾总结与行动引导',
    ],
    fieldRules: [
      'title: data = { title, subtitle? }',
      'compare: data = { title, left: { label, value }, right: { label, value } }',
      'stats: data = { title, stats: [{ value, suffix?, label }] }',
      'progress: data = { title, bars: [{ label, percent }] }',
      'list: data = { title, items: [{ icon?, text, desc? }] }',
      'quote: data = { quote, author }',
      'cta: data = { title, subtitle?, button }',
    ],
    outputExample: `{
  "slides": [
    {
      "segmentIds": ["segment-1"],
      "type": "title",
      "data": { "title": "...", "subtitle": "..." },
      "narration": "..."
    }
  ]
}`,
  },
  GlassShow: {
    mode: 'structured',
    role: '一个有审美判断的短视频导演兼信息设计师',
    objective: '输出像真实产品团队做出来的玻璃风分镜，而不是机械套模板',
    allowedTypes: ['hero', 'stats', 'compare', 'steps', 'list', 'chart', 'timeline', 'highlight', 'quote', 'default'],
    styleGoals: [
      '画面要像一套完整产品，而不是一页页随机拼起来的模板。',
      '优先追求信息表达自然、节奏舒服、页面意图明确，不要为了花哨强行换版式。',
      '同一条视频允许有稳定的视觉惯性，不必为了变化把每页都做成不同结构。',
      '如果内容本身只是解释、拆分、总结、建议，优先用 list / default 这类稳定版式。',
    ],
    pageRules: [
      '每页都要有 title、可选 subtitle、type、narration、segmentIds。',
      '不要让相邻两页机械重复同一种版式，但如果内容都只是普通要点，连续使用 list / default 也比硬造数据图更好。',
      '当页数 >= 6 时，尽量使用 3-4 种不同版式即可；内容不足时不要强行凑到 5 种。',
      'default 和 list 都可以作为主体页型，不需要刻意回避；真正应该回避的是无依据的结构页。',
    ],
    typeGuidelines: [
      'hero：用在开头、转场、总述、抛观点，不要塞太多细节',
      'list：最适合普通讲解、并列要点、建议整理、原因拆分，是主力版式',
      'default：适合信息比较轻、需要留白、重点不多的一页',
      'highlight：适合少量关键词、短句提醒、强重点提炼',
      'compare：只有左右两侧真的能形成明确对照时才使用',
      'stats / chart：必须有真实数字或明确量化信息；没有数字就不要假造',
      'steps / timeline：必须真的有步骤感、阶段感或时间推进感；没有过程就不要假造',
      'quote：只在确实值得单独强调的一句结论出现时使用，不要滥用',
      '不要为了看起来高级，硬把普通文案做成比例图、数据图、进度条',
    ],
    fieldRules: [
      'hero: data 可包含 badge、cta',
      'stats: data.stats = [{ value, suffix?, label, color? }]',
      'compare: data.left / data.right / data.vsText',
      'steps: data.steps = [{ title, description? }]',
      'list: data.items = [{ icon?, text, desc? }]',
      'chart: data.bars = [{ label, value, color? }]',
      'timeline: data.timeline = [{ year, title, description? }]',
      'highlight: data.items = ["关键词"]',
      'quote: data.quote / data.author',
      'default: 使用 title / subtitle / points',
    ],
    outputExample: `{
  "slides": [
    {
      "segmentIds": ["segment-1", "segment-2"],
      "title": "...",
      "subtitle": "...",
      "type": "hero",
      "data": { "badge": "...", "cta": "..." },
      "narration": "..."
    }
  ]
}`,
  },
  LiquidShow: {
    mode: 'structured',
    role: '短视频分镜策划助手',
    objective: '输出多版式液态玻璃分镜',
    allowedTypes: ['hero', 'stats', 'compare', 'steps', 'list', 'chart', 'timeline', 'highlight', 'quote', 'default'],
    styleGoals: [
      '优先按内容语义选择版式，不要为了变化而变化。',
      '普通解释、结论展开、建议整理可以直接使用 list 或 default。',
      '只有内容确实带有数字、过程、时间顺序、对比时，才使用更强结构的版式。',
    ],
    pageRules: [
      '每页都要有 title、可选 subtitle、type、narration、segmentIds。',
      '不要让相邻两页使用同一种版式，但如果内容都只是普通要点，连续使用 list / default 也比硬造数据图更好。',
      '当页数 >= 6 时，尽量使用 3-4 种不同版式即可；内容不足时不要强行凑到 5 种。',
    ],
    typeGuidelines: [
      'hero：开场钩子或阶段总述',
      'list / default：普通说明、建议整理、结论展开',
      'compare：有明确对照关系时使用',
      'stats / chart：只适合真实数字',
      'steps / timeline：只适合真实过程与阶段',
      'highlight：关键词强化',
      'quote：关键结论收口',
    ],
    fieldRules: [
      'hero: data 可包含 badge、cta',
      'stats: data.stats = [{ value, suffix?, label, color? }]',
      'compare: data.left / data.right / data.vsText',
      'steps: data.steps = [{ title, description? }]',
      'list: data.items = [{ icon?, text, desc? }]',
      'chart: data.bars = [{ label, value, color? }]',
      'timeline: data.timeline = [{ year, title, description? }]',
      'highlight: data.items = ["关键词"]',
      'quote: data.quote / data.author',
      'default: 使用 title / subtitle / points',
    ],
    outputExample: `{
  "slides": [
    {
      "segmentIds": ["segment-1", "segment-2"],
      "title": "...",
      "subtitle": "...",
      "type": "hero",
      "data": { "badge": "...", "cta": "..." },
      "narration": "..."
    }
  ]
}`,
  },
};

function isStructuredTemplate(template: string): boolean {
  return template === 'GlassShow' || template === 'LiquidShow' || template === 'RichShow' || template === 'TechShow';
}

function usesDataOnlyStructuredSlides(template: string): boolean {
  return template === 'RichShow' || template === 'TechShow';
}

function getTemplateSlideTypes(template: string): string[] {
  if (template === 'GlassShow' || template === 'LiquidShow') {
    return ['hero', 'stats', 'compare', 'steps', 'list', 'chart', 'timeline', 'highlight', 'quote', 'default'];
  }

  if (template === 'TechShow') {
    return ['title', 'list', 'compare', 'quote', 'progress', 'stats', 'cta'];
  }

  return ['title', 'list', 'compare', 'quote', 'highlight', 'progress', 'stats', 'cta'];
}

const TECH_SHOW_MIDDLE_TYPES = ['compare', 'stats', 'progress', 'list', 'quote'] as const;
const GLASS_SHOW_TYPES = ['hero', 'stats', 'compare', 'steps', 'list', 'chart', 'timeline', 'highlight', 'quote', 'default'] as const;
const LIQUID_SHOW_TYPES = ['hero', 'stats', 'compare', 'steps', 'list', 'chart', 'timeline', 'highlight', 'quote', 'default'] as const;

function getTechShowTypeTargets(pageCount: number): string[] {
  if (pageCount <= 2) {
    return ['title', 'cta'];
  }

  const middleCount = Math.max(0, pageCount - 2);
  const preferredOrder = ['compare', 'stats', 'progress', 'list', 'quote'] as const;
  const preferredQueue = [...preferredOrder];
  const result: string[] = ['title'];
  let cursor = 0;

  for (let index = 0; index < middleCount; index += 1) {
    let nextType = preferredQueue[cursor % preferredQueue.length];
    if (index > 0 && result[result.length - 1] === nextType) {
      nextType = preferredQueue[(cursor + 1) % preferredQueue.length];
      cursor += 1;
    }
    result.push(nextType);
    cursor += 1;
  }

  result.push('cta');
  return result;
}

function getTechShowMinUniqueTypes(pageCount: number): number {
  if (pageCount >= 8) {
    return 5;
  }
  if (pageCount >= 6) {
    return 4;
  }
  if (pageCount >= 4) {
    return 3;
  }
  return 2;
}

function getTechShowDirectorBrief(pageCount: number): string {
  const targets = getTechShowTypeTargets(pageCount);
  return [
    '优先按内容语义选择版式，而不是按固定顺序轮换版式',
    `可参考节奏：${targets.join(' -> ')}，但只有内容真的适合时才采用`,
    '普通说明、建议、并列要点优先使用 list',
    '只有文本里明确出现数字、比例、阶段、对比、结论时，才使用 stats / progress / compare / quote',
    `尽量保持 ${Math.min(4, getTechShowMinUniqueTypes(pageCount))} 种左右的有效版式变化，宁可少而准，不要多而乱`,
  ].join('\n');
}

function getGlassShowTypeTargets(pageCount: number): string[] {
  if (pageCount <= 1) {
    return ['hero'];
  }

  if (pageCount === 2) {
    return ['hero', 'quote'];
  }

  const middleCount = Math.max(0, pageCount - 2);
  const preferredOrder = ['stats', 'compare', 'steps', 'list', 'timeline', 'highlight', 'chart'] as const;
  const result: string[] = ['hero'];
  let cursor = 0;

  for (let index = 0; index < middleCount; index += 1) {
    let nextType = preferredOrder[cursor % preferredOrder.length];
    if (result[result.length - 1] === nextType) {
      nextType = preferredOrder[(cursor + 1) % preferredOrder.length];
      cursor += 1;
    }
    result.push(nextType);
    cursor += 1;
  }

  result.push('quote');
  return result;
}

function getGlassShowMinUniqueTypes(pageCount: number): number {
  if (pageCount >= 8) {
    return 5;
  }
  if (pageCount >= 6) {
    return 4;
  }
  if (pageCount >= 4) {
    return 3;
  }
  return 2;
}

function getGlassShowDirectorBrief(pageCount: number): string {
  const targets = getGlassShowTypeTargets(pageCount);
  return [
    '优先按内容语义选择版式，不要为了变化而变化',
    `可参考节奏：${targets.join(' -> ')}，但不要硬套`,
    '普通解释、结论展开、建议整理可以直接使用 list 或 default',
    '只有内容确实带有数字、过程、时间顺序、对比时，才使用 stats / chart / timeline / steps / compare',
    `尽量保持 ${Math.min(4, getGlassShowMinUniqueTypes(pageCount))} 种左右的有效版式变化，宁可自然，也不要硬凑`,
  ].join('\n');
}

function getLiquidShowTypeTargets(pageCount: number): string[] {
  if (pageCount <= 1) {
    return ['hero'];
  }

  if (pageCount === 2) {
    return ['hero', 'quote'];
  }

  const middleCount = Math.max(0, pageCount - 2);
  const preferredOrder = ['stats', 'compare', 'steps', 'chart', 'timeline', 'list', 'highlight'] as const;
  const result: string[] = ['hero'];
  let cursor = 0;

  for (let index = 0; index < middleCount; index += 1) {
    let nextType = preferredOrder[cursor % preferredOrder.length];
    if (result[result.length - 1] === nextType) {
      nextType = preferredOrder[(cursor + 1) % preferredOrder.length];
      cursor += 1;
    }
    result.push(nextType);
    cursor += 1;
  }

  result.push('quote');
  return result;
}

function getLiquidShowMinUniqueTypes(pageCount: number): number {
  if (pageCount >= 8) {
    return 5;
  }
  if (pageCount >= 6) {
    return 4;
  }
  if (pageCount >= 4) {
    return 3;
  }
  return 2;
}

function getLiquidShowDirectorBrief(pageCount: number): string {
  const targets = getLiquidShowTypeTargets(pageCount);
  return [
    '优先按内容语义选择版式，不要为了变化而变化',
    `可参考节奏：${targets.join(' -> ')}，但不要硬套`,
    '普通解释、结论展开、建议整理可以直接使用 list 或 default',
    '只有内容确实带有数字、过程、时间顺序、对比时，才使用 stats / chart / timeline / steps / compare',
    `尽量保持 ${Math.min(4, getLiquidShowMinUniqueTypes(pageCount))} 种左右的有效版式变化，宁可自然，也不要硬凑`,
  ].join('\n');
}

function isComplexSlide(slide: Slide): slide is ComplexSlide {
  return 'type' in slide;
}

function detachSlideNarrationTiming<T extends Slide>(slide: T, narration: string): T {
  return {
    ...slide,
    narration,
    segmentIds: undefined,
    audioStart: undefined,
    audioEnd: undefined,
    audioDuration: undefined,
    durationInFrames: undefined,
  } as T;
}

function getProjectContentPath(template: string): string {
  return `public/projects/${template}/content.json`;
}

function getGeneratedProjectContentPath(template: string, projectId: string): string {
  return `public/projects/generated/${projectId}-${template}/content.json`;
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
    const parsed = JSON.parse(raw) as Partial<SettingsData> & {
      bailianApiKey?: string;
    };
    const legacyDashScopeApiKey = parsed.bailianApiKey || '';
    const rewriteStyles =
      Array.isArray(parsed.rewriteStyles) && parsed.rewriteStyles.length > 0
        ? parsed.rewriteStyles.filter(
            (style): style is RewriteStyle =>
              !!style &&
              typeof style.id === 'string' &&
              typeof style.name === 'string' &&
              typeof style.prompt === 'string'
          )
        : DEFAULT_REWRITE_STYLES;
    const defaultRewriteStyleId =
      typeof parsed.defaultRewriteStyleId === 'string' &&
      rewriteStyles.some((style) => style.id === parsed.defaultRewriteStyleId)
        ? parsed.defaultRewriteStyleId
        : rewriteStyles[0]?.id || DEFAULT_REWRITE_STYLES[0].id;

    return {
      voiceId: parsed.voiceId || '',
      voiceModel: parsed.voiceModel || DEFAULT_SETTINGS.voiceModel,
      voiceApiKey: parsed.voiceApiKey || legacyDashScopeApiKey,
      volcengineAppId: parsed.volcengineAppId || '',
      volcengineResourceId: parsed.volcengineResourceId || DEFAULT_SETTINGS.volcengineResourceId,
      voiceSpeechRate: normalizeSpeechRate(parsed.voiceSpeechRate),
      aiUrl: parsed.aiUrl || DEFAULT_SETTINGS.aiUrl,
      aiApiKey: parsed.aiApiKey || legacyDashScopeApiKey,
      aiModel: parsed.aiModel || DEFAULT_SETTINGS.aiModel,
      rewriteStyles,
      defaultRewriteStyleId,
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

function loadHomeDraft(): HomeDraft | null {
  const raw = localStorage.getItem(STORAGE_KEYS.homeDraft);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<HomeDraft>;
    const settings = loadSettings();
    return {
      douyinLink: parsed.douyinLink || '',
      originalText: parsed.originalText || '',
      editedText: parsed.editedText || '',
      template: parsed.template || 'SlideShow',
      selectedRewriteStyleId:
        typeof parsed.selectedRewriteStyleId === 'string' &&
        settings.rewriteStyles.some((style) => style.id === parsed.selectedRewriteStyleId)
          ? parsed.selectedRewriteStyleId
          : settings.defaultRewriteStyleId,
    };
  } catch {
    return null;
  }
}

function saveHomeDraft(draft: HomeDraft) {
  localStorage.setItem(STORAGE_KEYS.homeDraft, JSON.stringify(draft));
}

function getPagePlan(durationSeconds: number, template: string) {
  const structured = isStructuredTemplate(template);
  const targetSecondsPerPage = structured ? 6.2 : 5.4;
  const minPages = Math.max(
    structured ? 5 : 4,
    Math.ceil(durationSeconds / 7),
    Math.ceil(durationSeconds / MAX_SLIDE_DURATION_SECONDS)
  );
  const maxPages = structured ? 20 : 24;
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

function formatSegmentsForPrompt(segments: NarrationSegment[]): string {
  if (segments.length === 0) {
    return '';
  }

  // Reduce prompt size: merge adjacent short segments into semantic groups.
  const groups: Array<{
    ids: string[];
    start: number;
    end: number;
    text: string;
  }> = [];

  const sentenceEndPattern = /[。！？!?]$/;
  const maxCharsPerGroup = 34;
  const maxIdsPerGroup = 4;
  let current: {
    ids: string[];
    start: number;
    end: number;
    text: string;
  } | null = null;

  const pushCurrent = () => {
    if (!current) {
      return;
    }
    groups.push(current);
    current = null;
  };

  for (const segment of segments) {
    const segmentText = segment.text.trim();
    if (!current) {
      current = {
        ids: [segment.id],
        start: segment.start,
        end: segment.end,
        text: segmentText,
      };
    } else {
      current = {
        ids: [...current.ids, segment.id],
        start: current.start,
        end: segment.end,
        text: `${current.text}${segmentText}`.trim(),
      };
    }

    const isSentenceEnd = sentenceEndPattern.test(segmentText);
    const isLengthEnough = current.text.length >= maxCharsPerGroup;
    const isGroupSizeEnough = current.ids.length >= maxIdsPerGroup;
    if (isSentenceEnd || isLengthEnough || isGroupSizeEnough) {
      pushCurrent();
    }
  }

  pushCurrent();

  return groups
    .map((segment) => {
      const preview = segment.text.length > 40 ? `${segment.text.slice(0, 40)}...` : segment.text;
      return `- ${segment.ids.join(',')} | ${segment.start.toFixed(2)}s - ${segment.end.toFixed(
        2
      )}s | ${preview}`;
    })
    .join('\n');
}

function replaceToken(source: string, token: string, value: string): string {
  return source.split(token).join(value);
}

function formatNumberedPromptLines(lines: string[]): string {
  return lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
}

function formatBulletedPromptLines(lines: string[]): string {
  return lines.map((line) => `- ${line}`).join('\n');
}

function getTemplatePromptConfig(template: string): TemplatePromptConfig {
  return TEMPLATE_PROMPT_CONFIGS[template] || DEFAULT_TEMPLATE_PROMPT_CONFIG;
}

function getPrompt(
  template: string,
  timeline: NarrationTimeline,
  strict: boolean
): string {
  const plan = getPagePlan(timeline.duration, template);
  const config = getTemplatePromptConfig(template);
  const basePrompt = config.mode === 'structured' ? MASTER_STRUCTURED_PROMPT : MASTER_SIMPLE_PROMPT;

  let prompt = basePrompt;
  prompt = replaceToken(prompt, '{template_name}', template);
  prompt = replaceToken(prompt, '{duration_seconds}', timeline.duration.toFixed(2));
  prompt = replaceToken(prompt, '{target_pages}', String(plan.targetPages));
  prompt = replaceToken(prompt, '{min_pages}', String(plan.minPages));
  prompt = replaceToken(prompt, '{max_pages}', String(plan.maxPages));
  prompt = replaceToken(prompt, '{segments_text}', formatSegmentsForPrompt(timeline.segments));
  prompt = replaceToken(prompt, '{role}', config.role);
  prompt = replaceToken(prompt, '{objective}', config.objective);
  prompt = replaceToken(prompt, '{style_goals}', formatNumberedPromptLines(config.styleGoals));
  prompt = replaceToken(prompt, '{page_rules}', formatNumberedPromptLines(config.pageRules));
  prompt = replaceToken(prompt, '{field_rules}', formatBulletedPromptLines(config.fieldRules));
  prompt = replaceToken(prompt, '{output_example}', config.outputExample);
  prompt = replaceToken(
    prompt,
    '{allowed_types}',
    config.allowedTypes ? config.allowedTypes.join('、') : '无额外限制'
  );
  prompt = replaceToken(
    prompt,
    '{type_guidelines}',
    config.typeGuidelines ? formatBulletedPromptLines(config.typeGuidelines) : '无额外准则'
  );
  prompt = replaceToken(
    prompt,
    '{director_brief}',
    template === 'TechShow'
      ? getTechShowDirectorBrief(plan.targetPages)
      : template === 'GlassShow'
        ? getGlassShowDirectorBrief(plan.targetPages)
        : template === 'LiquidShow'
          ? getLiquidShowDirectorBrief(plan.targetPages)
        : ''
  );

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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(
        new Error(
          `${label} 超时（>${Math.round(timeoutMs / 1000)} 秒）。建议稍后重试，或缩短文案/更换更快模型。`
        )
      );
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

async function generateStoryboardTimeline(
  rawText: string,
  contentPath: string
): Promise<NarrationTimeline> {
  const settings = loadSettings();
  if (!settings.voiceId || !settings.voiceApiKey || !settings.volcengineAppId || !settings.volcengineResourceId) {
    throw new Error('请先在设置中配置语音 ID、Access Key、App ID 和 Resource ID');
  }

  const result = await invokeTauri<string>('generate_storyboard_timeline', {
    rawText,
    voiceId: settings.voiceId,
    accessKey: settings.voiceApiKey,
    appId: settings.volcengineAppId,
    resourceId: settings.volcengineResourceId,
    speechRate: normalizeSpeechRate(settings.voiceSpeechRate),
    contentPath,
  });

  return JSON.parse(result) as NarrationTimeline;
}

function normalizeSegmentIds(
  value: unknown,
  availableIds: Set<string>
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && availableIds.has(item));
}

function repairSegmentAssignments(
  rawSlides: Array<Record<string, unknown>>,
  segments: NarrationSegment[]
): string[][] {
  const ids = segments.map((segment) => segment.id);
  const available = new Set(ids);
  let cursor = 0;

  return rawSlides.map((item, index) => {
    const requested = normalizeSegmentIds(item.segmentIds, available);
    const expectedStart = ids[cursor];
    const isContiguous =
      requested.length > 0 &&
      requested.every((id, offset) => ids[cursor + offset] === id);

    if (expectedStart && isContiguous) {
      cursor += requested.length;
      return requested;
    }

    const remainingSlides = Math.max(1, rawSlides.length - index);
    const remainingSegments = Math.max(0, ids.length - cursor);
    const take = index === rawSlides.length - 1
      ? remainingSegments
      : Math.max(1, Math.floor(remainingSegments / remainingSlides));
    const assigned = ids.slice(cursor, cursor + take);
    cursor += assigned.length;
    return assigned;
  });
}

function attachTimingToSlides(
  slides: Slide[],
  segments: NarrationSegment[]
): Slide[] {
  const segmentMap = new Map(segments.map((segment) => [segment.id, segment]));

  return slides.map((slide) => {
    const ids = (slide.segmentIds || []).filter((id) => segmentMap.has(id));
    const pageSegments = ids.map((id) => segmentMap.get(id) as NarrationSegment);

    if (pageSegments.length === 0) {
      return slide;
    }

    const audioStart = pageSegments[0].start;
    const audioEnd = pageSegments[pageSegments.length - 1].end;
    const audioDuration = Math.max(0.01, audioEnd - audioStart);
    const narration = (slide.narration || '').trim() || pageSegments.map((item) => item.text).join(' ');

    return {
      ...slide,
      narration,
      segmentIds: ids,
      audioStart,
      audioEnd,
      audioDuration,
      durationInFrames: Math.max(1, Math.round(audioDuration * FPS)),
    };
  });
}

function normalizeSlides(
  rawSlides: Array<Record<string, unknown>>,
  template: string,
  segments: NarrationSegment[]
): Slide[] {
  const structured = isStructuredTemplate(template);
  const dataOnly = usesDataOnlyStructuredSlides(template);
  const assignments = repairSegmentAssignments(rawSlides, segments);

  const normalized = rawSlides.map((item, index) => {
    if (structured) {
      return {
        id: `slide-${index}`,
        type: typeof item.type === 'string' ? item.type : dataOnly ? 'title' : 'default',
        data:
          item.data && typeof item.data === 'object'
            ? (item.data as Record<string, unknown>)
            : {},
        title:
          !dataOnly && typeof item.title === 'string'
            ? item.title
            : undefined,
        subtitle:
          !dataOnly && typeof item.subtitle === 'string'
            ? item.subtitle
            : undefined,
        points:
          !dataOnly && Array.isArray(item.points)
            ? item.points.filter((point): point is string => typeof point === 'string')
            : undefined,
        badge:
          !dataOnly && typeof item.badge === 'string'
            ? item.badge
            : undefined,
        items:
          !dataOnly && Array.isArray(item.items)
            ? item.items.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
            : undefined,
        narration: typeof item.narration === 'string' ? item.narration : '',
        segmentIds: assignments[index],
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
      segmentIds: assignments[index],
    };
  });

  return attachTimingToSlides(normalized, segments);
}

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function collectSlideText(slide: Slide): string {
  const parts: string[] = [];

  if ('title' in slide && hasNonEmptyString(slide.title)) {
    parts.push(slide.title);
  }
  if ('subtitle' in slide && hasNonEmptyString(slide.subtitle)) {
    parts.push(slide.subtitle);
  }
  if ('narration' in slide && hasNonEmptyString(slide.narration)) {
    parts.push(slide.narration);
  }
  if ('points' in slide && Array.isArray(slide.points)) {
    parts.push(...slide.points.filter((item): item is string => hasNonEmptyString(item)));
  }
  if (isComplexSlide(slide)) {
    parts.push(JSON.stringify(slide.data || {}));
  }

  return parts.join(' ');
}

function hasNumberCue(text: string): boolean {
  return /\d/.test(text) || /百分之|占比|比例|数据|增长|下降|翻倍|倍|排名|Top|TOP|%/.test(text);
}

function hasProcessCue(text: string): boolean {
  return /步骤|阶段|流程|路径|先|再|然后|最后|第一|第二|第三|进阶|推进|过程|逐步|成熟度|完成度/.test(text);
}

function hasCompareCue(text: string): boolean {
  return /对比|相比|区别|不同|vs|VS|一边|另一边|优点|缺点|误区|正确|过去|现在|之前|之后/.test(text);
}

function hasQuoteCue(text: string): boolean {
  return /一句话|核心|重点|结论|记住|本质|关键|说白了|提醒/.test(text);
}

function hasListFriendlyCue(text: string): boolean {
  return /包括|主要|比如|例如|可以|建议|方法|要点|原因|优势|问题|重点|注意/.test(text);
}

function hasTechShowRequiredData(slide: Slide): boolean {
  if (!isComplexSlide(slide)) {
    return false;
  }

  const data = slide.data || {};

  switch (slide.type) {
    case 'title':
      return hasNonEmptyString(data.title);
    case 'compare':
      return (
        hasNonEmptyString((data.left as { label?: unknown } | undefined)?.label) &&
        hasNonEmptyString((data.left as { value?: unknown } | undefined)?.value) &&
        hasNonEmptyString((data.right as { label?: unknown } | undefined)?.label) &&
        hasNonEmptyString((data.right as { value?: unknown } | undefined)?.value)
      );
    case 'stats':
      return (
        hasNonEmptyString(data.title) &&
        Array.isArray(data.stats) &&
        data.stats.length >= 2
      );
    case 'progress':
      return (
        hasNonEmptyString(data.title) &&
        Array.isArray(data.bars) &&
        data.bars.length >= 2
      );
    case 'list':
      return (
        hasNonEmptyString(data.title) &&
        Array.isArray(data.items) &&
        data.items.length >= 2
      );
    case 'quote':
      return hasNonEmptyString(data.quote);
    case 'cta':
      return hasNonEmptyString(data.title) && hasNonEmptyString(data.button);
    default:
      return false;
  }
}

function shouldRetryTechShowSlides(slides: Slide[]): boolean {
  const techSlides = slides.filter(isComplexSlide);
  const types = techSlides.map((slide) => slide.type);

  if (types.length === 0) {
    return true;
  }

  if (types[0] !== 'title' || types[types.length - 1] !== 'cta') {
    return true;
  }

  const middleTypes = types.slice(1, -1);
  if (middleTypes.some((type) => !TECH_SHOW_MIDDLE_TYPES.includes(type as (typeof TECH_SHOW_MIDDLE_TYPES)[number]))) {
    return true;
  }

  for (let index = 1; index < types.length; index += 1) {
    if (types[index] === types[index - 1]) {
      return true;
    }
  }

  const uniqueTypeCount = new Set(types).size;
  if (uniqueTypeCount < getTechShowMinUniqueTypes(types.length)) {
    return true;
  }

  const listCount = middleTypes.filter((type) => type === 'list').length;
  if (listCount > Math.max(1, Math.ceil(middleTypes.length * 0.4))) {
    return true;
  }

  if (techSlides.some((slide) => !hasTechShowRequiredData(slide))) {
    return true;
  }

  if (
    techSlides.some((slide) => {
      const text = collectSlideText(slide);
      if (slide.type === 'stats') {
        return !hasNumberCue(text);
      }
      if (slide.type === 'progress') {
        return !hasProcessCue(text);
      }
      if (slide.type === 'compare') {
        return !hasCompareCue(text);
      }
      if (slide.type === 'quote') {
        return !hasQuoteCue(text);
      }
      return false;
    })
  ) {
    return true;
  }

  return false;
}

function hasGlassShowRequiredData(slide: Slide): boolean {
  if (!isComplexSlide(slide)) {
    return false;
  }

  const data = slide.data || {};

  switch (slide.type) {
    case 'hero':
      return hasNonEmptyString(slide.title) || hasNonEmptyString(data.badge) || hasNonEmptyString(data.cta);
    case 'stats':
      return Array.isArray(data.stats) && data.stats.length >= 2;
    case 'compare':
      return (
        hasNonEmptyString((data.left as { label?: unknown } | undefined)?.label) &&
        hasNonEmptyString((data.right as { label?: unknown } | undefined)?.label)
      );
    case 'steps':
      return Array.isArray(data.steps) && data.steps.length >= 2;
    case 'list':
      return Array.isArray(data.items) && data.items.length >= 2;
    case 'chart':
      return Array.isArray(data.bars) && data.bars.length >= 2;
    case 'timeline':
      return Array.isArray(data.timeline) && data.timeline.length >= 2;
    case 'highlight':
      return Array.isArray(data.items) && data.items.length >= 2;
    case 'quote':
      return hasNonEmptyString(data.quote);
    case 'default':
      return Array.isArray(slide.points) && slide.points.length >= 2;
    default:
      return false;
  }
}

function shouldRetryGlassShowSlides(slides: Slide[]): boolean {
  const glassSlides = slides.filter(isComplexSlide);
  const types = glassSlides.map((slide) => slide.type);

  if (types.length === 0) {
    return true;
  }

  if (types[0] !== 'hero') {
    return true;
  }

  for (let index = 1; index < types.length; index += 1) {
    if (types[index] === types[index - 1]) {
      return true;
    }
  }

  if (types.some((type) => !GLASS_SHOW_TYPES.includes(type as (typeof GLASS_SHOW_TYPES)[number]))) {
    return true;
  }

  const uniqueTypeCount = new Set(types).size;
  if (uniqueTypeCount < getGlassShowMinUniqueTypes(types.length)) {
    return true;
  }

  const defaultCount = types.filter((type) => type === 'default').length;
  if (defaultCount > Math.max(1, Math.floor(types.length / 3))) {
    return true;
  }

  const listCount = types.filter((type) => type === 'list').length;
  if (listCount > Math.max(1, Math.ceil(types.length * 0.35))) {
    return true;
  }

  if (glassSlides.some((slide) => !hasGlassShowRequiredData(slide))) {
    return true;
  }

  if (
    glassSlides.some((slide) => {
      const text = collectSlideText(slide);
      if (slide.type === 'stats' || slide.type === 'chart') {
        return !hasNumberCue(text);
      }
      if (slide.type === 'timeline' || slide.type === 'steps') {
        return !hasProcessCue(text);
      }
      if (slide.type === 'compare') {
        return !hasCompareCue(text);
      }
      if (slide.type === 'quote') {
        return !hasQuoteCue(text);
      }
      if (slide.type === 'highlight') {
        return !hasListFriendlyCue(text) && !hasQuoteCue(text);
      }
      return false;
    })
  ) {
    return true;
  }

  return false;
}

function hasLiquidShowRequiredData(slide: Slide): boolean {
  if (!isComplexSlide(slide)) {
    return false;
  }

  const data = slide.data || {};

  switch (slide.type) {
    case 'hero':
      return hasNonEmptyString(slide.title) || hasNonEmptyString(data.badge) || hasNonEmptyString(data.cta);
    case 'stats':
      return Array.isArray(data.stats) && data.stats.length >= 2;
    case 'compare':
      return (
        hasNonEmptyString((data.left as { label?: unknown } | undefined)?.label) &&
        hasNonEmptyString((data.left as { value?: unknown } | undefined)?.value) &&
        hasNonEmptyString((data.right as { label?: unknown } | undefined)?.label) &&
        hasNonEmptyString((data.right as { value?: unknown } | undefined)?.value)
      );
    case 'steps':
      return Array.isArray(data.steps) && data.steps.length >= 2;
    case 'list':
      return Array.isArray(data.items) && data.items.length >= 3;
    case 'chart':
      return Array.isArray(data.bars) && data.bars.length >= 2;
    case 'timeline':
      return Array.isArray(data.timeline) && data.timeline.length >= 2;
    case 'highlight':
      return Array.isArray(data.items) && data.items.length >= 3;
    case 'quote':
      return hasNonEmptyString(data.quote);
    case 'default':
      return hasNonEmptyString(slide.title) && Array.isArray(slide.points) && slide.points.length > 0;
    default:
      return false;
  }
}

function shouldRetryLiquidShowSlides(slides: Slide[]): boolean {
  const liquidSlides = slides.filter(isComplexSlide);
  const types = liquidSlides.map((slide) => slide.type);

  if (types.length === 0) {
    return true;
  }

  if (types[0] !== 'hero') {
    return true;
  }

  for (let index = 1; index < types.length; index += 1) {
    if (types[index] === types[index - 1]) {
      return true;
    }
  }

  if (types.some((type) => !LIQUID_SHOW_TYPES.includes(type as (typeof LIQUID_SHOW_TYPES)[number]))) {
    return true;
  }

  const uniqueTypeCount = new Set(types).size;
  if (uniqueTypeCount < getLiquidShowMinUniqueTypes(types.length)) {
    return true;
  }

  const defaultCount = types.filter((type) => type === 'default').length;
  const listCount = types.filter((type) => type === 'list').length;
  if (defaultCount > Math.max(1, Math.floor(types.length / 4)) || listCount > Math.ceil(types.length / 3)) {
    return true;
  }

  if (liquidSlides.some((slide) => !hasLiquidShowRequiredData(slide))) {
    return true;
  }

  if (
    liquidSlides.some((slide) => {
      const text = collectSlideText(slide);
      if (slide.type === 'stats' || slide.type === 'chart') {
        return !hasNumberCue(text);
      }
      if (slide.type === 'timeline' || slide.type === 'steps') {
        return !hasProcessCue(text);
      }
      if (slide.type === 'compare') {
        return !hasCompareCue(text);
      }
      if (slide.type === 'quote') {
        return !hasQuoteCue(text);
      }
      if (slide.type === 'highlight') {
        return !hasListFriendlyCue(text) && !hasQuoteCue(text);
      }
      return false;
    })
  ) {
    return true;
  }

  return false;
}

async function generateSlidesWithAi(
  rawText: string,
  template: string,
  timeline: NarrationTimeline
): Promise<Slide[]> {
  const settings = loadSettings();
  if (!settings.aiApiKey) {
    throw new Error('请先在设置中配置 AI API Key');
  }

  const requestSlides = async (strict: boolean): Promise<Slide[]> => {
    const result = await withTimeout(
      invokeTauri<string>('generate_slides', {
        apiUrl: settings.aiUrl,
        accessKey: settings.aiApiKey,
        model: settings.aiModel,
        prompt: getPrompt(template, timeline, strict).replace('{input_text}', rawText),
      }),
      45_000,
      strict ? 'AI 分页规划请求（严格重试）' : 'AI 分页规划请求'
    );
    const parsed = JSON.parse(result) as { slides?: Array<Record<string, unknown>> };

    if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
      throw new Error('AI 返回的 JSON 不包含 slides');
    }

    return normalizeSlides(parsed.slides, template, timeline.segments);
  };

  const plan = getPagePlan(timeline.duration, template);
  const shouldRetry = (slides: Slide[]) => {
    const durations = slides.map((slide) => slide.audioDuration || 0);
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const coveredIds = slides.flatMap((slide) => slide.segmentIds || []);
    const expectedIds = timeline.segments.map((segment) => segment.id);
    const techShowInvalid = template === 'TechShow' && shouldRetryTechShowSlides(slides);
    const glassShowInvalid = template === 'GlassShow' && shouldRetryGlassShowSlides(slides);
    const liquidShowInvalid = template === 'LiquidShow' && shouldRetryLiquidShowSlides(slides);

    return (
      slides.length < plan.targetPages ||
      maxDuration > MAX_SLIDE_DURATION_SECONDS ||
      coveredIds.length !== expectedIds.length ||
      coveredIds.some((id, index) => id !== expectedIds[index]) ||
      techShowInvalid ||
      glassShowInvalid ||
      liquidShowInvalid
    );
  };

  let slides = await requestSlides(false);
  const shouldTryStrictRetry =
    shouldRetry(slides) &&
    rawText.trim().length > 120 &&
    timeline.segments.length > 4;

  if (shouldTryStrictRetry) {
    slides = await requestSlides(true);
  }

  return slides;
}

function buildRewritePrompt(text: string, style: RewriteStyle): string {
  const template = style.prompt.trim() || DEFAULT_REWRITE_STYLES[0].prompt;
  if (template.includes('{{text}}')) {
    return template.replaceAll('{{text}}', text);
  }

  return `${template}\n\n原文案：\n${text}`;
}

async function rewriteCopyWithAi(text: string, style: RewriteStyle): Promise<string> {
  const settings = loadSettings();
  if (!settings.aiApiKey) {
    throw new Error('请先在设置中配置 AI API Key');
  }

  const result = await invokeTauri<string>('generate_slides', {
    apiUrl: settings.aiUrl,
    accessKey: settings.aiApiKey,
    model: settings.aiModel,
    prompt: buildRewritePrompt(text, style),
  });

  return result.trim();
}

async function saveSlidesToProject(project: Project) {
  const settings = loadSettings();
  const hasCompleteTiming =
    project.slides.length > 0 &&
    project.slides.every(
      (slide) =>
        typeof slide.audioStart === 'number' &&
        typeof slide.audioEnd === 'number' &&
        slide.audioEnd >= slide.audioStart
    );
  const slides = project.slides.map((slide) => {
    if (isComplexSlide(slide)) {
      const payload: Record<string, unknown> = {
        type: slide.type,
        data: slide.data,
        narration: slide.narration || '',
        segmentIds: slide.segmentIds || [],
        audioStart: slide.audioStart,
        audioEnd: slide.audioEnd,
        audioDuration: slide.audioDuration,
        durationInFrames: slide.durationInFrames,
      };

      if (typeof slide.title === 'string') {
        payload.title = slide.title;
      }
      if (typeof slide.subtitle === 'string') {
        payload.subtitle = slide.subtitle;
      }
      if (Array.isArray(slide.points)) {
        payload.points = slide.points;
      }
      if (typeof slide.badge === 'string') {
        payload.badge = slide.badge;
      }
      if (Array.isArray(slide.items)) {
        payload.items = slide.items;
      }

      return payload;
    }

    return {
      title: slide.title,
      subtitle: slide.subtitle,
      points: slide.points,
      narration: slide.narration,
      segmentIds: slide.segmentIds || [],
      audioStart: slide.audioStart,
      audioEnd: slide.audioEnd,
      audioDuration: slide.audioDuration,
      durationInFrames: slide.durationInFrames,
    };
  });

  await invokeTauri<string>('save_slides', {
    template: project.template,
    voiceId: settings.voiceId,
    rawText: project.rawText,
    slides,
    contentPath: project.contentPath,
    soundtrackPath: hasCompleteTiming
      ? project.contentPath.replace(/content\.json$/i, 'audio/narration.mp3').replace(/^public\//, '')
      : undefined,
    soundtrackDuration: hasCompleteTiming
      ? project.slides.reduce((max, slide) => Math.max(max, slide.audioEnd || 0), 0)
      : undefined,
  });
}

async function syncAudio(project: Project) {
  const settings = loadSettings();
  if (!settings.voiceId || !settings.voiceApiKey || !settings.volcengineAppId || !settings.volcengineResourceId) {
    return;
  }

  await invokeTauri<string>('generate_audio', {
    voiceId: settings.voiceId,
    accessKey: settings.voiceApiKey,
    appId: settings.volcengineAppId,
    resourceId: settings.volcengineResourceId,
    speechRate: normalizeSpeechRate(settings.voiceSpeechRate),
    contentPath: project.contentPath,
  });
}

function dockLinkStyle(active: boolean): React.CSSProperties {
  return {
    width: active ? 44 : 56,
    height: active ? 44 : 56,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? '#2563eb' : '#5f6b82',
    textDecoration: 'none',
    borderRadius: 16,
    background: active
      ? 'linear-gradient(180deg, rgba(239,244,255,0.98) 0%, rgba(220,231,255,0.96) 100%)'
      : 'transparent',
    border: active ? '1px solid rgba(141,171,255,0.6)' : '1px solid transparent',
    boxShadow: active
      ? '0 6px 16px rgba(53, 113, 231, 0.14), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -6px 12px rgba(115, 154, 255, 0.08)'
      : 'none',
    transition:
      'transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease, border-color 180ms ease, width 180ms ease, height 180ms ease',
  };
}

const SOFT_CARD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 24,
  padding: 18,
  border: '1px solid rgba(224, 231, 240, 0.92)',
  boxShadow: '0 18px 36px rgba(148, 163, 184, 0.12), inset 0 1px 0 rgba(255,255,255,0.92)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

const SOFT_INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  borderRadius: 14,
  border: '1px solid #d7e0ee',
  background: 'rgba(255,255,255,0.96)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.86)',
  fontSize: 14,
  color: '#1d2129',
  lineHeight: 1.4,
};

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  padding: '11px 18px',
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, #1f67ff 0%, #3c8cff 100%)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  boxShadow: '0 8px 18px rgba(53, 113, 231, 0.2)',
};

const PAGE_FRAME_STYLE: React.CSSProperties = {
  maxWidth: COMPACT_UI.pageMaxWidth,
  margin: '0 auto',
  padding: `16px 18px 18px`,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const PAGE_HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  maxWidth: 760,
};

const PANEL_STYLE: React.CSSProperties = {
  ...SOFT_CARD_STYLE,
  padding: 18,
  borderRadius: 24,
};

const FIELD_GROUP_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const FIELD_LABEL_STYLE: React.CSSProperties = {
  color: '#20293b',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.4,
};

const SECTION_TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  color: '#20293b',
  fontSize: 17,
  lineHeight: 1.25,
  fontWeight: 800,
};

const SECONDARY_BUTTON_STYLE: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 14,
  border: '1px solid #dbe3ef',
  background: 'rgba(255,255,255,0.96)',
  color: '#42506a',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 8px 16px rgba(148, 163, 184, 0.08)',
};

const QUIET_DANGER_BUTTON_STYLE: React.CSSProperties = {
  padding: '0 12px',
  borderRadius: 12,
  border: '1px solid rgba(245,63,63,0.22)',
  background: 'rgba(245,63,63,0.05)',
  color: '#e35252',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

function HomePage(props: {
  project: Project | null;
  onProjectChange: (project: Project | null) => void;
}) {
  const navigate = useNavigate();
  const homeDraft = React.useMemo(() => loadHomeDraft(), []);
  // 文案状态
  const [originalText, setOriginalText] = React.useState(homeDraft?.originalText || ''); // 原文案（提取的）
  const [editedText, setEditedText] = React.useState(homeDraft?.editedText || props.project?.rawText || ''); // 修改后的文案
  const [template, setTemplate] = React.useState(homeDraft?.template || props.project?.template || 'SlideShow');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState('');

  // 抖音提取状态
  const [douyinLink, setDouyinLink] = React.useState(homeDraft?.douyinLink || '');
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [isRewriting, setIsRewriting] = React.useState(false);
  const [selectedRewriteStyleId, setSelectedRewriteStyleId] = React.useState(
    () => homeDraft?.selectedRewriteStyleId || loadSettings().defaultRewriteStyleId
  );
  const rewriteStyles = loadSettings().rewriteStyles;

  React.useEffect(() => {
    if (!rewriteStyles.some((style) => style.id === selectedRewriteStyleId)) {
      setSelectedRewriteStyleId(loadSettings().defaultRewriteStyleId);
    }
  }, [rewriteStyles, selectedRewriteStyleId]);

  React.useEffect(() => {
    saveHomeDraft({
      douyinLink,
      originalText,
      editedText,
      template,
      selectedRewriteStyleId,
    });
  }, [douyinLink, originalText, editedText, template, selectedRewriteStyleId]);

  // 从设置获取 API Key
  const getApiKey = () => {
    const settings = loadSettings() as SettingsData & { bailianApiKey?: string };
    return settings.voiceApiKey || settings.aiApiKey || settings.bailianApiKey || '';
  };

  // 从抖音链接提取文案
  const handleExtractFromDouyin = async () => {
    if (!douyinLink.trim()) {
      setError('请输入抖音分享链接');
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('请先配置阿里云 DashScope API Key（在设置页面）');
      return;
    }

    setIsExtracting(true);
    setError('');
    setStatus('正在解析抖音链接...');

    try {
      // Step 1: 解析分享链接获取视频URL
      const parseResult = await invokeTauri<{ title: string; videoUrl: string; videoId: string }>('parse_douyin_url', {
        shareText: douyinLink,
      });

      setStatus(`已获取视频: ${parseResult.title}，正在转写语音...`);

      // Step 2: 调用语音转写
      const transcribeResult = await invokeTauri<{ text: string; duration: number }>('transcribe_douyin_video', {
        videoUrl: parseResult.videoUrl,
        accessKey: apiKey,
      });

      // 设置原文案和修改后的文案
      setOriginalText(transcribeResult.text);
      setEditedText(transcribeResult.text);

      setStatus(`文案提取成功！视频时长: ${Math.round(transcribeResult.duration)}秒`);
      setTimeout(() => setStatus(''), 3000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsExtracting(false);
    }
  };

  // 复制原文案到修改区
  const handleCopyToEdit = () => {
    setEditedText(originalText);
  };

  const handleRewriteCopy = async () => {
    const sourceText = (originalText || editedText).trim();
    if (!sourceText) {
      setError('请先输入或提取文案');
      return;
    }
    const settings = loadSettings();
    const selectedStyle =
      settings.rewriteStyles.find((style) => style.id === selectedRewriteStyleId) ||
      settings.rewriteStyles[0] ||
      DEFAULT_REWRITE_STYLES[0];

    setIsRewriting(true);
    setError('');
    setStatus('正在改写文案...');

    try {
      const rewritten = await rewriteCopyWithAi(sourceText, selectedStyle);
      setEditedText(rewritten);
      setStatus('文案改写完成');
      window.setTimeout(() => setStatus(''), 2500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsRewriting(false);
    }
  };

  const handleGenerate = async () => {
    if (!editedText.trim()) {
      setError('请输入完整口播文案');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const projectId = `${Date.now()}`;
      const contentPath = getGeneratedProjectContentPath(template, projectId);
      setStatus('正在生成语义时间轴...');
      const timeline = await generateStoryboardTimeline(editedText, contentPath);

      const planningStart = Date.now();
      setStatus('正在规划最终分页...（已等待 0 秒）');
      const planningTimer = window.setInterval(() => {
        const waited = Math.floor((Date.now() - planningStart) / 1000);
        setStatus(`正在规划最终分页...（已等待 ${waited} 秒）`);
      }, 5000);
      let slides: Slide[];
      try {
        slides = await generateSlidesWithAi(editedText, template, timeline);
      } finally {
        window.clearInterval(planningTimer);
      }

      const project: Project = {
        id: projectId,
        rawText: editedText,
        slides,
        template,
        contentPath,
      };

      setStatus('正在保存项目...');
      await saveSlidesToProject(project);

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
    <div style={PAGE_FRAME_STYLE}>
      <div style={PAGE_HEADER_STYLE}>
        <h2 style={{ marginTop: 0, marginBottom: 4, color: '#1d2129', fontSize: 18, letterSpacing: '-0.02em' }}>生成项目</h2>
      </div>

      {/* 抖音链接提取区域 */}
      <div style={{ ...PANEL_STYLE, width: '100%', marginBottom: 12, padding: 16 }}>
        <div style={{ display: 'flex', gap: SPACING.md, alignItems: 'flex-start' }}>
          <input
            type="text"
            placeholder="https://v.douyin.com/xxxxx 或完整分享文本..."
            value={douyinLink}
            onChange={(e) => setDouyinLink(e.target.value)}
            style={{ ...SOFT_INPUT_STYLE, flex: 1 }}
          />
          <button
            onClick={handleExtractFromDouyin}
            disabled={isExtracting}
            style={{
              ...PRIMARY_BUTTON_STYLE,
              background: isExtracting ? '#94b8ff' : '#165dff',
              cursor: isExtracting ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isExtracting ? '提取中...' : '提取文案'}
          </button>
        </div>
        {isExtracting && (
          <div style={{ marginTop: SPACING.md, padding: '12px', background: '#f2f3f5', borderRadius: 6, textAlign: 'center' }}>
            <span style={{ color: '#4e5969', fontSize: 13 }}>⏳ 正在云端转写视频语音，请稍候...</span>
          </div>
        )}
      </div>

      {/* 文案编辑区域 */}
      <div style={{ ...PANEL_STYLE, width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
        <div style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#1d2129' }}>文案编辑</h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 12,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              ...FIELD_GROUP_STYLE,
              height: '100%',
              marginTop: 0,
              padding: 14,
              borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(247,250,255,0.92) 0%, rgba(255,255,255,0.98) 100%)',
              border: '1px solid #e5eaf4',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
              <label style={FIELD_LABEL_STYLE}>原文案（提取）</label>
              <button
                onClick={handleCopyToEdit}
                disabled={!originalText}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #165dff',
                  background: 'transparent',
                  color: !originalText ? '#94a3b8' : '#165dff',
                  borderRadius: 8,
                  cursor: !originalText ? 'not-allowed' : 'pointer',
                  opacity: !originalText ? 0.6 : 1,
                }}
              >
                复制到修改区
              </button>
            </div>
            <div
              style={{
                ...SOFT_INPUT_STYLE,
                flex: 1,
                minHeight: 208,
                height: 208,
                padding: '12px 14px',
                lineHeight: 1.6,
                background: '#f7f8fa',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
              }}
            >
              {originalText || '提取后的原文案会显示在这里'}
            </div>
          </div>

          <div
            style={{
              ...FIELD_GROUP_STYLE,
              height: '100%',
              marginTop: 0,
              padding: 14,
              borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(247,250,255,0.92) 0%, rgba(255,255,255,0.98) 100%)',
              border: '1px solid #e5eaf4',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.md, flexWrap: 'nowrap', marginBottom: 10 }}>
              <label style={FIELD_LABEL_STYLE}>修改后的文案</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                <select
                  value={selectedRewriteStyleId}
                  onChange={(event) => setSelectedRewriteStyleId(event.target.value)}
                  style={{ ...SOFT_INPUT_STYLE, minWidth: 148, width: 148, padding: '8px 12px' }}
                >
                  {rewriteStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleRewriteCopy}
                  disabled={isRewriting}
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    minWidth: 108,
                    padding: '8px 14px',
                    background: isRewriting ? '#94b8ff' : '#165dff',
                    cursor: isRewriting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isRewriting ? '改写中...' : 'AI 改写'}
                </button>
              </div>
            </div>
            <textarea
              value={editedText}
              onChange={(event) => setEditedText(event.target.value)}
              rows={8}
              style={{
                ...SOFT_INPUT_STYLE,
                flex: 1,
                minHeight: 208,
                height: 208,
                padding: '12px 14px',
                lineHeight: 1.6,
                resize: 'none',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: SPACING.md,
            flexWrap: 'nowrap',
            paddingTop: 8,
            borderTop: '1px solid #edf1f7',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 0,
              flex: 1,
            }}
          >
            <label style={{ fontWeight: 600, color: '#1d2129', whiteSpace: 'nowrap', flexShrink: 0 }}>模板</label>
            <select
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
              style={{ ...SOFT_INPUT_STYLE, width: 260, maxWidth: '100%', flexShrink: 0 }}
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
              minWidth: 148,
              flexShrink: 0,
              background: loading ? '#94b8ff' : '#165dff',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '生成中...' : '开始生成'}
          </button>
        </div>

        {status ? <p style={{ margin: 0, color: '#4e5969', fontSize: 13, lineHeight: 1.6 }}>{status}</p> : null}
        {error ? <p style={{ margin: 0, color: '#f53f3f', fontSize: 13, lineHeight: 1.6 }}>{error}</p> : null}
      </div>
    </div>
  );
}

function EditorPage(props: {
  project: Project | null;
  onProjectChange: (project: Project | null) => void;
}) {
  const editorWorkspaceHeight = 'min(680px, calc(100vh - 150px))';
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<PreviewProjectData | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState('');
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

  const complex = isStructuredTemplate(project.template);
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
    const usesGlassStyleData = project.template === 'GlassShow' || project.template === 'LiquidShow';
    const nextSlide: Slide = complex
      ? {
          id: `slide-${Date.now()}`,
          type: getTemplateSlideTypes(project.template)[0] || 'title',
          title: '新页面',
          subtitle: '',
          points: [],
          badge: usesGlassStyleData ? 'NEW PAGE' : undefined,
          items: usesGlassStyleData ? [] : undefined,
          data: usesGlassStyleData ? {} : { title: '新页面', subtitle: '' },
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
    setPreviewError('');

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
      const message = cause instanceof Error ? cause.message : String(cause);
      setPreviewError(message);
      alert(message);
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewToggle = () => {
    if (showPreview) {
      setShowPreview(false);
      return;
    }

    void handlePreview();
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
    ? String((slide.title || slide.data.title || slide.data.quote || slide.type) ?? `第 ${safeIndex + 1} 页`)
    : slide.title || `第 ${safeIndex + 1} 页`;

  return (
    <div style={{ ...PAGE_FRAME_STYLE, maxWidth: 1140 }}>
      <div
        style={{
          display: 'flex',
          gap: SPACING.md,
          alignItems: 'start',
          width: '100%',
        }}
      >
        <div
          style={{
            ...SOFT_CARD_STYLE,
            padding: 0,
            width: COMPACT_UI.sidePanelWidth,
            flexShrink: 0,
            borderRadius: 22,
            minHeight: editorWorkspaceHeight,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 14px 12px',
              borderBottom: '1px solid #edf1f7',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: SPACING.md,
            }}
          >
            <span style={{ fontWeight: 700, color: '#1d2129', whiteSpace: 'nowrap' }}>页面 ({project.slides.length})</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={handleAddSlide}
                style={{ ...PRIMARY_BUTTON_STYLE, padding: '8px 16px', borderRadius: 12, fontSize: 13, cursor: 'pointer', minWidth: 88 }}
              >
                + 新增
              </button>
              <button
                onClick={handlePreviewToggle}
                disabled={previewLoading}
                style={{
                  ...PRIMARY_BUTTON_STYLE,
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  minWidth: 96,
                  background: previewLoading ? '#94b8ff' : 'linear-gradient(135deg, #07b36d 0%, #19c37d 100%)',
                  cursor: previewLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {previewLoading ? '准备中...' : showPreview ? '返回编辑' : '预览'}
              </button>
              <button
                onClick={handleRender}
                disabled={rendering}
                style={{
                  ...PRIMARY_BUTTON_STYLE,
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  minWidth: 116,
                  background: rendering ? '#94b8ff' : PRIMARY_BUTTON_STYLE.background,
                  cursor: rendering ? 'not-allowed' : 'pointer',
                }}
              >
                {rendering ? '生成中...' : '生成视频'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 6 }}>
            {project.slides.map((item, index) => {
              const title = isComplexSlide(item)
                ? String((item.title || item.data.title || item.data.quote || item.type) ?? `第 ${index + 1} 页`)
                : item.title || `第 ${index + 1} 页`;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    marginBottom: 6,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    background:
                      safeIndex === index
                        ? 'linear-gradient(180deg, rgba(232,239,255,0.98) 0%, rgba(219,229,255,0.9) 100%)'
                        : 'transparent',
                    border:
                      safeIndex === index
                        ? '1px solid rgba(167,191,255,0.56)'
                        : '1px solid transparent',
                    borderRadius: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: SPACING.sm,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#1d2129', lineHeight: 1.4 }}>{title}</span>
                  {project.slides.length > 1 ? (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteSlide(index);
                      }}
                      style={{ ...QUIET_DANGER_BUTTON_STYLE, padding: '4px 8px', fontSize: 11, flexShrink: 0 }}
                    >
                      删除
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {showPreview ? (
            <div
              style={{
                ...SOFT_CARD_STYLE,
                padding: 0,
                borderRadius: 22,
                minHeight: editorWorkspaceHeight,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #edf1f7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, color: '#1d2129' }}>预览</span>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{ ...SECONDARY_BUTTON_STYLE, padding: '8px 12px', borderRadius: 999 }}
                >
                  返回编辑
                </button>
              </div>

              <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex' }}>
                {previewLoading || !previewData ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      color: '#86909c',
                    }}
                  >
                    {previewError || '正在准备预览...'}
                  </div>
                ) : (
                  <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                    <EmbeddedPreview previewData={previewData} />
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  borderTop: '1px solid #e5e6eb',
                  fontSize: 12,
                  color: '#86909c',
                  textAlign: 'center',
                }}
              >
                当前模板: {project.template} | 预览在应用内直接播放
              </div>
            </div>
          ) : (
            <div
              style={{
                ...PANEL_STYLE,
                minHeight: editorWorkspaceHeight,
                overflow: 'auto',
              }}
            >
            <div style={{ marginBottom: SPACING.md }}>
              <h3 style={{ ...SECTION_TITLE_STYLE, marginBottom: SPACING.xs }}>{panelTitle}</h3>
              <p style={{ margin: 0, color: '#86909c', fontSize: 12, lineHeight: 1.5 }}>
                第 {safeIndex + 1} 页 / 共 {project.slides.length} 页
              </p>
            </div>

            {isComplexSlide(slide) ? (
              <>
                <div style={FIELD_GROUP_STYLE}>
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
                    style={SOFT_INPUT_STYLE}
                  >
                    {getTemplateSlideTypes(project.template).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {project.template === 'GlassShow' || project.template === 'LiquidShow' ? (
                  <>
                    <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>标题</label>
                      <input
                        value={slide.title || ''}
                        onChange={(event) => {
                          updateSlide(safeIndex, (current) => ({
                            ...(current as ComplexSlide),
                            title: event.target.value,
                          }));
                        }}
                        onBlur={() => {
                          void saveCurrentProject();
                        }}
                        style={SOFT_INPUT_STYLE}
                      />
                    </div>

                    <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>副标题</label>
                      <input
                        value={slide.subtitle || ''}
                        onChange={(event) => {
                          updateSlide(safeIndex, (current) => ({
                            ...(current as ComplexSlide),
                            subtitle: event.target.value,
                          }));
                        }}
                        onBlur={() => {
                          void saveCurrentProject();
                        }}
                        style={SOFT_INPUT_STYLE}
                      />
                    </div>

                    <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>要点</label>
                      <textarea
                        value={(slide.points || []).join('\n')}
                        onChange={(event) => {
                          const nextPoints = event.target.value
                            .split('\n')
                            .map((line) => line.trim())
                            .filter(Boolean);
                          updateSlide(safeIndex, (current) => ({
                            ...(current as ComplexSlide),
                            points: nextPoints,
                          }));
                        }}
                        onBlur={() => {
                          void saveCurrentProject();
                        }}
                        rows={5}
                        style={{ ...SOFT_INPUT_STYLE, minHeight: 128 }}
                      />
                    </div>
                  </>
                ) : null}

                <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
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
                    style={{ ...SOFT_INPUT_STYLE, minHeight: 220, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.55 }}
                  />
                </div>

                <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>旁白</label>
                  <textarea
                    value={slide.narration || ''}
                    onChange={(event) => {
                      const nextNarration = event.target.value;
                      updateSlide(safeIndex, (current) => ({
                        ...(nextNarration === (current as ComplexSlide).narration
                          ? (current as ComplexSlide)
                          : detachSlideNarrationTiming(
                              current as ComplexSlide,
                              nextNarration
                            )),
                      }));
                    }}
                    onBlur={() => {
                      void saveCurrentProject();
                    }}
                    rows={5}
                    style={{ ...SOFT_INPUT_STYLE, minHeight: 128 }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={FIELD_GROUP_STYLE}>
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
                    style={SOFT_INPUT_STYLE}
                  />
                </div>

                <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
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
                    style={SOFT_INPUT_STYLE}
                  />
                </div>

                <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>要点</label>
                  {slide.points.map((point, pointIndex) => (
                    <div key={`${slide.id}-${pointIndex}`} style={{ display: 'flex', gap: SPACING.sm, marginBottom: SPACING.sm }}>
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
                        style={{ ...SOFT_INPUT_STYLE, flex: 1 }}
                      />
                      <button
                        onClick={() => {
                          const nextPoints = slide.points.filter((_, itemIndex) => itemIndex !== pointIndex);
                          updateSlide(safeIndex, (current) => ({
                            ...(current as SimpleSlide),
                            points: nextPoints,
                          }));
                        }}
                        style={{ ...QUIET_DANGER_BUTTON_STYLE, padding: '0 14px' }}
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
                    style={{ ...SECONDARY_BUTTON_STYLE, padding: '8px 12px' }}
                  >
                    + 添加要点
                  </button>
                </div>

                <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>旁白</label>
                  <textarea
                    value={slide.narration}
                    onChange={(event) => {
                      const nextNarration = event.target.value;
                      updateSlide(safeIndex, (current) => ({
                        ...(nextNarration === (current as SimpleSlide).narration
                          ? (current as SimpleSlide)
                          : detachSlideNarrationTiming(
                              current as SimpleSlide,
                              nextNarration
                            )),
                      }));
                    }}
                    onBlur={() => {
                      void saveCurrentProject();
                    }}
                    rows={5}
                    style={{ ...SOFT_INPUT_STYLE, minHeight: 128 }}
                  />
                </div>
              </>
            )}
            {renderProgress ? (
              <p style={{ margin: `${SPACING.md}px 0 0`, fontSize: 12, color: '#86909c', lineHeight: 1.5 }}>
                {renderProgress}
              </p>
            ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function SettingsPage() {
  const [settings, setSettings] = React.useState<SettingsData>(loadSettings());
  const [saved, setSaved] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'voice' | 'ai' | 'rewrite'>('voice');
  const [editingRewriteStyleId, setEditingRewriteStyleId] = React.useState<string | null>(null);

  const updateField = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const updateRewriteStyle = (id: string, patch: Partial<RewriteStyle>) => {
    setSettings((current) => ({
      ...current,
      rewriteStyles: current.rewriteStyles.map((style) => (style.id === id ? { ...style, ...patch } : style)),
    }));
  };

  const addRewriteStyle = () => {
    const id = `rewrite-${Date.now()}`;
    setSettings((current) => ({
      ...current,
      rewriteStyles: [
        ...current.rewriteStyles,
        {
          id,
          name: `新风格 ${current.rewriteStyles.length + 1}`,
          prompt: '你是短视频文案改写助手。请把下面的原文案改写成更适合口播的视频文案。\n\n要求：输出纯文本，不要解释，不要加标题。\n\n原文案：\n{{text}}',
        },
      ],
      defaultRewriteStyleId: current.defaultRewriteStyleId || id,
    }));
    setEditingRewriteStyleId(id);
  };

  const removeRewriteStyle = (id: string) => {
    setSettings((current) => {
      if (current.rewriteStyles.length <= 1) {
        return current;
      }
      const rewriteStyles = current.rewriteStyles.filter((style) => style.id !== id);
      return {
        ...current,
        rewriteStyles,
        defaultRewriteStyleId:
          current.defaultRewriteStyleId === id ? rewriteStyles[0].id : current.defaultRewriteStyleId,
      };
    });
    setEditingRewriteStyleId((current) => (current === id ? null : current));
  };

  const settingsTabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 18px',
    borderRadius: 999,
    border: active ? '1px solid rgba(70, 118, 255, 0.35)' : '1px solid transparent',
    background: active
      ? 'linear-gradient(180deg, rgba(233,239,255,0.98) 0%, rgba(220,230,255,0.92) 100%)'
      : 'transparent',
    color: active ? '#2563eb' : '#5f6b82',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  });

  return (
    <div style={PAGE_FRAME_STYLE}>
      <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0, marginBottom: 8, color: '#1d2129', fontSize: 18, letterSpacing: '-0.02em' }}>设置</h2>

        <div style={{ ...PANEL_STYLE, display: 'flex', flexDirection: 'column', gap: SPACING.md }}>
          <div
            style={{
              display: 'inline-flex',
              gap: SPACING.xs,
              padding: 5,
              borderRadius: 999,
              background: 'rgba(243, 247, 252, 0.88)',
              border: '1px solid rgba(223, 230, 240, 0.92)',
              alignSelf: 'flex-start',
            }}
          >
            <button type="button" onClick={() => setActiveTab('voice')} style={settingsTabStyle(activeTab === 'voice')}>
              配音
            </button>
            <button type="button" onClick={() => setActiveTab('ai')} style={settingsTabStyle(activeTab === 'ai')}>
              AI 生成
            </button>
            <button type="button" onClick={() => setActiveTab('rewrite')} style={settingsTabStyle(activeTab === 'rewrite')}>
              改写风格
            </button>
          </div>

          {activeTab === 'voice' ? (
            <>
              <h3 style={{ ...SECTION_TITLE_STYLE, marginTop: 0 }}>配音</h3>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>Access Key</label>
                <input
                  type="password"
                  value={settings.voiceApiKey}
                  onChange={(event) => updateField('voiceApiKey', event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>App ID</label>
                <input
                  value={settings.volcengineAppId}
                  onChange={(event) => updateField('volcengineAppId', event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>Resource ID</label>
                <input
                  value={settings.volcengineResourceId}
                  onChange={(event) => updateField('volcengineResourceId', event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>模型</label>
                <input
                  value={settings.voiceModel}
                  onChange={(event) => updateField('voiceModel', event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>语音 ID</label>
                <input
                  value={settings.voiceId}
                  onChange={(event) => updateField('voiceId', event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>语速</label>
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
            </>
          ) : activeTab === 'ai' ? (
            <>
              <h3 style={{ ...SECTION_TITLE_STYLE, marginTop: 0 }}>AI 生成</h3>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>API Base URL</label>
                <input
                  value={settings.aiUrl}
                  onChange={(event) => updateField('aiUrl', event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>API Key</label>
                <input
                  type="password"
                  value={settings.aiApiKey}
                  onChange={(event) => updateField('aiApiKey', event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>模型名</label>
                <input
                  value={settings.aiModel}
                  onChange={(event) => updateField('aiModel', event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.md, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ ...SECTION_TITLE_STYLE, marginTop: 0, marginBottom: 6 }}>改写风格</h3>
                  <p style={{ margin: 0, color: '#86909c', fontSize: 12 }}>
                    在这里管理二创提示词模板。首页改写文案时会使用你选择的风格。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addRewriteStyle}
                  style={{ ...SECONDARY_BUTTON_STYLE, minWidth: 120, cursor: 'pointer' }}
                >
                  新增风格
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}>
                {settings.rewriteStyles.map((style) => {
                  const isDefault = settings.defaultRewriteStyleId === style.id;
                  const isEditing = editingRewriteStyleId === style.id;
                  const promptPreview = style.prompt.replace(/\s+/g, ' ').trim();
                  return (
                    <div
                      key={style.id}
                      style={{
                        border: isDefault ? '1px solid rgba(22, 93, 255, 0.28)' : '1px solid rgba(229, 230, 235, 0.92)',
                        borderRadius: 16,
                        background: isDefault ? 'rgba(232, 243, 255, 0.45)' : '#fff',
                        padding: 16,
                        }}
                      >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: SPACING.md, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          {isEditing ? (
                            <input
                              value={style.name}
                              onChange={(event) => updateRewriteStyle(style.id, { name: event.target.value })}
                              style={{ ...SOFT_INPUT_STYLE, minWidth: 220 }}
                            />
                          ) : (
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#1d2129' }}>{style.name}</div>
                          )}
                          {isDefault ? (
                            <span style={{ fontSize: 12, color: '#165dff', fontWeight: 700 }}>默认</span>
                          ) : null}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => setEditingRewriteStyleId((current) => (current === style.id ? null : style.id))}
                            style={{ ...SECONDARY_BUTTON_STYLE, padding: '8px 12px', cursor: 'pointer' }}
                          >
                            {isEditing ? '收起' : '编辑'}
                          </button>
                          {!isDefault ? (
                            <button
                              type="button"
                              onClick={() => updateField('defaultRewriteStyleId', style.id)}
                              style={{ ...SECONDARY_BUTTON_STYLE, padding: '8px 12px', cursor: 'pointer' }}
                            >
                              设为默认
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => removeRewriteStyle(style.id)}
                            disabled={settings.rewriteStyles.length <= 1}
                            style={{
                              ...QUIET_DANGER_BUTTON_STYLE,
                              padding: '8px 12px',
                              cursor: settings.rewriteStyles.length <= 1 ? 'not-allowed' : 'pointer',
                              opacity: settings.rewriteStyles.length <= 1 ? 0.5 : 1,
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <>
                          <textarea
                            value={style.prompt}
                            onChange={(event) => updateRewriteStyle(style.id, { prompt: event.target.value })}
                            rows={10}
                            style={{ ...SOFT_INPUT_STYLE, minHeight: 220, lineHeight: 1.6, marginTop: 12 }}
                          />
                          <p style={{ margin: '10px 0 0 0', color: '#86909c', fontSize: 12, lineHeight: 1.6 }}>
                            这里只写风格提示词本身。系统会自动把原文案拼接到后面。
                          </p>
                        </>
                      ) : (
                        <p style={{ margin: '12px 0 0 0', color: '#4e5969', fontSize: 13, lineHeight: 1.7 }}>
                          {promptPreview.length > 140 ? `${promptPreview.slice(0, 140)}...` : promptPreview}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
            <button
              onClick={handleSave}
              style={{ ...PRIMARY_BUTTON_STYLE, minWidth: 160, cursor: 'pointer' }}
            >
              保存设置
            </button>
            {saved ? <span style={{ color: '#00b42a', fontSize: 12 }}>已保存</span> : null}
          </div>
        </div>
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
        padding: '10px 12px 10px 6px',
        gap: 12,
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
          position: 'relative',
          zIndex: 30,
        }}
      >
        <nav
          aria-label="主导航"
          className="dock-nav"
          style={{
            width: 60,
            padding: '10px 6px',
            borderRadius: 24,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.96) 100%)',
            border: '1px solid rgba(223, 230, 240, 0.95)',
            boxShadow:
              '0 30px 60px rgba(148, 163, 184, 0.24), inset 0 1px 0 rgba(255,255,255,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            position: 'relative',
            zIndex: 30,
          }}
        >
          {NAV_ITEMS.map((item, index) => {
            const active = location.pathname === item.path;
            const isLast = index === NAV_ITEMS.length - 1;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={active ? 'dock-nav__link dock-nav__link--active' : 'dock-nav__link'}
                style={{
                  ...dockLinkStyle(active),
                  marginTop: isLast ? 12 : 0,
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
          paddingRight: 0,
        }}
      >
        <div
          style={{
            minHeight: 'calc(100vh - 20px)',
            maxWidth: COMPACT_UI.shellMaxWidth,
            margin: '0 auto',
            borderRadius: 28,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.64) 100%)',
            border: '1px solid rgba(255,255,255,0.82)',
            boxShadow: '0 16px 34px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255,255,255,0.92)',
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
