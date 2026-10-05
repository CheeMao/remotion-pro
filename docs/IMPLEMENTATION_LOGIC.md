# AI-remotion 实现逻辑说明

本文档描述当前项目的核心实现思路，目标是让人和 AI 都能快速理解：

1. 这个系统现在是怎么生产视频的
2. 为什么我们要这样分层
3. 生成内容、模板风格、版式布局分别负责什么
4. 后续改动应该优先改哪里

## 1. 当前系统的核心原则

当前项目不再采用“一个模板目录 = 一套固定页面组件 = 一套固定内容结构”的旧模式。

当前采用的是分层结构：

`原始内容 -> 结构化 slide -> layout -> 模板实现 -> Remotion 时间轴`

更具体一点：

`用户文案 / AI 生成内容`
-> `prepareSlidesForRender()`
-> `得到统一的 layout/type/data/elementTimings`
-> `SceneRenderer`
-> `优先走模板自己的多布局实现`
-> `必要时才回退共享 layout`
-> `SlideTimeline 按时长拼成完整视频`

## 2. 我们为什么这样设计

### 2.1 旧模式的问题

旧模式里，一个模板通常只支持少量页面结构。这样会带来几个问题：

- 用户换了模板，内容表达能力也跟着变少
- 某个模板只有一种页面布局时，生成视频会非常单一
- 新增一个模板成本很高，因为要重做一整套页面类型
- AI 生成内容时会被模板内部字段牵制，难以稳定输出

### 2.2 新模式的目标

新模式想解决的是：

- 所有模板都支持同一套内容布局协议
- AI 只需要理解一套统一的 slide 结构
- 模板之间的差异主要体现在视觉风格、动画语言、构图处理
- 内容能力和模板风格解耦，但最终仍保留模板自己的视觉实现

一句话：

**统一内容协议，统一布局集合，模板负责各自风格化实现。**

## 3. 当前架构分层

### 3.1 内容结构化层

入口文件：

- [src/templates/autoLayout.ts](../src/templates/autoLayout.ts)

职责：

- 接收原始 slide
- 兼容历史字段
- 推断或补齐 `layout`
- 规范化 `type`
- 组装 `data`
- 补 `elementTimings`

最终每一页都会尽量变成统一结构：

```ts
{
  title?: string;
  subtitle?: string;
  points?: string[];
  narration?: string;
  layout: SharedLayout;
  type: SharedLayout;
  data?: Record<string, unknown>;
  elementTimings?: ElementTiming[];
  durationInFrames?: number;
  audioPath?: string;
}
```

### 3.2 共享布局协议层

共享 layout 集合位于：

- [src/layouts](../src/layouts)

当前统一支持的布局类型：

- `hero`
- `default`
- `steps`
- `compare`
- `stats`
- `quote`
- `list`
- `chart`
- `timeline`
- `highlight`
- `cta`

这些 layout 是平台级能力，不属于某一个模板。

### 3.3 模板实现层

入口文件：

- [src/renderers/templateSceneRegistry.tsx](../src/renderers/templateSceneRegistry.tsx)

职责：

- 把统一的 `layout/type/data` 映射成模板自己的页面实现
- 尽量保证每个模板都支持完整 layout 集
- 如果模板支持这个 layout，就优先使用模板自己的视觉语言

当前保留的模板：

- `GlassShow`
- `LiquidShow`
- `LiquidBriefShow`
- `TechShow`
- `RichShow`
- `KnowledgeShow`
- `MacShow`
- `StudioShow`
- `EditorialShow`

### 3.4 主题 token 层

入口文件：

- [src/themes/registry.ts](../src/themes/registry.ts)

职责：

- 提供主题 palette、字体、圆角、motion 参数
- 给共享 layout 提供基础视觉 token
- 给非模板实现路径提供基本风格支持

注意：

**theme token 不是模板本体。**

theme 只负责基础视觉参数，不负责完整模板风格。
真正的“模板感”主要来自模板实现层。

### 3.5 渲染编排层

核心文件：

- [src/renderers/SharedVideo.tsx](../src/renderers/SharedVideo.tsx)
- [src/renderers/SlideTimeline.tsx](../src/renderers/SlideTimeline.tsx)
- [src/renderers/SceneRenderer.tsx](../src/renderers/SceneRenderer.tsx)

职责：

- `SharedVideo` 决定 template -> themeId
- `SlideTimeline` 负责音轨和 Sequence 时间轴
- `SceneRenderer` 负责选模板实现或共享 layout

## 4. 当前实际渲染顺序

