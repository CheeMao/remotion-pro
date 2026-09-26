<div align="center">

<img src="app/src/assets/qingjian-logo.png" width="96" alt="轻剪 Logo" />

# 轻剪 · Remotion Pro

**一段文案进去，一条带配音、字幕节奏和动效的知识类短视频出来。**

基于 [Remotion](https://www.remotion.dev/) 的中文短视频自动生成系统：AI 拆分镜 → 火山引擎 TTS 配音 → 逐元素音画同步动画 → 一键渲染 MP4。
同时提供命令行工具和桌面客户端（Tauri v2）。

`Remotion 4` · `React 19` · `TypeScript` · `Tauri v2` · `火山引擎 TTS`

</div>

---

## 为什么做这个项目

做知识类、干货类短视频，最耗时间的往往不是想内容，而是**把内容变成画面**：排版、找模板、配音、对齐口播节奏、调动画、导出……一条一分钟的视频，手工剪要一两个小时。

轻剪想把这件事变成一条流水线：

| 传统做法 | 轻剪 |
| --- | --- |
| 在剪辑软件里逐页排版 | 文案经 AI 自动拆成分镜，并匹配合适的版式（数据页、对比页、步骤页……） |
| 录音或找配音，再手动对齐 | 火山引擎 TTS 自动配音，带**字级时间戳** |
| 元素出场全靠手动打关键帧 | 数字、要点、标签在**念到它的那一刻**自动入场 |
| 换风格 = 重做一遍 | 同一份内容可随意切换 8 套模板，一键重渲染 |
| 视频是二进制文件，难以复用 | 视频由一份 `content.json` 描述，可版本管理、可批量生成、可让 AI 直接编写 |

## 核心特性

### 🎬 统一内容协议，模板随意切换

项目采用**分层渲染架构**，而不是"一个模板 = 一套固定页面"。所有模板共享同一套内容结构和 11 种版式：

`hero` 封面 · `default` 要点 · `steps` 步骤 · `compare` 对比 · `stats` 数据 · `quote` 金句 · `list` 卡片列表 · `chart` 图表 · `timeline` 时间线 · `highlight` 关键词高亮 · `cta` 结尾引导

内容只写一次，换模板只改一个字段。每个模板都有自己的版式实现和动画语言，不是简单地换个配色。

### 🗣️ 字级音画同步

TTS 返回每个字的时间戳，系统据此为页面上的每个元素（一个数字、一条要点、一个关键词）计算 `elementTimings`。口播念到"100 万用户"时，这个数字才弹出来——这是手工剪辑最费时、也最能提升观感的部分。

### 🤖 AI 友好

- 内置面向 LLM 的[内容生成规范](docs/AI_CONTENT_PROMPT.md)：强调开头钩子、叙事节奏和信息密度，让 AI 写出的是"短视频脚本"而不是"PPT 大纲"。
- 桌面端支持任意 **OpenAI 兼容接口**（配置 API 地址、Key、模型即可），把原始文案自动结构化成分镜。
- 输出容错：自带 JSON 修复与字段规范化（如 `cover → hero`、`cards → list`），AI 输出不完美也能渲染。

### 🖥️ 桌面客户端「轻剪」

基于 Tauri v2 + React + Arco Design，面向不写代码的创作者：

- 粘贴文案 → AI 生成分镜 → 在编辑器里逐页修改
- 使用 `@remotion/player` 实时预览，所见即所得
- 支持从抖音链接提取视频文案（语音识别），用于二次创作参考
- 一键配音与渲染，内置 Chromium，无需额外安装环境
- 应用内自动更新

### ⌨️ 完整的命令行工具

适合批量生产或接入自己的自动化流程：一条命令完成 配音 → 时间轴 → 渲染；每一步也可以单独执行。

## 模板一览

| 模板 | 风格 | 画幅 | 适合内容 |
| --- | --- | --- | --- |
| `GlassShow` | 毛玻璃，深紫渐变 | 竖屏 1080×1920 | 产品介绍、知识分享 |
| `LiquidShow` | macOS 液态玻璃，浅色流动渐变 | 竖屏 | 工具推荐、效率类 |
| `LiquidBriefShow` | 液态玻璃简报版 | 竖屏 | 快讯、要点速览 |
| `TechShow` | 终端 + 全息框，深黑背景 | 竖屏 | AI、科技、数码 |
| `KnowledgeShow` | 知识科普，深蓝灰背景 | 竖屏 | 科普、概念解释 |
| `MacShow` | 轻产品感 | 横屏 1920×1080 | 教程、演示、复盘 |
| `StudioShow` | 深色信息墙 | 横屏 | 汇报、策略拆解、数据讲解 |
| `EditorialShow` | 杂志版面感 | 横屏 | 观点表达、案例拆解、品牌故事 |

以上为完整支持全部 11 种版式的正式模板；仓库中另有 `InsightShow`、`CosmosShow`、`StickShow`、`ProjectShow` 等实验性合成。

## 快速开始

### 环境要求

- Node.js 18+（CI 使用 22）
- 使用配音功能需要 [火山引擎语音合成](https://console.volcengine.com/speech/app/) 账号
- 构建桌面端还需要 Rust stable 工具链

### 1. 安装并预览

```bash
git clone https://github.com/CheeMao/remotion-pro.git
cd remotion-pro
npm install
npm run dev          # 打开 Remotion Studio：http://localhost:32123
```

`public/projects/` 下已附带多个模板的示例内容，无需配置即可在 Studio 中预览。

### 2. 配置配音

```bash
cp .env.example .env
```

填写火山引擎凭证：

```ini
VOLCENGINE_APP_ID=your_app_id
VOLCENGINE_ACCESS_KEY=your_access_key
VOLCENGINE_RESOURCE_ID=seed-tts-1.0
```

### 3. 生成你的第一条视频

```bash
# 完整流水线：配音 + 时间轴 + 渲染
npm run generate -- public/projects/GlassShow/content.json -t GlassShow -o out/video.mp4

# 换一个风格，内容不变
npm run generate -- public/projects/GlassShow/content.json -t TechShow -o out/video-tech.mp4
```

## 内容格式

一条视频就是一份 `content.json`：

```jsonc
{
  "meta": {
    "title": "AI 工具如何提升 10 倍效率",
    "template": "GlassShow",
    "voiceId": "zh_female_shuangkuaisisi_moon_bigtts"
  },
  "slides": [
    {
      "layout": "hero",
      "title": "你还在手动剪视频？",
      "subtitle": "3 分钟看懂自动化流程",
      "narration": "你还在一帧一帧地手动剪视频吗？今天用三分钟讲清楚。"
    },
    {
      "layout": "stats",
      "title": "效率对比",
      "data": {
        "stats": [
          { "value": 10, "suffix": "x", "label": "制作速度" },
          { "value": 100, "suffix": "万", "label": "用户规模" }
        ]
      },
      "narration": "制作速度提升十倍，已经有一百万用户在用。"
    }
  ]
}
```

只需要写 `layout`、文字和 `narration`；`durationInFrames`、`audioStart/audioEnd`、`elementTimings` 都会由流水线自动补齐。各版式的 `data` 字段见 [`docs/TEMPLATE_DEVELOPMENT_SPEC.md`](docs/TEMPLATE_DEVELOPMENT_SPEC.md) 和 [`docs/AI_CONTENT_PROMPT.md`](docs/AI_CONTENT_PROMPT.md)。

## 命令行参考

```bash
# 完整流水线
npm run generate -- <content.json> [-t 模板] [-v 音色ID] [-r 语速] [-o 输出路径] [--skip-audio]

# 只生成逐页配音
npm run generate:audio -- <content.json> [-v 音色ID] [-r 1.0] [-o public/audio]

# 把纯文字分镜结构化为 layout + 默认 elementTimings
npm run generate:structure -- <content.json> [-t 模板]

# 从文本生成整段旁白 / 分段旁白时间轴
npx tsx src/cli/index.ts narrate <text-file> [-v 音色ID]
npx tsx src/cli/index.ts narrate-timeline <text-file> [-v 音色ID]

# 把已有旁白音频的时间轴同步到 content.json
npx tsx src/cli/index.ts timeline <content.json> -s public/audio/narration.mp3

# 仅渲染（内容已含时间信息）
npx tsx src/cli/index.ts render <content.json> [-t 模板] [-o out/video.mp4]
```

支持两种音频模式：**整段旁白**（一条音轨，每页标注起止时间）和**逐页配音**（每页独立音频，渲染时拼接）。TTS 结果会缓存到 `audio-cache/`，改文案只会重新合成改动的部分。

## 桌面客户端

```bash
cd app && npm install && cd ..
npm run tauri:dev      # 开发模式
npm run tauri:build    # 打包安装包（会先把 src/ 同步为内置运行时）
```

首次运行后在「设置」中填写火山引擎凭证、AI 接口（OpenAI 兼容）、默认模板和视频保存路径即可使用。推送 `v*` 标签会通过 GitHub Actions 自动构建 Windows 安装包。

## 工作原理

```
原始文案 / AI 生成内容
  → prepareSlidesForRender()   规范化 layout / data，补齐 elementTimings
  → TTS + 时间轴               字级时间戳 → 每页时长 → 每个元素的入场时间
  → SharedVideo / SlideTimeline 音频时间映射为帧
  → SceneRenderer               按 (模板, 版式) 分发
      ├─ 模板自有场景（优先）
      └─ 共享版式（兜底）
  → Remotion 渲染 MP4
```

设计原则：**内容协议统一、版式集合共享、模板只负责风格化实现**。新增一个模板时，只要实现 11 种版式场景，就能立刻渲染任何已有内容。详见 [`docs/IMPLEMENTATION_LOGIC.md`](docs/IMPLEMENTATION_LOGIC.md)。

## 项目结构

```
src/
  cli/            命令行入口与流水线
  tts/            火山引擎 TTS 封装（字级时间戳 + 文件缓存）
  templates/      内容规范化、时间计算、模板注册表
  renderers/      SharedVideo / SlideTimeline / SceneRenderer / 模板场景注册
  layouts/        11 种共享版式（兜底实现）
  themes/         主题 token
  GlassShow/ …    各模板的场景实现
app/              桌面端前端（React + Arco Design + @remotion/player）
src-tauri/        桌面端 Rust 后端
docs/             架构、模板规范、AI 内容规范
public/projects/  各模板示例内容
```

## 参与贡献

欢迎 Issue 和 PR，尤其是：

- **新模板**：按 [`docs/TEMPLATE_DEVELOPMENT_SPEC.md`](docs/TEMPLATE_DEVELOPMENT_SPEC.md) 实现全部 11 种版式
- **更多 TTS 引擎**：目前仅支持火山引擎
- **更好的 AI 提示词**：改进 [`docs/AI_CONTENT_PROMPT.md`](docs/AI_CONTENT_PROMPT.md)

提交前请运行：

```bash
npm run lint   # ESLint + tsc
```

## 许可

本项目代码的开源许可见仓库中的 LICENSE 文件。

本项目依赖 [Remotion](https://www.remotion.dev/)，Remotion 对部分公司/组织要求购买商业授权，商用前请阅读 [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)。
