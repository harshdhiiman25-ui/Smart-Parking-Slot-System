import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const distPath = path.join(import.meta.dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Automatically ensure production bundle is built before serving
function ensureBuild() {
  if (!fs.existsSync(indexPath)) {
    console.log('⚡ dist/index.html not detected. Running automated build (npm run build)...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed successfully.');
    } catch (err) {
      console.error('⚠️ Build failed:', err);
    }
  }
}

// Initial build check on startup
ensureBuild();

// Health check endpoint for Render service monitoring
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    buildReady: fs.existsSync(indexPath),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve compiled static assets dynamically
app.use((req, res, next) => {
  if (req.path === '/healthz') return next();

  // If dist is still missing (e.g., initial startup edge case), attempt build
  if (!fs.existsSync(indexPath)) {
    ensureBuild();
  }

  if (fs.existsSync(indexPath)) {
    // Attempt to serve static asset
    express.static(distPath, {
      maxAge: '1d',
      etag: true
    })(req, res, () => {
      // If asset not matched, fall back to index.html for SPA routing
      res.sendFile(indexPath);
    });
  } else {
    res.status(500).send('Application bundle is generating. Please refresh in a few seconds.');
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Smart Parking System server running at http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use.`);
  } else {
    console.error('Server error:', err);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
