import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  Message,
  Space,
  Typography,
  Select,
} from '@arco-design/web-react';
import { IconSend } from '@arco-design/web-react/icon';
import { useProjectStore } from '../stores/project';
import { generateSlides } from '../services/ai';

const { Title, Text } = Typography;
const TextArea = Input.TextArea;

const TEMPLATES = [
  { label: '科技风', value: 'SlideShow' },
  { label: '毛玻璃', value: 'GlassShow' },
  { label: '新拟态', value: 'NeuShow' },
  { label: '丰富特效', value: 'RichShow' },
  { label: '科技感特效', value: 'TechShow' },
];

export default function Home() {
  const navigate = useNavigate();
  const { project, setProject, setGenerating, isGenerating } = useProjectStore();
  const [text, setText] = useState(project?.rawText || '');
  const [template, setTemplate] = useState(project?.template || 'SlideShow');

  const handleGenerate = async () => {
    if (!text.trim()) {
      Message.warning('请输入口播文案');
      return;
    }

    setGenerating(true);
    Message.info('正在生成幻灯片...');

    try {
      const slides = await generateSlides(text);

      setProject({
        id: Date.now().toString(),
        title: '新项目',
        rawText: text,
        slides: slides.map((slide, index) => ({
          ...slide,
          id: `slide-${index}`,
        })),
        template,
        voiceId: '',
      });

      Message.success('生成成功！');
      navigate('/editor');
    } catch (error) {
      Message.error('生成失败：' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title heading={4}>口播文案</Title>
            <Text type="secondary">
              粘贴你的口播文案，AI 将自动拆分为幻灯片
            </Text>
          </div>

          <TextArea
            placeholder="在此粘贴口播文案...&#10;&#10;示例：&#10;Claude Code 是一款革命性的 AI 编程助手，它在命令行中运行，能够理解你的整个代码库并进行智能编辑。&#10;你只需要用自然语言描述需求，就能完成各种开发任务。&#10;它可以读取、编辑和创建文件，运行命令和测试，还能自动化 Git 操作。"
            value={text}
            onChange={setText}
            autoSize={{ minRows: 10, maxRows: 20 }}
            style={{ fontSize: 16 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Text>模板风格：</Text>
              <Select
                value={template}
                onChange={setTemplate}
                style={{ width: 200 }}
              >
                {TEMPLATES.map((t) => (
                  <Select.Option key={t.value} value={t.value}>
                    {t.label}
                  </Select.Option>
                ))}
              </Select>
            </Space>

            <Button
              type="primary"
              size="large"
              icon={<IconSend />}
              loading={isGenerating}
              onClick={handleGenerate}
            >
              生成幻灯片
            </Button>
          </div>
        </Space>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Title heading={5}>使用说明</Title>
        <ul style={{ paddingLeft: 20, color: '#86909c', marginTop: 12 }}>
          <li>粘贴完整的口播文案，AI 会自动拆分为 4-8 张幻灯片</li>
          <li>每张幻灯片包含标题、副标题、要点和旁白</li>
          <li>生成后可在编辑器中修改内容</li>
          <li>选择不同的模板风格会影响视频的视觉效果</li>
        </ul>
      </Card>
    </div>
  );
}