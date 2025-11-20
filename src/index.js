import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MemeDecoder API is running',
    version: '1.0.0',
  });
});

// Endpoint to analyze memes
app.post('/api/decode-meme', upload.single('meme'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
      });
    }

    // Verify API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
      });
    }

    // Convert image to base64
    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Configure Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create the prompt to analyze the meme
    const prompt = `You are a meme expert. Analyze this meme and provide a brief, concise explanation (3-4 sentences max) covering:
- What you see in the image
- What it means and why it's funny
- When it's typically used

Keep it short, simple, and engaging. No bullet points or formatting.`;

    // Send the image to Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const explanation = response.text();

    // Respond with the analysis
    res.json({
      success: true,
      explanation: explanation,
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('Error processing meme:', error);

    res.status(500).json({
      error: 'Error processing meme',
      details: error.message,
    });
  }
});

// Test endpoint (for testing)
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Multer error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File is too large. Maximum 10MB',
      });
    }
    return res.status(400).json({
      error: 'Error uploading file',
      details: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`🎭 Decode endpoint: POST http://localhost:${PORT}/api/decode-meme`);
  console.log(`🔑 Gemini API Key configured: ${!!process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
});
