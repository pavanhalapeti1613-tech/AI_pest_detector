import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

let latestPushDetection: any = null;
let latestPushTimestamp = 0;
let pushHistory: any[] = [];

// Allow cross-origin and private network requests from ESP32
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ESP32 Direct Ingestion: POST /api/esp32/push
app.post('/api/esp32/push', (req, res) => {
  const data = req.body || {};
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
  res.json({ success: true, message: 'Detection recorded successfully', data: latestPushDetection });
});

app.get('/api/esp32/latest', (req, res) => {
  const isOnline = Boolean(latestPushTimestamp && Date.now() - latestPushTimestamp < 60000);
  res.json({
    data: latestPushDetection,
    timestamp: latestPushTimestamp,
    isOnline,
  });
});

app.get('/api/esp32/history', (req, res) => {
  res.json(pushHistory);
});

app.post('/api/esp32/ack', (req, res) => {
  if (latestPushDetection) {
    latestPushDetection.acknowledged = true;
    latestPushDetection.detected = false;
  }
  res.json({ success: true, message: 'Acknowledged' });
});

app.get('/api/esp32/proxy', async (req, res) => {
  const target = req.query.target as string;
  if (!target) {
    return res.status(400).json({ error: 'Missing target parameter' });
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const proxyRes = await fetch(target, { signal: controller.signal });
    clearTimeout(timer);
    const body = await proxyRes.text();
    res.status(proxyRes.status);
    res.setHeader('Content-Type', proxyRes.headers.get('content-type') || 'application/json');
    res.send(body);
  } catch (err: any) {
    res.status(502).json({ error: 'Proxy fetch failed', message: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
