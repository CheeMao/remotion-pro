// 11 个 layout 的火柴人编排函数
//
// 每个函数: (frame, dur) → Pose
// 内部用 phase 划分，相邻 phase 间用 lerp 插值

import { Easing, interpolate } from 'remotion';
import {
  POSE_BOW,
  POSE_CHEER,
  POSE_HOLD_UP,
  POSE_IDLE,
  POSE_JUMP,
  POSE_POINT_DOWN,
  POSE_POINT_LEFT,
  POSE_POINT_RIGHT,
  POSE_POINT_UP,
  POSE_SIT,
  POSE_SURPRISE,
  POSE_THINK,
  POSE_WALK_A,
  POSE_WALK_B,
  POSE_WAVE,
  type Pose,
} from './poses';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const interpolatePose = (a: Pose, b: Pose, t: number): Pose => ({
  leftShoulder: lerp(a.leftShoulder, b.leftShoulder, t),
  leftForearm: lerp(a.leftForearm, b.leftForearm, t),
  rightShoulder: lerp(a.rightShoulder, b.rightShoulder, t),
  rightForearm: lerp(a.rightForearm, b.rightForearm, t),
  leftHip: lerp(a.leftHip, b.leftHip, t),
  leftShin: lerp(a.leftShin, b.leftShin, t),
  rightHip: lerp(a.rightHip, b.rightHip, t),
  rightShin: lerp(a.rightShin, b.rightShin, t),
  bodyX: lerp(a.bodyX, b.bodyX, t),
  bodyY: lerp(a.bodyY, b.bodyY, t),
  bodyTilt: lerp(a.bodyTilt, b.bodyTilt, t),
  bodyScale: lerp(a.bodyScale, b.bodyScale, t),
  expression: t > 0.55 ? b.expression : a.expression,
});

const easeT = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const withPos = (
  pose: Pose,
  overrides: Partial<Pick<Pose, 'bodyX' | 'bodyY' | 'bodyScale' | 'bodyTilt'>>,
): Pose => ({ ...pose, ...overrides });

// 步态循环：A→B→A→B
const walkCycle = (frame: number, bodyX: number, bodyY: number, scale: number): Pose => {
  const phase = Math.floor(frame / 8) % 2;
  const base = phase === 0 ? POSE_WALK_A : POSE_WALK_B;
  return withPos(base, { bodyX, bodyY, bodyScale: scale });
};

// 浮动呼吸：让 idle 不那么僵硬
const breathe = (pose: Pose, frame: number, intensity = 6): Pose => {
  const offset = Math.sin(frame * 0.08) * intensity;
  return { ...pose, bodyY: pose.bodyY + offset };
};

// ===== 11 layout choreography =====

// HERO: 走入场 → 挥手 → 指向上方标题
export const heroChoreo = (frame: number): Pose => {
  const baseY = 1380;
  const baseScale = 0.78;
  if (frame < 30) {
    const t = easeT(frame, 0, 30);
    return walkCycle(frame, lerp(-200, 540, t), baseY, baseScale);
  }
  if (frame < 60) {
    return interpolatePose(
      withPos(POSE_IDLE, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }),
      withPos(POSE_WAVE, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }),
      easeT(frame, 30, 50),
    );
  }
  if (frame < 95) {
    return interpolatePose(
      withPos(POSE_WAVE, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }),
      withPos(POSE_POINT_UP, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }),
      easeT(frame, 60, 85),
    );
  }
  return breathe(withPos(POSE_POINT_UP, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }), frame, 4);
};

// STATS: 站立 → 每个数字弹出时跳起惊讶
export const statsChoreo = (frame: number): Pose => {
  const baseX = 200;
  const baseY = 1420;
  const baseScale = 0.62;
  // 在 30, 70, 110 时各跳一次
  const triggers = [30, 70, 110];
  for (const t of triggers) {
    if (frame >= t && frame < t + 18) {
      const p = easeT(frame, t, t + 9);
      const back = easeT(frame, t + 9, t + 18);
      const a = interpolatePose(
        withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: baseScale }),
        withPos(POSE_SURPRISE, { bodyX: baseX, bodyY: baseY - 60, bodyScale: baseScale }),
        p,
      );
      return interpolatePose(
        a,
        withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: baseScale }),
        back,
      );
    }
  }
  return breathe(withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: baseScale }), frame);
};

