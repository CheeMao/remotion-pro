# RichShow 模板规范

> Bento Grid + 流体渐变风格幻灯片模板，多种内容类型和丰富动效，视觉冲击力强

## 模板概述

- **风格**: Bento Grid + 流体渐变 (动态光效背景)
- **尺寸**: 1080 x 1920 (9:16 竖版)
- **帧率**: 30 fps
- **单页时长**: 150 帧 (5秒)
- **转场**: 淡出切换

## 设计特点

```
┌─────────────────────────────────┐
│   流体渐变动态背景              │
│   ≋≋≋≋≋ 光效流动 ≋≋≋≋≋         │
│                                 │
│   ┌─────────────────────────┐   │
│   │    毛玻璃卡片           │   │
│   │    半透明 + 边框发光    │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌──────────┐  ┌──────────┐   │
│   │ 彩色卡片 │  │ 彩色卡片 │   │
│   │ 渐变背景 │  │ 渐变背景 │   │
│   └──────────┘  └──────────┘   │
└─────────────────────────────────┘
```

- **流体渐变背景**: 多个彩色光晕缓慢移动
- **毛玻璃卡片**: 半透明 + backdrop-filter 模糊
- **模块化网格**: 不同大小卡片组合
- **动态光效**: 背景光晕持续流动
- **渐变配色**: 现代感强

## 核心特性

本模板支持 **8种页面类型**，每种都有独特的动效：

| 类型 | 特效 | 适用场景 |
|------|------|----------|
| `title` | 打字机效果、缩放入场 | 开场标题页 |
| `stats` | 数字跳动计数器 | 数据展示 |
| `highlight` | 高亮框缩放弹出 | 关键词展示 |
| `progress` | 进度条填充动画 | 排行/占比 |
| `quote` | 引用气泡滑入 | 用户评价 |
| `compare` | 左右对比动画 | 前后对比 |
| `list` | 图标卡片列表 | 功能介绍 |
| `cta` | 按钮脉冲呼吸 | 行动号召 |

## 文件结构

```
src/RichShow/
├── index.tsx       # 入口文件，配置幻灯片内容
└── RichSlide.tsx   # 组件库，包含所有特效
```

## 内容配置规范

### 基础结构

```typescript
const slides = [
  {
    type: "页面类型",
    data: {
      // 根据类型不同，数据结构不同
    },
  },
];
```

### 各类型数据结构

#### 1. title - 标题页

```typescript
{
  type: "title",
  data: {
    title: string;      // 主标题
    subtitle?: string;  // 副标题（打字机效果）
  },
}
```

**特效**: 主标题缩放入场，副标题逐字打印

#### 2. stats - 数据统计页

```typescript
{
  type: "stats",
  data: {
    title: string;                    // 页面标题
    stats: Array<{
      value: number;   // 数值
      suffix?: string; // 后缀（如 "%", "x", "+"）
      label: string;   // 标签说明
    }>;
  },
}
```

**特效**: 数字从 0 跳动到目标值

**示例**:
```typescript
{
  type: "stats",
  data: {
    title: "惊人的数据",
    stats: [
      { value: 10, suffix: "x", label: "效率提升" },
      { value: 95, suffix: "%", label: "满意度" },
    ],
  },
}
```

#### 3. highlight - 高亮展示页

```typescript
{
  type: "highlight",
  data: {
    title: string;           // 页面标题
    items: string[];         // 高亮关键词（建议 3-5 个）
  },
}
```

**特效**: 框从中心弹出，带发光效果

#### 4. progress - 进度条页

```typescript
{
  type: "progress",
  data: {
    title: string;           // 页面标题
    bars: Array<{
      label: string;   // 条目标签
      percent: number; // 百分比 (0-100)
    }>;
  },
}
```

**特效**: 进度条从 0 填充到目标值

**示例**:
```typescript
{
  type: "progress",
  data: {
    title: "功能使用率",
    bars: [
      { label: "代码生成", percent: 92 },
      { label: "Bug 修复", percent: 87 },
    ],
  },
}
```

#### 5. quote - 引用页

```typescript
{
  type: "quote",
  data: {
    title?: string;    // 可选标题
    quote: string;     // 引用内容
    author: string;    // 作者/来源
  },
}
```

**特效**: 引用框从下方滑入

#### 6. compare - 对比页

