import React from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  EmbeddedPreview,
  PreviewProjectData,
} from "./remotion-preview/EmbeddedPreview";
import { prepareSlidesForRender } from "@remotion-root/templates/autoLayout";
import {
  getTemplateOrientation,
  type TemplateOrientation,
} from "@remotion-root/templates/templateSpecs";
import type {
  ContentSlide,
  ElementTiming,
} from "@remotion-root/templates/types";
import qingjianLogo from "./assets/qingjian-logo.png";

type SimpleSlide = {
  id: string;
  title: string;
  subtitle: string;
  points: string[];
  narration: string;
  layout?: string;
  type?: string;
  data?: Record<string, unknown>;
  elementTimings?: ElementTiming[];
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
  layout?: string;
  elementTimings?: ElementTiming[];
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
  voiceApiKey: string;
  volcengineAppId: string;
  volcengineAccessKey?: string;
  voiceSpeechRate: number;
  aiUrl: string;
  aiApiKey: string;
  aiModel: string;
  rewriteStyles: RewriteStyle[];
  defaultRewriteStyleId: string;
};

const DEFAULT_VOLCENGINE_RESOURCE_ID = "seed-icl-2.0";

type AuthContext = {
  hwid: string;
  deviceName: string;
};

type AuthSession = {
  token: string;
  username: string;
  hwid: string;
  deviceName: string;
  isValid: boolean;
  expireTime?: string | null;
  validMessage: string;
  heartInterval: number;
  heartbeatTimeout: number;
};

type AuthStatus = {
  username: string;
  isValid: boolean;
  isActive: boolean;
  expireTime?: string | null;
  expireTimestamp?: number | null;
  remainingSeconds: number;
  validMessage: string;
  hwid: string;
  deviceName: string;
};

type AuthHeartbeat = {
  username: string;
  isValid: boolean;
  isActive: boolean;
  expireTime?: string | null;
  validMessage: string;
  hwid: string;
  deviceName: string;
  interval: number;
  heartbeatTimeout: number;
  maxDevices: number;
  boundDevices: number;
  commands: string[];
};

type AuthRegisterResult = {
  id: number;
  username: string;
  appId: number;
  createdAt?: string;
};

type AuthTrialResult = {
  success: boolean;
  message?: string;
  addedSeconds?: number;
  expireTime?: string;
  maxDevices?: number;
  isTrial?: boolean;
};

type AuthRechargeResult = {
  success: boolean;
  message?: string;
  addedSeconds?: number;
  newExpireTime?: string;
  cardType?: string;
};

type AuthAppInfo = {
  currentVersion: string;
  latestVersion?: string | null;
  downloadUrl?: string | null;
  forceUpdate: boolean;
  hasUpdate: boolean;
  heartInterval?: number | null;
  heartbeatTimeoutMultiplier?: number | null;
  trialEnabled: boolean;
  isActive: boolean;
};

type AuthPreferences = {
  rememberPassword: boolean;
  autoLogin: boolean;
  username: string;
  password: string;
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
const APP_NAME = "轻剪";
const APP_TAGLINE = "帮助用户快速创作高质量内容";
const APP_DESCRIPTION =
  "轻剪是一款面向高质量内容创作的智能视频工具，帮助用户从原始文案、链接或素材出发，更快完成改写、分镜、配音、预览和导出。";
const DEFAULT_AUTH_PREFERENCES: AuthPreferences = {
  rememberPassword: true,
  autoLogin: false,
  username: "",
  password: "",
};

const STORAGE_KEYS = {
  project: "videomaker-project",
  settings: "videomaker-settings",
  homeDraft: "videomaker-home-draft",
  authToken: "videomaker-auth-token",
  authPreferences: "videomaker-auth-preferences",
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
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {props.children}
    </span>
  );
}

function BrandLogo(props: { size?: number; alt?: string }) {
  const size = props.size ?? 48;

  return (
    <img
      src={qingjianLogo}
      alt={props.alt ?? `${APP_NAME} Logo`}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: Math.round(size * 0.28),
        display: "block",
        boxShadow:
          "0 16px 32px rgba(148, 163, 184, 0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    />
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    label: "首页",
    icon: (
      <DockIcon>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.25 9.75V21h13.5V9.75" />
          <path d="M9.75 21v-6h4.5v6" />
        </svg>
      </DockIcon>
    ),
  },
  {
    path: "/editor",
    label: "编辑器",
    icon: (
      <DockIcon>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.25V20h.75L17.8 6.95l-1.75-1.75L3 18.25V19Z" />
          <path d="m14.95 6.25 1.75 1.75" />
          <path d="M7 20h10" />
        </svg>
      </DockIcon>
    ),
  },
  {
    path: "/settings",
    label: "设置",
    icon: (
      <DockIcon>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.05.05a1.85 1.85 0 0 1 0 2.62 1.85 1.85 0 0 1-2.62 0l-.05-.05a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.85 1.85 0 0 1-3.7 0v-.07a1 1 0 0 0-.67-.95 1 1 0 0 0-1.03.22l-.05.05a1.85 1.85 0 0 1-2.62 0 1.85 1.85 0 0 1 0-2.62l.05-.05a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.85 1.85 0 0 1 0-3.7h.07a1 1 0 0 0 .95-.67 1 1 0 0 0-.22-1.03l-.05-.05a1.85 1.85 0 0 1 0-2.62 1.85 1.85 0 0 1 2.62 0l.05.05a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.85 1.85 0 0 1 3.7 0v.07a1 1 0 0 0 .67.95 1 1 0 0 0 1.03-.22l.05-.05a1.85 1.85 0 0 1 2.62 0 1.85 1.85 0 0 1 0 2.62l-.05.05a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1.85 1.85 0 0 1 0 3.7h-.07a1 1 0 0 0-.95.67 1 1 0 0 0 .22 1.03l.05.05Z" />
        </svg>
      </DockIcon>
    ),
  },
] as const;

const TEMPLATE_OPTIONS = [
  { label: "科技风", value: "SlideShow" },
  { label: "横屏基础版", value: "SlideShowWide" },
  { label: "玻璃风", value: "GlassShow" },
  { label: "新拟态", value: "NeuShow" },
  { label: "富效果", value: "RichShow" },
  { label: "科技信息流", value: "TechShow" },
  { label: "AI 风格", value: "AIShow" },
  { label: "霓虹风", value: "NeonShow" },
  { label: "奢华风", value: "LuxeShow" },
  { label: "液态玻璃", value: "LiquidShow" },
  { label: "液态玻璃 2", value: "LiquidShow-1" },
  { label: "磨砂玻璃", value: "FrostedShow" },
] as const;

const ACTIVE_TEMPLATE_OPTIONS = [
  { label: "玻璃风 · Glass", value: "GlassShow", orientation: "portrait" },
  { label: "液态玻璃 · Liquid", value: "LiquidShow", orientation: "portrait" },
  {
    label: "液态简报 · LiquidBrief",
    value: "LiquidBriefShow",
    orientation: "portrait",
  },
  { label: "科技信息流 · Tech", value: "TechShow", orientation: "portrait" },
  {
    label: "知识讲解 · Knowledge",
    value: "KnowledgeShow",
    orientation: "portrait",
  },
  { label: "火柴人 · Stick", value: "StickShow", orientation: "portrait" },
  { label: "Mac 风 · Mac", value: "MacShow", orientation: "landscape" },
  {
    label: "演播室 · Studio Terminal",
    value: "StudioShow",
    orientation: "landscape",
  },
  {
    label: "杂志风 · Editorial Magazine",
    value: "EditorialShow",
    orientation: "landscape",
  },
  {
    label: "知识洞察 · Insight",
    value: "InsightShow",
    orientation: "landscape",
  },
] as const;

const TEMPLATE_ORIENTATION_OPTIONS: Array<{
  label: string;
  value: TemplateOrientation;
}> = [
  { label: "竖屏", value: "portrait" },
  { label: "横屏", value: "landscape" },
];

const DEFAULT_TEMPLATE = "GlassShow";
const ACTIVE_TEMPLATES: Set<string> = new Set(
  ACTIVE_TEMPLATE_OPTIONS.map((option) => option.value),
);
void TEMPLATE_OPTIONS;

function normalizeTemplate(template?: string): string {
  if (!template) {
    return DEFAULT_TEMPLATE;
  }

  return ACTIVE_TEMPLATES.has(template) ? template : DEFAULT_TEMPLATE;
}

function getDefaultTemplateForOrientation(
  orientation: TemplateOrientation,
): string {
  return (
    ACTIVE_TEMPLATE_OPTIONS.find((option) => option.orientation === orientation)
      ?.value || DEFAULT_TEMPLATE
  );
}

const DEFAULT_REWRITE_STYLES: RewriteStyle[] = [
  {
    id: "rewrite-natural",
    name: "系统默认",
    prompt: `你是短视频口播文案改写助手。请把用户提供的原文案，改写成更适合中文短视频传播的口播成稿。

你的目标不是简单润色，而是让文案在保留原意的前提下，更抓人、更顺口、更有继续听下去的欲望。

改写要求：
1. 保留原意，不要编造事实，不要加入原文没有的关键信息、数据或结论。
2. 开头 1-2 句必须更有吸引力。优先从用户痛点、常见误区、反差结果、核心收益、关键问题中选择一个切入点。
3. 不要按原文顺序平铺直叙复述。要主动调整结构，把最值得听、最有价值的信息尽量前置。
4. 文案中要自然有“推进感”，让人觉得后面还有重点。可以适度使用设问、转折、提醒、总结句，但要自然，不要夸张。
5. 删除空话、套话、重复表达和无效铺垫，让节奏更紧凑、信息更集中。
6. 语言要像真人在说话，顺口、自然、有交流感，不要像书面总结或照着稿子念。
7. 句子长短要有变化。关键句可以更短、更有力，增强口播停顿感和镜头感。
8. 如果原文表达太平，可以适度强化痛点、代价、结果感，但不能写成标题党，也不能故意制造虚假悬念。
9. 输出必须是完整的纯文本正文，不要加标题、不要分点、不要解释、不要加引号。
10. 最终结果要适合直接配音，听起来像一个会表达、懂传播的人在对观众说话。

请直接输出改写后的最终文案。`,
  },
  {
    id: "rewrite-viral",
    name: "短视频感",
    prompt: `你是短视频高留存口播文案改写助手。请把输入文案改写成更有吸引力、更有节奏感、更适合短视频传播的版本。

你的核心任务不是单纯改得通顺，而是让观众更容易停下来、听下去、记住重点。

改写要求：
1. 保留原意，不要编造事实，不要夸大原文没有的结论。
2. 开头必须更强。优先使用以下方式之一开场：
   - 先点出观众最在意的痛点
   - 先抛一个会让人想知道答案的问题
   - 先给一个反常识、反差或结果感很强的结论
   - 先说“为什么这件事和你有关”
3. 不要平铺直叙地讲完整件事，要有明显的推进感。每一小段都尽量给观众一个新的信息点、判断点或情绪点。
4. 多用观众视角表达，把客观描述改成更有代入感的说法，让观众感觉“这事和我有关”。
5. 可以适度加入设问、反问、转折、提醒句，增强节奏和停顿感，但必须自然，不能油腻，不能像低质营销号。
6. 删除弱信息、废话和重复句，把真正有价值、最能带动情绪或兴趣的内容放前面。
7. 语言要口语化、有画面感、有镜头感，像一个很会讲内容的人在面对镜头说话。
8. 可以强化痛点、冲突、代价、收益、误区这些元素，但不要故意挑衅，不要低俗，不要制造无意义争议。
9. 结尾要有收束感，最好能留下一句容易记住的话，或让观众自然产生“原来如此”的感觉。
10. 输出必须是完整纯文本，不要加标题、不要分点、不要解释、不要加引号。

最终效果应该是：
开头能抓住人，中间不塌，结尾有记忆点，整体适合直接拿去配音。`,
  },
  {
    id: "rewrite-professional",
    name: "专业清晰",
    prompt: `你是知识类短视频口播编辑。请把输入文案改写成既专业清晰、又足够吸引人的讲解型短视频文案。

注意：
不要把文案改成平淡的说明文。你要做到的是，既让人觉得你懂，又让人愿意继续听。

改写要求：
1. 保留原意，不要编造事实，不要增加原文没有的专业结论。
2. 开头先抓注意力，再进入讲解。优先使用：核心结论前置、常见误区、关键痛点、代价提醒、用户最关心的问题。
3. 逻辑必须更清楚，但不能写成教科书。要让观众觉得是在被带着理解，而不是被硬灌知识。
4. 不要只是复述原文，要主动优化结构，把最重要、最有判断价值的内容放到更前面。
5. 抽象、复杂、书面化的表达，要改成更容易听懂的“人话”，但不能因此失去专业度。
6. 可以自然加入设问句、判断句、提醒句，增强讲解感和推进感。
7. 删除重复表达、空泛描述和不影响理解的铺垫，让内容更凝练、更有重点。
8. 语言要稳、准、清晰，有可信度，同时保留短视频需要的节奏感和镜头感。
9. 不要标题党，不要浮夸，不要故意煽动情绪，但要有明确重点句和可记住的结论句。
10. 输出必须为完整纯文本，不要加标题、不要分点、不要解释、不要加引号。

最终效果应该像：
一个真正懂内容的人，用更容易传播、更容易听进去的方式，把一件事讲明白。`,
  },
];

