# 模板开发规范

本文档定义当前项目新增模板、改模板、补布局时必须遵守的规范。

目标只有两个：

1. 保持模板之间的协议统一
2. 保持最终成片真正“像模板”，而不是退化成通用 token 页面

## 1. 模板的定义

在当前项目里，一个模板不是一个单页组件，也不是一个固定页面结构。

一个模板应该是：

- 一套完整的视觉风格
- 一套完整的 layout 支持能力
- 一组能承接统一 content schema 的页面实现

当前模板包括：

- `GlassShow`
- `LiquidShow`
- `LiquidBriefShow`
- `TechShow`
- `RichShow`
- `KnowledgeShow`
- `MacShow`
- `StudioShow`
- `EditorialShow`

## 2. 模板必须支持的 layout 集合

每个模板必须完整支持以下 layout：

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

如果模板缺任何一个 layout，就会出现：

- 某页回退到共享 layout
- 成片风格不统一
- 用户看到“前几页像模板，某一页不像”

所以：

**完整支持 layout 集是硬性要求，不是可选项。**

## 3. 模板开发的基本原则

### 3.1 协议统一，表现不同

所有模板都使用同一套内容协议：

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
}
```

模板之间不应该再定义彼此不兼容的私有核心字段。

模板的差异应该体现在：

- 构图
- 色彩
- 字体
- 材质
- 动画
- 组件细节

而不是体现在“数据结构完全不同”。

### 3.2 模板优先，不要长期依赖共享 fallback

共享 layout 是兜底，不是长期最终方案。

任何模板如果长期依赖共享 fallback，都会导致：

- 风格被 theme token 稀释
- 模板感不强
- 页面之间出现视觉断层

### 3.3 不要为了装饰增加无意义文字

禁止新增这类固定文本：

- 模板名角标
- `CARD 01 / CARD 02`
- `SYSTEM INITIALIZING...`
- `MISSION READY`
- `KEY TAGS`
- `INSIGHT FRAME`
- 模板说明句
- 对页面用途的解释句

允许新增的固定元素：

- 页码
- 步骤编号
- 进度标识
- 对比标签
- 有明确信息价值的数据标签

判断标准：

**如果删掉这行字，用户对内容理解完全不受影响，这行字大概率就不该存在。**

## 4. 模板文件结构建议

建议每个模板至少包含：

```text
src/<TemplateName>/
  index.tsx
  <TemplateSlide>.tsx
  TEMPLATE_SPEC.md
```

职责划分：

- `index.tsx`
  负责模板 composition 入口和默认内容
- `<TemplateSlide>.tsx`
  负责模板自己的多布局渲染
- `TEMPLATE_SPEC.md`
  负责记录模板视觉风格、适配场景和设计规则

## 5. 模板接入流程

新增模板时，必须同时完成以下步骤：

1. 新建模板目录与主 slide 组件
2. 在 [src/Root.tsx](/F:/My%20Apps/AI-remotion/src/Root.tsx) 注册 composition
3. 在 [src/themes/registry.ts](/F:/My%20Apps/AI-remotion/src/themes/registry.ts) 注册 template -> theme 映射
4. 在 [src/renderers/templateSceneRegistry.tsx](/F:/My%20Apps/AI-remotion/src/renderers/templateSceneRegistry.tsx) 注册模板 scene
5. 保证模板支持完整 layout 集
6. 补模板说明文档

缺任何一步，模板接入都不完整。

## 6. templateSceneRegistry 的职责规范

文件：

- [src/renderers/templateSceneRegistry.tsx](/F:/My%20Apps/AI-remotion/src/renderers/templateSceneRegistry.tsx)

这个文件是模板层的关键适配器。

它负责：

- 把统一 layout 翻译成模板内部页面类型
- 补齐模板内部需要的数据映射
- 让模板对统一 schema 保持兼容

规范要求：

- 映射逻辑必须集中在这里，不要把大段兼容逻辑散落到各模板里
- 对旧字段的兼容可以做，但不要继续发散历史字段
- 新增 layout 时，优先在这里补模板映射

## 7. 每种 layout 的最低实现要求

### `hero`

必须支持：

- 大标题
- 可选副标题
- 可选 CTA
- 强主视觉中心

### `default`

必须支持：

- 标题
- 副标题
- 点列内容

### `steps`

必须支持：

- 多步骤列表
- 步骤顺序清晰
- 每步标题可读

### `compare`

必须支持：

- 左右两组信息
- 清晰的对比边界
- 中间可选对比标识

### `stats`

必须支持：

- 数值焦点
- 指标标签
- 可选说明文案

### `quote`

必须支持：

- 引用主体
- 作者或来源
- 适当的强调构图

### `list`

必须支持：

- 多项要点
- 可选 icon/编号
- 适合信息拆分

### `chart`

必须支持：

- 柱状、进度或同类数据图形表达
- 标签与数值对应清晰

### `timeline`

必须支持：

- 时间顺序
- 节点区分
- 标题和描述对应

### `highlight`

必须支持：

- 关键短句突出展示
- 重点词或重点项层级清晰

### `cta`

必须支持：

- 收束型标题
- 行动按钮或行动语
- 明显的结束页气质

## 8. 动画规范

模板可以有自己的动画语言，但要满足以下底线：

- 标题入场清晰
- 核心信息按顺序揭示
- 不允许全页长时间静止又缺少信息递进
- 不允许动画过重导致阅读困难

推荐优先接入：

- `elementTimings`
- 标题与副标题错峰入场
- 列表项逐条入场
- 图表按数值增长
- CTA 有轻微脉冲或收束感

## 9. 视觉规范

### 9.1 每个模板都要有明确个性

模板之间的差异不能只是换背景颜色。

模板应该至少在这些维度有明显差异：

- 背景组织
- 面板材质
- 标题气质
- 卡片构图
- 动画节奏

### 9.2 但不要通过无意义文案体现风格

错误做法：

- 用固定英文标签表现“科技感”
- 用模板名角标表现“品牌感”
- 用解释句表现“信息感”

正确做法：

- 用材质、光感、排版、运动来体现风格

## 10. content data 设计规范

模板必须优先消费统一字段：

- `title`
- `subtitle`
- `points`
- `layout`
- `type`
- `data`
- `elementTimings`

模板内部不要再要求 AI 额外输出一套只属于该模板的核心字段。

可以接受的模板内辅助映射：

- `compare` -> 模板自己的双栏结构
- `stats` -> 模板自己的指标卡结构
- `cta` -> 模板自己的收束页结构

不可以接受的情况：

- 不同模板要求完全不同的内容 schema
- AI 必须记住某个模板的独占字段才能正常出图

## 11. 开发完成后的检查清单

每次修改模板后，至少检查：

1. 11 个 layout 是否都能正常渲染
2. 是否出现共享 fallback
3. 是否出现无意义固定文本
4. 是否保留了页码、步骤编号等真正有用的结构元素
5. `npm run lint` 是否通过
6. `npm run build` 是否通过
7. `app/npm run build` 是否通过

## 12. AI 开发模板时的工作指令

如果后续让 AI 继续开发模板，应该明确告诉它：

- 模板必须支持完整 layout 集
- 不要新增模板名标签
- 不要新增解释模板的静态文案
- 优先改模板实现，不要把问题推给共享 fallback
- 保持统一 schema，不要发明新的核心协议

## 13. 一句话总结

模板开发的核心不是“做一页好看的样机”，而是：

**用统一 schema 做出一整套完整、多布局、风格一致、无静态噪音的模板系统。**