```typescript
{
  type: "compare",
  data: {
    title: string;               // 页面标题
    left: {
      label: string;   // 左侧标签（旧/差）
      value: string;   // 左侧数值
    };
    right: {
      label: string;   // 右侧标签（新/好）
      value: string;   // 右侧数值
    };
  },
}
```

**特效**: 左右两边分别滑入，红绿对比色

**示例**:
```typescript
{
  type: "compare",
  data: {
    title: "效率对比",
    left: { label: "传统开发", value: "8小时" },
    right: { label: "AI 辅助", value: "2小时" },
  },
}
```

#### 7. list - 列表页

```typescript
{
  type: "list",
  data: {
    title: string;               // 页面标题
    items: Array<{
      icon?: string;   // 图标（emoji 或符号）
      text: string;    // 主文字
      desc?: string;   // 描述文字（可选）
    }>;
  },
}
```

**特效**: 条目依次从左滑入

**示例**:
```typescript
{
  type: "list",
  data: {
    title: "核心优势",
    items: [
      { icon: "🚀", text: "极速响应", desc: "< 2秒" },
      { icon: "🧠", text: "智能理解", desc: "全上下文" },
    ],
  },
}
```

#### 8. cta - 行动号召页

```typescript
{
  type: "cta",
  data: {
    title: string;        // 主标题
    subtitle?: string;    // 副标题
    button?: string;      // 按钮文字
  },
}
```

**特效**: 按钮脉冲呼吸效果

## 配色方案

```typescript
const colors = {
  bg: "#0f0f1a",                      // 深色背景
  card: "rgba(255,255,255,0.08)",     // 半透明卡片
  cardBorder: "rgba(255,255,255,0.12)", // 卡片边框
  text: "#ffffff",                    // 主文字（白色）
  muted: "rgba(255,255,255,0.6)",     // 次要文字
  accent1: "#6366f1",                 // 靛蓝
  accent2: "#a855f7",                 // 紫色
  accent3: "#22d3ee",                 // 青色
  accent4: "#f43f5e",                 // 玫红
  accent5: "#fb923c",                 // 橙色
};

// 渐变配色（用于卡片背景）
const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",  // 紫蓝
  "linear-gradient(135deg, #f093fb, #f5576c)",  // 粉红
  "linear-gradient(135deg, #4facfe, #00f2fe)",  // 青蓝
  "linear-gradient(135deg, #43e97b, #38f9d7)",  // 绿青
];
```

## 视觉特性

| 元素 | 说明 |
|------|------|
| 背景光效 | 4个彩色光晕缓慢移动 |
| 卡片圆角 | 24px，柔和现代 |
| 卡片样式 | 半透明 + 毛玻璃模糊 |
| 卡片边框 | 1px 半透明白色 |
| 网格间距 | 20px |
| 字体 | SF Pro Display / PingFang SC |

## 动效说明

| 页面类型 | 特效 |
|----------|------|
| 背景光效 | 持续流动（正弦/余弦运动） |
| title | 卡片缩放入场 + 打字机副标题 |
| stats | 数字跳动 + 卡片弹出 |
| highlight | 卡片依次弹出 + 彩色背景 |
| progress | 进度环填充动画 |
| quote | 引用卡片淡入 |
| compare | 左右卡片分别滑入 |
| list | 图标卡片网格弹出 |
| cta | 按钮脉冲呼吸 |

## 使用指南

### 创建内容流程

1. 确定内容结构和要展示的信息
2. 选择合适的页面类型
3. 按顺序配置 slides 数组
4. 建议流程：`title` → 内容页 → `cta`

### 推荐组合

**产品介绍**:
```
title → stats → highlight → list → cta
```

**效果对比**:
```
title → compare → progress → quote → cta
```

**数据报告**:
```
title → stats → progress → highlight → cta
```

### 调整时长

```typescript
const SLIDE_DURATION = 150;  // 修改帧数
```

### 渲染输出

```bash
npx remotion render RichShow out/rich.mp4
```

## 注意事项

1. **stats 类型**: 数值不宜过大，跳动效果更明显
2. **compare 类型**: 左侧为旧/差，右侧为新/好
3. **list 类型**: 建议 3-5 条，过多影响展示
4. **highlight 类型**: 关键词简短有力，4-8 字最佳
5. **顺序建议**: 以 title 开头，cta 结尾

## 适用场景

- 产品发布/功能介绍
- 数据报告/年度总结
- 效果对比/前后展示
- 营销推广/用户证言
- 品牌宣传/价值主张