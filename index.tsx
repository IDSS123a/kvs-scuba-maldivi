
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './i18n'; // Initialize i18n


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// DIAGNOSTICS
import { testSupabaseConnection } from './services/testConnection';
// @ts-ignore
window.testSupabaseConnection = testSupabaseConnection;
console.log('🔧 DIAGNOSTICS READY: type window.testSupabaseConnection() to run');

