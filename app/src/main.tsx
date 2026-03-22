import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@arco-design/web-react/dist/css/arco.css';
import App from './App';
import './index.css';

// 隐藏加载提示
const loadingEl = document.getElementById('loading');
if (loadingEl) loadingEl.style.display = 'none';

console.log('Starting React app...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

console.log('React app rendered');