# StickShow 模板规范

## 定位

火柴人动画模板。火柴人作为「宿主/解说员」叠加在标准 11 layout 上，为知识类短视频提供**人格化、有表演性**的视觉表达。

完全复用 `content.json` 与现有 AI 提示词，**不需要新的内容 schema**。

## 视觉风格

- **背景**：深棕黑 `#1a1814` + 粉笔颗粒 + 径向渐变（模拟黑板）
- **粉笔色**：`#fffefb`（线条主色）
- **重点色**：`#fbbf24` 黄（主强调）/ `#67e8f9` 青 / `#f472b6` 粉 / `#86efac` 绿
- **字体**：Caveat / Permanent Marker（手写感）
- **气质**：黑板 + 粉笔 + 手绘抖动 + 火柴人解说

## 火柴人骨骼系统

10 个肢体段（颈/躯干/双臂双前臂/双腿双小腿）+ 9 个绝对方向角度 + 全局位置/缩放/倾斜。

文件分布：
- `figure/StickFigure.tsx` — 骨骼组件 + 正向运动学
- `figure/poses.ts` — 14 个姿势常量（IDLE / WAVE / POINT_* / THINK / SURPRISE / WALK_A/B / JUMP / HOLD_UP / SIT / CHEER / BOW）
- `figure/face.tsx` — 表情子组件（含眨眼、眉毛）
- `figure/actions.ts` — 11 个 layout 的 choreography
- `figure/jitter.ts` — 手绘抖动工具

## 11 个 layout 编排

| Layout | 火柴人位置 | 主动作 |
|---|---|---|
| hero | 中下 | 走入场 → 挥手 → 指向上方标题 |
| stats | 左下 | 站立 → 每个数字弹出时跳起惊讶 |
| compare | 左↔右 | 走到左边演示 → 走到右边演示 |
| chart | 左下 | 跟着每条进度条往上跳 → 末了欢呼 |
| steps | 横向走动 | 在每个步骤之间走动 + 指向当前步骤 |
| timeline | 沿时间线走 | 在每个年份停下 |
| list | 右下 | 盘腿坐着听 + 偶尔点头 |
| highlight | 中下 | 每个关键词冒出时惊讶 |
| quote | 右下 | 双手举起引号牌沉思 |
| cta | 中央 | 挥手 → 跳 → 指向按钮 → 持续脉冲 |
| default | 右下 | 复用 list（坐听） |

## 适用内容

适合：
- AI/编程概念演示
- 故事化知识（"想象你是……"）
- 对比演绎（新手 vs 老手）
- 流程拆解（步骤演示）
- 幽默科普

不适合：
- 纯数据堆砌
- 技术参考文档
- 需要严肃专业感的内容

## 接入清单

- [x] `src/StickShow/StickSlide.tsx` + `index.tsx`
- [x] `src/StickShow/figure/*` 骨骼系统
- [x] `src/Root.tsx` Composition 注册（1080×1920）
- [x] `src/themes/registry.ts` 加 stick theme
- [x] `src/renderers/templateSceneRegistry.tsx` 加 renderStickScene
- [x] `app/src/App.tsx` 加 ACTIVE_TEMPLATE_OPTIONS + isStructuredTemplate
- [x] `public/projects/StickShow/content.json` 示例内容

## 后续可扩展

- lip-sync（嘴形跟 narration 字级时间戳）
- 多角色对比（compare 里出两个不同色火柴人）
- 横屏版 StickShowWide
- 用户自定义角色（眼镜/帽子/工具）
