import {AbsoluteFill,Audio,Sequence,staticFile,useVideoConfig} from 'remotion';
import {LiquidBriefSlide} from './LiquidBriefSlide';
import {getSlideTiming,getStaticAssetPath,useContentJson} from '../hooks/useContentJson';
import {getTemplateContentPath} from '../project-content';
import {SubtitleOverlay} from '../renderers/SubtitleOverlay';

// ============================================================
// DEMO 内容 — 修改这里可预览所有 10 种 layout 效果
// LiquidBrief 类型映射：cover=hero, cards=list
// ============================================================
const DEMO = {
  // cover（= hero）
  coverTitle:    '液态玻璃知识页',
  coverSubtitle: '柔和不等于松散，层级仍然必须明确',
  coverBadge:    'LIQUID BRIEF',
  coverItems:    [
    { number: '01', title: '大标题负责抓注意力', color: '#ff9ecf' },
    { number: '02', title: '结构卡片负责讲清楚', color: '#8be8e2' },
    { number: '03', title: '色彩分区但不抢信息', color: '#ffcb9b' },
  ],

  // cards（= list）
  cardsTitle:    '信息页的四种职责',
  cardsSubtitle: '不是每页都长一样，而是每页都有明确职责',
  cardsBadge:    'PAGE SYSTEM',
  cardsData:     [
    { eyebrow: '标题页', title: '先建立主题', body: '用更大的标题先把主题钉住。', color: '#ff9ecf' },
    { eyebrow: '拆解页', title: '再拆成模块', body: '把一个观点拆成几张小卡片。', color: '#8be8e2' },
    { eyebrow: '对比页', title: '用对照讲差异', body: '左右结构最适合讲方案差异。', color: '#b6a7ff' },
    { eyebrow: '数据页', title: '用数字做锚点', body: '数字负责抓重点，文字负责解释。', color: '#ffcb9b' },
  ],

  // steps
  stepsTitle:    '信息页阅读顺序设计',
  stepsSubtitle: '让观众先看哪里，再看哪里，最后记住哪里',
  stepsBadge:    'READING FLOW',
  stepsData:     [
    { title: '第一层先抓主结论',  description: '首页只讲一个中心观点。', color: '#ff9ecf' },
    { title: '第二层再讲分论点',  description: '每一块只说一件事。', color: '#8be8e2' },
    { title: '第三层补解释细节',  description: '小字只负责解释，不抢视觉中心。', color: '#ffcb9b' },
  ],

  // compare
  compareTitle:    '液态感与结构感',
  compareSubtitle: '视觉氛围和信息秩序，应该各司其职',
  compareBadge:    'COMPARE',
  compareLeft:     { label: '错误做法', title: '把所有元素都做得很软',
    points: ['标题正文装饰都差不多重', '背景色和内容色混在一起'] },
  compareRight:    { label: '推荐做法', title: '让层级比风格更明确',
    points: ['标题重量最大', '卡片边界稳定'] },

  // stats
  statsTitle:    '数字页的三个原则',
  statsSubtitle: '数据不是为了显得专业，而是为了缩短理解时间',
  statsBadge:    'METRICS',
  statsData:     [
    { label: '首屏理解', value: '3秒',  note: '观众在前三秒判断这页值不值得看。', color: '#ff9ecf' },
    { label: '卡片数量', value: '3块',  note: '一页三块最稳，既清楚也不拥挤。', color: '#8be8e2' },
    { label: '主色数量', value: '2-3种', note: '颜色越少，信息越容易被看清。', color: '#ffcb9b' },
  ],
  statsInsights: ['大数字负责记忆点，说明负责把数字翻译成人话。', '留白比装饰更重要，留白本身就是层级。'],

  // timeline
  timelineTitle:    '设计风格演进',
  timelineSubtitle: '从复杂到克制的审美进化',
  timelineBadge:    'TIMELINE',
  timelineData:     [
    { year: '2018', title: '拟物风流行',    description: '大量阴影、纹理、3D 效果' },
    { year: '2020', title: '扁平化统治',    description: '极简线条，色块驱动' },
    { year: '2022', title: '毛玻璃兴起',    description: 'macOS 带动模糊透明风' },
    { year: '2025', title: '液态玻璃成熟',  description: '克制的光感与强结构并存' },
  ],

  // chart
  chartTitle:    '各类页面阅读完成率',
  chartSubtitle: '结构越清晰，观众读完率越高',
  chartBadge:    'DATA',
  chartBars:     [
    { label: '标题页',  percent: 95, value: 95 },
    { label: '列表页',  percent: 82, value: 82 },
    { label: '数据页',  percent: 76, value: 76 },
    { label: '对比页',  percent: 88, value: 88 },
  ],

  // quote
  quoteTitle:    '设计哲学',
  quoteSubtitle: '',
  quoteBadge:    'CLOSING NOTE',
  quoteText:     '先把信息结构搭稳，再给它加柔和的光、雾和颜色。这样页面既有气质，也不会失去清晰度。',
  quoteAuthor:   'Liquid Brief 设计原则',
  quoteTags:     ['标题先行', '结构清楚', '颜色克制', '玻璃做氛围'],

  // highlight
  highlightTitle:    '关键设计词',
  highlightSubtitle: '这些词决定了页面的气质',
  highlightBadge:    'KEYWORDS',
  highlightItems:    ['层级', '克制', '光感', '留白', '结构', '清晰'],

  // cta
  ctaTitle:    '先搭结构，再加玻璃感',
  ctaSubtitle: '不需要换工具，需要换思路',
  ctaBadge:    'CTA',
  ctaText:     '点赞收藏',
};

