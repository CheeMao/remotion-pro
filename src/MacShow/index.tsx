import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { MacSlide } from './MacSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';

const defaultSlides = [
  {
    title: '把复杂内容做成像 Mac 应用一样顺滑的横屏视频',
    subtitle: '更适合教程、产品介绍、复盘和知识讲解',
    type: 'hero' as const,
    data: {
      badge: 'macOS style layout',
      cta: 'Build a clean story',
    },
  },
  {
    title: '为什么横屏更适合这类内容',
    subtitle: '信息层级更舒展，页面能真正有主副区分',
    type: 'list' as const,
    data: {
      items: [
        { text: '更宽的叙事空间', desc: '可以同时摆正文、侧栏、图表和对比信息' },
        { text: '更像产品界面', desc: '适合教程、演示、工作流和工具类内容' },
        { text: '镜头更稳定', desc: '减少竖屏里一味堆叠卡片的局促感' },
      ],
    },
  },
  {
    title: '核心指标一眼就能看明白',
    subtitle: '横屏里做统计页，更像真实数据面板',
    type: 'stats' as const,
    data: {
      stats: [
        { value: 92, suffix: '%', label: '信息可读性' },
        { value: 3.2, suffix: 'x', label: '布局延展性' },
        { value: 18, suffix: 's', label: '理解启动时间' },
      ],
    },
  },
  {
    title: '结尾就用更明确的收束页',
    subtitle: '给结论，也给动作，不再只是普通结尾',
    type: 'cta' as const,
    data: {
      cta: '用 MacShow 做下一条横屏视频',
      items: ['教程讲解', '产品演示', '工作流复盘'],
    },
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('MacShow');

export const MacShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'MacShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#eef2f7' }}>
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
            <MacSlide
              title={slide.title || ''}
              subtitle={slide.subtitle}
              points={(slide as { points?: string[] }).points}
              type={(slide as { type?: string }).type as React.ComponentProps<typeof MacSlide>['type']}
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
