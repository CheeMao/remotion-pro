import React from 'react';
import { jitter } from './jitter';
import { Face } from './face';
import type { Pose } from './poses';

// 火柴人骨骼组件 — 用 SVG 渲染所有肢体
//
// 角度规范：屏幕坐标系，0=右，90=下，180=左，270=上(-90)
// 每个肢体段是一条 line，端点用正向运动学算

const TORSO_LEN = 150;
const NECK_LEN = 22;
const HEAD_R = 56;
const SHOULDER_W = 36;
const HIP_W = 28;
const UPPER_ARM = 105;
const FOREARM = 95;
const UPPER_LEG = 135;
const LOWER_LEG = 125;

const deg = (d: number) => (d * Math.PI) / 180;

const endpoint = (cx: number, cy: number, length: number, angleDeg: number) => ({
  x: cx + length * Math.cos(deg(angleDeg)),
  y: cy + length * Math.sin(deg(angleDeg)),
});

interface Props {
  pose: Pose;
  frame: number;
  color?: string;
  strokeWidth?: number;
  fillColor?: string;
}

export const StickFigure: React.FC<Props> = ({
  pose,
  frame,
  color = '#1c1814',
  strokeWidth = 9,
  fillColor = '#fffefb',
}) => {
  const s = pose.bodyScale;
  const hipX = pose.bodyX;
  const hipY = pose.bodyY;

  const torsoLen = TORSO_LEN * s;
  const neckLen = NECK_LEN * s;
  const headR = HEAD_R * s;
  const shoulderW = SHOULDER_W * s;
  const hipW = HIP_W * s;
  const upperArm = UPPER_ARM * s;
  const forearm = FOREARM * s;
  const upperLeg = UPPER_LEG * s;
  const lowerLeg = LOWER_LEG * s;
  const sw = strokeWidth * s;

  // 关键节点
  const shoulderCenter = { x: hipX, y: hipY - torsoLen };
  const headBottom = { x: shoulderCenter.x, y: shoulderCenter.y - neckLen };
  const headCenter = { x: headBottom.x, y: headBottom.y - headR };

  const leftShoulderJ = { x: shoulderCenter.x - shoulderW, y: shoulderCenter.y };
  const rightShoulderJ = { x: shoulderCenter.x + shoulderW, y: shoulderCenter.y };

  const leftElbow = endpoint(leftShoulderJ.x, leftShoulderJ.y, upperArm, pose.leftShoulder);
  const leftHand = endpoint(leftElbow.x, leftElbow.y, forearm, pose.leftForearm);

  const rightElbow = endpoint(rightShoulderJ.x, rightShoulderJ.y, upperArm, pose.rightShoulder);
  const rightHand = endpoint(rightElbow.x, rightElbow.y, forearm, pose.rightForearm);

  const leftHipJ = { x: hipX - hipW, y: hipY };
  const rightHipJ = { x: hipX + hipW, y: hipY };

  const leftKnee = endpoint(leftHipJ.x, leftHipJ.y, upperLeg, pose.leftHip);
  const leftFoot = endpoint(leftKnee.x, leftKnee.y, lowerLeg, pose.leftShin);

  const rightKnee = endpoint(rightHipJ.x, rightHipJ.y, upperLeg, pose.rightHip);
  const rightFoot = endpoint(rightKnee.x, rightKnee.y, lowerLeg, pose.rightShin);

  // 抖动函数
  const jx = (val: number, seed: number) => val + jitter(frame, seed);
  const jy = (val: number, seed: number) => val + jitter(frame, seed + 0.4);

  // 整体倾斜
  const tilt = pose.bodyTilt;
  const transform = tilt !== 0 ? `rotate(${tilt} ${hipX} ${hipY})` : undefined;

  const lineProps = {
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
  };

  return (
    <g transform={transform}>
      {/* 头 */}
      <circle
        cx={jx(headCenter.x, 1)}
        cy={jy(headCenter.y, 2)}
        r={headR}
        fill={fillColor}
        stroke={color}
        strokeWidth={sw}
      />
      <Face
        cx={headCenter.x}
        cy={headCenter.y}
        scale={s}
        expression={pose.expression}
        frame={frame}
        color={color}
        strokeWidth={sw * 0.55}
      />

      {/* 颈 */}
      <line
        x1={jx(headBottom.x, 3)}
        y1={jy(headBottom.y, 4)}
        x2={jx(shoulderCenter.x, 5)}
        y2={jy(shoulderCenter.y, 6)}
        {...lineProps}
      />

      {/* 躯干 */}
      <line
        x1={jx(shoulderCenter.x, 7)}
        y1={jy(shoulderCenter.y, 8)}
        x2={jx(hipX, 9)}
        y2={jy(hipY, 10)}
        {...lineProps}
      />

      {/* 肩横线 */}
      <line
        x1={jx(leftShoulderJ.x, 11)}
        y1={jy(leftShoulderJ.y, 12)}
        x2={jx(rightShoulderJ.x, 13)}
        y2={jy(rightShoulderJ.y, 14)}
        {...lineProps}
      />

      {/* 左臂 */}
      <line
        x1={jx(leftShoulderJ.x, 15)}
        y1={jy(leftShoulderJ.y, 16)}
        x2={jx(leftElbow.x, 17)}
        y2={jy(leftElbow.y, 18)}
        {...lineProps}
      />
      <line
        x1={jx(leftElbow.x, 19)}
        y1={jy(leftElbow.y, 20)}
        x2={jx(leftHand.x, 21)}
        y2={jy(leftHand.y, 22)}
        {...lineProps}
      />

      {/* 右臂 */}
      <line
        x1={jx(rightShoulderJ.x, 23)}
        y1={jy(rightShoulderJ.y, 24)}
        x2={jx(rightElbow.x, 25)}
        y2={jy(rightElbow.y, 26)}
        {...lineProps}
      />
      <line
        x1={jx(rightElbow.x, 27)}
        y1={jy(rightElbow.y, 28)}
        x2={jx(rightHand.x, 29)}
        y2={jy(rightHand.y, 30)}
        {...lineProps}
      />

      {/* 髋横线 */}
      <line
        x1={jx(leftHipJ.x, 31)}
        y1={jy(leftHipJ.y, 32)}
        x2={jx(rightHipJ.x, 33)}
        y2={jy(rightHipJ.y, 34)}
        {...lineProps}
      />

      {/* 左腿 */}
      <line
        x1={jx(leftHipJ.x, 35)}
        y1={jy(leftHipJ.y, 36)}
        x2={jx(leftKnee.x, 37)}
        y2={jy(leftKnee.y, 38)}
        {...lineProps}
      />
      <line
        x1={jx(leftKnee.x, 39)}
        y1={jy(leftKnee.y, 40)}
        x2={jx(leftFoot.x, 41)}
        y2={jy(leftFoot.y, 42)}
        {...lineProps}
      />

      {/* 右腿 */}
      <line
        x1={jx(rightHipJ.x, 43)}
        y1={jy(rightHipJ.y, 44)}
        x2={jx(rightKnee.x, 45)}
        y2={jy(rightKnee.y, 46)}
        {...lineProps}
      />
      <line
        x1={jx(rightKnee.x, 47)}
        y1={jy(rightKnee.y, 48)}
        x2={jx(rightFoot.x, 49)}
        y2={jy(rightFoot.y, 50)}
        {...lineProps}
      />

      {/* 手 */}
      <circle cx={leftHand.x} cy={leftHand.y} r={sw * 0.7} fill={color} />
      <circle cx={rightHand.x} cy={rightHand.y} r={sw * 0.7} fill={color} />

      {/* 脚 */}
      <line
        x1={jx(leftFoot.x - 14 * s, 51)}
        y1={jy(leftFoot.y, 52)}
        x2={jx(leftFoot.x + 6 * s, 53)}
        y2={jy(leftFoot.y, 54)}
        {...lineProps}
      />
      <line
        x1={jx(rightFoot.x - 6 * s, 55)}
        y1={jy(rightFoot.y, 56)}
        x2={jx(rightFoot.x + 14 * s, 57)}
        y2={jy(rightFoot.y, 58)}
        {...lineProps}
      />
    </g>
  );
};
