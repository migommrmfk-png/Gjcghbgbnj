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

  // Secure Gemini API Endpoint
  app.post('/api/gemini/generateContent', async (req, res) => {
    try {
      const { model, contents, config, customApiKey } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error("No API key available on the server backend");
        return res.status(400).json({ 
          error: "يرجى إدخال مفتاح الـ API الخاص بك في قسم الذكاء الاصطناعي لاستخدام هذه الميزة دون قيود." 
        });
      }

      // Support OpenAI API keys dynamically
      if (typeof apiKey === 'string' && apiKey.trim().startsWith('sk-')) {
        console.log("Using OpenAI API Key for Chat Completion");
        
        // Translate format
        const messages = contents.map((c: any) => {
          const role = c.role === 'model' ? 'assistant' : (c.role === 'system' ? 'system' : 'user');
          let contentStr = '';
          if (Array.isArray(c.parts)) {
            contentStr = c.parts.map((p: any) => typeof p === 'string' ? p : (p?.text || '')).join('\n');
          } else if (typeof c.parts === 'string') {
            contentStr = c.parts;
          } else if (typeof c.text === 'string') {
            contentStr = c.text;
          } else if (typeof c === 'string') {
            contentStr = c;
          }
          return { role, content: contentStr };
        });

        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: config?.temperature ?? 0.7,
            max_tokens: config?.maxOutputTokens ?? 2000
          })
        });

        if (!openAiResponse.ok) {
          const errText = await openAiResponse.text();
          console.error("OpenAI request failed:", errText);
          throw new Error(`خطأ من خادم الذكاء الاصطناعي: ${errText}`);
        }

        const openAiData = await openAiResponse.json();
        const responseText = openAiData?.choices?.[0]?.message?.content || "";
        return res.json({ text: responseText });
      }

      // Lazy load standard SDK for Gemini
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Map any legacy/deprecated models to stable gemini-3.5-flash
      let targetModel = 'gemini-3.5-flash';
      if (model && (model.startsWith('gemini-2.5') || model.startsWith('gemini-1.5') || model.startsWith('gemini-2.0'))) {
        targetModel = 'gemini-3.5-flash';
      } else if (model) {
        targetModel = model;
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI server-side call failed:", error);
      
      const errorStr = [
        String(error),
        error?.message,
        error?.stack,
        (error && typeof error === 'object') ? JSON.stringify(error) : ''
      ].filter(Boolean).join(' ');
      
      if (errorStr.includes("leaked") || errorStr.includes("LEAKED") || errorStr.includes("403") || errorStr.includes("PERMISSION_DENIED") || errorStr.includes("reported")) {
        return res.status(403).json({
          error: "عذراً، مفتاح الـ API الافتراضي للمنصة تم إيقافه من قِبل Google بسبب تسريبه. لتشغيل الذكاء الاصطناعي بشكل غير محدود ومجاني بالكامل، يرجى النقر على زر المفتاح الذهبي في الأعلى وإدخال مفتاح الـ API الخاص بك (سواءً Gemini مجاني بالكامل أو OpenAI)."
        });
      }
      
      res.status(500).json({ error: error?.message || "فشلت عملية معالجة الذكاء الاصطناعي." });
    }
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
