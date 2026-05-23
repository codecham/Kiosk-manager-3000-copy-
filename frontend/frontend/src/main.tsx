import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Providers from '@/app/providers';
import App from './App';
import '@/styles/globals.css';
import 'xterm/css/xterm.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>,
);