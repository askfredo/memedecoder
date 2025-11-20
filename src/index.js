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

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Configuración de Multer para manejar uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MemeDecoder API está funcionando',
    version: '1.0.0',
  });
});

// Endpoint para analizar memes
app.post('/api/decode-meme', upload.single('meme'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se proporcionó ninguna imagen',
      });
    }

    // Verificar que existe la API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'API key de Gemini no configurada',
      });
    }

    // Convertir la imagen a base64
    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Configurar el modelo Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Crear el prompt para analizar el meme
    const prompt = `Eres un experto en cultura de internet y memes. Analiza esta imagen de meme y proporciona:

1. **Descripción del meme**: Describe qué elementos visuales ves en la imagen
2. **Significado**: Explica el significado del meme, su contexto y por qué es gracioso
3. **Origen**: Si conoces el origen o plantilla del meme, menciónalo
4. **Uso común**: Explica en qué situaciones se suele usar este meme

Responde en español de manera clara, divertida y educativa.`;

    // Enviar la imagen a Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const explanation = response.text();

    // Responder con el análisis
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
    console.error('Error al procesar el meme:', error);

    res.status(500).json({
      error: 'Error al procesar el meme',
      details: error.message,
    });
  }
});

// Endpoint de prueba sin autenticación (para testing)
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Endpoint de prueba funcionando',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Manejo de errores de Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Máximo 10MB',
      });
    }
    return res.status(400).json({
      error: 'Error al subir el archivo',
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`🎭 Decode endpoint: POST http://localhost:${PORT}/api/decode-meme`);
  console.log(`🔑 Gemini API Key configurada: ${!!process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
});
