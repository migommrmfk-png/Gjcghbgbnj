import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('chat-message', (msg) => {
      // Broadcast message to everyone else
      socket.broadcast.emit('chat-message', msg);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Middleware for parsing JSON
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running!' });
  });

  // Integrations place-holders
  app.post('/api/zoom/meeting', (req, res) => {
    // Zoom meeting creation logic would go here
    res.json({ success: true, message: 'Zoom integration placeholder' });
  });

  app.post('/api/onmeet/meeting', (req, res) => {
    res.json({ success: true, message: 'OnMeet integration placeholder' });
  });

  app.post('/api/easykash/payment', (req, res) => {
    res.json({ success: true, message: 'EasyKash integration placeholder' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
