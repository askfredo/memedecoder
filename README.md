# MemeDecoder Backend API

Backend API para MemeDecoder - Servicio de explicación de memes con IA usando Gemini 2.5 Flash.

## Características

- Sube imágenes de memes y recibe explicaciones detalladas
- Análisis con Google Gemini 2.5 Flash
- API REST simple y eficiente
- Listo para desplegar en Railway

## Instalación Local

1. Instala las dependencias:
```bash
npm install
```

2. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Agrega tu API key de Gemini en el archivo `.env`:
```
GEMINI_API_KEY=tu_api_key_aqui
PORT=3000
```

4. Inicia el servidor:
```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm start
```

## Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la clave y pégala en tu archivo `.env`

## Endpoints

### GET `/`
Health check del servidor.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "MemeDecoder API está funcionando",
  "version": "1.0.0"
}
```

### POST `/api/decode-meme`
Analiza un meme y devuelve su explicación.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `meme`: Archivo de imagen (JPG, PNG, GIF, etc.)

**Respuesta exitosa:**
```json
{
  "success": true,
  "explanation": "Análisis detallado del meme...",
  "metadata": {
    "filename": "meme.jpg",
    "size": 123456,
    "mimeType": "image/jpeg"
  }
}
```

**Respuesta de error:**
```json
{
  "error": "Descripción del error",
  "details": "Detalles adicionales"
}
```

### GET `/api/test`
Endpoint de prueba para verificar la configuración.

**Respuesta:**
```json
{
  "message": "Endpoint de prueba funcionando",
  "geminiConfigured": true
}
```

## Prueba con cURL

```bash
# Health check
curl http://localhost:3000/

# Probar análisis de meme
curl -X POST http://localhost:3000/api/decode-meme \
  -F "meme=@/ruta/a/tu/meme.jpg"
```

## Despliegue en Railway

### Preparación

1. Sube el código a GitHub:
```bash
cd backend
git init
git add .
git commit -m "Initial commit: MemeDecoder backend"
git branch -M main
git remote add origin https://github.com/tu-usuario/memedecoder-backend.git
git push -u origin main
```

### Despliegue

1. Ve a [Railway](https://railway.app/)
2. Inicia sesión con GitHub
3. Haz clic en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Elige tu repositorio `memedecoder-backend`
6. Railway detectará automáticamente que es un proyecto Node.js

### Configuración de Variables de Entorno

En Railway, ve a la pestaña "Variables" y agrega:

- `GEMINI_API_KEY`: Tu API key de Gemini
- `PORT`: Railway lo asigna automáticamente, pero puedes dejarlo vacío

Railway asignará automáticamente un dominio público como: `https://tu-app.up.railway.app`

### Configuración Adicional

Railway debería detectar automáticamente el comando de inicio desde `package.json`, pero si necesitas configurarlo manualmente:

1. Ve a Settings > Deploy
2. Start Command: `npm start`
3. Build Command: `npm install`

## Estructura del Proyecto

```
backend/
├── src/
│   └── index.js          # Servidor Express principal
├── .env.example          # Plantilla de variables de entorno
├── .gitignore           # Archivos a ignorar en Git
├── package.json         # Dependencias y scripts
└── README.md           # Este archivo
```

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Multer** - Manejo de uploads multipart/form-data
- **Google Generative AI** - SDK de Gemini
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Manejo de variables de entorno

## Límites

- Tamaño máximo de imagen: 10MB
- Formatos soportados: Todos los formatos de imagen comunes (JPG, PNG, GIF, WebP, etc.)

## Seguridad

- CORS habilitado para permitir requests desde cualquier origen
- Validación de tipo de archivo (solo imágenes)
- Límite de tamaño de archivo
- Variables de entorno para información sensible

## Desarrollo

El proyecto usa ES Modules (`type: "module"` en package.json), así que usa `import/export` en lugar de `require`.

Para desarrollo con hot reload:
```bash
npm run dev
```

## Troubleshooting

### Error: "API key de Gemini no configurada"
Verifica que el archivo `.env` existe y contiene `GEMINI_API_KEY=tu_key`

### Error: "Solo se permiten archivos de imagen"
Asegúrate de enviar un archivo con MIME type que comience con `image/`

### Error: "El archivo es demasiado grande"
Reduce el tamaño de la imagen a menos de 10MB

## Licencia

MIT
