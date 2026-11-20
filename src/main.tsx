import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Inter со своего сайта, без Google Fonts: только нужные начертания и алфавиты
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/cyrillic-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/cyrillic-600.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
