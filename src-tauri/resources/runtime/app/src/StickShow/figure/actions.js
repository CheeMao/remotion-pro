"use strict";
// 11 个 layout 的火柴人编排函数
//
// 每个函数: (frame, dur) → Pose
// 内部用 phase 划分，相邻 phase 间用 lerp 插值
Object.defineProperty(exports, "__esModule", { value: true });
exports.bowChoreo = exports.thinkChoreo = exports.defaultChoreo = exports.ctaChoreo = exports.quoteChoreo = exports.highlightChoreo = exports.listChoreo = exports.timelineChoreo = exports.stepsChoreo = exports.chartChoreo = exports.compareChoreo = exports.statsChoreo = exports.heroChoreo = exports.interpolatePose = void 0;
const remotion_1 = require("remotion");
const poses_1 = require("./poses");
const lerp = (a, b, t) => a + (b - a) * t;
const interpolatePose = (a, b, t) => ({
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
exports.interpolatePose = interpolatePose;
const easeT = (frame, from, to) => (0, remotion_1.interpolate)(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: remotion_1.Easing.out(remotion_1.Easing.cubic),
});
const withPos = (pose, overrides) => ({ ...pose, ...overrides });
// 步态循环：A→B→A→B
const walkCycle = (frame, bodyX, bodyY, scale) => {
    const phase = Math.floor(frame / 8) % 2;
    const base = phase === 0 ? poses_1.POSE_WALK_A : poses_1.POSE_WALK_B;
    return withPos(base, { bodyX, bodyY, bodyScale: scale });
};
// 浮动呼吸：让 idle 不那么僵硬
const breathe = (pose, frame, intensity = 6) => {
    const offset = Math.sin(frame * 0.08) * intensity;
    return { ...pose, bodyY: pose.bodyY + offset };
};
// ===== 11 layout choreography =====
// HERO: 走入场 → 挥手 → 指向上方标题
const heroChoreo = (frame) => {
    const baseY = 1380;
    const baseScale = 0.78;
    if (frame < 30) {
        const t = easeT(frame, 0, 30);
        return walkCycle(frame, lerp(-200, 540, t), baseY, baseScale);
    }
    if (frame < 60) {
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }), withPos(poses_1.POSE_WAVE, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }), easeT(frame, 30, 50));
    }
    if (frame < 95) {
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_WAVE, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }), withPos(poses_1.POSE_POINT_UP, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }), easeT(frame, 60, 85));
    }
    return breathe(withPos(poses_1.POSE_POINT_UP, { bodyX: 540, bodyY: baseY, bodyScale: baseScale }), frame, 4);
};
exports.heroChoreo = heroChoreo;
// STATS: 站立 → 每个数字弹出时跳起惊讶
const statsChoreo = (frame) => {
    const baseX = 200;
    const baseY = 1420;
    const baseScale = 0.62;
    // 在 30, 70, 110 时各跳一次
    const triggers = [30, 70, 110];
    for (const t of triggers) {
        if (frame >= t && frame < t + 18) {
            const p = easeT(frame, t, t + 9);
            const back = easeT(frame, t + 9, t + 18);
            const a = (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: baseScale }), withPos(poses_1.POSE_SURPRISE, { bodyX: baseX, bodyY: baseY - 60, bodyScale: baseScale }), p);
            return (0, exports.interpolatePose)(a, withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: baseScale }), back);
        }
    }
    return breathe(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: baseScale }), frame);
};
exports.statsChoreo = statsChoreo;
// COMPARE: 走到左 → 指左 → 走到右 → 指右
const compareChoreo = (frame) => {
    const baseY = 1480;
    const scale = 0.52;
    if (frame < 25) {
        const t = easeT(frame, 0, 25);
        return walkCycle(frame, lerp(540, 270, t), baseY, scale);
    }
    if (frame < 60) {
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: 270, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_POINT_LEFT, { bodyX: 270, bodyY: baseY, bodyScale: scale }), easeT(frame, 25, 45));
    }
    if (frame < 90) {
        const t = easeT(frame, 60, 90);
        return walkCycle(frame, lerp(270, 810, t), baseY, scale);
    }
    return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: 810, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_POINT_RIGHT, { bodyX: 810, bodyY: baseY, bodyScale: scale }), easeT(frame, 90, 110));
};
exports.compareChoreo = compareChoreo;
// CHART: 跟着进度条往上跳 → 末了欢呼
const chartChoreo = (frame) => {
    const baseX = 180;
    const baseY = 1480;
    const scale = 0.55;
    const beats = [25, 55, 85];
    for (const t of beats) {
        if (frame >= t && frame < t + 14) {
            return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_JUMP, { bodyX: baseX, bodyY: baseY - 50, bodyScale: scale }), easeT(frame, t, t + 7));
        }
    }
    if (frame >= 110) {
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_CHEER, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), easeT(frame, 110, 130));
    }
    return breathe(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), frame);
};
exports.chartChoreo = chartChoreo;
// STEPS: 横向走动，停在每个步骤旁
const stepsChoreo = (frame, stepCount = 4) => {
    const baseY = 1480;
    const scale = 0.48;
    const positions = [];
    for (let i = 0; i < stepCount; i++) {
        positions.push(180 + (720 / Math.max(1, stepCount - 1)) * i);
    }
    const stepDur = 35;
    const idx = Math.floor(frame / stepDur);
    if (idx >= positions.length) {
        return breathe(withPos(poses_1.POSE_POINT_DOWN, { bodyX: positions[positions.length - 1], bodyY: baseY, bodyScale: scale }), frame);
    }
    const local = frame - idx * stepDur;
    const fromX = idx === 0 ? -150 : positions[idx - 1];
    const toX = positions[idx];
    if (local < 18) {
        const t = easeT(local, 0, 18);
        return walkCycle(frame, lerp(fromX, toX, t), baseY, scale);
    }
    return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: toX, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_POINT_DOWN, { bodyX: toX, bodyY: baseY, bodyScale: scale }), easeT(local, 18, 32));
};
exports.stepsChoreo = stepsChoreo;
// TIMELINE: 沿时间线走，每年份停一下
const timelineChoreo = (frame, count = 4) => {
    const baseY = 1480;
    const scale = 0.48;
    const positions = [];
    for (let i = 0; i < count; i++) {
        positions.push(180 + (720 / Math.max(1, count - 1)) * i);
    }
    const stepDur = 30;
    const idx = Math.floor(frame / stepDur);
    if (idx >= positions.length) {
        return breathe(withPos(poses_1.POSE_IDLE, { bodyX: positions[positions.length - 1], bodyY: baseY, bodyScale: scale }), frame);
    }
    const local = frame - idx * stepDur;
    const fromX = idx === 0 ? -100 : positions[idx - 1];
    const toX = positions[idx];
    if (local < 18) {
        const t = easeT(local, 0, 18);
        return walkCycle(frame, lerp(fromX, toX, t), baseY, scale);
    }
    return breathe(withPos(poses_1.POSE_IDLE, { bodyX: toX, bodyY: baseY, bodyScale: scale }), frame);
};
exports.timelineChoreo = timelineChoreo;
// LIST: 右下盘腿坐着听
const listChoreo = (frame) => {
    const baseX = 880;
    const baseY = 1490;
    const scale = 0.5;
    if (frame < 20) {
        const t = easeT(frame, 0, 20);
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_SIT, { bodyX: baseX, bodyY: baseY + 30, bodyScale: scale }), t);
    }
    // 偶尔点头
    const nod = Math.sin(frame * 0.06) * 4;
    return { ...withPos(poses_1.POSE_SIT, { bodyX: baseX, bodyY: baseY + 30, bodyScale: scale }), bodyTilt: nod };
};
exports.listChoreo = listChoreo;
// HIGHLIGHT: 中下，每个关键词冒出时惊讶
const highlightChoreo = (frame) => {
    const baseX = 540;
    const baseY = 1490;
    const scale = 0.5;
    const triggers = [25, 55, 85, 115];
    for (const t of triggers) {
        if (frame >= t && frame < t + 16) {
            return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_SURPRISE, { bodyX: baseX, bodyY: baseY - 30, bodyScale: scale }), easeT(frame, t, t + 8));
        }
    }
    return breathe(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), frame);
};
exports.highlightChoreo = highlightChoreo;
// QUOTE: 右下，举着引号牌沉思
const quoteChoreo = (frame) => {
    const baseX = 850;
    const baseY = 1480;
    const scale = 0.55;
    if (frame < 25) {
        const t = easeT(frame, 0, 25);
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_HOLD_UP, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), t);
    }
    return breathe(withPos(poses_1.POSE_HOLD_UP, { bodyX: baseX, bodyY: baseY, bodyScale: scale }), frame, 4);
};
exports.quoteChoreo = quoteChoreo;
// CTA: 中央，挥手 → 跳 → 指向按钮 → 持续跳
const ctaChoreo = (frame) => {
    const baseY = 1430;
    const scale = 0.7;
    if (frame < 25) {
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_IDLE, { bodyX: 540, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_WAVE, { bodyX: 540, bodyY: baseY, bodyScale: scale }), easeT(frame, 0, 25));
    }
    if (frame < 50) {
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_WAVE, { bodyX: 540, bodyY: baseY, bodyScale: scale }), withPos(poses_1.POSE_JUMP, { bodyX: 540, bodyY: baseY - 70, bodyScale: scale }), easeT(frame, 25, 40));
    }
    if (frame < 80) {
        return (0, exports.interpolatePose)(withPos(poses_1.POSE_JUMP, { bodyX: 540, bodyY: baseY - 70, bodyScale: scale }), withPos(poses_1.POSE_POINT_UP, { bodyX: 540, bodyY: baseY, bodyScale: scale }), easeT(frame, 50, 70));
    }
    // 持续脉冲跳
    const pulse = Math.sin((frame - 80) * 0.18) * 24;
    return withPos(poses_1.POSE_POINT_UP, { bodyX: 540, bodyY: baseY - Math.abs(pulse), bodyScale: scale });
};
exports.ctaChoreo = ctaChoreo;
// DEFAULT: 右下盘腿坐听
const defaultChoreo = (frame) => (0, exports.listChoreo)(frame);
exports.defaultChoreo = defaultChoreo;
// THINK 模式 (备用)
const thinkChoreo = (frame) => breathe(withPos(poses_1.POSE_THINK, { bodyX: 540, bodyY: 1500, bodyScale: 0.75 }), frame, 5);
exports.thinkChoreo = thinkChoreo;
// BOW 模式 (备用)
const bowChoreo = () => withPos(poses_1.POSE_BOW, { bodyX: 540, bodyY: 1500, bodyScale: 0.8 });
exports.bowChoreo = bowChoreo;
