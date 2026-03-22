import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Message,
  Space,
  Typography,
  Divider,
} from '@arco-design/web-react';
import { IconSave } from '@arco-design/web-react/icon';

const { Title, Text } = Typography;

interface Settings {
  aiProvider: 'bailian' | 'openai' | 'anthropic';
  bailianApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  defaultVoiceId: string;
  defaultTemplate: string;
}

const AI_PROVIDERS = [
  { label: '阿里云百炼（Qwen）', value: 'bailian' },
  { label: 'OpenAI（GPT）', value: 'openai' },
  { label: 'Anthropic（Claude）', value: 'anthropic' },
];

const TEMPLATES = [
  { label: '科技风', value: 'SlideShow' },
  { label: '毛玻璃', value: 'GlassShow' },
  { label: '新拟态', value: 'NeuShow' },
  { label: '丰富特效', value: 'RichShow' },
  { label: '科技感特效', value: 'TechShow' },
];

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    aiProvider: 'bailian',
    bailianApiKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    defaultVoiceId: '',
    defaultTemplate: 'SlideShow',
  });

  useEffect(() => {
    // 从 localStorage 加载设置
    const saved = localStorage.getItem('videomaker-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('videomaker-settings', JSON.stringify(settings));
    Message.success('设置已保存');
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title heading={4}>设置</Title>

          <Divider />

          <Form layout="vertical">
            <Form.Item label="AI 服务提供商">
              <Select
                value={settings.aiProvider}
                onChange={(value) => setSettings({ ...settings, aiProvider: value })}
              >
                {AI_PROVIDERS.map((p) => (
                  <Select.Option key={p.value} value={p.value}>
                    {p.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {settings.aiProvider === 'bailian' && (
              <Form.Item label="百炼 API Key">
                <Input.Password
                  value={settings.bailianApiKey}
                  onChange={(value) => setSettings({ ...settings, bailianApiKey: value })}
                  placeholder="sk-..."
                />
              </Form.Item>
            )}

            {settings.aiProvider === 'openai' && (
              <Form.Item label="OpenAI API Key">
                <Input.Password
                  value={settings.openaiApiKey}
                  onChange={(value) => setSettings({ ...settings, openaiApiKey: value })}
                  placeholder="sk-..."
                />
              </Form.Item>
            )}

            {settings.aiProvider === 'anthropic' && (
              <Form.Item label="Anthropic API Key">
                <Input.Password
                  value={settings.anthropicApiKey}
                  onChange={(value) => setSettings({ ...settings, anthropicApiKey: value })}
                  placeholder="sk-ant-..."
                />
              </Form.Item>
            )}

            <Divider />

            <Form.Item label="默认声音 ID">
              <Input
                value={settings.defaultVoiceId}
                onChange={(value) => setSettings({ ...settings, defaultVoiceId: value })}
                placeholder="cosyvoice-v3.5-plus-bailian-xxx"
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                在百炼控制台复刻声音后获得的 ID
              </Text>
            </Form.Item>

            <Form.Item label="默认模板">
              <Select
                value={settings.defaultTemplate}
                onChange={(value) => setSettings({ ...settings, defaultTemplate: value })}
              >
                {TEMPLATES.map((t) => (
                  <Select.Option key={t.value} value={t.value}>
                    {t.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" icon={<IconSave />} onClick={handleSave}>
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}