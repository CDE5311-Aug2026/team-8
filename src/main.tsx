import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/bree-serif/400.css';
import App from './FarmerApp';
import './styles.css';
import './farmer.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