### 4.1 Studio / CLI / GeneratedVideo

主入口：

- [src/Root.tsx](../src/Root.tsx)

当前 `GeneratedVideo` 的主路径是：

1. 读取 `slides` 或 `content.json`
2. 调用 `prepareSlidesForRender()`
3. 进入 `SharedVideo`
4. 进入 `SlideTimeline`
5. 每页调用 `SceneRenderer`

### 4.2 SceneRenderer 的优先级

当前优先级非常重要：

1. 先尝试模板自己的 scene
2. 模板 scene 返回 `null` 时，才回退共享 layout

也就是说：

**模板优先，共享兜底。**

这是为了避免成片中出现“前几页像模板，某一页突然像通用页面”的割裂感。

## 5. 当前 AI / 内容生成应该怎么理解这个系统

对于 AI 来说，不应该再把项目理解成“按模板硬写页面”。

正确理解方式是：

### 5.1 AI 输出的不是“模板页面”，而是“结构化内容页面”

AI 最终应该优先产出：

- 页面目标是什么
- 对应哪个 `layout`
- 这一页的标题、副标题、points、narration
- 需要哪些结构化 `data`

而不是写模板名相关字段，比如：

- 不要写 `GLASS`
- 不要写 `TECH`
- 不要写 `LIQUID BRIEF`
- 不要写“本页是卡片页/结尾页负责...”

### 5.2 AI 要避免生成无意义静态文案

禁止生成这类内容：

- 模板名角标
- “CARD 01 / CARD 02”
- “SYSTEM INITIALIZING...”
- “MISSION READY”
- “KEY TAGS”
- “INSIGHT FRAME”
- 任何解释模板本身的说明语

允许生成的内容只能是：

- 用户要表达的真实信息
- 用于增强理解的真实标签
- 必要的数据标题、步骤名、对比标签

### 5.3 AI 应优先输出统一 layout

推荐优先使用的 layout：

- 开头：`hero`
- 过程：`steps` / `timeline`
- 冲突：`compare`
- 证据：`stats` / `chart`
- 重点：`highlight` / `list`
- 收尾：`quote` / `cta`

不要把所有页都退化成 `default`。

## 6. content.json 的职责

`content.json` 现在不是单纯的文案文件，而是接近“视频脚本”的文件。

它可以承载：

- 原始文案
- 结构化 layout
- 模板无关的数据组织
- 音频路径
- 每页时长
- 元素出场时间

因此它更接近：

**结构化视频脚本**

而不是：

**纯文本分页内容**

## 7. 音频逻辑

音频拼接与播放由：

- [src/renderers/SlideTimeline.tsx](../src/renderers/SlideTimeline.tsx)

负责。

当前逻辑：

- `soundtrackPath` 由内容文件或外层传入
- `resolveAudioSrc()` 会正确识别：
  - `data:`
  - `blob:`
  - `http(s):`
  - `file://`
  - `tauri://`
  - `asset://`
- 仅相对静态资源才走 `staticFile()`

这样做是为了兼容桌面端预览和导出链路。

## 8. 当前最重要的产品约束

### 8.1 不允许模板只有单一布局能力

任何保留模板都应该支持完整布局集。

如果某个模板缺少某个 layout，就会回退到共享 layout，最终产生风格割裂。

### 8.2 不允许模板里长期存在无意义静态文案

模板可以有风格化装饰，但不应该出现和内容无关的固定文本。

允许保留的固定元素：

- 页码
- 进度点
- 步骤编号
- 有明确信息价值的结构标签

不允许保留的固定元素：

- 模板名
- 系统提示语
- 占位说明
- 解释模板用途的句子

### 8.3 模板风格不是只靠 token

如果希望成片真正像某个模板，不能只依赖 theme token。

必须保证：

- 每个模板对完整 layout 集有自己的实现
- 模板 scene 能承接统一的 layout 协议

## 9. 后续开发优先级

### 第一优先级

- 保证 6 个模板都完整支持全部 layout
- 继续消除共享 fallback 带来的风格割裂

### 第二优先级

- 继续提升 `autoLayout` 的内容导演能力
- 让 AI 更容易产出 `hero / compare / stats / quote / cta`

### 第三优先级

- 精修每个模板的 layout 质量
- 优化模板的动画、材质、节奏差异

## 10. 一句话总结

当前项目的正确理解方式是：

**统一内容协议 + 统一布局集合 + 模板自己的多布局实现 + Remotion 时间轴编排。**

不要再把它理解成“选一个模板，然后把文案直接塞进那个模板的固定页面组件”。
