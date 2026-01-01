import React from 'react';
import ReactDOM from 'react-dom/client';
import AppFinal from './AppFinal.tsx'; // Local import path fix
import './styles.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppFinal />
  </React.StrictMode>
);
