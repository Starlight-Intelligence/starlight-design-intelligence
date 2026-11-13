import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Experiences from './Experiences';
import GlassProduct from './GlassProduct';
import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-500.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './tokens.css';
import './components.css';
// Keep the original library's page styles isolated from the commercial demos.
const isLibrary = window.location.pathname === '/library.html';
if (isLibrary) await import('./studio.css');

createRoot(document.getElementById('root')!).render(<React.StrictMode>{isLibrary ? <App /> : window.location.pathname==='/glass.html' ? <GlassProduct/> : <Experiences />}</React.StrictMode>);