const defaultSlides = [
  // 1. cover — 封面
  { title: DEMO.coverTitle, subtitle: DEMO.coverSubtitle, badge: DEMO.coverBadge,
    type: 'cover' as const, items: DEMO.coverItems, durationInFrames: 180 },
  // 2. cards — 列表卡片
  { title: DEMO.cardsTitle, subtitle: DEMO.cardsSubtitle, badge: DEMO.cardsBadge,
    type: 'cards' as const, data: { cards: DEMO.cardsData }, durationInFrames: 180 },
  // 3. steps — 步骤
  { title: DEMO.stepsTitle, subtitle: DEMO.stepsSubtitle, badge: DEMO.stepsBadge,
    type: 'steps' as const, data: { steps: DEMO.stepsData }, durationInFrames: 180 },
  // 4. compare — 对比
  { title: DEMO.compareTitle, subtitle: DEMO.compareSubtitle, badge: DEMO.compareBadge,
    type: 'compare' as const, data: { centerLabel: 'VS', left: DEMO.compareLeft, right: DEMO.compareRight }, durationInFrames: 180 },
  // 5. stats — 数据统计
  { title: DEMO.statsTitle, subtitle: DEMO.statsSubtitle, badge: DEMO.statsBadge,
    type: 'stats' as const, data: { stats: DEMO.statsData, insights: DEMO.statsInsights }, durationInFrames: 180 },
  // 6. timeline — 时间线
  { title: DEMO.timelineTitle, subtitle: DEMO.timelineSubtitle, badge: DEMO.timelineBadge,
    type: 'timeline' as const, data: { timeline: DEMO.timelineData }, durationInFrames: 180 },
  // 7. chart — 柱状图
  { title: DEMO.chartTitle, subtitle: DEMO.chartSubtitle, badge: DEMO.chartBadge,
    type: 'chart' as const, data: { bars: DEMO.chartBars }, durationInFrames: 180 },
  // 8. highlight — 关键词
  { title: DEMO.highlightTitle, subtitle: DEMO.highlightSubtitle, badge: DEMO.highlightBadge,
    type: 'highlight' as const, data: { highlights: DEMO.highlightItems }, durationInFrames: 180 },
  // 9. quote — 引言
  { title: DEMO.quoteTitle, subtitle: DEMO.quoteSubtitle, badge: DEMO.quoteBadge,
    type: 'quote' as const, data: { quote: DEMO.quoteText, author: DEMO.quoteAuthor, tags: DEMO.quoteTags }, durationInFrames: 180 },
  // 10. cta — 行动页
  { title: DEMO.ctaTitle, subtitle: DEMO.ctaSubtitle, badge: DEMO.ctaBadge,
    type: 'cta' as const, data: { cta: DEMO.ctaText }, durationInFrames: 180 },
];

const DEFAULT_SLIDE_DURATION = 180;
const CONTENT_PATH = getTemplateContentPath('LiquidBriefShow');

export const LiquidBriefShow: React.FC = () => {
  const {fps} = useVideoConfig();
  const {slides, soundtrackPath} = useContentJson(defaultSlides, {
    expectedTemplate: 'LiquidBriefShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{background: '#ebe7e8'}}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      <SubtitleOverlay slides={slides} template="LiquidBriefShow" />
      {slides.map((slide, index) => {
        const {from, duration} = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);
        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <LiquidBriefSlide
              title={slide.title || ''}
              subtitle={slide.subtitle}
              badge={slide.badge}
              items={(slide as {items?: Array<{number: string; title: string; color?: string}>}).items}
              type={(slide as {type?: 'cover'|'cards'|'steps'|'compare'|'stats'|'timeline'|'chart'|'highlight'|'quote'|'cta'}).type}
              data={(slide as {data?: Record<string, unknown>}).data}
              index={index}
              totalSlides={slides.length}
              durationInFrames={duration}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
