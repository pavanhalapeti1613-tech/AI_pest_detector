import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory store for ESP32 cloud telemetry & push ingestion
let latestPushDetection: any = null;
let latestPushTimestamp = 0;
let pushHistory: any[] = [];

function esp32ApiPlugin(): Plugin {
  return {
    name: 'esp32-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/esp32')) {
          return next();
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Private-Network', 'true');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;

        // ESP32 Direct Ingestion: POST /api/esp32/push
        if (pathname === '/api/esp32/push' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const pestName = data.pest || data.pest_name || data.detection || (data.detected ? 'Mole Cricket' : null);
              latestPushDetection = {
                id: data.id || `esp-${Date.now()}`,
                detected: Boolean(data.detected ?? (pestName ? true : false)),
                pest: pestName,
                confidence: typeof data.confidence === 'number' ? data.confidence : 92,
                timestamp: data.timestamp || new Date().toISOString(),
                db_level: typeof data.db_level === 'number' ? data.db_level : (typeof data.db === 'number' ? data.db : 54),
                frequency_hz: typeof data.frequency_hz === 'number' ? data.frequency_hz : (typeof data.freq === 'number' ? data.freq : 2180),
                device_id: data.device_id || 'ESP32-PUSH-01',
                battery_v: typeof data.battery_v === 'number' ? data.battery_v : 4.12,
                field_zone: data.field_zone || 'Field Sensor Zone A',
                remedy: data.remedy || (pestName?.toLowerCase().includes('dragon') ? 'Beneficial predator · Conserve naturally' : 'Soil root drench recommended'),
                acknowledged: false,
              };
              latestPushTimestamp = Date.now();
              pushHistory.unshift({ ...latestPushDetection });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Detection recorded successfully', data: latestPushDetection }));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // GET /api/esp32/latest
        if (pathname === '/api/esp32/latest' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const isOnline = Boolean(latestPushTimestamp && Date.now() - latestPushTimestamp < 60000);
          return res.end(
            JSON.stringify({
              data: latestPushDetection,
              timestamp: latestPushTimestamp,
              isOnline,
            })
          );
        }

        // GET /api/esp32/history
        if (pathname === '/api/esp32/history' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(pushHistory));
        }

        // POST /api/esp32/ack
        if (pathname === '/api/esp32/ack' && req.method === 'POST') {
          if (latestPushDetection) {
            latestPushDetection.acknowledged = true;
            latestPushDetection.detected = false;
          }
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: true, message: 'Acknowledged' }));
        }

        // Server Proxy: GET /api/esp32/proxy?target=...
        if (pathname === '/api/esp32/proxy' && req.method === 'GET') {
          const target = urlObj.searchParams.get('target');
          if (!target) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Missing target parameter' }));
          }
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3000);
            const proxyRes = await fetch(target, { signal: controller.signal });
            clearTimeout(timer);
            const body = await proxyRes.text();
            res.statusCode = proxyRes.status;
            res.setHeader('Content-Type', proxyRes.headers.get('content-type') || 'application/json');
            return res.end(body);
          } catch (err: any) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Proxy fetch failed', message: err.message }));
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), esp32ApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
