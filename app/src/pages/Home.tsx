import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  Message,
  Space,
  Typography,
  Select,
  Tabs,
  Spin,
} from '@arco-design/web-react';
import { IconSend, IconLink, IconCopy } from '@arco-design/web-react/icon';
import { useProjectStore } from '../stores/project';
import { generateSlides } from '../services/ai';

const { Title, Text } = Typography;
const TextArea = Input.TextArea;
const TabPane = Tabs.TabPane;

const TEMPLATES = [
  { label: '科技风', value: 'SlideShow' },
  { label: '毛玻璃', value: 'GlassShow' },
  { label: '新拟态', value: 'NeuShow' },
  { label: '丰富特效', value: 'RichShow' },
  { label: '科技感特效', value: 'TechShow' },
];

// 动态导入 Tauri API
async function invokeTauri<T>(cmd: string, args: Record<string, unknown>): Promise<T> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(cmd, args);
  } catch {
    console.warn('Tauri API not available');
    throw new Error('Tauri API not available');
  }
}

interface DouyinResult {
  title: string;
  videoUrl: string;
  videoId: string;
}

interface TranscriptionResult {
  text: string;
  duration: number;
}

export default function Home() {
  const navigate = useNavigate();
  const { project, setProject, setGenerating, isGenerating } = useProjectStore();

  // 抖音链接相关状态
  const [douyinLink, setDouyinLink] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // 文案状态
  const [originalText, setOriginalText] = useState('');
  const [editedText, setEditedText] = useState(project?.rawText || '');
  const [template, setTemplate] = useState(project?.template || 'SlideShow');

  // 加载保存的设置
  const [apiKey, setApiKey] = useState('');
  useEffect(() => {
    const saved = localStorage.getItem('videomaker-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setApiKey(settings.bailianApiKey || '');
    }
  }, []);

  // 从抖音链接提取文案
  const handleExtractFromDouyin = async () => {
    if (!douyinLink.trim()) {
      Message.warning('请输入抖音分享链接');
      return;
    }

    if (!apiKey) {
      Message.warning('请先配置阿里云DashScope API Key（在设置页面）');
      return;
    }

    setIsExtracting(true);
    Message.info('正在解析抖音链接...');

    try {
      // Step 1: 解析分享链接获取视频URL
      const parseResult = await invokeTauri<DouyinResult>('parse_douyin_url', {
        shareText: douyinLink,
      });

      Message.info(`已获取视频: ${parseResult.title}，正在转写语音...`);

      // Step 2: 调用语音转写
      const transcribeResult = await invokeTauri<TranscriptionResult>('transcribe_douyin_video', {
        videoUrl: parseResult.videoUrl,
        apiKey: apiKey,
      });

      // 设置原文案和修改后的文案
      setOriginalText(transcribeResult.text);
      setEditedText(transcribeResult.text);

      Message.success(`文案提取成功！视频时长: ${Math.round(transcribeResult.duration)}秒`);
    } catch (error) {
      Message.error('提取失败：' + (error as Error).message);
    } finally {
      setIsExtracting(false);
    }
  };

  // 复制原文案到修改区
  const handleCopyToEdit = () => {
    setEditedText(originalText);
    Message.success('已复制到修改区');
  };

  // 生成幻灯片
  const handleGenerate = async () => {
    if (!editedText.trim()) {
      Message.warning('请输入或提取口播文案');
      return;
    }

    setGenerating(true);
    Message.info('正在生成幻灯片...');

    try {
      const slides = await generateSlides(editedText);

      setProject({
        id: Date.now().toString(),
        title: '新项目',
        rawText: editedText,
        originalText: originalText || editedText,
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
      {/* 抖音链接提取卡片 */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title heading={4}>
              <IconLink style={{ marginRight: 8 }} />
              抖音链接提取
            </Title>
            <Text type="secondary">
              粘贴抖音分享链接，自动提取视频中的口播文案（无需下载视频）
            </Text>
          </div>

          <Space direction="horizontal" style={{ width: '100%' }}>
            <Input
              placeholder="粘贴抖音分享链接，如：https://v.douyin.com/xxxxx 或 1.23 复制打开抖音..."
              value={douyinLink}
              onChange={setDouyinLink}
              style={{ flex: 1 }}
              size="large"
            />
            <Button
              type="primary"
              size="large"
              icon={<IconLink />}
              loading={isExtracting}
              onClick={handleExtractFromDouyin}
            >
              {isExtracting ? '提取中...' : '提取文案'}
            </Button>
          </Space>

          {isExtracting && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin size="large" />
              <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                正在云端转写视频语音，请稍候...
              </Text>
            </div>
          )}
        </Space>
      </Card>

      {/* 文案编辑卡片 */}
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title heading={4}>口播文案</Title>
            <Text type="secondary">
              直接输入文案，或从抖音链接提取
            </Text>
          </div>

          <Tabs defaultActiveKey={originalText ? 'original' : 'edit'}>
            {originalText && (
              <TabPane key="original" title="原文案（提取）">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <TextArea
                    value={originalText}
                    readOnly
                    autoSize={{ minRows: 8, maxRows: 15 }}
                    style={{ fontSize: 16, backgroundColor: '#f5f5f5' }}
                  />
                  <Button
                    type="secondary"
                    icon={<IconCopy />}
                    onClick={handleCopyToEdit}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    复制到修改区
                  </Button>
                </Space>
              </TabPane>
            )}

            <TabPane key="edit" title="修改后的文案">
              <TextArea
                placeholder="在此输入或粘贴口播文案...

示例：
Claude Code 是一款革命性的 AI 编程助手，它在命令行中运行，能够理解你的整个代码库并进行智能编辑。
你只需要用自然语言描述需求，就能完成各种开发任务。
它可以读取、编辑和创建文件，运行命令和测试，还能自动化 Git 操作。"
                value={editedText}
                onChange={setEditedText}
                autoSize={{ minRows: 10, maxRows: 20 }}
                style={{ fontSize: 16 }}
              />
            </TabPane>
          </Tabs>

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

      {/* 使用说明卡片 */}
      <Card style={{ marginTop: 24 }}>
        <Title heading={5}>使用说明</Title>
        <ul style={{ paddingLeft: 20, color: '#86909c', marginTop: 12 }}>
          <li><strong>方式一：</strong>粘贴抖音分享链接，点击"提取文案"自动获取视频中的口播内容</li>
          <li><strong>方式二：</strong>直接在"修改后的文案"框中输入或粘贴你自己的文案</li>
          <li>提取后的原文案会显示在"原文案"标签页中，可以复制到修改区进行编辑</li>
          <li>修改后的文案会用于AI生成幻灯片</li>
          <li>每张幻灯片包含标题、副标题、要点和旁白</li>
          <li>生成后可在编辑器中进一步修改内容和样式</li>
        </ul>
      </Card>
    </div>
  );
}