const LEGACY_DEFAULT_REWRITE_STYLES: RewriteStyle[] = [
  {
    id: "rewrite-natural",
    name: "系统默认",
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
    id: "rewrite-viral",
    name: "短视频感",
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
    id: "rewrite-professional",
    name: "专业清晰",
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
  voiceId: "",
  voiceApiKey: "",
  volcengineAppId: "",
  voiceSpeechRate: 1,
  aiUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  aiApiKey: "",
  aiModel: "qwen-plus",
  rewriteStyles: DEFAULT_REWRITE_STYLES,
  defaultRewriteStyleId: DEFAULT_REWRITE_STYLES[0].id,
};

const NEW_REWRITE_STYLE_TEMPLATE = `你是短视频口播文案改写助手。请把输入文案改写成更适合短视频传播的版本。

要求：
1. 保留原意，不要编造事实。
2. 开头要更抓人，整体要更顺口、更有节奏。
3. 输出纯文本，不要加标题、不要分点、不要解释。

原文案：
{{text}}`;

const COMMON_SEGMENT_RULES = `
硬性要求：
1. 你必须根据 segments 做分页，不能自己虚构时间。
2. 每页必须输出 segmentIds，且 segmentIds 只能来自输入。
3. 所有 segments 必须按原顺序被完整覆盖一次，不能遗漏，不能重复，不能倒序。
4. 每页时长由该页 segmentIds 覆盖的真实时间决定，所以不要把过多 segments 塞进一页。
5. narration 必须与该页 segmentIds 覆盖的原文一致，只能做轻微口语化整理，不能跨页挪内容。
`;

const SIMPLE_PROMPT = `你是短视频分镜策划助手。请根据模板风格和语义片段时间轴，输出最终分页结果。
${COMMON_SEGMENT_RULES}
页面要求：
1. 每页输出 title、subtitle、points、narration、segmentIds。
2. 页面内容适合知识干货类短视频，表达清晰、重点明确。

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{
  "slides": [
    {
      "segmentIds": ["segment-1", "segment-2"],
      "title": "...",
      "subtitle": "...",
      "points": ["...", "..."],
      "narration": "..."
    }
  ]
}`;

const SHARED_STRUCTURED_PROMPT = `你是短视频导演，不只是负责分页，更要把内容组织成“每一页都尽量吸引人”的视频脚本。请基于语义片段时间轴输出共享版式 JSON，而不是按旧模板的固定页面结构输出。${COMMON_SEGMENT_RULES}
核心目标：
1. 不是只有第一页要抓人，而是每一页都要有继续看的理由。
2. 每一页都必须承担一个明确任务：抛钩子、给结论、做对比、给证据、拆步骤、提炼记忆点、做收束。
3. 页面不能只是重复 narration，要补充 narration 没有直接提供的视觉价值，比如反差、证据、压缩理解、结果强化。
4. 页面之间要有推进关系，不要做成一页页并列解释。
5. 标题、要点、数据都要像短视频镜头文案，不要像 PPT 说明文字。

页面吸引力原则：
1. 一页只保留一个主重点，其他内容只能辅助，不要平均用力。
2. 每一页都尽量比上一页多给一点新信息、新证据、新反差或新结论。
3. 如果某页只是普通说明，没有新的价值，就把它和相邻片段合并，或改成更有表达力的 layout。
4. 避免连续多页都只是 default / list；即使使用 default / list，也要让每页承担不同任务。
5. 不要输出没有用户价值的装饰性标签、伪 UI 标签、模板自解释文案，例如 “Hook”、“Verdict”、“Signal”、“Preview”、“Call to action” 这类词。

layout 使用原则：
1. hero：适合开场钩子、强结论、反常识、利益点、问题抛出。
2. default / list：适合普通讲解，但页面必须有清晰主重点，不要只是堆字。
3. compare：适合旧方案 vs 新方案、错误 vs 正确、前后反差、两类选择冲突。
4. stats / chart：适合真实数字、比例、量化结果、证据型内容；没有数字就不要硬造。
5. steps：适合方法拆解、流程动作、顺序执行。
6. timeline：适合阶段推进、演变过程、先后变化。
7. highlight / quote：适合金句、提醒、单句结论、记忆点。
8. cta：适合收束、行动建议、最后一步，不要只是重复前文。

节奏要求：
1. 开头优先 hero，但重点不是“必须像封面”，而是必须立刻给人停住的理由。
2. 中段必须尽量出现证据页、反差页、或拆解页，避免整条视频都在解释。
3. 结尾优先 quote / cta / highlight，用于收束和记忆点。
4. 相邻页面尽量不要机械重复同一 layout；如果连续使用同类 layout，也必须承担不同任务。
5. 全片通常保持 3-5 种有效 layout 变化就够了，宁可少而准，不要乱切。

字段约定：
- hero: title, subtitle?, data.badge?, data.cta?
- default: title, subtitle?, points
- steps: title, subtitle?, data.steps = [{ title, description? }]
- compare: title, subtitle?, data.left / data.right / data.vsText
- stats: title, subtitle?, data.stats = [{ value, suffix?, label, color? }]
- quote: title?, subtitle?, data.quote, data.author?
- list: title, subtitle?, data.items = [{ icon?, text, desc? }]
- chart: title, subtitle?, data.bars = [{ label, value, color? }]
- timeline: title, subtitle?, data.timeline = [{ year, title, description? }]
- highlight: title, subtitle?, data.items = ["关键词"]
- cta: title, subtitle?, data.cta 或 data.button

输出要求：
1. title 要短、狠、清楚，适合做页面主视觉，不要写成长句。
2. subtitle 只有在它能增强推进、解释冲突、补充证据时才写，不要每页都写。
3. points 和 data 都要服务视觉表达，不要把 narration 原文大段搬上屏幕。
4. narration 可以自然口语化，但屏幕文字必须更短、更干、更像镜头文案。
5. 如果一页没有明显主重点、没有新推进、没有新价值，就说明这页不够吸引人，应当重新组织。
6. hero 的 data.badge 默认留空；只有在它是用户一眼能理解且确实有价值的短词时才写，绝不要写“先抛问题”“关键反转”“Hook”这类导演提示词。
7. 不要使用“答案在下一页”“往下看答案”“继续往下看”这类廉价悬念引导词；如果要引导继续看，请用更具体的利益点、结果点或问题本身来吸引。

输入信息：
- 风格：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{
  "slides": [
    {
      "segmentIds": ["segment-1", "segment-2"],
      "title": "...",
      "subtitle": "...",
      "type": "list",
      "layout": "list",
      "data": {
        "items": [{ "text": "...", "desc": "..." }]
      },
      "points": ["...", "..."],
      "narration": "..."
    }
  ]
}`;

const MACSHOW_PROMPT = `你是横屏知识视频导演，目标是把内容做成“像高质量 Mac 产品发布视频一样干净、顺滑、抓人”的分镜脚本。${COMMON_SEGMENT_RULES}
导演目标：
1. 不是只把内容讲清楚，而是要让用户愿意继续看下一页。
2. 开头 1-2 页必须有明显钩子：优先结论、反常识、收益点、冲突点，不要先平铺背景介绍。
3. 中段必须出现“证据页”或“反差页”，优先使用 compare / stats / chart / timeline，而不是整条视频都落成 list。
4. 每一页都要有明确视觉任务：抛问题、给结论、做对比、给证据、拆步骤、做收束。
5. 横屏更适合双栏结构、信息主副区分、数据侧栏和产品面板感，请优先考虑这些表达。

页面节奏要求：
1. 第一页必须是 hero。
2. 最后一页优先使用 cta 或 quote。
3. 全片至少要有 3 种 layout；如果页数 >= 5，尽量做到 4 种左右。
4. 中间至少有一页来自 compare / stats / chart / timeline 之一。
5. 相邻两页不要机械重复同一种 layout，除非内容真的只适合普通解释。

可用 layout：
hero, default, steps, compare, stats, quote, list, chart, timeline, highlight, cta

各 layout 的使用建议：
- hero：只放一个强主题，一个强结论，一个强钩子
- list/default：用于普通讲解，但不要连续过多
- compare：用于旧方案 vs 新方案、错误做法 vs 正确做法、前后反差
- stats/chart：用于明确数字、比例、量化结果
- steps：用于方法拆解、流程路径
- timeline：用于演进过程、阶段推进、顺序变化
- quote：用于一句话结论或关键提醒
- cta：用于结尾动作和收束

输出要求：
1. 标题尽量短，适合大字号展示。
2. subtitle 只在确实能增强推进时才写，不要每页都写。
3. points 和 data 都要服务于视觉表达，不要把 narration 原文大段搬上屏幕。
4. narration 保持自然口播感，但页面文案要更凝练、更像镜头字幕。

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{
  "slides": [
    {
      "segmentIds": ["segment-1"],
      "title": "...",
      "subtitle": "...",
      "type": "hero",
      "layout": "hero",
      "data": {
        "badge": "...",
        "cta": "..."
      },
      "points": ["..."],
      "narration": "..."
    }
  ]
}`;

const RICH_PROMPT = `你是短视频分镜策划助手。请根据 RichShow 模板风格和语义片段时间轴，输出多版式分镜。
${COMMON_SEGMENT_RULES}
页面要求：
1. 第一页必须是 title，最后一页必须是 cta。
2. 中间页面可以使用：list、compare、quote、highlight、progress、stats。
3. 每页版式要和内容类型匹配。

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{
  "slides": [
    {
      "segmentIds": ["segment-1"],
      "type": "title",
      "data": { "title": "...", "subtitle": "..." },
      "narration": "..."
    }
  ]
}`;

const TECH_PROMPT = `你是短视频分镜策划助手。请根据 TechShow 模板风格和语义片段时间轴，输出科技信息流分镜。
${COMMON_SEGMENT_RULES}
导演编排要求：
{director_brief}

页面要求：
1. 第一页必须是 title，最后一页必须是 cta。
2. 中间页面只能使用：list、stats、progress、compare、quote。
3. 不要让相邻两页使用同一种版式，但也不要为了“凑变化”硬切版式。
4. 版式选择优先服从内容表达，不要为了炫技强行做成数据页、比例页、进度页。
5. list 是默认优先版式；只有内容明确适合时才使用 stats / progress / compare / quote。
6. 当页数 >= 6 时，尽量使用 3-4 种不同版式即可；只有内容确实支持时再更多变化。
7. 每页版式必须和信息类型匹配：
- compare：适合前后方案、旧新方法、常见误区 vs 正确做法
- stats：只适合文本里明确出现数字、占比、规模、效果时；没有数字就不要硬造比例
- progress：只适合阶段、路径、成熟度、完成度、步骤推进；没有“进程感”就不要使用
- list：适合并列要点、结论拆分、建议整理，是最稳妥的中性版式
- quote：适合一句关键结论、提醒、收口
8. 如果一段内容只是普通讲解，没有明显数字、对比或阶段结构，请优先使用 list，而不是 stats / progress。
9. 列表项可使用 "01"、"02"、"03" 这类编号。

字段约定：
- title: data = { title, subtitle? }
- compare: data = { title, left: { label, value }, right: { label, value } }
- stats: data = { title, stats: [{ value, suffix?, label }] }
- progress: data = { title, bars: [{ label, percent }] }
- list: data = { title, items: [{ icon?, text, desc? }] }
- quote: data = { quote, author }
- cta: data = { title, subtitle?, button }

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{
  "slides": [
    {
      "segmentIds": ["segment-1"],
      "type": "title",
      "data": { "title": "...", "subtitle": "..." },
      "narration": "..."
    }
  ]
}`;

const GLASS_PROMPT = `你是一个有审美判断的短视频导演兼信息设计师。请根据 GlassShow 模板风格和语义片段时间轴，输出“像真实产品团队做出来的”玻璃风分镜，而不是机械套模板。
${COMMON_SEGMENT_RULES}
导演编排要求：
{director_brief}

整体风格目标：
1. 画面要像一套完整产品，而不是一页页随机拼起来的模板。
2. 优先追求信息表达自然、节奏舒服、页面意图明确，不要为了花哨强行换版式。
3. 每一页都先判断“这一页想表达什么”，再决定 type；不要先想 type 再硬塞内容。
4. 同一条视频里允许有稳定的视觉惯性，不必为了变化把每页都做成不同结构。
5. 如果内容本身只是解释、拆分、总结、建议，优先用 list / default 这类稳定版式。
6. 只有当内容真的存在数字、对比、阶段、时间顺序、结论金句时，才使用更强结构的版式。

页面要求：
1. 页面类型只能使用：hero、stats、compare、steps、list、chart、timeline、highlight、quote、default。
2. 每页都要有 title、可选 subtitle、type、narration、segmentIds。
3. 优先让版式和内容匹配，不要为了“显得丰富”硬塞 chart、stats、timeline。
4. 不要让相邻两页机械重复同一种版式，但如果内容都只是普通要点，连续使用 list / default 也比硬造数据图更好。
5. 当页数 >= 6 时，尽量使用 3-4 种不同版式即可；内容不足时不要强行凑到 5 种。
6. hero 只适合开场钩子、立题、阶段总述；quote 适合关键结论；timeline 适合有明显时间顺序或演变过程；steps 适合有清晰拆解关系；stats / chart 只适合真实数据。
7. default 和 list 都可以作为主体页型，不需要刻意回避；真正应该回避的是“无依据的结构页”。
8. 如果没有真实数字，就不要使用 stats / chart；如果没有明显过程，就不要使用 timeline / steps；如果没有明显对照关系，就不要使用 compare。

版式判断准则：
- hero：用在开头、转场、总述、抛观点，不要塞太多细节
- list：最适合普通讲解、并列要点、建议整理、原因拆分，是 GlassShow 的主力版式
- default：适合信息比较轻、需要留白、重点不多的一页
- highlight：适合少量关键词、短句提醒、强重点提炼
- compare：只有左右两侧真的能形成明确对照时才使用
- stats / chart：必须有真实数字或明确量化信息；没有数字就不要假造
- steps / timeline：必须真的有步骤感、阶段感或时间推进感；没有过程就不要假造
- quote：只在确实值得单独强调的一句结论出现时使用，不要滥用

负面约束：
1. 不要为了看起来高级，硬把普通文案做成比例图、数据图、进度条。
2. 不要把一句普通结论强行包装成 quote。
3. 不要把缺乏时间顺序的内容写成 timeline。
4. 不要把普通并列观点伪装成 compare。
5. 不要输出“样式很丰富但信息很空”的页面。

输出偏好：
1. 宁可少一点版式变化，也要保证每一页看起来合理、自然、像同一个产品。
2. 页面标题要像真实成片里的标题，不要像 PPT 小标题。
3. subtitle 只有在能增强气质或补充语义时才写，不要每页硬写。
4. narration 要和页面内容高度一致，不能页面很花、口播却很平。

字段约定：
- hero: data 可包含 badge、cta
- stats: data.stats = [{ value, suffix?, label, color? }]
- compare: data.left / data.right / data.vsText
- steps: data.steps = [{ title, description? }]
- list: data.items = [{ icon?, text, desc? }]
- chart: data.bars = [{ label, value, color? }]
- timeline: data.timeline = [{ year, title, description? }]
- highlight: data.items = ["关键词"]
- quote: data.quote / data.author
- default: 使用 title / subtitle / points

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{
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
}`;

const LIQUID_PROMPT = `你是短视频分镜策划助手。请根据 LiquidShow 模板风格和语义片段时间轴，输出多版式液态玻璃分镜。
${COMMON_SEGMENT_RULES}
导演编排要求：
{director_brief}

页面要求：
1. 页面类型只能使用：hero、stats、compare、steps、list、chart、timeline、highlight、quote、default。
2. 每页都要有 title、可选 subtitle、type、narration、segmentIds。
3. 优先让版式和内容匹配，不要为了“显得丰富”硬塞 chart、stats、timeline。
4. 不要让相邻两页使用同一种版式，但如果内容都只是普通要点，连续使用 list / default 也比硬造数据图更好。
5. 当页数 >= 6 时，尽量使用 3-4 种不同版式即可；内容不足时不要强行凑到 5 种。
6. hero 只适合开场钩子或阶段总述；quote 适合关键结论；timeline 适合过程；steps 适合拆解；stats / chart 只适合真实数据。
7. default 和 list 都可以作为正常主体页型，不需要刻意回避；真正应该回避的是“无依据的结构页”。
8. 如果没有真实数字，就不要使用 stats / chart；如果没有明显过程，就不要使用 timeline / steps。

字段约定：
- hero: data 可包含 badge、cta
- stats: data.stats = [{ value, suffix?, label, color? }]
- compare: data.left / data.right / data.vsText
- steps: data.steps = [{ title, description? }]
- list: data.items = [{ icon?, text, desc? }]
- chart: data.bars = [{ label, value, color? }]
- timeline: data.timeline = [{ year, title, description? }]
- highlight: data.items = ["关键词"]
- quote: data.quote / data.author
- default: 使用 title / subtitle / points

输入信息：
- 模板：{template_name}
- 音频总时长：{duration_seconds} 秒
- 建议页数：{target_pages} 页，可在 {min_pages}-{max_pages} 之间调整
- 语义片段时间轴：
{segments_text}

只输出 JSON：
{
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
}`;

function isStructuredTemplate(template: string): boolean {
  return (
    template === "GlassShow" ||
    template === "LiquidShow" ||
    template === "LiquidBriefShow" ||
    template === "MacShow" ||
    template === "StudioShow" ||
    template === "EditorialShow" ||
    template === "InsightShow" ||
    template === "StickShow" ||
    template === "TechShow" ||
    template === "KnowledgeShow"
  );
}

function getTemplateSlideTypes(template: string): string[] {
  if (!isStructuredTemplate(template)) {
    return ["default"];
  }

  return [
    "hero",
    "default",
    "steps",
    "compare",
    "stats",
    "quote",
    "list",
    "chart",
    "timeline",
    "highlight",
    "cta",
  ];
}

const TECH_SHOW_MIDDLE_TYPES = [
  "compare",
  "stats",
  "progress",
  "list",
  "quote",
] as const;
const GLASS_SHOW_TYPES = [
  "hero",
  "stats",
  "compare",
  "steps",
  "list",
  "chart",
  "timeline",
  "highlight",
  "quote",
  "default",
] as const;
const LIQUID_SHOW_TYPES = [
  "hero",
  "stats",
  "compare",
  "steps",
  "list",
  "chart",
  "timeline",
  "highlight",
  "quote",
  "default",
] as const;

function getTechShowTypeTargets(pageCount: number): string[] {
  if (pageCount <= 2) {
    return ["title", "cta"];
  }

  const middleCount = Math.max(0, pageCount - 2);
  const preferredOrder = [
    "compare",
    "stats",
    "progress",
    "list",
    "quote",
  ] as const;
  const preferredQueue = [...preferredOrder];
  const result: string[] = ["title"];
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

  result.push("cta");
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
    "优先按内容语义选择版式，而不是按固定顺序轮换版式",
    `可参考节奏：${targets.join(" -> ")}，但只有内容真的适合时才采用`,
    "普通说明、建议、并列要点优先使用 list",
    "只有文本里明确出现数字、比例、阶段、对比、结论时，才使用 stats / progress / compare / quote",
    `尽量保持 ${Math.min(4, getTechShowMinUniqueTypes(pageCount))} 种左右的有效版式变化，宁可少而准，不要多而乱`,
  ].join("\n");
}

function getGlassShowTypeTargets(pageCount: number): string[] {
  if (pageCount <= 1) {
    return ["hero"];
  }

  if (pageCount === 2) {
    return ["hero", "quote"];
  }

  const middleCount = Math.max(0, pageCount - 2);
  const preferredOrder = [
    "stats",
    "compare",
    "steps",
    "list",
    "timeline",
    "highlight",
    "chart",
  ] as const;
  const result: string[] = ["hero"];
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

  result.push("quote");
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
    "优先按内容语义选择版式，不要为了变化而变化",
    `可参考节奏：${targets.join(" -> ")}，但不要硬套`,
    "普通解释、结论展开、建议整理可以直接使用 list 或 default",
    "只有内容确实带有数字、过程、时间顺序、对比时，才使用 stats / chart / timeline / steps / compare",
    `尽量保持 ${Math.min(4, getGlassShowMinUniqueTypes(pageCount))} 种左右的有效版式变化，宁可自然，也不要硬凑`,
  ].join("\n");
}

function getLiquidShowTypeTargets(pageCount: number): string[] {
  if (pageCount <= 1) {
    return ["hero"];
  }

  if (pageCount === 2) {
    return ["hero", "quote"];
  }

  const middleCount = Math.max(0, pageCount - 2);
  const preferredOrder = [
    "stats",
    "compare",
    "steps",
    "chart",
    "timeline",
    "list",
    "highlight",
  ] as const;
  const result: string[] = ["hero"];
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

  result.push("quote");
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
    "优先按内容语义选择版式，不要为了变化而变化",
    `可参考节奏：${targets.join(" -> ")}，但不要硬套`,
    "普通解释、结论展开、建议整理可以直接使用 list 或 default",
    "只有内容确实带有数字、过程、时间顺序、对比时，才使用 stats / chart / timeline / steps / compare",
    `尽量保持 ${Math.min(4, getLiquidShowMinUniqueTypes(pageCount))} 种左右的有效版式变化，宁可自然，也不要硬凑`,
  ].join("\n");
}

function getMacShowTypeTargets(pageCount: number): string[] {
  if (pageCount <= 1) {
    return ["hero"];
  }

  if (pageCount === 2) {
    return ["hero", "cta"];
  }

  const middleCount = Math.max(0, pageCount - 2);
  const preferredOrder = [
    "compare",
    "stats",
    "steps",
    "chart",
    "list",
    "timeline",
    "highlight",
  ] as const;
  const result: string[] = ["hero"];
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

  result.push("cta");
  return result;
}

function getMacShowDirectorBrief(pageCount: number): string {
  const targets = getMacShowTypeTargets(pageCount);
  return [
    "开头必须像横屏产品视频的钩子页，而不是普通封面",
    `可参考节奏：${targets.join(" -> ")}，但要服从内容本身`,
    "中段优先安排至少一页证据页或反差页，优先 compare / stats / chart / timeline",
    "list 和 default 只用于解释，不要让它们占满整条视频",
    "结尾要有明确收束，优先 cta，其次 quote",
  ].join("\n");
}

function isComplexSlide(slide: Slide): slide is ComplexSlide {
  return "type" in slide;
}

