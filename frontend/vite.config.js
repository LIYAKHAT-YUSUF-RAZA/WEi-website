import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // Plugin to suppress HMR WebSocket errors (backup to index.html script)
    {
      name: 'suppress-ws-errors',
      transformIndexHtml(html) {
        // Only inject if not already present (index.html already has it)
        if (html.includes('Suppress Vite HMR WebSocket')) {
          return html;
        }
        // This is a backup - the main script is in index.html
        return html.replace(
          '<head>',
          `<head>
    <script>
      // Backup error suppression (main script in index.html)
      (function(){'use strict';const o={error:console.error.bind(console),warn:console.warn.bind(console)};function isWS(e){if(!e)return!1;const t=String(e).toLowerCase();return(t.includes('websocket')||t.includes('ws://'))&&(t.includes('localhost:5173')||t.includes('failed')||t.includes('connection'))}function getMsg(e){return e.map(e=>{if(null===e)return'null';if(void 0===e)return'undefined';if('object'==typeof e){try{return e.toString?e.toString():JSON.stringify(e)}catch(t){return'[Object]'}}return String(e)}).join(' ')}console.error=function(...e){const t=getMsg(e);if(isWS(t))return;for(const t of e)if(isWS(getMsg([t])))return;o.error.apply(console,e)},console.warn=function(...e){const t=getMsg(e);isWS(t)||o.warn.apply(console,e)},window.addEventListener('error',function(e){const t=(e.message||'').toLowerCase(),n=(e.filename||e.source||'').toLowerCase();(t.includes('websocket')&&(t.includes('localhost:5173')||t.includes('failed'))||n.includes('client:')&&t.includes('websocket'))&&(e.stopImmediatePropagation(),e.preventDefault())},!0),window.onerror=function(e,t){const n=String(e||'').toLowerCase(),r=String(t||'').toLowerCase();return(n.includes('websocket')&&(n.includes('localhost:5173')||n.includes('failed'))||r.includes('client:')&&n.includes('websocket'))||!1}})();
    </script>`
        );
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
