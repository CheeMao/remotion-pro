import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { getTemplateContentPath } from '../project-content';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { WideSlide } from './WideSlide';

const defaultSlides = [
  {
    title: '横屏内容表达更适合演示型视频',
    subtitle: '把重点结构、信息对比和讲解节奏放到更宽的视觉空间里。',
    points: ['左侧讲结论与标题', '右侧容纳要点与说明', '适合教程、演示、发布会风格'],
  },
  {
    title: '同样的文案结构，单独走横屏模板',
    subtitle: '不改竖屏模板，不做兼容判断，直接新增一套横版视觉。',
    points: ['保留 title / subtitle / points', '继续支持配音时间轴', '可直接预览与导出'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('SlideShowWide');

export const SlideShowWide: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'SlideShowWide',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#050816' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          fps,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <WideSlide
              title={slide.title || `Slide ${index + 1}`}
              subtitle={slide.subtitle}
              points={slide.points}
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
