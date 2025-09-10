import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

const app = express();
const PORT = 3002; // Cambiamos puerto para evitar conflictos

// Middleware más permisivo
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Crear carpeta de destino
const SAVE_PATH = 'D:\\FotoEvento';
console.log('📁 Verificando carpeta de destino:', SAVE_PATH);

if (!fs.existsSync(SAVE_PATH)) {
    try {
        fs.mkdirSync(SAVE_PATH, { recursive: true });
        console.log('✅ Carpeta creada:', SAVE_PATH);
    } catch (error) {
        console.error('❌ Error creando carpeta:', error);
    }
} else {
    console.log('✅ Carpeta ya existe:', SAVE_PATH);
}

// Función para descargar imagen desde URL
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
        }).on('error', reject);
    });
}

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        savePath: SAVE_PATH,
        canWrite: fs.existsSync(SAVE_PATH)
    });
});

// Endpoint principal para guardar imagen
app.post('/api/save-image', async (req, res) => {
    console.log('🔄 Recibida petición para guardar imagen');
    console.log('📋 Headers:', req.headers);
    console.log('💾 Body size:', JSON.stringify(req.body).length, 'caracteres');
    
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            throw new Error('No se proporcionó imageUrl');
        }
        
        console.log('🖼️ Procesando imagen desde:', imageUrl.substring(0, 100) + '...');
        
        let buffer;
        
        if (imageUrl.startsWith('http')) {
            // Descargar imagen desde URL
            console.log('🌐 Descargando imagen desde URL...');
            buffer = await downloadImage(imageUrl);
            console.log('✅ Imagen descargada, tamaño:', buffer.length, 'bytes');
            
        } else if (imageUrl.startsWith('data:image')) {
            // Convertir base64
            console.log('🔢 Convirtiendo imagen base64...');
            const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
            buffer = Buffer.from(base64Data, 'base64');
            console.log('✅ Imagen convertida, tamaño:', buffer.length, 'bytes');
            
        } else {
            throw new Error('Formato de imagen no soportado');
        }
        
        // Crear nombre único
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `imagen-generada-${timestamp}.jpg`;
        const filepath = path.join(SAVE_PATH, filename);
        
        // Guardar archivo
        console.log('💿 Guardando archivo en:', filepath);
        fs.writeFileSync(filepath, buffer);
        
        // Verificar que se guardó correctamente
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            console.log('✅ ARCHIVO GUARDADO EXITOSAMENTE');
            console.log('📊 Tamaño del archivo:', stats.size, 'bytes');
            console.log('📍 Ubicación completa:', filepath);
            
            res.json({
                success: true,
                message: 'Imagen guardada exitosamente',
                filename: filename,
                path: filepath,
                size: stats.size,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('El archivo no se pudo verificar después de guardarlo');
        }
        
    } catch (error) {
        console.error('❌ ERROR GUARDANDO IMAGEN:', error.message);
        console.error('📋 Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 SERVIDOR DE GUARDADO INICIADO');
    console.log('🌐 Local:    http://localhost:' + PORT);
    console.log('🌐 Red:      http://0.0.0.0:' + PORT);
    console.log('📁 Destino:  ' + SAVE_PATH);
    console.log('🔗 Salud:    http://localhost:' + PORT + '/health');
    console.log('💾 API:      http://localhost:' + PORT + '/api/save-image');
    console.log('');
});

// Mantener servidor activo
server.timeout = 0;
server.keepAliveTimeout = 0;
server.headersTimeout = 0;

// Manejo de cierre
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Mantener proceso activo
setInterval(() => {
    // Solo un pequeño log cada 10 minutos para confirmar que está vivo
    const now = new Date();
    if (now.getMinutes() % 10 === 0 && now.getSeconds() === 0) {
        console.log('💓 Servidor activo -', now.toLocaleTimeString());
    }
}, 1000);

console.log('👀 Esperando conexiones...');