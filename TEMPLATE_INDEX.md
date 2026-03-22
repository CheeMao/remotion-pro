# Remotion 视频模板库

本项目包含多个视频模板，用于快速生成短视频内容。

## 模板列表

| 模板 ID | 名称 | 风格 | 背景 | 页面类型 | 规范文件 |
|---------|------|------|------|----------|----------|
| `SlideShow` | 科技风幻灯片 | 赛博朋克 | 深色 | 单一 | `src/SlideShow/TEMPLATE_SPEC.md` |
| `GlassShow` | 毛玻璃幻灯片 | 现代简约 | 深紫 | 单一 | `src/GlassShow/TEMPLATE_SPEC.md` |
| `NeuShow` | 新拟态幻灯片 | 柔和立体 | 浅色 | 单一 | `src/NeuShow/TEMPLATE_SPEC.md` |
| `RichShow` | 丰富特效幻灯片 | Bento+流体渐变 | 深色 | **8种** | `src/RichShow/TEMPLATE_SPEC.md` |
| `TechShow` | 科技感特效幻灯片 | 终端+全息框 | 深黑 | **7种** | `src/TechShow/TEMPLATE_SPEC.md` |

## 快速使用

### 1. 选择模板

根据内容风格选择合适模板：

- **科技/数码/AI 相关** → `SlideShow` (科技风)
- **产品介绍/知识分享** → `GlassShow` (毛玻璃)
- **工具产品/教程/设计** → `NeuShow` (新拟态)
- **产品发布/数据展示/营销** → `RichShow` (丰富特效)
- **科技感/终端风/黑客风** → `TechShow` (科技感特效)

### 2. 修改内容

编辑对应模板的 `index.tsx` 文件：

```typescript
// src/SlideShow/index.tsx 或 src/GlassShow/index.tsx
const slides = [
  {
    title: "你的标题",
    subtitle: "副标题说明",
    points: ["要点1", "要点2", "要点3"],
  },
  // ...更多幻灯片
];
```

### 3. 预览

```bash
npm run dev
```

浏览器打开 http://localhost:3000，选择对应模板预览。

### 4. 渲染输出

```bash
npx remotion render SlideShow out/output.mp4
npx remotion render GlassShow out/output.mp4
```

## AI 使用指南

当用户请求创作视频内容时：

1. **阅读规范**: 先阅读目标模板的 `TEMPLATE_SPEC.md`
2. **遵循结构**: 严格按照数据结构生成内容
3. **控制字数**: 标题 4-10 字，要点每条 8-20 字
4. **数量建议**: 幻灯片 4-6 张，要点 3-5 条

## 项目结构

```
src/
├── Root.tsx              # 入口，注册所有模板
├── SlideShow/            # 科技风模板
│   ├── index.tsx
│   ├── Slide.tsx
│   └── TEMPLATE_SPEC.md
├── GlassShow/            # 毛玻璃模板
│   ├── index.tsx
│   ├── GlassSlide.tsx
│   └── TEMPLATE_SPEC.md
├── NeuShow/              # 新拟态模板
│   ├── index.tsx
│   ├── NeuSlide.tsx
│   └── TEMPLATE_SPEC.md
├── RichShow/             # 丰富特效模板
│   ├── index.tsx
│   ├── RichSlide.tsx
│   └── TEMPLATE_SPEC.md
├── TechShow/             # 科技感特效模板
│   ├── index.tsx
│   ├── TechSlide.tsx
│   └── TEMPLATE_SPEC.md
└── HelloWorld/           # 官方示例
```