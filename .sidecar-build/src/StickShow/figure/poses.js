"use strict";
// 火柴人姿势库
//
// 角度规范：屏幕坐标系，0=右，90=下，180=左，270=上(-90)
// 每个肢体段有自己的"绝对方向角"，不是相对于父段的弯曲角
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSE_BOW = exports.POSE_CHEER = exports.POSE_SIT = exports.POSE_HOLD_UP = exports.POSE_JUMP = exports.POSE_WALK_B = exports.POSE_WALK_A = exports.POSE_SURPRISE = exports.POSE_THINK = exports.POSE_POINT_DOWN = exports.POSE_POINT_UP = exports.POSE_POINT_LEFT = exports.POSE_POINT_RIGHT = exports.POSE_WAVE = exports.POSE_IDLE = void 0;
// 安全区: 顶部 240, 底部 1600 (避开抖音/视频号 UI 遮挡)
// 火柴人 hip 默认放在 1350，缩放后 feet 大约在 1550
const base = {
    bodyX: 540,
    bodyY: 1350,
    bodyTilt: 0,
    bodyScale: 1,
};
// ===== 姿势库 =====
exports.POSE_IDLE = {
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
exports.POSE_WAVE = {
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
exports.POSE_POINT_RIGHT = {
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
exports.POSE_POINT_LEFT = {
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
exports.POSE_POINT_UP = {
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
exports.POSE_POINT_DOWN = {
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
exports.POSE_THINK = {
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
exports.POSE_SURPRISE = {
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
exports.POSE_WALK_A = {
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
exports.POSE_WALK_B = {
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
exports.POSE_JUMP = {
    ...base,
    leftShoulder: -30,
    leftForearm: -10,
    rightShoulder: -150,
    rightForearm: -170,
    leftHip: 65,
    leftShin: 130,
    rightHip: 115,
    rightShin: 50,
    bodyY: 1280,
    expression: 'happy',
};
exports.POSE_HOLD_UP = {
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
exports.POSE_SIT = {
    ...base,
    leftShoulder: 110,
    leftForearm: 110,
    rightShoulder: 70,
    rightForearm: 70,
    leftHip: 25,
    leftShin: 155,
    rightHip: 155,
    rightShin: 25,
    bodyY: 1430,
    expression: 'neutral',
};
exports.POSE_CHEER = {
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
exports.POSE_BOW = {
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