// COMPARE: 走到左 → 指左 → 走到右 → 指右
export const compareChoreo = (frame: number): Pose => {
  const baseY = 1480;
  const scale = 0.52;
  if (frame < 25) {
    const t = easeT(frame, 0, 25);
    return walkCycle(frame, lerp(540, 270, t), baseY, scale);
  }
  if (frame < 60) {
    return interpolatePose(
      withPos(POSE_IDLE, { bodyX: 270, bodyY: baseY, bodyScale: scale }),
      withPos(POSE_POINT_LEFT, { bodyX: 270, bodyY: baseY, bodyScale: scale }),
      easeT(frame, 25, 45),
    );
  }
  if (frame < 90) {
    const t = easeT(frame, 60, 90);
    return walkCycle(frame, lerp(270, 810, t), baseY, scale);
  }
  return interpolatePose(
    withPos(POSE_IDLE, { bodyX: 810, bodyY: baseY, bodyScale: scale }),
    withPos(POSE_POINT_RIGHT, { bodyX: 810, bodyY: baseY, bodyScale: scale }),
    easeT(frame, 90, 110),
  );
};

// CHART: 跟着进度条往上跳 → 末了欢呼
export const chartChoreo = (frame: number): Pose => {
  const baseX = 180;
  const baseY = 1480;
  const scale = 0.55;
  const beats = [25, 55, 85];
  for (const t of beats) {
    if (frame >= t && frame < t + 14) {
      return interpolatePose(
        withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }),
        withPos(POSE_JUMP, { bodyX: baseX, bodyY: baseY - 50, bodyScale: scale }),
        easeT(frame, t, t + 7),
      );
    }
  }
  if (frame >= 110) {
    return interpolatePose(
      withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }),
      withPos(POSE_CHEER, { bodyX: baseX, bodyY: baseY, bodyScale: scale }),
      easeT(frame, 110, 130),
    );
  }
  return breathe(withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), frame);
};

// STEPS: 横向走动，停在每个步骤旁
export const stepsChoreo = (frame: number, stepCount = 4): Pose => {
  const baseY = 1480;
  const scale = 0.48;
  const positions: number[] = [];
  for (let i = 0; i < stepCount; i++) {
    positions.push(180 + (720 / Math.max(1, stepCount - 1)) * i);
  }
  const stepDur = 35;
  const idx = Math.floor(frame / stepDur);
  if (idx >= positions.length) {
    return breathe(withPos(POSE_POINT_DOWN, { bodyX: positions[positions.length - 1], bodyY: baseY, bodyScale: scale }), frame);
  }
  const local = frame - idx * stepDur;
  const fromX = idx === 0 ? -150 : positions[idx - 1];
  const toX = positions[idx];
  if (local < 18) {
    const t = easeT(local, 0, 18);
    return walkCycle(frame, lerp(fromX, toX, t), baseY, scale);
  }
  return interpolatePose(
    withPos(POSE_IDLE, { bodyX: toX, bodyY: baseY, bodyScale: scale }),
    withPos(POSE_POINT_DOWN, { bodyX: toX, bodyY: baseY, bodyScale: scale }),
    easeT(local, 18, 32),
  );
};

// TIMELINE: 沿时间线走，每年份停一下
export const timelineChoreo = (frame: number, count = 4): Pose => {
  const baseY = 1480;
  const scale = 0.48;
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    positions.push(180 + (720 / Math.max(1, count - 1)) * i);
  }
  const stepDur = 30;
  const idx = Math.floor(frame / stepDur);
  if (idx >= positions.length) {
    return breathe(withPos(POSE_IDLE, { bodyX: positions[positions.length - 1], bodyY: baseY, bodyScale: scale }), frame);
  }
  const local = frame - idx * stepDur;
  const fromX = idx === 0 ? -100 : positions[idx - 1];
  const toX = positions[idx];
  if (local < 18) {
    const t = easeT(local, 0, 18);
    return walkCycle(frame, lerp(fromX, toX, t), baseY, scale);
  }
  return breathe(withPos(POSE_IDLE, { bodyX: toX, bodyY: baseY, bodyScale: scale }), frame);
};