function detachSlideNarrationTiming<T extends Slide>(
  slide: T,
  narration: string,
): T {
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

function getSlideLayout(slide: Slide): string {
  if (isComplexSlide(slide)) {
    return slide.layout || slide.type || "default";
  }

  return slide.layout || slide.type || "default";
}

function splitEditorLine(line: string): {
  title: string;
  description?: string;
} {
  const parts = line
    .split(/[：:]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return { title: line.trim() };
  }

  return {
    title: parts[0],
    description: parts.slice(1).join("："),
  };
}

function getComplexSlideEditorPoints(slide: ComplexSlide): string[] {
  if (Array.isArray(slide.points) && slide.points.length > 0) {
    return slide.points;
  }

  const layout = getSlideLayout(slide);
  const data = slide.data || {};

  if (layout === "compare") {
    const lines: string[] = [];
    const left = data.left as Record<string, unknown> | undefined;
    const right = data.right as Record<string, unknown> | undefined;

    if (left) {
      const label = typeof left.label === "string" ? left.label : "左侧";
      const value =
        typeof left.value === "string"
          ? left.value
          : typeof left.title === "string"
            ? left.title
            : "";
      if (value) lines.push(`${label}：${value}`);
    }

    if (right) {
      const label = typeof right.label === "string" ? right.label : "右侧";
      const value =
        typeof right.value === "string"
          ? right.value
          : typeof right.title === "string"
            ? right.title
            : "";
      if (value) lines.push(`${label}：${value}`);
    }

    return lines;
  }

  if (layout === "stats" && Array.isArray(data.stats)) {
    return data.stats
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const record = item as Record<string, unknown>;
        const value = record.value ?? "";
        const suffix = typeof record.suffix === "string" ? record.suffix : "";
        const label = typeof record.label === "string" ? record.label : "";
        return `${label}：${value}${suffix}`.trim();
      })
      .filter(Boolean);
  }

  if (layout === "chart" && Array.isArray(data.bars)) {
    return data.bars
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const record = item as Record<string, unknown>;
        const label = typeof record.label === "string" ? record.label : "";
        const value = record.percent ?? record.value ?? "";
        return `${label}：${value}`.trim();
      })
      .filter(Boolean);
  }

  if (layout === "steps" && Array.isArray(data.steps)) {
    return data.steps
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const record = item as Record<string, unknown>;
        const title = typeof record.title === "string" ? record.title : "";
        const description =
          typeof record.description === "string" ? record.description : "";
        return description ? `${title}：${description}` : title;
      })
      .filter(Boolean);
  }

  if (layout === "timeline" && Array.isArray(data.timeline)) {
    return data.timeline
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const record = item as Record<string, unknown>;
        const year = typeof record.year === "string" ? record.year : "";
        const title = typeof record.title === "string" ? record.title : "";
        const description =
          typeof record.description === "string" ? record.description : "";
        const main = [year, title].filter(Boolean).join("：");
        return description ? `${main}：${description}` : main;
      })
      .filter(Boolean);
  }

  if (layout === "list" && Array.isArray(data.items)) {
    return data.items
      .map((item) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return "";
        const record = item as Record<string, unknown>;
        const text =
          typeof record.text === "string"
            ? record.text
            : typeof record.title === "string"
              ? record.title
              : "";
        const desc =
          typeof record.desc === "string"
            ? record.desc
            : typeof record.description === "string"
              ? record.description
              : "";
        return desc ? `${text}：${desc}` : text;
      })
      .filter(Boolean);
  }

  if (layout === "highlight" && Array.isArray(data.highlights)) {
    return data.highlights
      .map((item) => {
        if (typeof item === "string") return item;
        if (
          item &&
          typeof item === "object" &&
          typeof (item as { text?: unknown }).text === "string"
        ) {
          return (item as { text: string }).text;
        }
        return "";
      })
      .filter(Boolean);
  }

  if (layout === "quote" && Array.isArray(data.tags)) {
    return data.tags.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
  }

  if (layout === "hero" || layout === "cta") {
    const extras: string[] = [];
    if (typeof data.badge === "string" && data.badge.trim())
      extras.push(data.badge);
    const ctaText =
      typeof data.button === "string"
        ? data.button
        : typeof data.cta === "string"
          ? data.cta
          : "";
    if (ctaText.trim()) extras.push(ctaText);
    return extras;
  }

  return [];
}

function parseMetricLine(
  line: string,
  index: number,
): { label: string; value: number; suffix?: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/(\d+(?:[.,]\d+)?)(\s*[%a-zA-Z\u4e00-\u9fa5]*)/);
  if (!match || match.index === undefined) {
    return null;
  }

  const value = Number(match[1].replace(",", "."));
  if (Number.isNaN(value)) return null;

  const suffix = match[2]?.trim() || undefined;
  const label =
    `${trimmed.slice(0, match.index)} ${trimmed.slice(match.index + match[0].length)}`
      .replace(/\s+/g, " ")
      .replace(/^[：:\-]+|[：:\-]+$/g, "")
      .trim();

  return {
    label: label || `数据 ${index + 1}`,
    value,
    suffix,
  };
}

function syncComplexSlideForEditor(slide: ComplexSlide): ComplexSlide {
  const layout = getSlideLayout(slide);
  const points = Array.isArray(slide.points)
    ? slide.points.map((point) => point.trim()).filter(Boolean)
    : [];

  let data: Record<string, unknown> = {};

  switch (layout) {
    case "hero": {
      data = {
        badge: points[0] || undefined,
        cta: points[1] || undefined,
      };
      break;
    }
    case "compare": {
      const left = splitEditorLine(points[0] || "");
      const right = splitEditorLine(points[1] || "");
      data = {
        left: {
          label: left.title || "左侧",
          value: left.description || left.title || "",
          title: left.description || left.title || "",
          desc: left.description,
        },
        right: {
          label: right.title || "右侧",
          value: right.description || right.title || "",
          title: right.description || right.title || "",
          desc: right.description,
        },
        centerLabel: "VS",
      };
      break;
    }
    case "stats": {
      data = {
        stats: points
          .map((point, index) => parseMetricLine(point, index))
          .filter(
            (item): item is NonNullable<ReturnType<typeof parseMetricLine>> =>
              item !== null,
          )
          .map((item) => ({
            label: item.label,
            value: item.value,
            suffix: item.suffix,
            note: "",
          })),
      };
      break;
    }
    case "chart": {
      const bars = points
        .map((point, index) => parseMetricLine(point, index))
        .filter(
          (item): item is NonNullable<ReturnType<typeof parseMetricLine>> =>
            item !== null,
        )
        .map((item) => ({
          label: item.label,
          percent: item.value,
          value: item.value,
        }));

      data = {
        bars,
        chart: {
          type: "progress",
          values: bars.map((item) => ({
            label: item.label,
            value: item.percent,
          })),
        },
      };
      break;
    }
    case "steps": {
      data = {
        steps: points.map((point) => {
          const parsed = splitEditorLine(point);
          return {
            title: parsed.title,
            description: parsed.description,
          };
        }),
      };
      break;
    }
    case "timeline": {
      data = {
        timeline: points.map((point, index) => {
          const parsed = splitEditorLine(point);
          return {
            year: parsed.title || String(index + 1).padStart(2, "0"),
            title: parsed.description || parsed.title,
            description: parsed.description ? undefined : undefined,
          };
        }),
      };
      break;
    }
    case "list": {
      data = {
        items: points.map((point, index) => {
          const parsed = splitEditorLine(point);
          return {
            icon: String(index + 1).padStart(2, "0"),
            text: parsed.title,
            desc: parsed.description,
          };
        }),
      };
      break;
    }
    case "highlight": {
      data = {
        highlights: points.map((point) => ({ text: point })),
        items: points,
      };
      break;
    }
    case "quote": {
      data = {
        quote: slide.title || "",
        author: slide.subtitle || "",
        tags: points,
      };
      break;
    }
    case "cta": {
      const ctaText = points[0] || "";
      data = {
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        cta: ctaText,
        button: ctaText,
      };
      break;
    }
    default: {
      data = {};
    }
  }

  return {
    ...slide,
    layout,
    type: layout,
    data,
  };
}

function getComplexEditorLabels(slide: ComplexSlide): {
  title: string;
  subtitle: string;
  points: string;
} {
  const layout = getSlideLayout(slide);

  switch (layout) {
    case "quote":
      return { title: "引用内容", subtitle: "署名 / 来源", points: "标签" };
    case "cta":
      return { title: "收尾标题", subtitle: "补充说明", points: "按钮文案" };
    case "hero":
      return { title: "标题", subtitle: "副标题", points: "补充信息" };
    case "compare":
      return { title: "标题", subtitle: "副标题", points: "左右对比内容" };
    case "stats":
      return { title: "标题", subtitle: "副标题", points: "数据项" };
    case "chart":
      return { title: "标题", subtitle: "副标题", points: "图表项" };
    case "steps":
      return { title: "标题", subtitle: "副标题", points: "步骤内容" };
    case "timeline":
      return { title: "标题", subtitle: "副标题", points: "时间线内容" };
    case "highlight":
      return { title: "标题", subtitle: "副标题", points: "重点内容" };
    default:
      return { title: "标题", subtitle: "副标题", points: "页面内容" };
  }
}

function getProjectContentPath(template: string): string {
  return `public/projects/${template}/content.json`;
}

function getGeneratedProjectContentPath(
  template: string,
  projectId: string,
): string {
  return `public/projects/generated/${projectId}-${template}/content.json`;
}

function normalizeSpeechRate(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
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
    const legacyDashScopeApiKey = parsed.bailianApiKey || "";
    const parsedRewriteStyles =
      Array.isArray(parsed.rewriteStyles) && parsed.rewriteStyles.length > 0
        ? parsed.rewriteStyles.filter(
            (style): style is RewriteStyle =>
              !!style &&
              typeof style.id === "string" &&
              typeof style.name === "string" &&
              typeof style.prompt === "string",
          )
        : [];
    const shouldUpgradeLegacyRewriteStyles =
      parsedRewriteStyles.length > 0 &&
      parsedRewriteStyles.length === LEGACY_DEFAULT_REWRITE_STYLES.length &&
      parsedRewriteStyles.every((style, index) => {
        const legacyStyle = LEGACY_DEFAULT_REWRITE_STYLES[index];
        return (
          style.id === legacyStyle.id &&
          style.name === legacyStyle.name &&
          style.prompt.trim() === legacyStyle.prompt.trim()
        );
      });
    const rewriteStyles =
      parsedRewriteStyles.length === 0 || shouldUpgradeLegacyRewriteStyles
        ? DEFAULT_REWRITE_STYLES
        : parsedRewriteStyles;
    const defaultRewriteStyleId =
      typeof parsed.defaultRewriteStyleId === "string" &&
      rewriteStyles.some((style) => style.id === parsed.defaultRewriteStyleId)
        ? parsed.defaultRewriteStyleId
        : rewriteStyles[0]?.id || DEFAULT_REWRITE_STYLES[0].id;

    const nextSettings = {
      voiceId: parsed.voiceId || "",
      voiceApiKey: parsed.voiceApiKey || legacyDashScopeApiKey,
      volcengineAppId: parsed.volcengineAppId || "",
      voiceSpeechRate: normalizeSpeechRate(parsed.voiceSpeechRate),
      aiUrl: parsed.aiUrl || DEFAULT_SETTINGS.aiUrl,
      aiApiKey: parsed.aiApiKey || legacyDashScopeApiKey,
      aiModel: parsed.aiModel || DEFAULT_SETTINGS.aiModel,
      rewriteStyles,
      defaultRewriteStyleId,
    };

    if (shouldUpgradeLegacyRewriteStyles) {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(nextSettings));
    }

    return nextSettings;
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
    const template = normalizeTemplate(parsed.template);
    return {
      ...parsed,
      template,
      contentPath: parsed.contentPath || getProjectContentPath(template),
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
      douyinLink: parsed.douyinLink || "",
      originalText: parsed.originalText || "",
      editedText: parsed.editedText || "",
      template: normalizeTemplate(parsed.template),
      selectedRewriteStyleId:
        typeof parsed.selectedRewriteStyleId === "string" &&
        settings.rewriteStyles.some(
          (style) => style.id === parsed.selectedRewriteStyleId,
        )
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

function loadAuthToken(): string | null {
  const raw = localStorage.getItem(STORAGE_KEYS.authToken);
  if (!raw) {
    return null;
  }

  const token = raw.trim();
  return token ? token : null;
}

function saveAuthToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.authToken, token);
}

function clearAuthToken() {
  localStorage.removeItem(STORAGE_KEYS.authToken);
}

function normalizeAuthPreferences(
  value: Partial<AuthPreferences> | null | undefined,
): AuthPreferences {
  const rememberPassword =
    value?.rememberPassword ?? DEFAULT_AUTH_PREFERENCES.rememberPassword;
  const requestedAutoLogin =
    value?.autoLogin ?? DEFAULT_AUTH_PREFERENCES.autoLogin;
  const username = typeof value?.username === "string" ? value.username : "";
  const password =
    rememberPassword && typeof value?.password === "string"
      ? value.password
      : "";
  const autoLogin = rememberPassword ? requestedAutoLogin : false;

  return {
    rememberPassword,
    autoLogin,
    username,
    password,
  };
}

function shouldPersistAuthToken(preferences: AuthPreferences) {
  return preferences.rememberPassword && preferences.autoLogin;
}

function loadAuthPreferences(): AuthPreferences {
  const raw = localStorage.getItem(STORAGE_KEYS.authPreferences);
  if (!raw) {
    return DEFAULT_AUTH_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthPreferences>;
    return normalizeAuthPreferences(parsed);
  } catch {
    return DEFAULT_AUTH_PREFERENCES;
  }
}

function saveAuthPreferences(preferences: AuthPreferences) {
  localStorage.setItem(
    STORAGE_KEYS.authPreferences,
    JSON.stringify(normalizeAuthPreferences(preferences)),
  );
}

function formatRemainingSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "已过期";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days} 天 ${hours} 小时`;
  }
  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  }
  return `${Math.max(1, minutes)} 分钟`;
}

function formatAuthExpireTime(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const normalized = value.trim();
  if (!normalized) {
    return "-";
  }

  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) {
    const pad = (input: number) => String(input).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  return normalized
    .replace("T", " ")
    .replace(/\.\d+Z?$/, "")
    .replace(/Z$/, "")
    .trim();
}

function validateAuthUsername(username: string) {
  const trimmed = username.trim();
  if (!trimmed) {
    throw new Error("请输入用户名");
  }
  if (trimmed.length < 3 || trimmed.length > 50) {
    throw new Error("用户名长度需为 3-50 个字符");
  }
  if (/\s/.test(trimmed)) {
    throw new Error("用户名不能包含空格或换行");
  }
  return trimmed;
}

function validateAuthPassword(password: string) {
  if (!password) {
    throw new Error("请输入密码");
  }
  if (password.length < 6) {
    throw new Error("密码至少 6 个字符");
  }
  if (password.length > 128) {
    throw new Error("密码不能超过 128 个字符");
  }
  if (/[\u0000-\u001f]/.test(password)) {
    throw new Error("密码不能包含控制字符");
  }
  return password;
}

function validateCardCode(code: string) {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("请输入卡密");
  }
  if (trimmed.length < 6 || trimmed.length > 64) {
    throw new Error("卡密长度需为 6-64 个字符");
  }
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    throw new Error("卡密只能包含字母、数字、下划线或短横线");
  }
  return trimmed;
}

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function getPagePlan(durationSeconds: number, template: string) {
  const structured = isStructuredTemplate(template);
  const targetSecondsPerPage = structured ? 6.2 : 5.4;
  const minPages = Math.max(
    structured ? 5 : 4,
    Math.ceil(durationSeconds / 7),
    Math.ceil(durationSeconds / MAX_SLIDE_DURATION_SECONDS),
  );
  const maxPages = structured ? 20 : 24;
  const targetPages = Math.max(
    minPages,
    Math.min(maxPages, Math.ceil(durationSeconds / targetSecondsPerPage)),
  );

  return {
    minPages,
    maxPages,
    targetPages,
  };
}

function formatSegmentsForPrompt(segments: NarrationSegment[]): string {
  if (segments.length === 0) {
    return "";
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
      const preview =
        segment.text.length > 40
          ? `${segment.text.slice(0, 40)}...`
          : segment.text;
      return `- ${segment.ids.join(",")} | ${segment.start.toFixed(2)}s - ${segment.end.toFixed(
        2,
      )}s | ${preview}`;
    })
    .join("\n");
}

function replaceToken(source: string, token: string, value: string): string {
  return source.split(token).join(value);
}

function getPrompt(
  template: string,
  timeline: NarrationTimeline,
  strict: boolean,
): string {
  const plan = getPagePlan(timeline.duration, template);
  const legacyPrompt =
    template === "TechShow"
      ? TECH_PROMPT
      : template === "GlassShow"
        ? GLASS_PROMPT
        : template === "LiquidShow" || template === "LiquidBriefShow"
          ? LIQUID_PROMPT
          : SIMPLE_PROMPT;
  void legacyPrompt;
  void RICH_PROMPT;

  const legacyDirectorBrief =
    template === "TechShow"
      ? getTechShowDirectorBrief(plan.targetPages)
      : template === "GlassShow"
        ? getGlassShowDirectorBrief(plan.targetPages)
        : template === "LiquidShow" || template === "LiquidBriefShow"
          ? getLiquidShowDirectorBrief(plan.targetPages)
          : template === "MacShow" ||
              template === "StudioShow" ||
              template === "EditorialShow" ||
              template === "InsightShow"
            ? getMacShowDirectorBrief(plan.targetPages)
            : "";
  void legacyDirectorBrief;
  void MACSHOW_PROMPT;

  let prompt = isStructuredTemplate(template)
    ? SHARED_STRUCTURED_PROMPT
    : SIMPLE_PROMPT;
  prompt = replaceToken(prompt, "{template_name}", template);
  prompt = replaceToken(
    prompt,
    "{duration_seconds}",
    timeline.duration.toFixed(2),
  );
  prompt = replaceToken(prompt, "{target_pages}", String(plan.targetPages));
  prompt = replaceToken(prompt, "{min_pages}", String(plan.minPages));
  prompt = replaceToken(prompt, "{max_pages}", String(plan.maxPages));
  prompt = replaceToken(
    prompt,
    "{segments_text}",
    formatSegmentsForPrompt(timeline.segments),
  );
  prompt = replaceToken(prompt, "{director_brief}", legacyDirectorBrief);

  if (!strict) {
    return prompt;
  }

  return `${prompt}

