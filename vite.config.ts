import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function localDevProxyPlugin(): Plugin {
  return {
    name: 'echo-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        try {
          const fullUrl = new URL(req.url || '', 'http://localhost');
          const target = fullUrl.searchParams.get('url');
          if (!target) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }

          const forwardHeaders: Record<string, string> = {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          };

          // Forward custom headers passed via query param or headers
          const customHeadersParam = fullUrl.searchParams.get('custom_headers');
          if (customHeadersParam) {
            try {
              const parsed = JSON.parse(customHeadersParam);
              Object.assign(forwardHeaders, parsed);
            } catch {
              // Ignore invalid JSON
            }
          }

          if (req.headers['x-forward-authorization']) {
            forwardHeaders['Authorization'] = req.headers['x-forward-authorization'] as string;
          }
          if (req.headers['x-forward-cookie']) {
            forwardHeaders['Cookie'] = req.headers['x-forward-cookie'] as string;
          }

          const resp = await fetch(target, {
            headers: forwardHeaders,
            redirect: 'follow',
          });

          res.statusCode = resp.status;
          resp.headers.forEach((val, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
              res.setHeader(key, val);
            }
          });
          res.setHeader('Access-Control-Allow-Origin', '*');
          const buffer = await resp.arrayBuffer();
          res.end(Buffer.from(buffer));
        } catch (err: any) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Fetch failed' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localDevProxyPlugin()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  // @ts-ignore
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
