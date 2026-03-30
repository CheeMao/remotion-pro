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
  Spin,
} from '@arco-design/web-react';
import { IconSend, IconLink, IconCopy } from '@arco-design/web-react/icon';
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

const editorPanelStyle: React.CSSProperties = {
  minWidth: 0,
  padding: 16,
  borderRadius: 20,
  background: 'linear-gradient(180deg, rgba(247,250,255,0.92), rgba(255,255,255,0.98))',
  border: '1px solid #e5eaf4',
};

export default function Home() {
  const navigate = useNavigate();
  const { project, setProject, setGenerating, isGenerating } = useProjectStore();

  const [douyinLink, setDouyinLink] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [editedText, setEditedText] = useState(project?.rawText || '');
  const [template, setTemplate] = useState(project?.template || 'SlideShow');

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('videomaker-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        console.log(
          'Settings loaded, apiKey exists:',
          !!(settings.aiApiKey || settings.voiceApiKey || settings.bailianApiKey)
        );
      } else {
        console.log('No settings found in localStorage');
      }
    };

    loadSettings();
    window.addEventListener('focus', loadSettings);
    return () => window.removeEventListener('focus', loadSettings);
  }, []);

  const handleExtractFromDouyin = async () => {
    if (!douyinLink.trim()) {
      Message.warning('请输入抖音分享链接');
      return;
    }

    const saved = localStorage.getItem('videomaker-settings');
    let currentApiKey = '';
    if (saved) {
      const settings = JSON.parse(saved);
      currentApiKey = settings.aiApiKey || settings.voiceApiKey || settings.bailianApiKey || '';
    }

    if (!currentApiKey) {
      Message.warning('请先在设置页配置 DashScope API Key');
      return;
    }

    setIsExtracting(true);
    Message.info('正在解析抖音链接...');

    try {
      const parseResult = await invokeTauri<DouyinResult>('parse_douyin_url', {
        shareText: douyinLink,
      });

      Message.info(`已获取视频：${parseResult.title}，正在转写语音...`);

      const transcribeResult = await invokeTauri<TranscriptionResult>('transcribe_douyin_video', {
        videoUrl: parseResult.videoUrl,
        apiKey: currentApiKey,
      });

      setOriginalText(transcribeResult.text);
      setEditedText(transcribeResult.text);

      Message.success(`文案提取成功，视频时长约 ${Math.round(transcribeResult.duration)} 秒`);
    } catch (error) {
      Message.error('提取失败：' + (error as Error).message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyToEdit = () => {
    setEditedText(originalText);
    Message.success('已复制到修改区');
  };

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

      Message.success('生成成功');
      navigate('/editor');
    } catch (error) {
      Message.error('生成失败：' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ padding: '16px 20px 18px', maxWidth: 1380, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <Title heading={3} style={{ marginBottom: 6 }}>
          生成项目
        </Title>
        <Text type="secondary">从抖音链接提取文案，或直接输入文案生成视频。</Text>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <Space direction="vertical" size="medium" style={{ width: '100%' }}>
          <div>
            <Title heading={5} style={{ marginBottom: 6 }}>
              <IconLink style={{ marginRight: 8 }} />
              抖音链接提取
            </Title>
            <Text type="secondary">粘贴抖音分享链接，自动提取视频口播文案</Text>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Input
              placeholder="粘贴抖音分享链接，支持分享口令或短链接"
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
              style={{ minWidth: 140 }}
            >
              {isExtracting ? '提取中...' : '提取文案'}
            </Button>
          </div>

          {isExtracting && (
            <div style={{ textAlign: 'center', padding: '4px 0 0' }}>
              <Spin size={32} />
              <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                正在云端转写视频语音，请稍候...
              </Text>
            </div>
          )}
        </Space>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <Space direction="vertical" size="medium" style={{ width: '100%' }}>
          <div>
            <Title heading={5} style={{ marginBottom: 6 }}>
              文案编辑
            </Title>
            <Text type="secondary">原文案和修改文案左右对比，减少切换，提高编辑效率。</Text>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div style={editorPanelStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <Title heading={6} style={{ margin: 0 }}>
                  原文案（提取）
                </Title>
                <Button
                  type="outline"
                  size="small"
                  icon={<IconCopy />}
                  onClick={handleCopyToEdit}
                  disabled={!originalText}
                >
                  复制到修改区
                </Button>
              </div>
              <TextArea
                value={originalText}
                readOnly
                placeholder="提取后的原文案会显示在这里"
                autoSize={{ minRows: 15, maxRows: 15 }}
                style={{ fontSize: 15, backgroundColor: '#f7f9fc' }}
              />
            </div>

            <div style={editorPanelStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <Title heading={6} style={{ margin: 0 }}>
                  修改后的文案
                </Title>
                <Text type="secondary">推荐直接在右侧编辑</Text>
              </div>
              <TextArea
                placeholder={`在此输入或粘贴口播文案...

示例：
Claude Code 是一款革命性的 AI 编程助手，它在命令行中运行，能够理解你的整个代码库并进行智能编辑。你只需要用自然语言描述需求，就能完成各种开发任务。它可以读取、编辑和创建文件，运行命令和测试，还能自动化 Git 操作。`}
                value={editedText}
                onChange={setEditedText}
                autoSize={{ minRows: 15, maxRows: 15 }}
                style={{ fontSize: 15 }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Space size="medium" align="center">
              <Text>模板</Text>
              <Select value={template} onChange={setTemplate} style={{ width: 220 }}>
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
              style={{ minWidth: 168 }}
            >
              开始生成
            </Button>
          </div>
        </Space>
      </Card>

      <Card>
        <Title heading={6} style={{ marginBottom: 8 }}>
          使用说明
        </Title>
        <ul style={{ paddingLeft: 20, color: '#86909c', lineHeight: 1.65 }}>
          <li>方式一：粘贴抖音分享链接，点击“提取文案”自动获取视频中的口播内容。</li>
          <li>方式二：直接在右侧“修改后的文案”区域输入或粘贴自己的文案。</li>
          <li>左侧保留原文案，右侧负责修改，适合逐句对照处理。</li>
          <li>文案确认后选择模板，点击“开始生成”进入编辑器。</li>
        </ul>
      </Card>
    </div>
  );
}