补充硬性要求：
- 本次输出至少 ${plan.targetPages} 页
- 任何页面时长都不要超过 ${MAX_SLIDE_DURATION_SECONDS} 秒
- 如果内容偏密，请优先拆成更多页`;
}

async function invokeTauri<T>(
  command: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(
        new Error(
          `${label} 超时（>${Math.round(timeoutMs / 1000)} 秒）。建议稍后重试，或缩短文案/更换更快模型。`,
        ),
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
  contentPath: string,
): Promise<NarrationTimeline> {
  const settings = loadSettings();
  if (!settings.voiceId || !settings.voiceApiKey || !settings.volcengineAppId) {
    throw new Error("请先在设置中配置语音 ID、Access Key 和 App ID");
  }

  const result = await invokeTauri<string>("generate_storyboard_timeline", {
    rawText,
    voiceId: settings.voiceId,
    accessKey: settings.voiceApiKey,
    appId: settings.volcengineAppId,
    resourceId: DEFAULT_VOLCENGINE_RESOURCE_ID,
    speechRate: normalizeSpeechRate(settings.voiceSpeechRate),
    contentPath,
  });

  return JSON.parse(result) as NarrationTimeline;
}

function normalizeSegmentIds(
  value: unknown,
  availableIds: Set<string>,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && availableIds.has(item),
  );
}

function repairSegmentAssignments(
  rawSlides: Array<Record<string, unknown>>,
  segments: NarrationSegment[],
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
    const take =
      index === rawSlides.length - 1
        ? remainingSegments
        : Math.max(1, Math.floor(remainingSegments / remainingSlides));
    const assigned = ids.slice(cursor, cursor + take);
    cursor += assigned.length;
    return assigned;
  });
}

function attachTimingToSlides(
  slides: Slide[],
  segments: NarrationSegment[],
): Slide[] {
  const segmentMap = new Map(segments.map((segment) => [segment.id, segment]));

  return slides.map((slide) => {
    const ids = (slide.segmentIds || []).filter((id) => segmentMap.has(id));
    const pageSegments = ids.map(
      (id) => segmentMap.get(id) as NarrationSegment,
    );

    if (pageSegments.length === 0) {
      return slide;
    }

    const audioStart = pageSegments[0].start;
    const audioEnd = pageSegments[pageSegments.length - 1].end;
    const audioDuration = Math.max(0.01, audioEnd - audioStart);
    const narration =
      (slide.narration || "").trim() ||
      pageSegments.map((item) => item.text).join(" ");

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
  _template: string,
  segments: NarrationSegment[],
): Slide[] {
  const assignments = repairSegmentAssignments(rawSlides, segments);

  const normalized = rawSlides.map((item, index) => {
    return {
      id: `slide-${index}`,
      title: typeof item.title === "string" ? item.title : `第 ${index + 1} 页`,
      subtitle: typeof item.subtitle === "string" ? item.subtitle : "",
      points: Array.isArray(item.points)
        ? item.points.filter(
            (point): point is string => typeof point === "string",
          )
        : [],
      narration: typeof item.narration === "string" ? item.narration : "",
      layout: typeof item.layout === "string" ? item.layout : undefined,
      type: typeof item.type === "string" ? item.type : undefined,
      data:
        item.data && typeof item.data === "object"
          ? (item.data as Record<string, unknown>)
          : undefined,
      badge: typeof item.badge === "string" ? item.badge : undefined,
      items: Array.isArray(item.items)
        ? item.items.filter(
            (entry): entry is Record<string, unknown> =>
              Boolean(entry) && typeof entry === "object",
          )
        : undefined,
      segmentIds: assignments[index],
    };
  });

  const timedSlides = attachTimingToSlides(normalized, segments);
  const preparedSlides = prepareSlidesForRender(
    timedSlides.map((slide) => ({
      title: slide.title,
      subtitle: slide.subtitle,
      points: slide.points,
      narration: slide.narration,
      layout: slide.layout,
      type: slide.type as ContentSlide["type"],
      data: slide.data,
      segmentIds: slide.segmentIds,
      audioStart: slide.audioStart,
      audioEnd: slide.audioEnd,
      audioDuration: slide.audioDuration,
      durationInFrames: slide.durationInFrames,
    })),
  );

  return preparedSlides.map((slide, index) => ({
    id: `slide-${index}`,
    title: typeof slide.title === "string" ? slide.title : `第 ${index + 1} 页`,
    subtitle: typeof slide.subtitle === "string" ? slide.subtitle : "",
    points: Array.isArray(slide.points)
      ? slide.points.filter(
          (point): point is string => typeof point === "string",
        )
      : [],
    narration: typeof slide.narration === "string" ? slide.narration : "",
    layout: typeof slide.layout === "string" ? slide.layout : undefined,
    type: typeof slide.type === "string" ? slide.type : undefined,
    data: slide.data,
    elementTimings: slide.elementTimings,
    segmentIds: Array.isArray(slide.segmentIds)
      ? slide.segmentIds.filter(
          (segmentId): segmentId is string => typeof segmentId === "string",
        )
      : [],
    audioStart: slide.audioStart,
    audioEnd: slide.audioEnd,
    audioDuration: slide.audioDuration,
    durationInFrames: slide.durationInFrames,
  }));
}

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function collectSlideText(slide: Slide): string {
  const parts: string[] = [];

  if ("title" in slide && hasNonEmptyString(slide.title)) {
    parts.push(slide.title);
  }
  if ("subtitle" in slide && hasNonEmptyString(slide.subtitle)) {
    parts.push(slide.subtitle);
  }
  if ("narration" in slide && hasNonEmptyString(slide.narration)) {
    parts.push(slide.narration);
  }
  if ("points" in slide && Array.isArray(slide.points)) {
    parts.push(
      ...slide.points.filter((item): item is string => hasNonEmptyString(item)),
    );
  }
  if (isComplexSlide(slide)) {
    parts.push(JSON.stringify(slide.data || {}));
  }

  return parts.join(" ");
}

function hasNumberCue(text: string): boolean {
  return (
    /\d/.test(text) ||
    /百分之|占比|比例|数据|增长|下降|翻倍|倍|排名|Top|TOP|%/.test(text)
  );
}

function hasProcessCue(text: string): boolean {
  return /步骤|阶段|流程|路径|先|再|然后|最后|第一|第二|第三|进阶|推进|过程|逐步|成熟度|完成度/.test(
    text,
  );
}

function hasCompareCue(text: string): boolean {
  return /对比|相比|区别|不同|vs|VS|一边|另一边|优点|缺点|误区|正确|过去|现在|之前|之后/.test(
    text,
  );
}

function hasQuoteCue(text: string): boolean {
  return /一句话|核心|重点|结论|记住|本质|关键|说白了|提醒/.test(text);
}

function hasListFriendlyCue(text: string): boolean {
  return /包括|主要|比如|例如|可以|建议|方法|要点|原因|优势|问题|重点|注意/.test(
    text,
  );
}

function hasTechShowRequiredData(slide: Slide): boolean {
  if (!isComplexSlide(slide)) {
    return false;
  }

  const data = slide.data || {};

  switch (slide.type) {
    case "title":
      return hasNonEmptyString(data.title);
    case "compare":
      return (
        hasNonEmptyString(
          (data.left as { label?: unknown } | undefined)?.label,
        ) &&
        hasNonEmptyString(
          (data.left as { value?: unknown } | undefined)?.value,
        ) &&
        hasNonEmptyString(
          (data.right as { label?: unknown } | undefined)?.label,
        ) &&
        hasNonEmptyString(
          (data.right as { value?: unknown } | undefined)?.value,
        )
      );
    case "stats":
      return (
        hasNonEmptyString(data.title) &&
        Array.isArray(data.stats) &&
        data.stats.length >= 2
      );
    case "progress":
      return (
        hasNonEmptyString(data.title) &&
        Array.isArray(data.bars) &&
        data.bars.length >= 2
      );
    case "list":
      return (
        hasNonEmptyString(data.title) &&
        Array.isArray(data.items) &&
        data.items.length >= 2
      );
    case "quote":
      return hasNonEmptyString(data.quote);
    case "cta":
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

  if (types[0] !== "title" || types[types.length - 1] !== "cta") {
    return true;
  }

  const middleTypes = types.slice(1, -1);
  if (
    middleTypes.some(
      (type) =>
        !TECH_SHOW_MIDDLE_TYPES.includes(
          type as (typeof TECH_SHOW_MIDDLE_TYPES)[number],
        ),
    )
  ) {
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

  const listCount = middleTypes.filter((type) => type === "list").length;
  if (listCount > Math.max(1, Math.ceil(middleTypes.length * 0.4))) {
    return true;
  }

  if (techSlides.some((slide) => !hasTechShowRequiredData(slide))) {
    return true;
  }

  if (
    techSlides.some((slide) => {
      const text = collectSlideText(slide);
      if (slide.type === "stats") {
        return !hasNumberCue(text);
      }
      if (slide.type === "progress") {
        return !hasProcessCue(text);
      }
      if (slide.type === "compare") {
        return !hasCompareCue(text);
      }
      if (slide.type === "quote") {
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
    case "hero":
      return (
        hasNonEmptyString(slide.title) ||
        hasNonEmptyString(data.badge) ||
        hasNonEmptyString(data.cta)
      );
    case "stats":
      return Array.isArray(data.stats) && data.stats.length >= 2;
    case "compare":
      return (
        hasNonEmptyString(
          (data.left as { label?: unknown } | undefined)?.label,
        ) &&
        hasNonEmptyString(
          (data.right as { label?: unknown } | undefined)?.label,
        )
      );
    case "steps":
      return Array.isArray(data.steps) && data.steps.length >= 2;
    case "list":
      return Array.isArray(data.items) && data.items.length >= 2;
    case "chart":
      return Array.isArray(data.bars) && data.bars.length >= 2;
    case "timeline":
      return Array.isArray(data.timeline) && data.timeline.length >= 2;
    case "highlight":
      return Array.isArray(data.items) && data.items.length >= 2;
    case "quote":
      return hasNonEmptyString(data.quote);
    case "default":
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

  if (types[0] !== "hero") {
    return true;
  }

  for (let index = 1; index < types.length; index += 1) {
    if (types[index] === types[index - 1]) {
      return true;
    }
  }

  if (
    types.some(
      (type) =>
        !GLASS_SHOW_TYPES.includes(type as (typeof GLASS_SHOW_TYPES)[number]),
    )
  ) {
    return true;
  }

  const uniqueTypeCount = new Set(types).size;
  if (uniqueTypeCount < getGlassShowMinUniqueTypes(types.length)) {
    return true;
  }

  const defaultCount = types.filter((type) => type === "default").length;
  if (defaultCount > Math.max(1, Math.floor(types.length / 3))) {
    return true;
  }

  const listCount = types.filter((type) => type === "list").length;
  if (listCount > Math.max(1, Math.ceil(types.length * 0.35))) {
    return true;
  }

  if (glassSlides.some((slide) => !hasGlassShowRequiredData(slide))) {
    return true;
  }

  if (
    glassSlides.some((slide) => {
      const text = collectSlideText(slide);
      if (slide.type === "stats" || slide.type === "chart") {
        return !hasNumberCue(text);
      }
      if (slide.type === "timeline" || slide.type === "steps") {
        return !hasProcessCue(text);
      }
      if (slide.type === "compare") {
        return !hasCompareCue(text);
      }
      if (slide.type === "quote") {
        return !hasQuoteCue(text);
      }
      if (slide.type === "highlight") {
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
    case "hero":
      return (
        hasNonEmptyString(slide.title) ||
        hasNonEmptyString(data.badge) ||
        hasNonEmptyString(data.cta)
      );
    case "stats":
      return Array.isArray(data.stats) && data.stats.length >= 2;
    case "compare":
      return (
        hasNonEmptyString(
          (data.left as { label?: unknown } | undefined)?.label,
        ) &&
        hasNonEmptyString(
          (data.left as { value?: unknown } | undefined)?.value,
        ) &&
        hasNonEmptyString(
          (data.right as { label?: unknown } | undefined)?.label,
        ) &&
        hasNonEmptyString(
          (data.right as { value?: unknown } | undefined)?.value,
        )
      );
    case "steps":
      return Array.isArray(data.steps) && data.steps.length >= 2;
    case "list":
      return Array.isArray(data.items) && data.items.length >= 3;
    case "chart":
      return Array.isArray(data.bars) && data.bars.length >= 2;
    case "timeline":
      return Array.isArray(data.timeline) && data.timeline.length >= 2;
    case "highlight":
      return Array.isArray(data.items) && data.items.length >= 3;
    case "quote":
      return hasNonEmptyString(data.quote);
    case "default":
      return (
        hasNonEmptyString(slide.title) &&
        Array.isArray(slide.points) &&
        slide.points.length > 0
      );
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

  if (types[0] !== "hero") {
    return true;
  }

  for (let index = 1; index < types.length; index += 1) {
    if (types[index] === types[index - 1]) {
      return true;
    }
  }

  if (
    types.some(
      (type) =>
        !LIQUID_SHOW_TYPES.includes(type as (typeof LIQUID_SHOW_TYPES)[number]),
    )
  ) {
    return true;
  }

  const uniqueTypeCount = new Set(types).size;
  if (uniqueTypeCount < getLiquidShowMinUniqueTypes(types.length)) {
    return true;
  }

  const defaultCount = types.filter((type) => type === "default").length;
  const listCount = types.filter((type) => type === "list").length;
  if (
    defaultCount > Math.max(1, Math.floor(types.length / 4)) ||
    listCount > Math.ceil(types.length / 3)
  ) {
    return true;
  }

  if (liquidSlides.some((slide) => !hasLiquidShowRequiredData(slide))) {
    return true;
  }

  if (
    liquidSlides.some((slide) => {
      const text = collectSlideText(slide);
      if (slide.type === "stats" || slide.type === "chart") {
        return !hasNumberCue(text);
      }
      if (slide.type === "timeline" || slide.type === "steps") {
        return !hasProcessCue(text);
      }
      if (slide.type === "compare") {
        return !hasCompareCue(text);
      }
      if (slide.type === "quote") {
        return !hasQuoteCue(text);
      }
      if (slide.type === "highlight") {
        return !hasListFriendlyCue(text) && !hasQuoteCue(text);
      }
      return false;
    })
  ) {
    return true;
  }

  return false;
}

function shouldRetryMacShowSlides(slides: Slide[]): boolean {
  const macSlides = slides.filter(isComplexSlide);
  const types = macSlides.map((slide) => slide.type);

  if (types.length === 0) {
    return true;
  }

  if (types[0] !== "hero") {
    return true;
  }

  const lastType = types[types.length - 1];
  if (lastType !== "cta" && lastType !== "quote") {
    return true;
  }

  const uniqueTypeCount = new Set(types).size;
  if (types.length >= 4 && uniqueTypeCount < Math.min(4, types.length)) {
    return true;
  }

  const evidenceLayouts = new Set(["compare", "stats", "chart", "timeline"]);
  const hasEvidenceSlide = types
    .slice(1, -1)
    .some((type) => evidenceLayouts.has(type));
  if (types.length >= 4 && !hasEvidenceSlide) {
    return true;
  }

  const listLikeCount = types.filter(
    (type) => type === "list" || type === "default",
  ).length;
  if (listLikeCount > Math.ceil(types.length / 2)) {
    return true;
  }

  return false;
}

async function generateSlidesWithAi(
  rawText: string,
  template: string,
  timeline: NarrationTimeline,
): Promise<Slide[]> {
  const settings = loadSettings();
  if (!settings.aiApiKey) {
    throw new Error("请先在设置中配置 AI API Key");
  }

  const requestSlides = async (strict: boolean): Promise<Slide[]> => {
    const result = await withTimeout(
      invokeTauri<string>("generate_slides", {
        apiUrl: settings.aiUrl,
        accessKey: settings.aiApiKey,
        model: settings.aiModel,
        prompt: getPrompt(template, timeline, strict).replace(
          "{input_text}",
          rawText,
        ),
      }),
      45_000,
      strict ? "AI 分页规划请求（严格重试）" : "AI 分页规划请求",
    );
    const parsed = JSON.parse(result) as {
      slides?: Array<Record<string, unknown>>;
    };

    if (
      !parsed.slides ||
      !Array.isArray(parsed.slides) ||
      parsed.slides.length === 0
    ) {
      throw new Error("AI 返回的 JSON 不包含 slides");
    }

    return normalizeSlides(parsed.slides, template, timeline.segments);
  };

  const plan = getPagePlan(timeline.duration, template);
  const shouldRetry = (slides: Slide[]) => {
    const durations = slides.map((slide) => slide.audioDuration || 0);
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const coveredIds = slides.flatMap((slide) => slide.segmentIds || []);
    const expectedIds = timeline.segments.map((segment) => segment.id);
    const legacyTemplateChecks =
      (template === "TechShow" && shouldRetryTechShowSlides(slides)) ||
      (template === "GlassShow" && shouldRetryGlassShowSlides(slides)) ||
      ((template === "LiquidShow" || template === "LiquidBriefShow") &&
        shouldRetryLiquidShowSlides(slides)) ||
      ((template === "MacShow" ||
        template === "StudioShow" ||
        template === "EditorialShow" ||
        template === "InsightShow") &&
        shouldRetryMacShowSlides(slides));

    const layouts = slides
      .map((slide) => ("layout" in slide ? slide.layout : slide.type))
      .filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      );
    const uniqueLayoutCount = new Set(layouts).size;
    const hasStructuredSlide = slides.some(
      (slide) => isComplexSlide(slide) || Boolean(slide.layout),
    );
    const needsVariety = isStructuredTemplate(template) && slides.length >= 4;
    const varietyTooLow =
      needsVariety && uniqueLayoutCount < Math.min(3, slides.length);

    return (
      slides.length < plan.targetPages ||
      maxDuration > MAX_SLIDE_DURATION_SECONDS ||
      coveredIds.length !== expectedIds.length ||
      coveredIds.some((id, index) => id !== expectedIds[index]) ||
      legacyTemplateChecks ||
      (isStructuredTemplate(template) && !hasStructuredSlide) ||
      varietyTooLow
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
  if (template.includes("{{text}}")) {
    return template.replaceAll("{{text}}", text);
  }

  return `${template}\n\n原文案：\n${text}`;
}

async function rewriteCopyWithAi(
  text: string,
  style: RewriteStyle,
): Promise<string> {
  const settings = loadSettings();
  if (!settings.aiApiKey) {
    throw new Error("请先在设置中配置 AI API Key");
  }

  const result = await invokeTauri<string>("generate_slides", {
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
        typeof slide.audioStart === "number" &&
        typeof slide.audioEnd === "number" &&
        slide.audioEnd >= slide.audioStart,
    );
  const slides = project.slides.map((slide) => {
    if (isComplexSlide(slide)) {
      const payload: Record<string, unknown> = {
        type: slide.type,
        layout: slide.layout,
        data: slide.data,
        elementTimings: slide.elementTimings,
        narration: slide.narration || "",
        segmentIds: slide.segmentIds || [],
        audioStart: slide.audioStart,
        audioEnd: slide.audioEnd,
        audioDuration: slide.audioDuration,
        durationInFrames: slide.durationInFrames,
      };

      if (typeof slide.title === "string") {
        payload.title = slide.title;
      }
      if (typeof slide.subtitle === "string") {
        payload.subtitle = slide.subtitle;
      }
      if (Array.isArray(slide.points)) {
        payload.points = slide.points;
      }
      if (typeof slide.badge === "string") {
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
      layout: slide.layout,
      type: slide.type,
      data: slide.data,
      elementTimings: slide.elementTimings,
      segmentIds: slide.segmentIds || [],
      audioStart: slide.audioStart,
      audioEnd: slide.audioEnd,
      audioDuration: slide.audioDuration,
      durationInFrames: slide.durationInFrames,
    };
  });

  await invokeTauri<string>("save_slides", {
    template: project.template,
    voiceId: settings.voiceId,
    rawText: project.rawText,
    slides,
    contentPath: project.contentPath,
    soundtrackPath: hasCompleteTiming
      ? project.contentPath
          .replace(/content\.json$/i, "audio/narration.mp3")
          .replace(/^public\//, "")
      : undefined,
    soundtrackDuration: hasCompleteTiming
      ? project.slides.reduce(
          (max, slide) => Math.max(max, slide.audioEnd || 0),
          0,
        )
      : undefined,
  });
}

async function syncAudio(project: Project) {
  const settings = loadSettings();
  if (!settings.voiceId || !settings.voiceApiKey || !settings.volcengineAppId) {
    return;
  }

  await invokeTauri<string>("generate_audio", {
    voiceId: settings.voiceId,
    accessKey: settings.voiceApiKey,
    appId: settings.volcengineAppId,
    resourceId: DEFAULT_VOLCENGINE_RESOURCE_ID,
    speechRate: normalizeSpeechRate(settings.voiceSpeechRate),
    contentPath: project.contentPath,
  });
}

function dockLinkStyle(active: boolean): React.CSSProperties {
  return {
    width: active ? 44 : 56,
    height: active ? 44 : 56,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: active ? "#2563eb" : "#5f6b82",
    textDecoration: "none",
    borderRadius: 16,
    background: active
      ? "linear-gradient(180deg, rgba(239,244,255,0.98) 0%, rgba(220,231,255,0.96) 100%)"
      : "transparent",
    border: active
      ? "1px solid rgba(141,171,255,0.6)"
      : "1px solid transparent",
    boxShadow: active
      ? "0 6px 16px rgba(53, 113, 231, 0.14), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -6px 12px rgba(115, 154, 255, 0.08)"
      : "none",
    transition:
      "transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease, border-color 180ms ease, width 180ms ease, height 180ms ease",
  };
}

const SOFT_CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.96)",
  borderRadius: 12,
  padding: 16,
  border: "1px solid rgba(224, 231, 240, 0.9)",
  boxShadow: "0 1px 4px rgba(148, 163, 184, 0.10), 0 2px 8px rgba(148, 163, 184, 0.06)",
};

const SOFT_INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 12px",
  borderRadius: 7,
  border: "1px solid #d7e0ee",
  background: "#fff",
  fontSize: 14,
  color: "#1d2129",
  lineHeight: 1.4,
};

const COMPACT_SELECT_STYLE: React.CSSProperties = {
  ...SOFT_INPUT_STYLE,
  height: 38,
  padding: "0 10px",
  borderRadius: 7,
  fontSize: 13,
  lineHeight: "36px",
};

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 7,
  border: "none",
  background: "linear-gradient(135deg, #1f67ff 0%, #3c8cff 100%)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  boxShadow: "0 2px 6px rgba(53, 113, 231, 0.22)",
};

const PAGE_FRAME_STYLE: React.CSSProperties = {
  maxWidth: COMPACT_UI.pageMaxWidth,
  margin: "0 auto",
  padding: `16px 18px 18px`,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const HOME_PAGE_HEIGHT = "100%";

const PANEL_STYLE: React.CSSProperties = {
  ...SOFT_CARD_STYLE,
  padding: 16,
  borderRadius: 12,
};

const FIELD_GROUP_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const FIELD_LABEL_STYLE: React.CSSProperties = {
  color: "#20293b",
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.4,
};

const SECTION_TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  color: "#20293b",
  fontSize: 17,
  lineHeight: 1.25,
  fontWeight: 800,
};

const SECONDARY_BUTTON_STYLE: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 7,
  border: "1px solid #dbe3ef",
  background: "#fff",
  color: "#42506a",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const QUIET_DANGER_BUTTON_STYLE: React.CSSProperties = {
  padding: "0 10px",
  borderRadius: 6,
  border: "1px solid rgba(245,63,63,0.22)",
  background: "rgba(245,63,63,0.05)",
  color: "#e35252",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

function HomePage(props: {
  project: Project | null;
  onProjectChange: (project: Project | null) => void;
}) {
  const navigate = useNavigate();
  const homeDraft = React.useMemo(() => loadHomeDraft(), []);
  // 文案状态
  const [originalText, setOriginalText] = React.useState(
    homeDraft?.originalText || "",
  ); // 原文案（提取的）
  const [editedText, setEditedText] = React.useState(
    homeDraft?.editedText || props.project?.rawText || "",
  ); // 修改后的文案
  const [template, setTemplate] = React.useState(
    normalizeTemplate(
      homeDraft?.template || props.project?.template || DEFAULT_TEMPLATE,
    ),
  );
  const [templateOrientation, setTemplateOrientation] =
    React.useState<TemplateOrientation>(() =>
      getTemplateOrientation(
        homeDraft?.template || props.project?.template || DEFAULT_TEMPLATE,
      ),
    );
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");

  // 抖音提取状态
  const [douyinLink, setDouyinLink] = React.useState(
    homeDraft?.douyinLink || "",
  );
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [isRewriting, setIsRewriting] = React.useState(false);
  const [selectedRewriteStyleId, setSelectedRewriteStyleId] = React.useState(
    () =>
      homeDraft?.selectedRewriteStyleId || loadSettings().defaultRewriteStyleId,
  );
  const rewriteStyles = loadSettings().rewriteStyles;

  React.useEffect(() => {
    if (!rewriteStyles.some((style) => style.id === selectedRewriteStyleId)) {
      setSelectedRewriteStyleId(loadSettings().defaultRewriteStyleId);
    }
  }, [rewriteStyles, selectedRewriteStyleId]);

  const filteredTemplateOptions = React.useMemo(
    () =>
      ACTIVE_TEMPLATE_OPTIONS.filter(
        (option) => option.orientation === templateOrientation,
      ),
    [templateOrientation],
  );

  const handleTemplateOrientationChange = React.useCallback(
    (nextOrientation: TemplateOrientation) => {
      setTemplateOrientation(nextOrientation);

      const hasMatchingTemplate = ACTIVE_TEMPLATE_OPTIONS.some(
        (option) =>
          option.value === template && option.orientation === nextOrientation,
      );

      if (!hasMatchingTemplate) {
        setTemplate(getDefaultTemplateForOrientation(nextOrientation));
      }
    },
    [template],
  );

  const handleTemplateChange = React.useCallback((nextTemplate: string) => {
    setTemplate(nextTemplate);
    setTemplateOrientation(getTemplateOrientation(nextTemplate));
  }, []);

  React.useEffect(() => {
    saveHomeDraft({
      douyinLink,
      originalText,
      editedText,
      template,
      selectedRewriteStyleId,
    });
  }, [douyinLink, originalText, editedText, template, selectedRewriteStyleId]);

  // 从设置获取火山引擎配置
  const getVolcengineConfig = () => {
    const settings = loadSettings() as SettingsData & {
      bailianApiKey?: string;
    };
    return {
      accessKey: settings.voiceApiKey || settings.volcengineAccessKey || "",
      appId: settings.volcengineAppId || "",
    };
  };

  // 从抖音链接提取文案
  const handleExtractFromDouyin = async () => {
    if (!douyinLink.trim()) {
      setError("请输入抖音分享链接");
      return;
    }

    const { accessKey, appId } = getVolcengineConfig();
    if (!accessKey) {
      setError("请先配置火山引擎 Access Key（在设置页面）");
      return;
    }

    setIsExtracting(true);
    setError("");
    setStatus("正在解析抖音链接...");

    try {
      // Step 1: 解析分享链接获取视频URL
      const parseResult = await invokeTauri<{
        title: string;
        videoUrl: string;
        videoId: string;
      }>("parse_douyin_url", {
        shareText: douyinLink,
      });

      setStatus(`已获取视频: ${parseResult.title}，正在转写语音...`);

      // Step 2: 调用火山引擎语音转写
      const transcribeResult = await invokeTauri<{
        text: string;
        duration: number;
      }>("transcribe_douyin_video", {
        videoUrl: parseResult.videoUrl,
        accessKey,
        appId,
      });

      // 设置原文案和修改后的文案
      setOriginalText(transcribeResult.text);
      setEditedText(transcribeResult.text);

      setStatus(
        `文案提取成功！视频时长: ${Math.round(transcribeResult.duration)}秒`,
      );
      setTimeout(() => setStatus(""), 3000);
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
      setError("请先输入或提取文案");
      return;
    }
    const settings = loadSettings();
    const selectedStyle =
      settings.rewriteStyles.find(
        (style) => style.id === selectedRewriteStyleId,
      ) ||
      settings.rewriteStyles[0] ||
      DEFAULT_REWRITE_STYLES[0];

    setIsRewriting(true);
    setError("");
    setStatus("正在改写文案...");

    try {
      const rewritten = await rewriteCopyWithAi(sourceText, selectedStyle);
      setEditedText(rewritten);
      setStatus("文案改写完成");
      window.setTimeout(() => setStatus(""), 2500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsRewriting(false);
    }
  };

  const handleGenerate = async () => {
    if (!editedText.trim()) {
      setError("请输入完整口播文案");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const projectId = `${Date.now()}`;
      const contentPath = getGeneratedProjectContentPath(template, projectId);
      setStatus("正在生成语义时间轴...");
      const timeline = await generateStoryboardTimeline(
        editedText,
        contentPath,
      );

      const planningStart = Date.now();
      setStatus("正在规划最终分页...（已等待 0 秒）");
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

      setStatus("正在保存项目...");
      await saveSlidesToProject(project);

      props.onProjectChange(project);
      navigate("/editor");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div
      style={{
        ...PAGE_FRAME_STYLE,
        height: HOME_PAGE_HEIGHT,
        boxSizing: "border-box",
        padding: "12px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflow: "hidden",
      }}
    >
      {/* 抖音链接提取区域 */}
      <div style={{ ...PANEL_STYLE, width: "100%", padding: 14 }}>
        <div
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
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
              background: isExtracting ? "#94b8ff" : "#165dff",
              cursor: isExtracting ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {isExtracting ? "提取中..." : "提取文案"}
          </button>
        </div>
        {isExtracting && (
          <div
            style={{
              marginTop: SPACING.md,
              padding: "12px",
              background: "#f2f3f5",
              borderRadius: 6,
              textAlign: "center",
            }}
          >
            <span style={{ color: "#4e5969", fontSize: 13 }}>
              ⏳ 正在云端转写视频语音，请稍候...
            </span>
          </div>
        )}
      </div>

      {/* 文案编辑区域 */}
      <div
        style={{
          ...PANEL_STYLE,
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 14,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 12,
            alignItems: "stretch",
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              ...FIELD_GROUP_STYLE,
              marginTop: 0,
              padding: 14,
              borderRadius: 8,
              background: "rgba(249,251,255,0.9)",
              border: "1px solid #e5eaf4",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                gap: 8,
                flexShrink: 0,
              }}
            >
              <label style={FIELD_LABEL_STYLE}>原文案</label>
              <button
                onClick={handleCopyToEdit}
                disabled={!originalText}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  border: "1px solid #165dff",
                  background: "transparent",
                  color: !originalText ? "#94a3b8" : "#165dff",
                  borderRadius: 8,
                  cursor: !originalText ? "not-allowed" : "pointer",
                  opacity: !originalText ? 0.6 : 1,
                }}
              >
                复制到修改区
              </button>
            </div>
            <textarea
              value={originalText}
              onChange={(event) => setOriginalText(event.target.value)}
              placeholder="粘贴文案或从抖音提取..."
              style={{
                ...SOFT_INPUT_STYLE,
                flex: 1,
                minHeight: 0,
                padding: "12px 14px",
                lineHeight: 1.6,
                resize: "none",
              }}
            />
          </div>

          <div
            style={{
              ...FIELD_GROUP_STYLE,
              marginTop: 0,
              padding: 14,
              borderRadius: 8,
              background: "rgba(249,251,255,0.9)",
              border: "1px solid #e5eaf4",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: SPACING.md,
                flexWrap: "nowrap",
                marginBottom: 10,
                flexShrink: 0,
              }}
            >
              <label style={FIELD_LABEL_STYLE}>新文案</label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "nowrap",
                }}
              >
                <select
                  value={selectedRewriteStyleId}
                  onChange={(event) =>
                    setSelectedRewriteStyleId(event.target.value)
                  }
                  style={{
                    ...COMPACT_SELECT_STYLE,
                    minWidth: 148,
                    width: 148,
                  }}
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
                    padding: "8px 14px",
                    background: isRewriting ? "#94b8ff" : "#165dff",
                    cursor: isRewriting ? "not-allowed" : "pointer",
                  }}
                >
                  {isRewriting ? "改写中..." : "AI 改写"}
                </button>
              </div>
            </div>
            <textarea
              value={editedText}
              onChange={(event) => setEditedText(event.target.value)}
              placeholder="编辑后的文案..."
              style={{
                ...SOFT_INPUT_STYLE,
                flex: 1,
                minHeight: 0,
                padding: "12px 14px",
                lineHeight: 1.6,
                resize: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div
        style={{
          marginTop: "auto",
          background: "rgba(255, 255, 255, 0.96)",
          borderTop: "1px solid #e5eaf4",
          borderRadius: 12,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: SPACING.md,
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.04)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: SPACING.md,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
              flex: 1,
            }}
          >
            <label
              style={{
                fontWeight: 600,
                color: "#1d2129",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              画幅
            </label>
            <select
              value={templateOrientation}
              onChange={(event) =>
                handleTemplateOrientationChange(
                  event.target.value as TemplateOrientation,
                )
              }
              style={{
                ...COMPACT_SELECT_STYLE,
                width: 100,
                flexShrink: 0,
              }}
            >
              {TEMPLATE_ORIENTATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label
              style={{
                fontWeight: 600,
                color: "#1d2129",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              模板
            </label>
            <select
              value={template}
              onChange={(event) => handleTemplateChange(event.target.value)}
              style={{
                ...COMPACT_SELECT_STYLE,
                flex: 1,
                maxWidth: 240,
                flexShrink: 0,
              }}
            >
              {filteredTemplateOptions.map((option) => (
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
              minWidth: 130,
              flexShrink: 0,
              background: loading ? "#94b8ff" : "#165dff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "生成中..." : "开始生成"}
          </button>
        </div>
      </div>

      {/* 状态提示 */}
      {status ? (
        <div
          style={{
            position: "fixed",
            bottom: 64,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.75)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            zIndex: 101,
          }}
        >
          {status}
        </div>
      ) : null}

      {/* 错误提示 */}
      {error ? (
        <div
          style={{
            position: "fixed",
            bottom: 64,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(245, 63, 63, 0.9)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            zIndex: 101,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

function EditorPage(props: {
  project: Project | null;
  onProjectChange: (project: Project | null) => void;
}) {
  const editorWorkspaceHeight = "min(680px, calc(100vh - 150px))";
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewData, setPreviewData] =
    React.useState<PreviewProjectData | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState("");
  const [rendering, setRendering] = React.useState(false);
  const [renderProgress, setRenderProgress] = React.useState("");

  const project = props.project;

  React.useEffect(() => {
    setActiveIndex(0);
  }, [project?.id]);

  if (!project) {
    return (
      <div style={{ padding: COMPACT_UI.pagePadding }}>
        <p style={{ color: "#4e5969" }}>当前还没有项目，请先生成。</p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: 8,
            background: "#165dff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          返回首页
        </button>
      </div>
    );
  }

  const complex = isStructuredTemplate(project.template);
  const safeIndex = Math.min(
    activeIndex,
    Math.max(0, project.slides.length - 1),
  );
  const slide = project.slides[safeIndex];

  const updateProject = (updater: (current: Project) => Project) => {
    const next = updater(project);
    props.onProjectChange(next);
  };

  const updateSlide = (index: number, updater: (current: Slide) => Slide) => {
    updateProject((current) => ({
      ...current,
      slides: current.slides.map((item, itemIndex) =>
        itemIndex === index ? updater(item) : item,
      ),
    }));
  };

  const updateComplexSlideFields = (
    index: number,
    patch: Partial<ComplexSlide>,
  ) => {
    updateSlide(index, (current) =>
      syncComplexSlideForEditor({
        ...(current as ComplexSlide),
        ...patch,
      }),
    );
  };

  const saveCurrentProject = async () => {
    await saveSlidesToProject(project);
  };

  const handleAddSlide = () => {
    const defaultLayout = getTemplateSlideTypes(project.template)[0] || "hero";
    const nextSlide: Slide = complex
      ? {
          id: `slide-${Date.now()}`,
          layout: defaultLayout,
          type: defaultLayout,
          title: "新页面",
          subtitle: "",
          points: [],
          items: [],
          data: {},
          narration: "",
        }
      : {
          id: `slide-${Date.now()}`,
          title: "新页面",
          subtitle: "",
          points: ["要点 1"],
          narration: "",
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
    setPreviewError("");

    try {
      await saveCurrentProject();
      await syncAudio(project);

      const { convertFileSrc } = await import("@tauri-apps/api/core");
      const result = await invokeTauri<string>("load_preview_project", {
        contentPath: project.contentPath,
      });
      const preview = JSON.parse(result) as PreviewProjectResponse;

      setPreviewData({
        template: preview.template || project.template,
        slides: preview.slides || [],
        soundtrackUrl:
          preview.soundtrackDataUrl ||
          (preview.soundtrackFile
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
    setRenderProgress("正在保存项目...");

    try {
      await saveCurrentProject();
      setRenderProgress("正在同步音频...");
      await syncAudio(project);

      setRenderProgress("正在渲染视频...");
      const result = await invokeTauri<string>("render_video", {
        template: project.template,
        contentPath: project.contentPath,
      });
      setRenderProgress(`渲染完成: ${result}`);
    } catch (cause) {
      setRenderProgress("");
      alert(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRendering(false);
    }
  };

  const panelTitle = isComplexSlide(slide)
    ? String(
        (slide.title || slide.data.title || slide.data.quote || slide.type) ??
          `第 ${safeIndex + 1} 页`,
      )
    : slide.title || `第 ${safeIndex + 1} 页`;
  const complexEditorLabels = isComplexSlide(slide)
    ? getComplexEditorLabels(slide)
    : null;
  const complexEditorPoints = isComplexSlide(slide)
    ? getComplexSlideEditorPoints(slide)
    : [];

  return (
    <div style={{ ...PAGE_FRAME_STYLE, maxWidth: 1140 }}>
      <div
        style={{
          display: "flex",
          gap: SPACING.md,
          alignItems: "start",
          width: "100%",
        }}
      >
        <div
          style={{
            ...SOFT_CARD_STYLE,
            padding: 0,
            width: COMPACT_UI.sidePanelWidth,
            flexShrink: 0,
            minHeight: editorWorkspaceHeight,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 14px 12px",
              borderBottom: "1px solid #edf1f7",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: SPACING.md,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: "#1d2129",
                whiteSpace: "nowrap",
              }}
            >
              页面 ({project.slides.length})
            </span>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <button
                onClick={handleAddSlide}
                style={{
                  ...PRIMARY_BUTTON_STYLE,
                  padding: "8px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  cursor: "pointer",
                  minWidth: 88,
                }}
              >
                + 新增
              </button>
              <button
                onClick={handlePreviewToggle}
                disabled={previewLoading}
                style={{
                  ...PRIMARY_BUTTON_STYLE,
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: 13,
                  minWidth: 96,
                  background: previewLoading
                    ? "#94b8ff"
                    : "linear-gradient(135deg, #07b36d 0%, #19c37d 100%)",
                  cursor: previewLoading ? "not-allowed" : "pointer",
                }}
              >
                {previewLoading
                  ? "准备中..."
                  : showPreview
                    ? "返回编辑"
                    : "预览"}
              </button>
              <button
                onClick={handleRender}
                disabled={rendering}
                style={{
                  ...PRIMARY_BUTTON_STYLE,
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: 13,
                  minWidth: 116,
                  background: rendering
                    ? "#94b8ff"
                    : PRIMARY_BUTTON_STYLE.background,
                  cursor: rendering ? "not-allowed" : "pointer",
                }}
              >
                {rendering ? "生成中..." : "生成视频"}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: 6 }}>
            {project.slides.map((item, index) => {
              const title = isComplexSlide(item)
                ? String(
                    (item.title ||
                      item.data.title ||
                      item.data.quote ||
                      item.type) ??
                      `第 ${index + 1} 页`,
                  )
                : item.title || `第 ${index + 1} 页`;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    marginBottom: 6,
                    padding: "10px 12px",
                    cursor: "pointer",
                    background:
                      safeIndex === index
                        ? "linear-gradient(180deg, rgba(232,239,255,0.98) 0%, rgba(219,229,255,0.9) 100%)"
                        : "transparent",
                    border:
                      safeIndex === index
                        ? "1px solid rgba(167,191,255,0.56)"
                        : "1px solid transparent",
                    borderRadius: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: SPACING.sm,
                  }}
                >
                  <span
                    style={{ fontSize: 13, color: "#1d2129", lineHeight: 1.4 }}
                  >
                    {title}
                  </span>
                  {project.slides.length > 1 ? (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteSlide(index);
                      }}
                      style={{
                        ...QUIET_DANGER_BUTTON_STYLE,
                        padding: "4px 8px",
                        fontSize: 11,
                        flexShrink: 0,
                      }}
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
                minHeight: editorWorkspaceHeight,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #edf1f7",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 700, color: "#1d2129" }}>预览</span>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    padding: "8px 12px",
                    borderRadius: 999,
                  }}
                >
                  返回编辑
                </button>
              </div>

              <div
                style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}
              >
                {previewLoading || !previewData ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      color: "#86909c",
                    }}
                  >
                    {previewError || "正在准备预览..."}
                  </div>
                ) : (
                  <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                    <EmbeddedPreview previewData={previewData} />
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid #e5e6eb",
                  fontSize: 12,
                  color: "#86909c",
                  textAlign: "center",
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
                overflow: "auto",
              }}
            >
              <div style={{ marginBottom: SPACING.md }}>
                <h3
                  style={{ ...SECTION_TITLE_STYLE, marginBottom: SPACING.xs }}
                >
                  {panelTitle}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#86909c",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  第 {safeIndex + 1} 页 / 共 {project.slides.length} 页
                </p>
              </div>

              {isComplexSlide(slide) ? (
                <>
                  <div style={FIELD_GROUP_STYLE}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      {complexEditorLabels?.title || "标题"}
                    </label>
                    <input
                      value={slide.title || ""}
                      onChange={(event) => {
                        updateComplexSlideFields(safeIndex, {
                          title: event.target.value,
                        });
                      }}
                      onBlur={() => {
                        void saveCurrentProject();
                      }}
                      style={SOFT_INPUT_STYLE}
                    />
                  </div>

                  <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      {complexEditorLabels?.subtitle || "副标题"}
                    </label>
                    <input
                      value={slide.subtitle || ""}
                      onChange={(event) => {
                        updateComplexSlideFields(safeIndex, {
                          subtitle: event.target.value,
                        });
                      }}
                      onBlur={() => {
                        void saveCurrentProject();
                      }}
                      style={SOFT_INPUT_STYLE}
                    />
                  </div>

                  <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      {complexEditorLabels?.points || "页面内容"}
                    </label>
                    <textarea
                      value={complexEditorPoints.join("\n")}
                      onChange={(event) => {
                        const nextPoints = event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean);
                        updateComplexSlideFields(safeIndex, {
                          points: nextPoints,
                        });
                      }}
                      onBlur={() => {
                        void saveCurrentProject();
                      }}
                      rows={5}
                      style={{ ...SOFT_INPUT_STYLE, minHeight: 128 }}
                    />
                  </div>

                  <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      旁白
                    </label>
                    <textarea
                      value={slide.narration || ""}
                      onChange={(event) => {
                        const nextNarration = event.target.value;
                        updateSlide(safeIndex, (current) => ({
                          ...(nextNarration ===
                          (current as ComplexSlide).narration
                            ? (current as ComplexSlide)
                            : detachSlideNarrationTiming(
                                current as ComplexSlide,
                                nextNarration,
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
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      标题
                    </label>
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
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      副标题
                    </label>
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
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      要点
                    </label>
                    {slide.points.map((point, pointIndex) => (
                      <div
                        key={`${slide.id}-${pointIndex}`}
                        style={{
                          display: "flex",
                          gap: SPACING.sm,
                          marginBottom: SPACING.sm,
                        }}
                      >
                        <input
                          value={point}
                          onChange={(event) => {
                            const nextPoints = slide.points.map(
                              (item, itemIndex) =>
                                itemIndex === pointIndex
                                  ? event.target.value
                                  : item,
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
                            const nextPoints = slide.points.filter(
                              (_, itemIndex) => itemIndex !== pointIndex,
                            );
                            updateSlide(safeIndex, (current) => ({
                              ...(current as SimpleSlide),
                              points: nextPoints,
                            }));
                          }}
                          style={{
                            ...QUIET_DANGER_BUTTON_STYLE,
                            padding: "0 14px",
                          }}
                        >
                          删除
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        updateSlide(safeIndex, (current) => ({
                          ...(current as SimpleSlide),
                          points: [
                            ...(current as SimpleSlide).points,
                            "新要点",
                          ],
                        }));
                      }}
                      style={{ ...SECONDARY_BUTTON_STYLE, padding: "8px 12px" }}
                    >
                      + 添加要点
                    </button>
                  </div>

                  <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      旁白
                    </label>
                    <textarea
                      value={slide.narration}
                      onChange={(event) => {
                        const nextNarration = event.target.value;
                        updateSlide(safeIndex, (current) => ({
                          ...(nextNarration ===
                          (current as SimpleSlide).narration
                            ? (current as SimpleSlide)
                            : detachSlideNarrationTiming(
                                current as SimpleSlide,
                                nextNarration,
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
                <p
                  style={{
                    margin: `${SPACING.md}px 0 0`,
                    fontSize: 12,
                    color: "#86909c",
                    lineHeight: 1.5,
                  }}
                >
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
type SettingsPageProps = {
  appInfo: AuthAppInfo | null;
  authContext: AuthContext | null;
  authSession: AuthSession | null;
  authStatus: AuthStatus | null;
  updateBusy: boolean;
  updateError: string;
  onCheckUpdate: () => Promise<AuthAppInfo | null>;
  onOpenUpdate: () => Promise<void>;
};

function SettingsPage(props: SettingsPageProps) {
  const [settings, setSettings] = React.useState<SettingsData>(loadSettings());
  const [saved, setSaved] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    "voice" | "ai" | "rewrite" | "about"
  >("voice");
  const [editingRewriteStyleId, setEditingRewriteStyleId] = React.useState<
    string | null
  >(null);
  const [isCreateRewriteStyleOpen, setIsCreateRewriteStyleOpen] =
    React.useState(false);
  const [newRewriteStyleName, setNewRewriteStyleName] = React.useState("");
  const [newRewriteStylePrompt, setNewRewriteStylePrompt] = React.useState(
    NEW_REWRITE_STYLE_TEMPLATE,
  );
  const [aboutMessage, setAboutMessage] = React.useState("");

  const updateField = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
  ) => {
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
      rewriteStyles: current.rewriteStyles.map((style) =>
        style.id === id ? { ...style, ...patch } : style,
      ),
    }));
  };

  const openCreateRewriteStyle = () => {
    setNewRewriteStyleName(`新风格 ${settings.rewriteStyles.length + 1}`);
    setNewRewriteStylePrompt(NEW_REWRITE_STYLE_TEMPLATE);
    setIsCreateRewriteStyleOpen(true);
  };

  const closeCreateRewriteStyle = () => {
    setIsCreateRewriteStyleOpen(false);
  };

  const addRewriteStyle = () => {
    const id = `rewrite-${Date.now()}`;
    const nextName =
      newRewriteStyleName.trim() || `新风格 ${settings.rewriteStyles.length + 1}`;
    const nextPrompt = newRewriteStylePrompt.trim() || NEW_REWRITE_STYLE_TEMPLATE;
    setSettings((current) => ({
      ...current,
      rewriteStyles: [
        {
          id,
          name: nextName,
          prompt: nextPrompt,
        },
        ...current.rewriteStyles,
      ],
      defaultRewriteStyleId: current.defaultRewriteStyleId || id,
    }));
    setEditingRewriteStyleId(id);
    setIsCreateRewriteStyleOpen(false);
  };

  const removeRewriteStyle = (id: string) => {
    setSettings((current) => {
      if (current.rewriteStyles.length <= 1) {
        return current;
      }
      const rewriteStyles = current.rewriteStyles.filter(
        (style) => style.id !== id,
      );
      return {
        ...current,
        rewriteStyles,
        defaultRewriteStyleId:
          current.defaultRewriteStyleId === id
            ? rewriteStyles[0].id
            : current.defaultRewriteStyleId,
      };
    });
    setEditingRewriteStyleId((current) => (current === id ? null : current));
  };

  const settingsTabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 18px",
    borderRadius: 999,
    border: active
      ? "1px solid rgba(70, 118, 255, 0.35)"
      : "1px solid transparent",
    background: active
      ? "linear-gradient(180deg, rgba(233,239,255,0.98) 0%, rgba(220,230,255,0.92) 100%)"
      : "transparent",
    color: active ? "#2563eb" : "#5f6b82",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  });

  const handleCheckUpdate = async () => {
    setAboutMessage("");
    try {
      const info = await props.onCheckUpdate();
      if (!info) {
        setAboutMessage("暂时没有拿到版本信息。");
        return;
      }

      setAboutMessage(
        info.hasUpdate
          ? `发现新版本 ${info.latestVersion || ""}`.trim()
          : "当前已经是最新版本。",
      );
    } catch (cause) {
      setAboutMessage(getErrorMessage(cause));
    }
  };

  const licenseUsername =
    props.authStatus?.username || props.authSession?.username || "-";
  const licenseExpireTime = formatAuthExpireTime(
    props.authStatus?.expireTime || props.authSession?.expireTime || null,
  );

  return (
    <div style={PAGE_FRAME_STYLE}>
      <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: 8,
            color: "#1d2129",
            fontSize: 18,
            letterSpacing: "-0.02em",
          }}
        >
          设置
        </h2>

        <div
          style={{
            ...PANEL_STYLE,
            display: "flex",
            flexDirection: "column",
            gap: SPACING.md,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              gap: SPACING.xs,
              padding: 5,
              borderRadius: 999,
              background: "rgba(243, 247, 252, 0.88)",
              border: "1px solid rgba(223, 230, 240, 0.92)",
              alignSelf: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("voice")}
              style={settingsTabStyle(activeTab === "voice")}
            >
              配音
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              style={settingsTabStyle(activeTab === "ai")}
            >
              AI 生成
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rewrite")}
              style={settingsTabStyle(activeTab === "rewrite")}
            >
              改写风格
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("about")}
              style={settingsTabStyle(activeTab === "about")}
            >
              关于
            </button>
          </div>

          {activeTab === "voice" ? (
            <>
              <h3 style={{ ...SECTION_TITLE_STYLE, marginTop: 0 }}>配音</h3>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>Access Key</label>
                <input
                  type="password"
                  value={settings.voiceApiKey}
                  onChange={(event) =>
                    updateField("voiceApiKey", event.target.value)
                  }
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>App ID</label>
                <input
                  value={settings.volcengineAppId}
                  onChange={(event) =>
                    updateField("volcengineAppId", event.target.value)
                  }
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>语音 ID</label>
                <input
                  value={settings.voiceId}
                  onChange={(event) =>
                    updateField("voiceId", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField(
                      "voiceSpeechRate",
                      normalizeSpeechRate(event.target.value),
                    )
                  }
                  style={SOFT_INPUT_STYLE}
                />
              </div>
            </>
          ) : activeTab === "ai" ? (
            <>
              <h3 style={{ ...SECTION_TITLE_STYLE, marginTop: 0 }}>AI 生成</h3>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>API Base URL</label>
                <input
                  value={settings.aiUrl}
                  onChange={(event) => updateField("aiUrl", event.target.value)}
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>API Key</label>
                <input
                  type="password"
                  value={settings.aiApiKey}
                  onChange={(event) =>
                    updateField("aiApiKey", event.target.value)
                  }
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={{ ...FIELD_GROUP_STYLE, marginTop: SPACING.md }}>
                <label style={FIELD_LABEL_STYLE}>模型名</label>
                <input
                  value={settings.aiModel}
                  onChange={(event) =>
                    updateField("aiModel", event.target.value)
                  }
                  style={SOFT_INPUT_STYLE}
                />
              </div>
            </>
          ) : activeTab === "rewrite" ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: SPACING.md,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3
                    style={{
                      ...SECTION_TITLE_STYLE,
                      marginTop: 0,
                      marginBottom: 6,
                    }}
                  >
                    改写风格
                  </h3>
                  <p style={{ margin: 0, color: "#86909c", fontSize: 12 }}>
                    在这里管理二创提示词模板。首页改写文案时会使用你选择的风格。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateRewriteStyle}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minWidth: 120,
                    cursor: "pointer",
                  }}
                >
                  新增风格
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: SPACING.md,
                }}
              >
                {settings.rewriteStyles.map((style) => {
                  const isDefault = settings.defaultRewriteStyleId === style.id;
                  const isEditing = editingRewriteStyleId === style.id;
                  const promptPreview = style.prompt
                    .replace(/\s+/g, " ")
                    .trim();
                  return (
                    <div
                      key={style.id}
                      style={{
                        border: isDefault
                          ? "1px solid rgba(22, 93, 255, 0.28)"
                          : "1px solid rgba(229, 230, 235, 0.92)",
                        borderRadius: 10,
                        background: isDefault
                          ? "rgba(232, 243, 255, 0.45)"
                          : "#fff",
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: SPACING.md,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          {isEditing ? (
                            <input
                              value={style.name}
                              onChange={(event) =>
                                updateRewriteStyle(style.id, {
                                  name: event.target.value,
                                })
                              }
                              style={{ ...SOFT_INPUT_STYLE, minWidth: 220 }}
                            />
                          ) : (
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#1d2129",
                              }}
                            >
                              {style.name}
                            </div>
                          )}
                          {isDefault ? (
                            <span
                              style={{
                                fontSize: 12,
                                color: "#165dff",
                                fontWeight: 700,
                              }}
                            >
                              默认
                            </span>
                          ) : null}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingRewriteStyleId((current) =>
                                current === style.id ? null : style.id,
                              )
                            }
                            style={{
                              ...SECONDARY_BUTTON_STYLE,
                              padding: "8px 12px",
                              cursor: "pointer",
                            }}
                          >
                            {isEditing ? "收起" : "编辑"}
                          </button>
                          {!isDefault ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateField("defaultRewriteStyleId", style.id)
                              }
                              style={{
                                ...SECONDARY_BUTTON_STYLE,
                                padding: "8px 12px",
                                cursor: "pointer",
                              }}
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
                              padding: "8px 12px",
                              cursor:
                                settings.rewriteStyles.length <= 1
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                settings.rewriteStyles.length <= 1 ? 0.5 : 1,
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
                            onChange={(event) =>
                              updateRewriteStyle(style.id, {
                                prompt: event.target.value,
                              })
                            }
                            rows={10}
                            style={{
                              ...SOFT_INPUT_STYLE,
                              minHeight: 220,
                              lineHeight: 1.6,
                              marginTop: 12,
                            }}
                          />
                          <p
                            style={{
                              margin: "10px 0 0 0",
                              color: "#86909c",
                              fontSize: 12,
                              lineHeight: 1.6,
                            }}
                          >
                            这里只写风格提示词本身。系统会自动把原文案拼接到后面。
                          </p>
                        </>
                      ) : (
                        <p
                          style={{
                            margin: "12px 0 0 0",
                            color: "#4e5969",
                            fontSize: 13,
                            lineHeight: 1.7,
                          }}
                        >
                          {promptPreview.length > 140
                            ? `${promptPreview.slice(0, 140)}...`
                            : promptPreview}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gap: 18 }}>
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(226, 232, 240, 0.9)",
                    background: "rgba(248,250,252,0.96)",
                    padding: 16,
                    display: "grid",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: 18,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 18,
                        padding: 8,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(245,248,255,0.98)",
                        border: "1px solid rgba(214, 225, 240, 0.96)",
                        boxShadow:
                          "0 2px 8px rgba(148, 163, 184, 0.12), inset 0 1px 0 rgba(255,255,255,0.96)",
                      }}
                    >
                      <BrandLogo size={72} alt={`${APP_NAME} 品牌 Logo`} />
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#2563eb",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {APP_NAME}
                      </div>
                      <h3
                        style={{
                          ...SECTION_TITLE_STYLE,
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                      >
                        关于{APP_NAME}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          color: "#475569",
                          fontSize: 14,
                          lineHeight: 1.8,
                        }}
                      >
                        {APP_DESCRIPTION}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          fontSize: 13,
                          lineHeight: 1.75,
                        }}
                      >
                        它主要用于帮助用户快速创作高质量内容，把灵感整理、文案改写、分镜排版、配音节奏和导出预览串成一条更顺手的创作流程。
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: 13 }}>
                        当前版本
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: 14 }}>
                        {props.appInfo?.currentVersion || "-"}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => void handleCheckUpdate()}
                      disabled={props.updateBusy}
                      style={{
                        ...SECONDARY_BUTTON_STYLE,
                        minWidth: 120,
                        minHeight: 42,
                        cursor: props.updateBusy ? "wait" : "pointer",
                      }}
                    >
                      {props.updateBusy ? "检查中..." : "检查更新"}
                    </button>
                  </div>

                  {aboutMessage ? (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "rgba(37,99,235,0.08)",
                        color: "#1d4ed8",
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {aboutMessage}
                    </div>
                  ) : null}

                  {props.updateError ? (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "rgba(239,68,68,0.1)",
                        color: "#b91c1c",
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {props.updateError}
                    </div>
                  ) : null}

                  <div
                    style={{
                      borderRadius: 10,
                      border: "1px solid rgba(226, 232, 240, 0.92)",
                      background: "rgba(255,255,255,0.82)",
                      padding: 14,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: 13 }}>
                        当前账号
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: 14 }}>
                        {licenseUsername}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: 13 }}>
                        到期时间
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: 14 }}>
                        {licenseExpireTime}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {activeTab !== "about" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingTop: 4,
              }}
            >
              <button
                onClick={handleSave}
                style={{
                  ...PRIMARY_BUTTON_STYLE,
                  minWidth: 160,
                  cursor: "pointer",
                }}
              >
                保存设置
              </button>
              {saved ? (
                <span style={{ color: "#00b42a", fontSize: 12 }}>已保存</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {isCreateRewriteStyleOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.28)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 60,
          }}
          onClick={closeCreateRewriteStyle}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              borderRadius: 14,
              border: "1px solid rgba(15, 23, 42, 0.08)",
              background: "rgba(255,255,255,0.98)",
              boxShadow:
                "0 8px 32px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.92)",
              padding: 24,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3
                    style={{
                      ...SECTION_TITLE_STYLE,
                      marginTop: 0,
                      marginBottom: 6,
                    }}
                  >
                    新增改写风格
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    先填写风格名称和提示词，再创建到风格列表里。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCreateRewriteStyle}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minWidth: 44,
                    minHeight: 44,
                    padding: 0,
                    borderRadius: 14,
                    boxShadow: "none",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>风格名称</label>
                <input
                  value={newRewriteStyleName}
                  onChange={(event) => setNewRewriteStyleName(event.target.value)}
                  placeholder="例如：情绪拉满"
                  style={SOFT_INPUT_STYLE}
                />
              </div>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>提示词</label>
                <textarea
                  value={newRewriteStylePrompt}
                  onChange={(event) => setNewRewriteStylePrompt(event.target.value)}
                  rows={12}
                  style={{
                    ...SOFT_INPUT_STYLE,
                    minHeight: 260,
                    lineHeight: 1.6,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={closeCreateRewriteStyle}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minWidth: 108,
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={addRewriteStyle}
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    minWidth: 128,
                    cursor: "pointer",
                  }}
                >
                  创建风格
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type AuthScreenProps = {
  authContext: AuthContext | null;
  authPreferences: AuthPreferences;
  authSession: AuthSession | null;
  authStatus: AuthStatus | null;
  authBooting: boolean;
  message: string;
  error: string;
  busyAction: string | null;
  onAuthPreferencesChange: (patch: Partial<AuthPreferences>) => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
  onTrial: () => Promise<void>;
  onRecharge: (code: string) => Promise<void>;
  onLogout: () => Promise<void>;
};

function AuthScreen(props: AuthScreenProps) {
  const [username, setUsername] = React.useState(
    props.authPreferences.username,
  );
  const [password, setPassword] = React.useState(
    props.authPreferences.password,
  );
  const [cardCode, setCardCode] = React.useState("");
  const [showRegister, setShowRegister] = React.useState(false);
  const [registerUsername, setRegisterUsername] = React.useState("");
  const [registerPassword, setRegisterPassword] = React.useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] =
    React.useState("");
  const [rechargeModal, setRechargeModal] = React.useState<
    "hidden" | "reminder" | "expired" | "form"
  >("hidden");
  const [lastReminderKey, setLastReminderKey] = React.useState("");
  const [lastExpiredKey, setLastExpiredKey] = React.useState("");

  React.useEffect(() => {
    setUsername(props.authPreferences.username);
  }, [props.authPreferences.username]);

  React.useEffect(() => {
    setPassword(props.authPreferences.password);
  }, [props.authPreferences.password]);

  const submitLogin = async () => {
    try {
      const nextUsername = validateAuthUsername(username);
      const nextPassword = validateAuthPassword(password);
      await props.onLogin(nextUsername, nextPassword);
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const openRegister = () => {
    setRegisterUsername(username.trim());
    setRegisterPassword("");
    setRegisterConfirmPassword("");
    setShowRegister(true);
  };

  const closeRegister = () => {
    if (props.busyAction === "register") {
      return;
    }
    setShowRegister(false);
  };

  const submitRegister = async () => {
    try {
      const nextUsername = validateAuthUsername(registerUsername);
      const nextPassword = validateAuthPassword(registerPassword);
      const nextConfirmPassword = validateAuthPassword(registerConfirmPassword);
      if (nextPassword !== nextConfirmPassword) {
        throw new Error("两次输入的密码不一致");
      }

      await props.onRegister(nextUsername, nextPassword);
      setUsername(nextUsername);
      setPassword(nextPassword);
      setShowRegister(false);
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const submitRecharge = async () => {
    try {
      await props.onRecharge(validateCardCode(cardCode));
      setCardCode("");
      setRechargeModal("hidden");
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const remainingText = props.authStatus
    ? formatRemainingSeconds(props.authStatus.remainingSeconds)
    : "未登录";
  const expireTime =
    props.authStatus?.expireTime || props.authSession?.expireTime || "未激活";
  const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

  React.useEffect(() => {
    if (
      !props.authSession ||
      !props.authStatus ||
      props.authBooting ||
      props.busyAction === "recharge"
    ) {
      return;
    }

    const statusKey = [
      props.authStatus.username,
      props.authStatus.expireTime || "",
      props.authStatus.remainingSeconds,
      props.authStatus.isValid ? "valid" : "invalid",
    ].join("|");

    if (
      props.authStatus.isValid &&
      props.authStatus.remainingSeconds > 0 &&
      props.authStatus.remainingSeconds <= THIRTY_DAYS_SECONDS
    ) {
      if (lastReminderKey !== statusKey) {
        setLastReminderKey(statusKey);
        setRechargeModal("reminder");
      }
      return;
    }

    if (props.authStatus.remainingSeconds <= 0 || !props.authStatus.isValid) {
      if (lastExpiredKey !== statusKey) {
        setLastExpiredKey(statusKey);
        setRechargeModal("expired");
      }
    }
  }, [
    THIRTY_DAYS_SECONDS,
    lastExpiredKey,
    lastReminderKey,
    props.authBooting,
    props.authSession,
    props.authStatus,
    props.busyAction,
  ]);

  const cardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid rgba(15, 23, 42, 0.08)",
    background: "rgba(255,255,255,0.98)",
    boxShadow:
      "0 8px 32px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.88)",
    padding: 22,
  };
  const inputStyle: React.CSSProperties = {
    ...SOFT_INPUT_STYLE,
    minHeight: 46,
    borderRadius: 8,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(255,255,255,0.88)",
    color: "#0f172a",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "20px 24px",
        position: "relative",
        background:
          "radial-gradient(circle at 18% 18%, rgba(214,228,255,0.82) 0%, rgba(214,228,255,0) 34%), linear-gradient(180deg, #f7f8fb 0%, #edf2f7 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ display: "grid", gap: 16 }}>
            {/* 极简头部 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 2,
              }}
            >
              <BrandLogo size={32} alt={APP_NAME} />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                }}
              >
                {APP_NAME}
              </span>
            </div>

            {props.message ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(17,185,129,0.1)",
                  color: "#047857",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {props.message}
              </div>
            ) : null}

            {props.error ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.1)",
                  color: "#b91c1c",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {props.error}
              </div>
            ) : null}

            {props.authStatus &&
            !props.authStatus.isValid &&
            props.authStatus.validMessage ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(244,63,94,0.06)",
                  color: "#be123c",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                当前授权不可用。{props.authStatus.validMessage}
              </div>
            ) : null}

            <div style={FIELD_GROUP_STYLE}>
              <label style={FIELD_LABEL_STYLE}>用户名</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={FIELD_GROUP_STYLE}>
              <label style={FIELD_LABEL_STYLE}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#475569",
                  cursor:
                    props.authBooting || !!props.busyAction
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={props.authPreferences.rememberPassword}
                  disabled={props.authBooting || !!props.busyAction}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    props.onAuthPreferencesChange({
                      rememberPassword: checked,
                      autoLogin: checked
                        ? props.authPreferences.autoLogin
                        : false,
                      username,
                      password,
                    });
                  }}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                />
                记住密码
              </label>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: props.authPreferences.rememberPassword
                    ? "#475569"
                    : "#94a3b8",
                  cursor:
                    props.authBooting ||
                    !!props.busyAction ||
                    !props.authPreferences.rememberPassword
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={props.authPreferences.autoLogin}
                  disabled={
                    props.authBooting ||
                    !!props.busyAction ||
                    !props.authPreferences.rememberPassword
                  }
                  onChange={(event) => {
                    props.onAuthPreferencesChange({
                      autoLogin: event.target.checked,
                      username,
                      password,
                    });
                  }}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                />
                自动登录
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => void submitLogin()}
                disabled={props.authBooting || !!props.busyAction}
                style={{
                  ...PRIMARY_BUTTON_STYLE,
                  minHeight: 42,
                  borderRadius: 8,
                  cursor:
                    props.authBooting || props.busyAction ? "wait" : "pointer",
                }}
              >
                {props.busyAction === "login" ? "登录中..." : "登录"}
              </button>
              <button
                type="button"
                onClick={openRegister}
                disabled={props.authBooting || !!props.busyAction}
                style={{
                  ...SECONDARY_BUTTON_STYLE,
                  minHeight: 42,
                  borderRadius: 8,
                  cursor:
                    props.authBooting || props.busyAction ? "wait" : "pointer",
                }}
              >
                {props.busyAction === "register" ? "注册中..." : "注册"}
              </button>
            </div>

            {props.authSession ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => void props.onLogout()}
                  disabled={!!props.busyAction}
                  style={{
                    ...QUIET_DANGER_BUTTON_STYLE,
                    minHeight: 32,
                    padding: "0 10px",
                    cursor: props.busyAction ? "wait" : "pointer",
                  }}
                >
                  退出登录
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showRegister ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.34)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 40,
          }}
          onClick={closeRegister}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              ...cardStyle,
              padding: 22,
              boxShadow:
                "0 30px 80px rgba(15,23,42,0.2), inset 0 1px 0 rgba(255,255,255,0.88)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#9a7b34",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Create Account
                  </div>
                  <h2
                    style={{
                      margin: "10px 0 0",
                      fontSize: 26,
                      lineHeight: 1.12,
                      color: "#0f172a",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    注册账号
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeRegister}
                  disabled={props.busyAction === "register"}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minWidth: 44,
                    minHeight: 44,
                    borderRadius: 14,
                    padding: 0,
                    boxShadow: "none",
                    cursor:
                      props.busyAction === "register" ? "wait" : "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>用户名</label>
                <input
                  value={registerUsername}
                  onChange={(event) => setRegisterUsername(event.target.value)}
                  style={inputStyle}
                  placeholder="3-50 个字符，不能包含空格"
                />
              </div>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>密码</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  style={inputStyle}
                  placeholder="至少 6 个字符"
                />
              </div>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>确认密码</label>
                <input
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(event) =>
                    setRegisterConfirmPassword(event.target.value)
                  }
                  style={inputStyle}
                  placeholder="再次输入密码"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={closeRegister}
                  disabled={props.busyAction === "register"}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minHeight: 40,
                    borderRadius: 8,
                    boxShadow: "none",
                    cursor:
                      props.busyAction === "register" ? "wait" : "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void submitRegister()}
                  disabled={props.authBooting || !!props.busyAction}
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    minHeight: 40,
                    borderRadius: 8,
                    cursor:
                      props.authBooting || props.busyAction
                        ? "wait"
                        : "pointer",
                  }}
                >
                  {props.busyAction === "register" ? "注册中..." : "确认注册"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {rechargeModal === "reminder" ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.28)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 38,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              ...cardStyle,
              padding: 22,
            }}
          >
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#9a7b34",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Renewal Reminder
                </div>
                <h2
                  style={{
                    margin: "10px 0 0",
                    fontSize: 24,
                    lineHeight: 1.15,
                    color: "#0f172a",
                    letterSpacing: "-0.03em",
                  }}
                >
                  授权即将到期
                </h2>
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#64748b",
                    lineHeight: 1.7,
                    fontSize: 14,
                  }}
                >
                  当前授权剩余 {remainingText}，到期时间 {expireTime}
                  。是否现在充值续费？
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setRechargeModal("hidden");
                    setLastReminderKey("");
                    setLastExpiredKey("");
                  }}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minHeight: 40,
                    borderRadius: 8,
                    boxShadow: "none",
                    cursor: "pointer",
                  }}
                >
                  稍后再说
                </button>
                <button
                  type="button"
                  onClick={() => setRechargeModal("form")}
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    minHeight: 40,
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  去充值
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {rechargeModal === "expired" ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.28)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 38,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              ...cardStyle,
              padding: 22,
            }}
          >
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#9a7b34",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Renewal Required
                </div>
                <h2
                  style={{
                    margin: "10px 0 0",
                    fontSize: 24,
                    lineHeight: 1.15,
                    color: "#0f172a",
                    letterSpacing: "-0.03em",
                  }}
                >
                  授权已到期
                </h2>
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#64748b",
                    lineHeight: 1.7,
                    fontSize: 14,
                  }}
                >
                  当前账号授权已到期，请充值后继续使用。到期时间 {expireTime}。
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setRechargeModal("hidden");
                    setLastReminderKey("");
                    setLastExpiredKey("");
                  }}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minHeight: 40,
                    borderRadius: 8,
                    boxShadow: "none",
                    cursor: "pointer",
                  }}
                >
                  暂不充值
                </button>
                <button
                  type="button"
                  onClick={() => setRechargeModal("form")}
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    minHeight: 40,
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  立即充值
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {rechargeModal === "form" ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.34)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 40,
          }}
          onClick={() => {
            if (props.busyAction !== "recharge") {
              setRechargeModal("hidden");
            }
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              ...cardStyle,
              padding: 22,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#9a7b34",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Recharge License
                  </div>
                  <h2
                    style={{
                      margin: "10px 0 0",
                      fontSize: 24,
                      lineHeight: 1.15,
                      color: "#0f172a",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    充值续费
                  </h2>
                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#64748b",
                      lineHeight: 1.6,
                      fontSize: 14,
                    }}
                  >
                    {props.authSession
                      ? `当前到期时间 ${expireTime}，剩余 ${remainingText}`
                      : "请先登录账号，再进行充值。"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRechargeModal("hidden")}
                  disabled={props.busyAction === "recharge"}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minWidth: 44,
                    minHeight: 44,
                    borderRadius: 14,
                    padding: 0,
                    boxShadow: "none",
                    cursor:
                      props.busyAction === "recharge" ? "wait" : "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={FIELD_GROUP_STYLE}>
                <label style={FIELD_LABEL_STYLE}>充值卡密</label>
                <input
                  value={cardCode}
                  onChange={(event) => setCardCode(event.target.value)}
                  placeholder={
                    props.authSession
                      ? "输入卡密后为当前账号续费"
                      : "请先登录后再充值"
                  }
                  style={inputStyle}
                  disabled={!props.authSession}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setRechargeModal("hidden")}
                  disabled={props.busyAction === "recharge"}
                  style={{
                    ...SECONDARY_BUTTON_STYLE,
                    minHeight: 40,
                    borderRadius: 8,
                    boxShadow: "none",
                    cursor:
                      props.busyAction === "recharge" ? "wait" : "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void submitRecharge()}
                  disabled={
                    !props.authSession ||
                    props.authBooting ||
                    !!props.busyAction
                  }
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    minHeight: 40,
                    borderRadius: 8,
                    cursor:
                      !props.authSession ||
                      props.authBooting ||
                      props.busyAction
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {props.busyAction === "recharge" ? "充值中..." : "确认充值"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type UpdateNoticeModalProps = {
  appInfo: AuthAppInfo;
  busy: boolean;
  error: string;
  onUpdateNow: () => Promise<void>;
  onDismiss: () => void;
};

function UpdateNoticeModal(props: UpdateNoticeModalProps) {
  const latestVersion = props.appInfo.latestVersion || "最新版本";
  const isForceUpdate = props.appInfo.forceUpdate;
  const hasDownloadUrl = Boolean(props.appInfo.downloadUrl);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.28)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: 20,
        zIndex: 80,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          borderRadius: 14,
          border: "1px solid rgba(15, 23, 42, 0.08)",
          background: "rgba(255,255,255,0.98)",
          boxShadow:
            "0 8px 32px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.92)",
          padding: 22,
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#9a7b34",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Version Update
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 26,
                lineHeight: 1.14,
                color: "#0f172a",
                letterSpacing: "-0.03em",
              }}
            >
              {isForceUpdate ? "请先更新到新版本" : "发现新版本"}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                color: "#64748b",
              }}
            >
              当前版本 {props.appInfo.currentVersion}，最新版本 {latestVersion}
              。
              {isForceUpdate
                ? " 当前版本已被标记为必须更新。"
                : " 你可以现在更新，也可以稍后处理。"}
            </p>
          </div>

          <div
            style={{
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(248, 250, 252, 0.9)",
              padding: "12px 14px",
              display: "grid",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13,
                color: "#475569",
              }}
            >
              <span>当前版本</span>
              <strong style={{ color: "#0f172a" }}>
                {props.appInfo.currentVersion}
              </strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13,
                color: "#475569",
              }}
            >
              <span>最新版本</span>
              <strong style={{ color: "#0f172a" }}>{latestVersion}</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13,
                color: "#475569",
              }}
            >
              <span>更新方式</span>
              <strong style={{ color: "#0f172a" }}>
                {hasDownloadUrl ? "打开下载地址" : "暂未提供下载地址"}
              </strong>
            </div>
          </div>

          {props.error ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.1)",
                color: "#b91c1c",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {props.error}
            </div>
          ) : null}

          {!hasDownloadUrl ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(245,158,11,0.12)",
                color: "#b45309",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              服务端还没有返回下载地址，暂时无法直接跳转更新。
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isForceUpdate
                ? "1fr"
                : "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {!isForceUpdate ? (
              <button
                type="button"
                onClick={props.onDismiss}
                disabled={props.busy}
                style={{
                  ...SECONDARY_BUTTON_STYLE,
                  minHeight: 40,
                  borderRadius: 8,
                  boxShadow: "none",
                  cursor: props.busy ? "wait" : "pointer",
                }}
              >
                稍后提醒
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void props.onUpdateNow()}
              disabled={props.busy || !hasDownloadUrl}
              style={{
                ...PRIMARY_BUTTON_STYLE,
                minHeight: 40,
                borderRadius: 8,
                cursor: props.busy
                  ? "wait"
                  : !hasDownloadUrl
                    ? "not-allowed"
                    : "pointer",
                opacity: !hasDownloadUrl ? 0.6 : 1,
              }}
            >
              {props.busy ? "正在打开下载地址..." : "立即更新"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout(props: { children: React.ReactNode }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        padding: "10px 12px 10px 6px",
        gap: 12,
        background:
          "radial-gradient(circle at 16% 18%, rgba(214,228,255,0.94) 0%, rgba(214,228,255,0) 32%), radial-gradient(circle at 84% 12%, rgba(222,244,241,0.82) 0%, rgba(222,244,241,0) 26%), linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)",
      }}
    >
      <a href="#app-main" className="skip-link">
        跳到主内容
      </a>
      <div
        style={{
          width: COMPACT_UI.navWidth,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 30,
        }}
      >
        <nav
          aria-label="主导航"
          className="dock-nav"
          style={{
            width: 60,
            padding: "10px 6px",
            borderRadius: 24,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.96) 100%)",
            border: "1px solid rgba(223, 230, 240, 0.95)",
            boxShadow:
              "0 4px 16px rgba(148, 163, 184, 0.16), inset 0 1px 0 rgba(255,255,255,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            position: "relative",
            zIndex: 30,
          }}
        >
          <div
            title={`${APP_NAME} · ${APP_TAGLINE}`}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(238,244,255,0.96) 100%)",
              border: "1px solid rgba(214, 225, 240, 0.96)",
              boxShadow:
                "0 2px 6px rgba(148, 163, 184, 0.12), inset 0 1px 0 rgba(255,255,255,0.96)",
              marginBottom: 6,
            }}
          >
            <BrandLogo size={32} alt={`${APP_NAME} 品牌 Logo`} />
          </div>
          <div
            aria-hidden="true"
            style={{
              width: 30,
              height: 1,
              background: "rgba(148, 163, 184, 0.3)",
              marginBottom: 2,
            }}
          />
          {NAV_ITEMS.map((item, index) => {
            const active = location.pathname === item.path;
            const isLast = index === NAV_ITEMS.length - 1;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  active
                    ? "dock-nav__link dock-nav__link--active"
                    : "dock-nav__link"
                }
                style={{
                  ...dockLinkStyle(active),
                  marginTop: isLast ? 12 : 0,
                }}
                aria-label={item.label}
                title={item.label}
              >
                <span style={{ display: "inline-flex" }}>{item.icon}</span>
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
          overflow: isHomePage ? "hidden" : "auto",
          paddingRight: 0,
        }}
      >
        <div
          style={{
            height: isHomePage ? "calc(100vh - 20px)" : undefined,
            minHeight: isHomePage ? undefined : "calc(100vh - 20px)",
            maxWidth: COMPACT_UI.shellMaxWidth,
            margin: "0 auto",
            borderRadius: 12,
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(224,231,240,0.9)",
            boxShadow:
              "0 1px 4px rgba(148, 163, 184, 0.10), 0 2px 8px rgba(148, 163, 184, 0.06)",
            overflow: "hidden",
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
  const [project, setProject] = React.useState<Project | null>(() =>
    loadProject(),
  );
  const [authPreferences, setAuthPreferences] = React.useState<AuthPreferences>(
    loadAuthPreferences(),
  );
  const [authContext, setAuthContext] = React.useState<AuthContext | null>(
    null,
  );
  const [authSession, setAuthSession] = React.useState<AuthSession | null>(
    null,
  );
  const [authStatus, setAuthStatus] = React.useState<AuthStatus | null>(null);
  const [authAppInfo, setAuthAppInfo] = React.useState<AuthAppInfo | null>(
    null,
  );
  const [authBooting, setAuthBooting] = React.useState(true);
  const [authMessage, setAuthMessage] = React.useState("");
  const [authError, setAuthError] = React.useState("");
  const [authBusyAction, setAuthBusyAction] = React.useState<string | null>(
    null,
  );
  const [updateBusy, setUpdateBusy] = React.useState(false);
  const [updateError, setUpdateError] = React.useState("");
  const [dismissedUpdateVersion, setDismissedUpdateVersion] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    saveProject(project);
  }, [project]);

  React.useEffect(() => {
    saveAuthPreferences(authPreferences);
  }, [authPreferences]);

  React.useEffect(() => {
    if (authBooting) {
      return;
    }

    if (shouldPersistAuthToken(authPreferences) && authSession?.token) {
      saveAuthToken(authSession.token);
      return;
    }

    clearAuthToken();
  }, [
    authBooting,
    authPreferences.autoLogin,
    authPreferences.rememberPassword,
    authSession?.token,
  ]);

  React.useEffect(() => {
    let cancelled = false;

    const loadAppInfo = async () => {
      try {
        const info = await invokeTauri<AuthAppInfo>("auth_get_app_info", {});
        if (cancelled) {
          return;
        }
        setAuthAppInfo(info);
      } catch (cause) {
        if (!cancelled) {
          console.warn("Failed to load app update info:", cause);
        }
      }
    };

    void loadAppInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      setAuthBooting(true);
      setAuthError("");

      try {
        const storedAuthPreferences = loadAuthPreferences();
        const context = await invokeTauri<AuthContext>("auth_get_context", {});
        if (cancelled) {
          return;
        }
        setAuthContext(context);

        const token = loadAuthToken();
        if (!shouldPersistAuthToken(storedAuthPreferences)) {
          clearAuthToken();
          setAuthSession(null);
          setAuthStatus(null);
          return;
        }

        if (!token) {
          setAuthSession(null);
          setAuthStatus(null);

          if (
            storedAuthPreferences.username.trim() &&
            storedAuthPreferences.password
          ) {
            const session = await invokeTauri<AuthSession>("auth_login", {
              username: storedAuthPreferences.username.trim(),
              password: storedAuthPreferences.password,
            });
            if (cancelled) {
              return;
            }

            const status = await invokeTauri<AuthStatus>("auth_get_status", {});
            if (cancelled) {
              return;
            }

            setAuthSession(session);
            setAuthStatus(status);
            setAuthMessage(`已自动登录 ${status.username}`);
          }
          return;
        }

        const session = await invokeTauri<AuthSession>("auth_restore_session", {
          token,
        });
        if (cancelled) {
          return;
        }

        const status = await invokeTauri<AuthStatus>("auth_get_status", {});
        if (cancelled) {
          return;
        }

        setAuthSession(session);
        setAuthStatus(status);
      } catch (cause) {
        if (cancelled) {
          return;
        }
        clearAuthToken();
        setAuthSession(null);
        setAuthStatus(null);
        setAuthError(getErrorMessage(cause));
      } finally {
        if (!cancelled) {
          setAuthBooting(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const completeLogin = React.useCallback(async (session: AuthSession) => {
    setAuthSession(session);
    const status = await invokeTauri<AuthStatus>("auth_get_status", {});
    setAuthStatus(status);
    return status;
  }, []);

  const updateAuthPreferencesState = React.useCallback(
    (patch: Partial<AuthPreferences>) => {
      setAuthPreferences((current) =>
        normalizeAuthPreferences({ ...current, ...patch }),
      );
    },
    [],
  );

  const handleLogin = React.useCallback(
    async (username: string, password: string) => {
      setAuthBusyAction("login");
      setAuthError("");
      setAuthMessage("");

      try {
        const session = await invokeTauri<AuthSession>("auth_login", {
          username,
          password,
        });
        const status = await completeLogin(session);
        setAuthPreferences((current) =>
          normalizeAuthPreferences({
            ...current,
            username,
            password,
          }),
        );
        setAuthMessage(
          status.isValid
            ? `登录成功，欢迎回来 ${status.username}`
            : `登录成功，但当前授权无效${status.validMessage ? `：${status.validMessage}` : ""}`,
        );
      } catch (cause) {
        const message = getErrorMessage(cause);
        setAuthError(message);
        throw new Error(message);
      } finally {
        setAuthBusyAction(null);
      }
    },
    [completeLogin],
  );

  const handleRegister = React.useCallback(
    async (username: string, password: string) => {
      setAuthBusyAction("register");
      setAuthError("");
      setAuthMessage("");

      try {
        const result = await invokeTauri<AuthRegisterResult>("auth_register", {
          username,
          password,
        });
        setAuthMessage(`注册成功，用户 ${result.username} 已创建，请直接登录`);
      } catch (cause) {
        const message = getErrorMessage(cause);
        setAuthError(message);
        throw new Error(message);
      } finally {
        setAuthBusyAction(null);
      }
    },
    [],
  );

  const handleTrial = React.useCallback(async () => {
    setAuthBusyAction("trial");
    setAuthError("");
    setAuthMessage("");

    try {
      const result = await invokeTauri<AuthTrialResult>("auth_trial", {});
      const hours = Math.floor((result.addedSeconds || 0) / 3600);
      setAuthMessage(
        result.expireTime
          ? `试用申请成功，可用时长约 ${hours} 小时，到期时间 ${result.expireTime}`
          : result.message || "试用申请成功，请登录后继续使用",
      );
    } catch (cause) {
      const message = getErrorMessage(cause);
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthBusyAction(null);
    }
  }, []);

  const handleRecharge = React.useCallback(
    async (code: string) => {
      if (!authSession) {
        throw new Error("请先登录后再续费");
      }

      setAuthBusyAction("recharge");
      setAuthError("");
      setAuthMessage("");

      try {
        const result = await invokeTauri<AuthRechargeResult>("auth_recharge", {
          code,
        });
        const status = await invokeTauri<AuthStatus>("auth_get_status", {});
        setAuthStatus(status);
        setAuthSession((current) =>
          current
            ? {
                ...current,
                isValid: status.isValid,
                expireTime: status.expireTime,
                validMessage: status.validMessage,
                username: status.username,
              }
            : current,
        );
        setAuthMessage(
          result.newExpireTime
            ? `续费成功，新到期时间 ${result.newExpireTime}`
            : result.message || "续费成功",
        );
      } catch (cause) {
        const message = getErrorMessage(cause);
        setAuthError(message);
        throw new Error(message);
      } finally {
        setAuthBusyAction(null);
      }
    },
    [authSession],
  );

  const handleLogout = React.useCallback(async () => {
    setAuthBusyAction("logout");
    setAuthError("");

    try {
      await invokeTauri<void>("auth_logout", {});
    } catch {
      // Ignore logout cleanup errors and still clear local session.
    } finally {
      clearAuthToken();
      setAuthSession(null);
      setAuthStatus(null);
      setAuthMessage("已退出登录");
      setAuthBusyAction(null);
    }
  }, []);

  React.useEffect(() => {
    if (!authSession || !authStatus?.isValid) {
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const scheduleNext = (ms: number) => {
      if (cancelled) {
        return;
      }
      timer = window.setTimeout(() => {
        void runHeartbeat();
      }, ms);
    };

    const runHeartbeat = async () => {
      try {
        const heartbeat = await invokeTauri<AuthHeartbeat>(
          "auth_heartbeat",
          {},
        );
        if (cancelled) {
          return;
        }

        if (heartbeat.commands.includes("force_logout")) {
          void invokeTauri<void>("auth_logout", {});
          clearAuthToken();
          setAuthSession(null);
          setAuthStatus(null);
          setAuthError("授权被服务器强制下线，请重新登录");
          return;
        }

        setAuthSession((current) =>
          current
            ? {
                ...current,
                username: heartbeat.username,
                isValid: heartbeat.isValid,
                expireTime: heartbeat.expireTime,
                validMessage: heartbeat.validMessage,
                heartInterval: heartbeat.interval,
                heartbeatTimeout: heartbeat.heartbeatTimeout,
              }
            : current,
        );
        setAuthStatus((current) =>
          current
            ? {
                ...current,
                username: heartbeat.username,
                isValid: heartbeat.isValid,
                isActive: heartbeat.isActive,
                expireTime: heartbeat.expireTime,
                validMessage: heartbeat.validMessage,
                hwid: heartbeat.hwid,
                deviceName: heartbeat.deviceName,
              }
            : {
                username: heartbeat.username,
                isValid: heartbeat.isValid,
                isActive: heartbeat.isActive,
                expireTime: heartbeat.expireTime,
                expireTimestamp: null,
                remainingSeconds: 0,
                validMessage: heartbeat.validMessage,
                hwid: heartbeat.hwid,
                deviceName: heartbeat.deviceName,
              },
        );

        if (!heartbeat.isValid) {
          setAuthMessage(
            heartbeat.validMessage || "当前授权已失效，请续费后继续使用",
          );
          return;
        }

        scheduleNext(Math.max(15, heartbeat.interval || 60) * 1000);
      } catch (cause) {
        if (cancelled) {
          return;
        }
        setAuthMessage(`心跳检查失败，将自动重试：${getErrorMessage(cause)}`);
        scheduleNext(15000);
      }
    };

    scheduleNext(1000);

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [authSession, authStatus?.isValid]);

  const refreshAppInfo = React.useCallback(async () => {
    setUpdateBusy(true);
    setUpdateError("");

    try {
      const info = await invokeTauri<AuthAppInfo>("auth_get_app_info", {});
      setAuthAppInfo(info);
      return info;
    } catch (cause) {
      const message = getErrorMessage(cause);
      setUpdateError(message);
      throw new Error(message);
    } finally {
      setUpdateBusy(false);
    }
  }, []);

  const hasValidAccess = Boolean(authSession && authStatus?.isValid);

  // 根据登录状态动态调整窗口大小（通过 Rust 命令，绕过 JS window API 兼容问题）
  React.useEffect(() => {
    if (authBooting) {
      return;
    }

    if (hasValidAccess) {
      void invokeTauri("resize_window", {
        width: 980,
        height: 700,
        minWidth: 860,
        minHeight: 620,
      }).catch((e) => console.warn("[resize_window]", e));
    } else {
      void invokeTauri("resize_window", {
        width: 580,
        height: 520,
        minWidth: 520,
        minHeight: 460,
      }).catch((e) => console.warn("[resize_window]", e));
    }
  }, [hasValidAccess, authBooting]);

  const visibleUpdateInfo =
    authAppInfo &&
    authAppInfo.hasUpdate &&
    (authAppInfo.forceUpdate ||
      dismissedUpdateVersion !== authAppInfo.latestVersion)
      ? authAppInfo
      : null;

  const handleUpdateNow = React.useCallback(async () => {
    if (!authAppInfo?.downloadUrl) {
      setUpdateError("当前没有可用的更新地址。");
      return;
    }

    setUpdateBusy(true);
    setUpdateError("");

    try {
      await invokeTauri<void>("open_external_url", {
        url: authAppInfo.downloadUrl,
      });
    } catch (cause) {
      setUpdateError(getErrorMessage(cause));
    } finally {
      setUpdateBusy(false);
    }
  }, [authAppInfo]);

  const handleDismissUpdate = React.useCallback(() => {
    if (!authAppInfo || authAppInfo.forceUpdate) {
      return;
    }

    setDismissedUpdateVersion(
      authAppInfo.latestVersion || authAppInfo.currentVersion,
    );
    setUpdateError("");
  }, [authAppInfo]);

  return (
    <ErrorBoundary>
      <>
        {hasValidAccess ? (
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage project={project} onProjectChange={setProject} />
                }
              />
              <Route
                path="/editor"
                element={
                  <EditorPage project={project} onProjectChange={setProject} />
                }
              />
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    appInfo={authAppInfo}
                    authContext={authContext}
                    authSession={authSession}
                    authStatus={authStatus}
                    updateBusy={updateBusy}
                    updateError={updateError}
                    onCheckUpdate={refreshAppInfo}
                    onOpenUpdate={handleUpdateNow}
                  />
                }
              />
            </Routes>
          </Layout>
        ) : (
          <AuthScreen
            authContext={authContext}
            authPreferences={authPreferences}
            authSession={authSession}
            authStatus={authStatus}
            authBooting={authBooting}
            message={authMessage}
            error={authError}
            busyAction={authBusyAction}
            onAuthPreferencesChange={updateAuthPreferencesState}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onTrial={handleTrial}
            onRecharge={handleRecharge}
            onLogout={handleLogout}
          />
        )}

        {visibleUpdateInfo ? (
          <UpdateNoticeModal
            appInfo={visibleUpdateInfo}
            busy={updateBusy}
            error={updateError}
            onUpdateNow={handleUpdateNow}
            onDismiss={handleDismissUpdate}
          />
        ) : null}
      </>
    </ErrorBoundary>
  );
}
