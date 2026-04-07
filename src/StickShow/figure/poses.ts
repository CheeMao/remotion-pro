// 火柴人姿势库
//
// 角度规范：屏幕坐标系，0=右，90=下，180=左，270=上(-90)
// 每个肢体段有自己的"绝对方向角"，不是相对于父段的弯曲角

export type ExpressionType =
  | 'neutral'
  | 'happy'
  | 'surprise'
  | 'think'
  | 'point'
  | 'wow'
  | 'sad';

export interface Pose {
  // 肢体段方向角（度）
  leftShoulder: number;
  leftForearm: number;
  rightShoulder: number;
  rightForearm: number;
  leftHip: number;
  leftShin: number;
  rightHip: number;
  rightShin: number;
  // 全局
  bodyX: number;
  bodyY: number;
  bodyTilt: number;
  bodyScale: number;
  expression: ExpressionType;
}

const base = {
  bodyX: 540,
  bodyY: 1450,
  bodyTilt: 0,
  bodyScale: 1,
};

// ===== 姿势库 =====

export const POSE_IDLE: Pose = {
  ...base,
  leftShoulder: 100,
  leftForearm: 100,
  rightShoulder: 80,
  rightForearm: 80,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  expression: 'neutral',
};

export const POSE_WAVE: Pose = {
  ...base,
  leftShoulder: 100,
  leftForearm: 100,
  rightShoulder: -45,
  rightForearm: -85,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  expression: 'happy',
};

export const POSE_POINT_RIGHT: Pose = {
  ...base,
  leftShoulder: 100,
  leftForearm: 100,
  rightShoulder: 0,
  rightForearm: 0,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  expression: 'point',
};

export const POSE_POINT_LEFT: Pose = {
  ...base,
  leftShoulder: 180,
  leftForearm: 180,
  rightShoulder: 80,
  rightForearm: 80,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  expression: 'point',
};

export const POSE_POINT_UP: Pose = {
  ...base,
  leftShoulder: 100,
  leftForearm: 100,
  rightShoulder: -90,
  rightForearm: -90,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  expression: 'happy',
};

export const POSE_POINT_DOWN: Pose = {
  ...base,
  leftShoulder: 100,
  leftForearm: 100,
  rightShoulder: 70,
  rightForearm: 70,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  expression: 'point',
};

export const POSE_THINK: Pose = {
  ...base,
  leftShoulder: 110,
  leftForearm: 110,
  rightShoulder: 30,
  rightForearm: -75,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  bodyTilt: -3,
  expression: 'think',
};

export const POSE_SURPRISE: Pose = {
  ...base,
  leftShoulder: -135,
  leftForearm: -150,
  rightShoulder: -45,
  rightForearm: -30,
  leftHip: 100,
  leftShin: 100,
  rightHip: 80,
  rightShin: 80,
  expression: 'surprise',
};

export const POSE_WALK_A: Pose = {
  ...base,
  leftShoulder: 70,
  leftForearm: 80,
  rightShoulder: 110,
  rightForearm: 100,
  leftHip: 70,
  leftShin: 80,
  rightHip: 110,
  rightShin: 100,
  expression: 'happy',
};

export const POSE_WALK_B: Pose = {
  ...base,
  leftShoulder: 110,
  leftForearm: 100,
  rightShoulder: 70,
  rightForearm: 80,
  leftHip: 110,
  leftShin: 100,
  rightHip: 70,
  rightShin: 80,
  expression: 'happy',
};

export const POSE_JUMP: Pose = {
  ...base,
  leftShoulder: -30,
  leftForearm: -10,
  rightShoulder: -150,
  rightForearm: -170,
  leftHip: 65,
  leftShin: 130,
  rightHip: 115,
  rightShin: 50,
  bodyY: 1370,
  expression: 'happy',
};

export const POSE_HOLD_UP: Pose = {
  ...base,
  leftShoulder: -120,
  leftForearm: -110,
  rightShoulder: -60,
  rightForearm: -70,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  expression: 'think',
};

export const POSE_SIT: Pose = {
  ...base,
  leftShoulder: 110,
  leftForearm: 110,
  rightShoulder: 70,
  rightForearm: 70,
  leftHip: 25,
  leftShin: 155,
  rightHip: 155,
  rightShin: 25,
  bodyY: 1500,
  expression: 'neutral',
};

export const POSE_CHEER: Pose = {
  ...base,
  leftShoulder: -150,
  leftForearm: -160,
  rightShoulder: -30,
  rightForearm: -20,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  expression: 'happy',
};

export const POSE_BOW: Pose = {
  ...base,
  leftShoulder: 150,
  leftForearm: 130,
  rightShoulder: 30,
  rightForearm: 50,
  leftHip: 95,
  leftShin: 95,
  rightHip: 85,
  rightShin: 85,
  bodyTilt: 8,
  expression: 'happy',
};
