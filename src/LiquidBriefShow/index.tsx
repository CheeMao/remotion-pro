import {AbsoluteFill,Audio,Sequence,staticFile,useVideoConfig} from 'remotion';
import {LiquidBriefSlide} from './LiquidBriefSlide';
import {getSlideTiming,getStaticAssetPath,useContentJson} from '../hooks/useContentJson';
import {getTemplateContentPath} from '../project-content';

const defaultSlides = [
  {
    title: '液态玻璃也能做清晰知\n识页',
    subtitle: '柔和不等于松散，层级仍然必须明确',
    badge: 'LIQUID BRIEF',
    type: 'cover' as const,
    items: [
      {number: '01', title: '大标题负责抓注意力', color: '#ff9ecf'},
      {number: '02', title: '结构卡片负责讲清楚', color: '#8be8e2'},
      {number: '03', title: '色彩负责分区但不抢信息', color: '#ffcb9b'},
    ],
    durationInFrames: 180,
  },
  {
    title: '同一套风格里，\n可以拆出多种信息页',
    subtitle: '不是每页都长一样，而是每页都有明确职责',
    badge: 'PAGE SYSTEM',
    type: 'cards' as const,
    data: {
      cards: [
        {eyebrow: '标题页', title: '先建立主题', body: '用更大的标题、更少的字，先把主题钉住。', color: '#ff9ecf'},
        {eyebrow: '拆解页', title: '再拆成模块', body: '把一个观点拆成几张小卡片，让阅读顺序自然往下走。', color: '#8be8e2'},
        {eyebrow: '对比页', title: '用对照讲差异', body: '左右结构最适合讲方案差异、前后状态和取舍。', color: '#b6a7ff'},
        {eyebrow: '数据页', title: '用数字做锚点', body: '数字负责抓重点，说明文字负责给数字一个解释。', color: '#ffcb9b'},
      ],
    },
    durationInFrames: 180,
  },
  {
    title: '信息页不是堆字，\n而是安排阅读顺序',
    subtitle: '让观众先看哪里，再看哪里，最后记住哪里',
    badge: 'READING FLOW',
    type: 'steps' as const,
    data: {
      steps: [
        {title: '第一层先抓主结论', description: '首页只讲一个中心观点，标题需要比正文更有存在感。', color: '#ff9ecf'},
        {title: '第二层再讲分论点', description: '用分卡片承接内容，每一块只说一件事，避免横向抢夺注意力。', color: '#8be8e2'},
        {title: '第三层补解释和细节', description: '小字只负责解释，不负责抢视觉中心，这样阅读才稳定。', color: '#ffcb9b'},
      ],
    },
    durationInFrames: 180,
  },
  {
    title: '液态感可以柔和，\n但结构必须更硬',
    subtitle: '视觉氛围和信息秩序，应该各司其职',
    badge: 'COMPARE',
    type: 'compare' as const,
    data: {
      centerLabel: '对照',
      left: {
        label: '错误做法',
        title: '把所有元素都做得很软',
        points: ['标题、正文、装饰都差不多重', '背景色和内容色混在一起', '页面会变好看但难读'],
      },
      right: {
        label: '推荐做法',
        title: '让层级比风格更明确',
        points: ['标题重量最大', '卡片边界稳定', '颜色只做区分，不抢正文'],
      },
    },
    durationInFrames: 180,
  },
  {
    title: '数字页要做的，\n是把结论说得更快',
    subtitle: '数据不是为了显得专业，而是为了缩短理解时间',
    badge: 'METRICS',
    type: 'stats' as const,
    data: {
      stats: [
        {label: '首屏理解', value: '3秒', note: '观众通常在前三秒判断这页值不值得看。', color: '#ff9ecf'},
        {label: '卡片数量', value: '3块', note: '一页三块最稳，既清楚也不拥挤。', color: '#8be8e2'},
        {label: '主色数量', value: '2-3种', note: '颜色越少，信息越容易被看清。', color: '#ffcb9b'},
      ],
      insights: [
        '大数字负责记忆点，说明负责把数字翻译成人话。',
        '卡片之间的留白比装饰更重要，留白本身就是层级。',
        '只要标题和卡片顺序清楚，液态玻璃也能非常理性。',
      ],
    },
    durationInFrames: 180,
  },
  {
    title: '真正高级的玻璃感，\n不是模糊，而是克制',
    subtitle: '好的风格应该服务内容，而不是反过来压住内容',
    badge: 'CLOSING NOTE',
    type: 'quote' as const,
    data: {
      quote: '先把信息结构搭稳，再给它加柔和的光、雾和颜色。这样页面既有气质，也不会失去清晰度。',
      author: 'Liquid Brief 设计原则',
      tags: ['标题先行', '结构清楚', '颜色克制', '玻璃做氛围'],
    },
    durationInFrames: 180,
  },
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
      {slides.map((slide, index) => {
        const {from, duration} = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);

        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <LiquidBriefSlide
              title={slide.title || ''}
              subtitle={slide.subtitle}
              badge={slide.badge}
              items={(slide as {items?: Array<{number: string; title: string; color?: string}>}).items}
              type={(slide as {type?: 'cover'|'cards'|'steps'|'compare'|'stats'|'quote'}).type}
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
