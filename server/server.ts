import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiApp } from './apiApp';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxies
app.set('trust proxy', 1);

// Mount NextGen API router
app.use(apiApp);

// Serve frontend static build files in production
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // Fallback for SPA routing in Express 5
  app.use((req: Request, res: Response, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    } else {
      next();
    }
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`NextGen Official Backend Service Running`);
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/contact/health`);
  console.log(`===============================================`);
});

export default app;
