import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { NeuWideSlide } from "./NeuWideSlide";
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from "../hooks/useContentJson";
import { getTemplateContentPath } from "../project-content";

const defaultSlides = [
  {
    title: "Soft Horizon",
    subtitle: "软质感风格在横屏里更适合做稳定、克制、重心明确的内容展示。",
    points: ["节奏更稳", "内容更清楚", "适合教程与说明"],
  },
  {
    title: "Calm Layout",
    subtitle: "横屏 Neu 风格不追求炫技，而是让信息有明确先后顺序。",
    points: ["左侧做核心", "右侧做展开", "整体更耐看"],
  },
  {
    title: "Wide Balance",
    subtitle: "保留柔和触感，但把布局做成更适合桌面观看的比例。",
    points: ["统一阴影", "统一圆角", "统一信息节奏"],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath("NeuWideShow");

export const NeuWideShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: "NeuWideShow",
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: "#e8edf4" }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);
        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <NeuWideSlide
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