// LIST: 右下盘腿坐着听
export const listChoreo = (frame: number): Pose => {
  const baseX = 880;
  const baseY = 1490;
  const scale = 0.5;
  if (frame < 20) {
    const t = easeT(frame, 0, 20);
    return interpolatePose(
      withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }),
      withPos(POSE_SIT, { bodyX: baseX, bodyY: baseY + 30, bodyScale: scale }),
      t,
    );
  }
  // 偶尔点头
  const nod = Math.sin(frame * 0.06) * 4;
  return { ...withPos(POSE_SIT, { bodyX: baseX, bodyY: baseY + 30, bodyScale: scale }), bodyTilt: nod };
};

// HIGHLIGHT: 中下，每个关键词冒出时惊讶
export const highlightChoreo = (frame: number): Pose => {
  const baseX = 540;
  const baseY = 1490;
  const scale = 0.5;
  const triggers = [25, 55, 85, 115];
  for (const t of triggers) {
    if (frame >= t && frame < t + 16) {
      return interpolatePose(
        withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }),
        withPos(POSE_SURPRISE, { bodyX: baseX, bodyY: baseY - 30, bodyScale: scale }),
        easeT(frame, t, t + 8),
      );
    }
  }
  return breathe(withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), frame);
};

// QUOTE: 右下，举着引号牌沉思
export const quoteChoreo = (frame: number): Pose => {
  const baseX = 850;
  const baseY = 1480;
  const scale = 0.55;
  if (frame < 25) {
    const t = easeT(frame, 0, 25);
    return interpolatePose(
      withPos(POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }),
      withPos(POSE_HOLD_UP, { bodyX: baseX, bodyY: baseY, bodyScale: scale }),
      t,
    );
  }
  return breathe(withPos(POSE_HOLD_UP, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), frame, 4);
};

// CTA: 中央，挥手 → 跳 → 指向按钮 → 持续跳
export const ctaChoreo = (frame: number): Pose => {
  const baseY = 1430;
  const scale = 0.7;
  if (frame < 25) {
    return interpolatePose(
      withPos(POSE_IDLE, { bodyX: 540, bodyY: baseY, bodyScale: scale }),
      withPos(POSE_WAVE, { bodyX: 540, bodyY: baseY, bodyScale: scale }),
      easeT(frame, 0, 25),
    );
  }
  if (frame < 50) {
    return interpolatePose(
      withPos(POSE_WAVE, { bodyX: 540, bodyY: baseY, bodyScale: scale }),
      withPos(POSE_JUMP, { bodyX: 540, bodyY: baseY - 70, bodyScale: scale }),
      easeT(frame, 25, 40),
    );
  }
  if (frame < 80) {
    return interpolatePose(
      withPos(POSE_JUMP, { bodyX: 540, bodyY: baseY - 70, bodyScale: scale }),
      withPos(POSE_POINT_UP, { bodyX: 540, bodyY: baseY, bodyScale: scale }),
      easeT(frame, 50, 70),
    );
  }
  // 持续脉冲跳
  const pulse = Math.sin((frame - 80) * 0.18) * 24;
  return withPos(POSE_POINT_UP, { bodyX: 540, bodyY: baseY - Math.abs(pulse), bodyScale: scale });
};

// DEFAULT: 右下盘腿坐听
export const defaultChoreo = (frame: number): Pose => listChoreo(frame);

// THINK 模式 (备用)
export const thinkChoreo = (frame: number): Pose =>
  breathe(withPos(POSE_THINK, { bodyX: 540, bodyY: 1500, bodyScale: 0.75 }), frame, 5);

// BOW 模式 (备用)
export const bowChoreo = (): Pose =>
  withPos(POSE_BOW, { bodyX: 540, bodyY: 1500, bodyScale: 0.8 });
