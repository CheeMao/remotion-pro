import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { StickSlide } from "./StickSlide";
import { getSlideTiming, getStaticAssetPath, useContentJson } from "../hooks/useContentJson";
import { getTemplateContentPath } from "../project-content";

const defaultSlides = [
  {
    title: "为什么 AI 编程没让你变快",
    subtitle: "也许你只是把 AI 当成了打字员",
    type: "hero" as const,
    data: {
      badge: "AI 编程真相",
      cta: "看完你就懂了",
    },
  },
  {
    title: "新手 vs 老手用 AI 的根本差别",
    subtitle: "差别不在工具，在心态",
    type: "compare" as const,
    data: {
      left: {
        label: "新手",
        value: "让 AI 写代码",
        desc: "把需求扔给 AI 等结果",
      },
      right: {
        label: "老手",
        value: "让 AI 验证思路",
        desc: "先有判断再让 AI 落地",
      },
    },
  },
  {
    title: "真实数据：效率到底提升了多少",
    subtitle: "GitHub 2024 全球开发者调研",
    type: "stats" as const,
    data: {
      stats: [
        { value: 55, suffix: "%", label: "代码生成占比" },
        { value: 3.2, suffix: "x", label: "任务完成速度" },
        { value: 78, suffix: "%", label: "采用率" },
      ],
    },
  },
  {
    title: "想用好 AI，先练这四个基本功",
    subtitle: "工具会变，能力不会",
    type: "steps" as const,
    data: {
      steps: [
        { title: "问题拆解", description: "把模糊需求转成清晰任务" },
        { title: "上下文管理", description: "给 AI 足够背景信息" },
        { title: "结果验证", description: "快速判断输出是否正确" },
        { title: "迭代提示", description: "通过对话逼近最优解" },
      ],
    },
  },
  {
    title: "记住一句话",
    subtitle: "",
    type: "quote" as const,
    data: {
      quote: "AI 不会让你失业，不会用 AI 的人才会",
      author: "AI 编程箴言",
    },
  },
  {
    title: "今天就开始练，从下一行代码开始",
    subtitle: "不需要换工具，需要换思路",
    type: "cta" as const,
    data: {
      cta: "点赞收藏",
      items: ["AI 编程", "效率提升", "Cursor", "认知升级"],
    },
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath("StickShow");

export const StickShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: "StickShow",
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: "#1a1814" }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);

        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <StickSlide
              title={slide.title || ""}
              subtitle={slide.subtitle}
              points={(slide as { points?: string[] }).points}
              type={(slide as { type?: string }).type as React.ComponentProps<typeof StickSlide>["type"]}
              data={(slide as { data?: Record<string, unknown> }).data}
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
