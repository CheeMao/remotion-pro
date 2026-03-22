import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  TextArea,
  List,
  Space,
  Typography,
  Message,
  Progress,
  Modal,
  Spin,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconDelete,
  IconEdit,
  IconPlay,
  IconDownload,
  IconRefresh,
} from '@arco-design/web-react/icon';
import { invoke } from '@tauri-apps/api/core';
import { useProjectStore } from '../stores/project';

const { Title, Text } = Typography;

interface RemotionPreviewProps {
  onClose: () => void;
}

function RemotionPreview({ onClose }: RemotionPreviewProps) {
  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [port, setPort] = useState<number>(3000);

  const startRemotion = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    try {
      const result = await invoke<string>('start_remotion');
      Message.success(result);
      // Try to find which port is running
      const ports = [3000, 3002, 3004];
      for (const p of ports) {
        try {
          const res = await fetch(`http://localhost:${p}`);
          if (res.ok) {
            setPort(p);
            break;
          }
        } catch {
          // continue
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsStarting(false);
    }
  }, []);

  useEffect(() => {
    startRemotion();
  }, [startRemotion]);

  if (isStarting) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size={40} />
        <div style={{ marginTop: 16 }}>
          <Text>正在启动 Remotion Studio...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Text type="error">{error}</Text>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={startRemotion}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        display: 'flex',
        gap: 8,
      }}>
        <Button
          size="small"
          icon={<IconRefresh />}
          onClick={() => {
            const iframe = document.querySelector('iframe');
            if (iframe) iframe.src = iframe.src;
          }}
        >
          刷新
        </Button>
        <Button size="small" onClick={onClose}>
          关闭预览
        </Button>
      </div>
      <iframe
        src={`http://localhost:${port}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Remotion Preview"
      />
    </div>
  );
}

export default function Editor() {
  const { project, updateSlide, setSlides, isRendering, progress } = useProjectStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  if (!project) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type="secondary">请先在首页生成幻灯片</Text>
      </div>
    );
  }

  // Preview mode: show iframe
  if (showPreview) {
    return (
      <div style={{ padding: 24, height: '100%' }}>
        <Card style={{ height: '100%' }}>
          <RemotionPreview onClose={() => setShowPreview(false)} />
        </Card>
      </div>
    );
  }

  const currentSlide = project.slides[activeSlide];

  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      title: '新幻灯片',
      subtitle: '',
      points: ['要点 1'],
      narration: '',
    };
    setSlides([...project.slides, newSlide]);
    setActiveSlide(project.slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这张幻灯片吗？',
      onOk: () => {
        const newSlides = project.slides.filter((_, i) => i !== index);
        setSlides(newSlides);
        if (activeSlide >= newSlides.length) {
          setActiveSlide(Math.max(0, newSlides.length - 1));
        }
        Message.success('已删除');
      },
    });
  };

  const handleAddPoint = () => {
    const points = [...(currentSlide.points || []), '新要点'];
    updateSlide(currentSlide.id, { points });
  };

  const handleUpdatePoint = (index: number, value: string) => {
    const points = [...(currentSlide.points || [])];
    points[index] = value;
    updateSlide(currentSlide.id, { points });
  };

  const handleDeletePoint = (index: number) => {
    const points = (currentSlide.points || []).filter((_, i) => i !== index);
    updateSlide(currentSlide.id, { points });
  };

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', gap: 24 }}>
      {/* 左侧：幻灯片列表 */}
      <Card style={{ width: 280, flexShrink: 0 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title heading={5} style={{ margin: 0 }}>幻灯片</Title>
          <Button
            size="small"
            icon={<IconPlus />}
            onClick={handleAddSlide}
          >
            添加
          </Button>
        </div>

        {/* 内嵌预览按钮 */}
        <Button
          type="primary"
          icon={<IconPlay />}
          onClick={() => setShowPreview(true)}
          long
          style={{ marginBottom: 16 }}
        >
          内嵌预览
        </Button>

        <List
          dataSource={project.slides}
          render={(slide, index) => (
            <List.Item
              key={slide.id}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: activeSlide === index ? '#e8f3ff' : 'transparent',
                borderRadius: 4,
              }}
              onClick={() => setActiveSlide(index)}
              actions={[
                <Button
                  key="delete"
                  size="mini"
                  icon={<IconDelete />}
                  status="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSlide(index);
                  }}
                />,
              ]}
            >
              <Text>{slide.title || `幻灯片 ${index + 1}`}</Text>
            </List.Item>
          )}
        />
      </Card>

      {/* 右侧：编辑区 */}
      <Card style={{ flex: 1, overflow: 'auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text>标题</Text>
            <Input
              value={currentSlide.title}
              onChange={(value) => updateSlide(currentSlide.id, { title: value })}
              placeholder="输入标题（4-10字）"
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text>副标题</Text>
            <Input
              value={currentSlide.subtitle || ''}
              onChange={(value) => updateSlide(currentSlide.id, { subtitle: value })}
              placeholder="输入副标题（8-15字）"
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>要点</Text>
              <Button size="small" icon={<IconPlus />} onClick={handleAddPoint}>
                添加要点
              </Button>
            </div>
            <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 8 }}>
              {(currentSlide.points || []).map((point, index) => (
                <div key={index} style={{ display: 'flex', gap: 8 }}>
                  <Input
                    value={point}
                    onChange={(value) => handleUpdatePoint(index, value)}
                    placeholder={`要点 ${index + 1}`}
                    style={{ flex: 1 }}
                  />
                  <Button
                    icon={<IconDelete />}
                    status="danger"
                    onClick={() => handleDeletePoint(index)}
                  />
                </div>
              ))}
            </Space>
          </div>

          <div>
            <Text>旁白（用于 TTS 配音）</Text>
            <TextArea
              value={currentSlide.narration}
              onChange={(value) => updateSlide(currentSlide.id, { narration: value })}
              placeholder="输入旁白文本..."
              autoSize={{ minRows: 4, maxRows: 8 }}
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
}