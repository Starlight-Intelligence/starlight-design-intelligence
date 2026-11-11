import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-500.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './tokens.css';
import './components.css';
import './studio.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
