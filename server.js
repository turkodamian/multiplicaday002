import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Manejo de errores para ver qué pasa
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada en:', promise, 'razón:', reason);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Asegurarse de que la carpeta existe
const SAVE_PATH = 'D:\\FotoEvento';
if (!fs.existsSync(SAVE_PATH)) {
  fs.mkdirSync(SAVE_PATH, { recursive: true });
}

// Endpoint para guardar imagen
app.post('/api/save-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    // Si es una URL, descargar la imagen
    if (imageUrl.startsWith('http')) {
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();
      
      // Crear nombre único
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `imagen-generada-${timestamp}.jpg`;
      const filepath = path.join(SAVE_PATH, filename);
      
      // Guardar archivo
      fs.writeFileSync(filepath, buffer);
      
      console.log(`✅ Imagen guardada en: ${filepath}`);
      res.json({ success: true, filename, path: filepath });
    } 
    // Si es base64
    else if (imageUrl.startsWith('data:image')) {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Crear nombre único
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `imagen-generada-${timestamp}.jpg`;
      const filepath = path.join(SAVE_PATH, filename);
      
      // Guardar archivo
      fs.writeFileSync(filepath, buffer);
      
      console.log(`✅ Imagen guardada en: ${filepath}`);
      res.json({ success: true, filename, path: filepath });
    } else {
      throw new Error('Formato de imagen no válido');
    }
  } catch (error) {
    console.error('❌ Error guardando imagen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de guardado corriendo en:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Red:   http://190.111.255.235:${PORT}`);
  console.log(`📁 Las imágenes se guardarán en: ${SAVE_PATH}`);
});

// Mantener el servidor activo
server.keepAliveTimeout = 0;
server.timeout = 0;

// Log adicional para debug
console.log('👀 Servidor configurado, esperando conexiones...');

// Mantener el proceso activo con un intervalo
setInterval(() => {
  // Solo un log cada 5 minutos para no spam
  // console.log('🔄 Servidor activo...');
}, 300000);

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor de guardado...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor de guardado...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});