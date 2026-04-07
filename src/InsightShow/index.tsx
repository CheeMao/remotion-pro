import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { InsightSlide } from "./InsightSlide";
import { getSlideTiming, getStaticAssetPath, useContentJson } from "../hooks/useContentJson";
import { getTemplateContentPath } from "../project-content";

const defaultSlides = [
  {
    title: "AI 正在重新定义什么叫「会编程」",
    subtitle: "不是会写代码，而是会指挥代码",
    type: "hero" as const,
    data: {
      badge: "AI 编程范式",
      cta: "看看真正的变化在哪",
      items: ["理解问题", "设计方案", "验证结果"],
    },
  },
  {
    title: "过去五年 AI 编程工具的演进",
    subtitle: "从自动补全到自主完成任务",
    type: "timeline" as const,
    data: {
      timeline: [
        { year: "2021", title: "GitHub Copilot 发布", description: "行级代码补全成为主流" },
        { year: "2022", title: "ChatGPT 改变对话方式", description: "自然语言写代码成为可能" },
        { year: "2023", title: "Agent 框架涌现", description: "AI 开始自主规划和执行任务" },
        { year: "2024", title: "Cursor / Windsurf 崛起", description: "整个项目级别的 AI 协作" },
      ],
    },
  },
  {
    title: "AI 编程提升了多少效率",
    subtitle: "来自真实工程团队的数据",
    type: "stats" as const,
    data: {
      stats: [
        { value: 55, suffix: "%", label: "代码生成占比", note: "GitHub 2024 调研" },
        { value: 3.2, suffix: "x", label: "任务完成速度", note: "对比人工编写" },
        { value: 78, suffix: "%", label: "开发者采用率", note: "头部科技公司" },
      ],
    },
  },
  {
    title: "不是所有代码都该让 AI 写",
    subtitle: "清楚边界，才能用好工具",
    type: "compare" as const,
    data: {
      left: {
        label: "适合 AI",
        value: "样板代码",
        desc: "CRUD、配置、测试用例、文档注释",
        points: ["重复性高", "有明确规范", "容易验证"],
      },
      right: {
        label: "需要人判断",
        value: "架构决策",
        desc: "系统边界、技术选型、安全约束",
        points: ["依赖上下文", "涉及权衡取舍", "难以自动验证"],
      },
    },
  },
  {
    title: "学会和 AI 协作的核心能力",
    subtitle: "这些能力不会被 AI 替代，反而更重要",
    type: "list" as const,
    data: {
      items: [
        { icon: "01", text: "问题拆解", desc: "把模糊需求转化为可执行任务" },
        { icon: "02", text: "上下文管理", desc: "给 AI 提供恰当的背景信息" },
        { icon: "03", text: "结果验证", desc: "快速判断 AI 输出是否正确" },
        { icon: "04", text: "迭代提示", desc: "通过对话引导 AI 逼近最优解" },
      ],
    },
  },
  {
    title: "现在开始，用 AI 重新定义你的工作流",
    subtitle: "不是替代，而是放大你的判断力",
    type: "cta" as const,
    data: {
      cta: "从下一个项目开始实践",
      items: ["AI 编程", "效率提升", "知识洞察"],
    },
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath("InsightShow");

export const InsightShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: "InsightShow",
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: "#0a0f1e" }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);

        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <InsightSlide
              title={slide.title || ""}
              subtitle={slide.subtitle}
              points={(slide as { points?: string[] }).points}
              type={(slide as { type?: string }).type as React.ComponentProps<typeof InsightSlide>["type"]}
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
