import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('Test page loading...');

function TestApp() {
  return (
    <div style={{ padding: 40, background: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#000' }}>测试页面</h1>
      <p style={{ color: '#333' }}>如果你看到这个页面，说明 React 正常工作了。</p>
    </div>
  );
}

console.log('Rendering test app...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);