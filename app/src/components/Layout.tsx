import { ReactNode } from 'react';
import { Layout as ArcoLayout, Menu } from '@arco-design/web-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconHome,
  IconEdit,
  IconSettings,
} from '@arco-design/web-react/icon';

const { Sider, Content } = ArcoLayout;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <IconHome />, label: '首页' },
    { key: '/editor', icon: <IconEdit />, label: '编辑器' },
    { key: '/settings', icon: <IconSettings />, label: '设置' },
  ];

  return (
    <ArcoLayout style={{ height: '100vh' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        <div style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #e5e6eb',
          fontWeight: 'bold',
          fontSize: 18,
          color: '#165dff'
        }}>
          AI 视频生成器
        </div>
        <Menu
          selectedKeys={[location.pathname]}
          onClickMenuItem={(key) => navigate(key)}
          style={{ borderRight: 'none' }}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key}>
              {item.icon} {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Content style={{ background: '#f5f5f5', overflow: 'auto' }}>
        {children}
      </Content>
    </ArcoLayout>
  );
}