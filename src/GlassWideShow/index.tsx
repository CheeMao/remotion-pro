import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { GlassWideSlide } from "./GlassWideSlide";
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from "../hooks/useContentJson";
import { getTemplateContentPath } from "../project-content";

const defaultSlides = [
  {
    title: "Glass Horizon",
    subtitle: "横屏更适合做结构清晰、节奏舒展的展示型视频。",
    points: ["左侧讲概念", "右侧承载重点", "适合发布会与方案展示"],
  },
  {
    title: "Clear Story",
    subtitle: "玻璃质感保留高级感，但信息排布更适合横向阅读。",
    points: ["更宽的标题区", "更完整的对比空间", "更自然的讲解节奏"],
  },
  {
    title: "Present Better",
    subtitle: "不是把竖屏硬拉宽，而是重做适合横屏的结构。",
    points: ["更强层级", "更稳定重心", "更适合桌面预览"],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath("GlassWideShow");

export const GlassWideShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: "GlassWideShow",
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: "#071120" }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);
        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <GlassWideSlide
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
