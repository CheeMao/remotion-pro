"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATE_REGISTRY = void 0;
exports.getTemplateSpec = getTemplateSpec;
exports.getAllLayoutTypes = getAllLayoutTypes;
exports.getTemplateLayouts = getTemplateLayouts;
exports.isLayoutSupported = isLayoutSupported;
exports.generateLayoutPrompt = generateLayoutPrompt;
exports.buildLayoutDataExample = buildLayoutDataExample;
exports.generateAIPrompt = generateAIPrompt;
exports.normalizeAISlide = normalizeAISlide;
exports.normalizeAISlides = normalizeAISlides;
const FULL_STRUCTURED_LAYOUTS = [
    {
        name: 'hero',
        description: '开场页，突出主题、标题与行动指向',
        whenToUse: '视频开场、章节切换、建立主结论时使用',
        requiredFields: ['title'],
        optionalFields: ['subtitle', 'data'],
    },
    {
        name: 'default',
        description: '通用说明页，适合展开一段解释或结论',
        whenToUse: '普通解释、补充说明、轻量总结时使用',
        requiredFields: ['title'],
        optionalFields: ['subtitle', 'points', 'data'],
    },
    {
        name: 'steps',
        description: '步骤流程页，强调顺序和执行路径',
        whenToUse: '教程、操作、方法拆解、阶段推进时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
    {
        name: 'compare',
        description: '对比页，突出前后差异或两种方案',
        whenToUse: '前后反差、方案比较、错误与正确做法时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
    {
        name: 'stats',
        description: '数据页，展示关键指标和结果',
        whenToUse: '核心数字、指标成果、量化证据时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
    {
        name: 'quote',
        description: '引用页，强化一句结论或金句',
        whenToUse: '收束、观点强调、引用原话时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
    {
        name: 'list',
        description: '列表页，适合并列拆分多个要点',
        whenToUse: '功能总结、并列观点、要点归纳时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
    {
        name: 'chart',
        description: '图表页，适合表现比例、柱状或进度数据',
        whenToUse: '可视化数字、评分、占比、趋势切面时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
    {
        name: 'timeline',
        description: '时间线页，适合阶段或历史脉络',
        whenToUse: '发展过程、演进路径、版本迭代时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
    {
        name: 'highlight',
        description: '高亮页，突出关键词或重点短句',
        whenToUse: '记忆点强化、关键词总结、概念聚焦时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
    {
        name: 'cta',
        description: '行动页，适合结尾给动作或下一步',
        whenToUse: '视频结尾、行动引导、明确下一步时使用',
        requiredFields: ['title', 'data'],
        optionalFields: ['subtitle', 'points'],
    },
];
const createFullStructuredLayouts = () => FULL_STRUCTURED_LAYOUTS.map((layout) => ({
    ...layout,
    requiredFields: [...layout.requiredFields],
    optionalFields: layout.optionalFields ? [...layout.optionalFields] : undefined,
}));
/**
 * 模板注册表
 * 记录所有可用模板及其支持的布局类型
 */
exports.TEMPLATE_REGISTRY = {
    GlassShow: {
        id: 'GlassShow',
        name: '毛玻璃风格',
        description: '毛玻璃(Glassmorphism)风格，现代简洁设计，深紫色渐变背景',
        style: ['现代', '简洁', '毛玻璃', '渐变'],
        supportedLayouts: [
            {
                name: 'hero',
                description: '封面页，带徽章标签和CTA按钮',
                whenToUse: '视频开场，需要突出主题和品牌标识时使用',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'badge', 'cta'],
            },
            {
                name: 'stats',
                description: '数据展示页，展示关键数字和指标',
                whenToUse: '展示成果数据、用户增长、关键指标时使用',
                requiredFields: ['title', 'stats'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'compare',
                description: '对比页，左右对比展示两种方案',
                whenToUse: '需要对比传统vs新方案、竞品对比时使用',
                requiredFields: ['title', 'compare'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'steps',
                description: '步骤流程页，垂直时间线展示',
                whenToUse: '展示操作流程、制作步骤、发展阶段时使用',
                requiredFields: ['title', 'steps'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'list',
                description: '列表页，网格卡片展示多个项目',
                whenToUse: '展示功能列表、特点总结、多个并列项时使用',
                requiredFields: ['title', 'items'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'chart',
                description: '图表页，柱状图或进度条展示数据',
                whenToUse: '需要可视化数据对比、评分展示时使用',
                requiredFields: ['title', 'chart'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'timeline',
                description: '时间线页，交替布局展示发展历程',
                whenToUse: '展示历史沿革、版本迭代、项目里程碑时使用',
                requiredFields: ['title', 'timeline'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'highlight',
                description: '关键词高亮页，发光标签展示核心词',
                whenToUse: '需要强化记忆点、展示核心关键词时使用',
                requiredFields: ['title', 'highlights'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'quote',
                description: '引用页，带引号装饰的金句页',
                whenToUse: '视频结尾、总结金句、引用名言时使用',
                requiredFields: ['title', 'quote'],
                optionalFields: ['subtitle', 'author'],
            },
            {
                name: 'default',
                description: '默认列表页，标准标题+要点格式',
                whenToUse: '通用内容展示，无特殊数据时使用',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'points'],
            },
        ],
    },
    LiquidShow: {
        id: 'LiquidShow',
        name: '液态玻璃风格',
        description: 'macOS风格液态玻璃效果，浅色背景，流动渐变',
        style: ['液态', '玻璃', '流动', '浅色'],
        supportedLayouts: [
            {
                name: 'hero',
                description: '封面页，带徽章标签',
                whenToUse: '视频开场，突出主题和标签',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'badge'],
            },
            {
                name: 'stats',
                description: '数据展示页，通透卡片展示核心结果',
                whenToUse: '展示关键数据、指标成果',
                requiredFields: ['title', 'stats'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'compare',
                description: '对比页，传统vs新方案对比',
                whenToUse: '方案对比、前后对比',
                requiredFields: ['title', 'compare'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'steps',
                description: '步骤流程页，清晰三段动作',
                whenToUse: '制作流程、操作步骤',
                requiredFields: ['title', 'steps'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'list',
                description: '列表页，网格卡片展示',
                whenToUse: '功能亮点、特点总结',
                requiredFields: ['title', 'items'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'chart',
                description: '图表页，表现力评分',
                whenToUse: '数据图表、评分对比',
                requiredFields: ['title', 'chart'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'timeline',
                description: '时间线页，迭代节奏展示',
                whenToUse: '发展历程、阶段变化',
                requiredFields: ['title', 'timeline'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'highlight',
                description: '关键词高亮页',
                whenToUse: '核心关键词、记忆点',
                requiredFields: ['title', 'highlights'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'quote',
                description: '引用页，收束页',
                whenToUse: '视频结尾、总结金句',
                requiredFields: ['title', 'quote'],
                optionalFields: ['subtitle', 'author'],
            },
            {
                name: 'default',
                description: '默认列表页',
                whenToUse: '通用内容展示',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'points'],
            },
        ],
    },
    LiquidBriefShow: {
        id: 'LiquidBriefShow',
        name: '简洁液态风格',
        description: '简洁液态风格，暖白背景，标题先行',
        style: ['简洁', '液态', '暖白', '清晰'],
        supportedLayouts: [
            {
                name: 'cover',
                description: '封面页，带标签',
                whenToUse: '视频开场',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'badge'],
            },
            {
                name: 'steps',
                description: '步骤页，序号+标题+描述',
                whenToUse: '操作流程、步骤说明',
                requiredFields: ['title', 'steps'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'compare',
                description: '对比页',
                whenToUse: '方案对比',
                requiredFields: ['title', 'compare'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'stats',
                description: '数据页',
                whenToUse: '数据展示',
                requiredFields: ['title', 'stats'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'quote',
                description: '引用页',
                whenToUse: '视频结尾',
                requiredFields: ['title', 'quote'],
                optionalFields: ['subtitle', 'author'],
            },
            {
                name: 'default',
                description: '默认页',
                whenToUse: '通用内容',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'points'],
            },
        ],
    },
    RichShow: {
        id: 'RichShow',
        name: '丰富特效风格',
        description: '丰富特效风格，Bento+流体渐变，深色背景',
        style: ['丰富', '特效', 'Bento', '流体'],
        supportedLayouts: [
            {
                name: 'title',
                description: '标题页',
                whenToUse: '开场或章节标题',
                requiredFields: ['title'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'stats',
                description: '数据页',
                whenToUse: '数据展示',
                requiredFields: ['title', 'data'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'highlight',
                description: '高亮页',
                whenToUse: '关键词高亮',
                requiredFields: ['title', 'data'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'quote',
                description: '引用页',
                whenToUse: '金句引用',
                requiredFields: ['title', 'data'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'compare',
                description: '对比页',
                whenToUse: '对比展示',
                requiredFields: ['title', 'data'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'list',
                description: '列表页',
                whenToUse: '列表展示',
                requiredFields: ['title', 'data'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'cta',
                description: '行动召唤页',
                whenToUse: '视频结尾引导',
                requiredFields: ['title', 'data'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'default',
                description: '默认页',
                whenToUse: '通用内容',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'points'],
            },
        ],
    },
    TechShow: {
        id: 'TechShow',
        name: '科技特效风格',
        description: '科技特效风格，终端+全息框，深黑背景',
        style: ['科技', '终端', '全息', '深色'],
        supportedLayouts: [
            {
                name: 'title',
                description: '标题页',
                whenToUse: '开场标题',
                requiredFields: ['title'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'stats',
                description: '数据页',
                whenToUse: '数据展示',
                requiredFields: ['title', 'data'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'cta',
                description: '行动页',
                whenToUse: '结尾引导',
                requiredFields: ['title', 'data'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'default',
                description: '默认页',
                whenToUse: '通用内容',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'points'],
            },
        ],
    },
    KnowledgeShow: {
        id: 'KnowledgeShow',
        name: '知识科普风格',
        description: '知识类风格，高亮词、时间线、图表支持，深蓝灰背景',
        style: ['知识', '科普', '教育', '图表'],
        supportedLayouts: [
            {
                name: 'steps',
                description: '步骤页',
                whenToUse: '操作流程',
                requiredFields: ['title', 'steps'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'chart',
                description: '图表页',
                whenToUse: '数据可视化',
                requiredFields: ['title', 'chart'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'timeline',
                description: '时间线页',
                whenToUse: '历史发展',
                requiredFields: ['title', 'timeline'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'highlight',
                description: '高亮词页',
                whenToUse: '关键词强调',
                requiredFields: ['title', 'highlights'],
                optionalFields: ['subtitle'],
            },
            {
                name: 'default',
                description: '默认页',
                whenToUse: '通用内容',
                requiredFields: ['title'],
                optionalFields: ['subtitle', 'points'],
            },
        ],
    },
    MacShow: {
        id: 'MacShow',
        name: 'Mac 横屏风格',
        description: '轻产品感横屏模板，适合教程、演示、复盘和知识讲解',
        style: ['横屏', '产品感', '轻玻璃', '清爽'],
        supportedLayouts: createFullStructuredLayouts(),
    },
    StudioShow: {
        id: 'StudioShow',
        name: '演播室横屏风格',
        description: '深色信息墙横屏模板，适合复盘、汇报、策略拆解和数据讲解',
        style: ['横屏', '演播室', '深色', '数据墙'],
        supportedLayouts: createFullStructuredLayouts(),
    },
    EditorialShow: {
        id: 'EditorialShow',
        name: '编辑感横屏风格',
        description: '版面化横屏模板，适合观点表达、案例拆解、品牌故事和内容讲述',
        style: ['横屏', '编辑感', '留白', '版面'],
        supportedLayouts: createFullStructuredLayouts(),
    },
};
/**
 * 获取模板规格
 */
function getTemplateSpec(templateId) {
    return exports.TEMPLATE_REGISTRY[templateId];
}
/**
 * 获取所有支持的布局类型（去重）
 */
function getAllLayoutTypes() {
    const layouts = new Set();
    Object.values(exports.TEMPLATE_REGISTRY).forEach((template) => {
        template.supportedLayouts.forEach((layout) => {
            layouts.add(layout.name);
        });
    });
    return Array.from(layouts).sort();
}
/**
 * 获取模板支持的布局类型列表
 */
function getTemplateLayouts(templateId) {
    const template = exports.TEMPLATE_REGISTRY[templateId];
    return (template === null || template === void 0 ? void 0 : template.supportedLayouts) || [];
}
/**
 * 检查布局是否被模板支持
 */
function isLayoutSupported(templateId, layoutName) {
    const layouts = getTemplateLayouts(templateId);
    return layouts.some((l) => l.name === layoutName);
}
/**
 * 生成AI Prompt用的布局描述文本
 */
function generateLayoutPrompt(templateId) {
    const template = exports.TEMPLATE_REGISTRY[templateId];
    if (!template) {
        return '';
    }
    const lines = [];
    lines.push(`【模板信息】`);
    lines.push(`模板名称: ${template.name}`);
    lines.push(`风格特点: ${template.style.join('、')}`);
    lines.push(`描述: ${template.description}`);
    lines.push('');
    lines.push(`【支持的布局类型】`);
    template.supportedLayouts.forEach((layout) => {
        var _a;
        lines.push(`- ${layout.name}: ${layout.description}`);
        lines.push(`  使用场景: ${layout.whenToUse}`);
        lines.push(`  必需字段: ${layout.requiredFields.join(', ')}`);
        if ((_a = layout.optionalFields) === null || _a === void 0 ? void 0 : _a.length) {
            lines.push(`  可选字段: ${layout.optionalFields.join(', ')}`);
        }
        lines.push('');
    });
    return lines.join('\n');
}
/**
 * 数据字段构建器
 * 根据布局类型生成对应的数据结构示例
 */
function buildLayoutDataExample(layoutName) {
    switch (layoutName) {
        case 'hero':
            return {
                badge: 'NEW',
                cta: '了解更多',
            };
        case 'stats':
            return {
                stats: [
                    { value: 24600, suffix: '+', label: '月活用户', cue: '月活用户突破两万四' },
                    { value: 94, suffix: '%', label: '完播率', cue: '完播率高达94%' },
                    { value: 7, suffix: '天', label: '上线周期', cue: '仅用7天上线' },
                ],
            };
        case 'compare':
            return {
                left: {
                    label: '传统方式',
                    value: '信息拥挤',
                    desc: '内容平铺，层次不清',
                    cue: '传统方式信息拥挤',
                },
                right: {
                    label: '新方案',
                    value: '视觉聚焦',
                    desc: '重点信息被自然放大',
                    cue: '新方案视觉聚焦',
                },
                vsText: 'VS',
            };
        case 'steps':
            return {
                steps: [
                    { title: '提炼主线', description: '先锁定这一页只讲一个重点', cue: '第一步提炼主线' },
                    { title: '匹配版式', description: '按内容选不同页型', cue: '第二步匹配版式' },
                    { title: '增强节奏', description: '让页面切换有新鲜感', cue: '第三步增强节奏' },
                ],
            };
        case 'list':
            return {
                items: [
                    { icon: '01', text: '柔和高光', desc: '更适合包装重点信息', cue: '第一柔和高光' },
                    { icon: '02', text: '流动背景', desc: '增强镜头层次', cue: '第二流动背景' },
                    { icon: '03', text: '卡片聚焦', desc: '避免全屏信息同权', cue: '第三卡片聚焦' },
                ],
            };
        case 'chart':
            return {
                chart: {
                    type: 'bar',
                    bars: [
                        { label: '层次感', value: 95, cue: '层次感95分' },
                        { label: '辨识度', value: 91, cue: '辨识度91分' },
                        { label: '流畅度', value: 93, cue: '流畅度93分' },
                    ],
                },
            };
        case 'timeline':
            return {
                timeline: [
                    { year: '阶段 1', title: '抓住主题', description: '确定核心信息', cue: '第一阶段抓住主题' },
                    { year: '阶段 2', title: '切换布局', description: '按内容选页型', cue: '第二阶段切换布局' },
                    { year: '阶段 3', title: '强化节奏', description: '避免重复', cue: '第三阶段强化节奏' },
                ],
            };
        case 'highlight':
            return {
                highlights: [
                    { text: '流动', cue: '流动的视觉' },
                    { text: '通透', cue: '通透的质感' },
                    { text: '层次', cue: '层次分明' },
                    { text: '聚焦', cue: '聚焦重点' },
                    { text: '节奏', cue: '有节奏' },
                    { text: '质感', cue: '质感强' },
                ],
            };
        case 'quote':
            return {
                quote: '好看的视频不是每一页都在堆列表，而是每一页都有自己的视觉任务。',
                author: '设计格言',
                cue: '好看的视频每一页都有自己的视觉任务',
            };
        case 'cover':
            return {
                badge: 'FEATURED',
            };
        default:
            return undefined;
    }
}
/**
 * 完整的AI Prompt模板
 */
function generateAIPrompt(templateId, text) {
    const layoutInfo = generateLayoutPrompt(templateId);
    const layouts = getTemplateLayouts(templateId);
    // 生成每个布局的示例
    const examples = [];
    const exampleLayouts = layouts.filter((l) => l.name !== 'default').slice(0, 3);
    exampleLayouts.forEach((layout) => {
        const data = buildLayoutDataExample(layout.name);
        if (data) {
            examples.push(`// ${layout.name} 布局示例:
{
  "layout": "${layout.name}",
  "title": "示例标题",
  "subtitle": "示例副标题",${Object.entries(data).map(([key, value]) => `
  "${key}": ${JSON.stringify(value)}`).join(',')},
  "narration": "对应文案片段"
}`);
        }
    });
    return `你是一个专业的短视频内容策划专家。请将以下口播文案智能拆分为多个幻灯片。

${layoutInfo}
【任务要求】

1. **智能分段**: 根据文案语义自然分段，不要固定数量。每段应是一个完整的表达单元。

2. **布局选择**: 为每段内容选择最合适的 layout 类型。选择依据：
   - 开场介绍 → 使用 hero 或 cover
   - 数据展示 → 使用 stats
   - 前后对比 → 使用 compare
   - 操作步骤 → 使用 steps
   - 功能列表 → 使用 list
   - 数据图表 → 使用 chart
   - 发展历程 → 使用 timeline
   - 关键词 → 使用 highlight
   - 结尾金句 → 使用 quote
   - 普通内容 → 使用 default

3. **数据生成**: 根据选择的 layout，生成对应的数据结构。确保字段完整且数据真实合理。

4. **文案规范**:
   - title: 4-10字，核心主题
   - subtitle: 8-15字，补充说明（可选）
   - narration: 从原文中提取对应的口语化片段

5. **时长控制**: narration 的时长决定了页面展示时长，确保每段narration完整表达一个意思。

6. 元素时间戳对齐: 为了实现"讲到哪动画出到哪"的效果，需要为每个数据元素标记对应的cue文本：
   - 每个数据项(stats/steps/items等)必须包含cue字段
   - cue文本应该是narration中的原话片段
   - 系统会根据cue在narration中的位置计算动画时间

   示例：
   // stats布局示例
   {
     "layout": "stats",
     "title": "用户数据",
     "stats": [
       { "value": 10000, "label": "用户", "cue": "用户突破了一万" },
       { "value": 95, "label": "满意度", "cue": "满意度高达95%" }
     ],
     "narration": "我们的用户突破了一万，满意度高达95%"
   }
   // 示例结束

【输出格式示例】

${examples.join('\n\n')}

请严格按照以下JSON格式输出，不要包含其他内容：

{
  "slides": [
    {
      "layout": "布局名称",
      "title": "标题",
      "subtitle": "副标题",
      // 根据layout添加对应的数据字段
      "narration": "对应的口播文案片段"
    }
  ]
}

【待处理文案】
"""
${text}
"""`;
}
/**
 * 将AI生成的新格式转换为内部格式
 * 新格式: { layout, title, subtitle, stats?, ...narration }
 * 旧格式: { type, title, subtitle, data: {...}, narration }
 */
function normalizeAISlide(slide) {
    // 如果已经是旧格式（有type和data），直接返回
    if (slide.type && slide.data) {
        return slide;
    }
    // 如果是新格式（有layout），转换为旧格式
    if (slide.layout) {
        const { layout, ...rest } = slide;
        const data = {};
        // 将特定字段提取到data中
        const dataFields = [
            'badge',
            'cta',
            'stats',
            'compare',
            'steps',
            'items',
            'chart',
            'timeline',
            'highlights',
            'quote',
            'author',
        ];
        dataFields.forEach((field) => {
            if (slide[field] !== undefined) {
                data[field] = slide[field];
            }
        });
        return {
            ...rest,
            type: layout,
            data: Object.keys(data).length > 0 ? data : undefined,
        };
    }
    // 如果都没有，保持原样
    return slide;
}
/**
 * 批量规范化slides
 */
function normalizeAISlides(slides) {
    return slides.map(normalizeAISlide);
}
