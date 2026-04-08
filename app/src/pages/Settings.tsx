import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Message,
  Space,
  Typography,
  Divider,
  Select,
} from "@arco-design/web-react";
import { IconSave } from "@arco-design/web-react/icon";
import { invoke } from "@tauri-apps/api/core";

const { Title, Text } = Typography;

interface AppSettings {
  dashscopeApiKey?: string;
  defaultVoiceId?: string;
  defaultTtsModel?: string;
  qiniuAccessKey?: string;
  qiniuSecretKey?: string;
  qiniuBucket?: string;
  qiniuDomain?: string;
}

interface Settings {
  volcengineAppId: string;
  volcengineAccessKey: string;
  volcengineResourceId: string;
  defaultVoiceId: string;
  defaultTemplate: string;
}

const TEMPLATES = [
  { label: "科技风", value: "SlideShow" },
  { label: "毛玻璃", value: "GlassShow" },
  { label: "新拟态", value: "NeuShow" },
  { label: "丰富特效", value: "RichShow" },
  { label: "科技感特效", value: "TechShow" },
];

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    volcengineAppId: "",
    volcengineAccessKey: "",
    volcengineResourceId: "seed-tts-1.0",
    defaultVoiceId: "",
    defaultTemplate: "SlideShow",
  });

  useEffect(() => {
    const loadSettings = async () => {
      // 优先从本地存储加载
      const saved = localStorage.getItem("videomaker-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({
          volcengineAppId: parsed.volcengineAppId || "",
          volcengineAccessKey:
            parsed.volcengineAccessKey || parsed.voiceApiKey || "",
          volcengineResourceId: parsed.volcengineResourceId || "seed-tts-1.0",
          defaultVoiceId: parsed.defaultVoiceId || parsed.voiceId || "",
          defaultTemplate: parsed.defaultTemplate || "SlideShow",
        });
        return;
      }

      // 如果本地没有，尝试从 .env 文件加载（通过 Tauri 后端）
      try {
        const envSettings = await invoke<AppSettings>("get_app_settings");
        if (envSettings.dashscopeApiKey) {
          setSettings((prev) => ({
            ...prev,
            volcengineAccessKey:
              envSettings.dashscopeApiKey || prev.volcengineAccessKey,
            defaultVoiceId: envSettings.defaultVoiceId || prev.defaultVoiceId,
          }));
        }
      } catch (e) {
        console.error("Failed to load settings from env:", e);
      }
    };

    loadSettings();
  }, []);

  const handleSave = () => {
    const next = {
      ...settings,
      voiceApiKey: settings.volcengineAccessKey,
      voiceId: settings.defaultVoiceId,
    };
    localStorage.setItem("videomaker-settings", JSON.stringify(next));
    Message.success("设置已保存");
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title heading={4}>设置</Title>

          <Divider />

          <Form layout="vertical">
            <Form.Item label="火山引擎 App ID">
              <Input
                value={settings.volcengineAppId}
                onChange={(value) =>
                  setSettings({ ...settings, volcengineAppId: value })
                }
                placeholder="输入 VOLCENGINE_APP_ID"
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                在火山引擎控制台 - 语音合成 - 应用管理 中获取
              </Text>
            </Form.Item>

            <Form.Item label="火山引擎 Access Key">
              <Input.Password
                value={settings.volcengineAccessKey}
                onChange={(value) =>
                  setSettings({ ...settings, volcengineAccessKey: value })
                }
                placeholder="输入 VOLCENGINE_ACCESS_KEY"
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                用于语音合成与抖音语音转写。
              </Text>
            </Form.Item>

            <Form.Item label="火山引擎 Resource ID">
              <Input
                value={settings.volcengineResourceId}
                onChange={(value) =>
                  setSettings({ ...settings, volcengineResourceId: value })
                }
                placeholder="seed-tts-1.0"
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                默认 seed-tts-1.0，一般无需修改
              </Text>
            </Form.Item>

            <Form.Item label="默认声音 ID">
              <Input
                value={settings.defaultVoiceId}
                onChange={(value) =>
                  setSettings({ ...settings, defaultVoiceId: value })
                }
                placeholder="zh_female_shuangkuaisisi_moon_bigtts"
              />
            </Form.Item>

            <Form.Item label="默认模板">
              <Select
                value={settings.defaultTemplate}
                onChange={(value) =>
                  setSettings({ ...settings, defaultTemplate: value })
                }
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
