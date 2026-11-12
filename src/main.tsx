import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/bree-serif/400.css';
import '@fontsource/palanquin/latin-400.css';
import '@fontsource/palanquin/latin-500.css';
import '@fontsource/lora/latin-700.css';
import App from './App';
import {migrateLegacySamplePhotos} from '../shared/presetProduct';
import {AccountProvider} from './AuthContext';
import './styles.css';
import './farmer.css';
try{migrateLegacySamplePhotos(window.localStorage);}catch{}
import './role.css';
import './account.css';
import './mobile-forms.css';
import './forms.css';
import './farmer-home.css';
import './farmer-pages.css';
import './onboarding-v2.css';
import './home-v2.css';
import './brand-v2.css';
import './publish-v2.css';
import './daily-v2.css';
// Open the app with ?restart to clear saved demo progress and start from the welcome screen.
if(new URLSearchParams(location.search).has('restart')){
 try{Object.keys(localStorage).filter(key=>key.startsWith('farmily')).forEach(key=>localStorage.removeItem(key));sessionStorage.clear();}catch{/* storage blocked: nothing saved to clear */}
 history.replaceState(null,'',location.pathname);
}
// noframe branch: on a desktop browser, show the app inside a fixed 402x874 screen (no phone border)
// so farmer and shopper screens can be recorded at the same size. ?inner is the app itself.
const recordingStage=window.top===window&&innerWidth>=600&&!new URLSearchParams(location.search).has('inner');
if(recordingStage){
 document.body.style.cssText='margin:0;background:#e8e8e3;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 0;box-sizing:border-box';
 const screen=document.createElement('iframe');
 screen.src='/?inner=1'+location.hash;
 screen.title='Farmily';
 screen.allow='camera; microphone; autoplay; clipboard-write';
 screen.style.cssText='width:402px;height:874px;border:0;display:block;background:#fffdf0;flex-shrink:0';
 document.getElementById('root')!.replaceWith(screen);
}else createRoot(document.getElementById('root')!).render(<React.StrictMode><AccountProvider><App/></AccountProvider></React.StrictMode>);
import './shorts-v2.css';
import './brief-v2.css';

import './card-swipe.css';
import './add-product-v2.css';

import './sprout-v2.css';
import './dialog-v2.css';
