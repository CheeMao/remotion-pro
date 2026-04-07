// 手绘抖动工具：模拟笔触的微微颤动
// 每 4 帧重新计算一次，避免过度抖动
//
// usage:  const x2 = x1 + jitter(frame, seed);

export const jitter = (frame: number, seed: number, amplitude = 1.4): number => {
  const bucket = Math.floor(frame / 4);
  const a = Math.sin(bucket * 0.71 + seed * 1.3) * amplitude;
  const b = Math.cos(bucket * 1.27 + seed * 2.1) * (amplitude * 0.6);
  return a + b;
};

// 双轴抖动（同时给 x 和 y 一个偏移）
export const jitter2 = (
  frame: number,
  seed: number,
  amplitude = 1.4,
): { dx: number; dy: number } => ({
  dx: jitter(frame, seed, amplitude),
  dy: jitter(frame, seed + 0.37, amplitude),
});
