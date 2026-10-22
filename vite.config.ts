import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel supplies the Git branch at build time. Keep this project scoped to dev.
const clarityEnabled = process.env.VERCEL_GIT_COMMIT_REF === 'dev';
const clarityScript = `(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "z1hrlazsy1");`;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'clarity-dev-branch',
      apply: 'build',
      transformIndexHtml() {
        return clarityEnabled
          ? [{ tag: 'script', children: clarityScript, injectTo: 'head' }]
          : [];
      },
    },
  ],
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
});
