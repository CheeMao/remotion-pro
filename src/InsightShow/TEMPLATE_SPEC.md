# InsightShow 模板规范

## 定位

横屏知识洞察模板，面向 AI、编程、科技类知识内容。适合 B 站、YouTube、微信视频号等横屏平台。

## 视觉风格

- **背景**: 深海蓝黑 `#0a0f1e`，带细密 indigo 点阵网格
- **主色**: Indigo `#6366f1`（主要强调色）
- **辅色**: Sky `#38bdf8`（次级信息）、Amber `#fbbf24`（关键高亮）
- **字体**: Inter / SF Pro Display，现代无衬线
- **面板**: 深蓝半透明 `rgba(15,23,42,0.75)`，indigo 细边线
- **气质**: 高级内容感，适合截图传播，像 Linear / Framer 风格的知识卡片

## 差异化维度

| 维度 | InsightShow | StudioShow | EditorialShow |
|------|-------------|-----------|----------------|
| 背景 | 深蓝黑+indigo网格 | 纯黑+青色 | 暖米色 |
| 主色 | Indigo+Amber | Cyan+Red | Pink+Blue |
| 字体 | Inter无衬线 | SF Pro | Newsreader衬线 |
| 气质 | 知识洞察感 | 数据控制室 | 杂志叙事 |

## 适用内容类型

- AI 技术科普
- 编程技能讲解
- 行业趋势分析
- 思维框架拆解
- 知识点对比

## 设计禁忌

- 不加模板名角标
- 不加解释性静态文案
- 高亮色（Amber）只用于真正的关键词，不做装饰

## Layout 支持

全部 11 种 layout 均通过 MacSlide `variant="insight"` 实现，无需单独维护。
