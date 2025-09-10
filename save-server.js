import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
const SAVE_PATH = 'C:\\Autoprinter';
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

// Función para imprimir imagen silenciosamente en Windows
async function printImageSilently(filepath) {
    console.log('🖨️ Iniciando impresión silenciosa de:', filepath);
    
    // Método 1: Usar PowerShell con Add-PrinterJob (más moderno)
    try {
        console.log('💻 Método 1: Intentando con PowerShell Add-Printer...');
        
        const psCommand1 = `powershell -Command "& {Add-Type -AssemblyName System.Drawing; Add-Type -AssemblyName System.Windows.Forms; $img = [System.Drawing.Image]::FromFile('${filepath}'); $pd = New-Object System.Drawing.Printing.PrintDocument; $pd.PrinterSettings.PrinterName = (Get-WmiObject -Class Win32_Printer | Where-Object {$_.Default -eq $true}).Name; $pd.DefaultPageSettings.PrinterSettings = $pd.PrinterSettings; $pd.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0,0,0,0); $pd.add_PrintPage({param($sender, $e) $bounds = New-Object System.Drawing.Rectangle(0, 0, $e.PageBounds.Width, $e.PageBounds.Height); $e.Graphics.DrawImage($img, $bounds)}); $pd.Print(); $img.Dispose()}"`;
        
        await execAsync(psCommand1);
        console.log('✅ Impresión exitosa con PowerShell método 1');
        return true;
        
    } catch (error1) {
        console.log('⚠️ Método 1 falló:', error1.message);
        
        // Método 2: Usar comando CMD con MSPAINT (alternativo)
        try {
            console.log('💻 Método 2: Intentando con Paint...');
            
            // Intentar con configuración sin bordes primero
            const paintCommand = `mspaint /pt "${filepath}"`;
            console.log('💻 Ejecutando comando Paint:', paintCommand);
            
            await execAsync(paintCommand);
            console.log('✅ Impresión iniciada con Paint');
            return true;
            
        } catch (error2) {
            console.log('⚠️ Método 2 falló:', error2.message);
            
            // Método 3: PowerShell simple con Start-Process
            try {
                console.log('💻 Método 3: PowerShell Start-Process...');
                
                const psCommand3 = `powershell -Command "Start-Process -FilePath '${filepath}' -Verb Print -WindowStyle Hidden -Wait"`;
                
                await execAsync(psCommand3, { timeout: 10000 });
                console.log('✅ Impresión iniciada con PowerShell método 3');
                return true;
                
            } catch (error3) {
                console.log('⚠️ Método 3 falló:', error3.message);
                
                // Método 4: PowerShell con configuración avanzada sin bordes
                try {
                    console.log('💻 Método 4: PowerShell configuración sin bordes...');
                    
                    const psCommand4 = `powershell -Command "& {Add-Type -AssemblyName System.Drawing; $img = [System.Drawing.Image]::FromFile('${filepath}'); $pd = New-Object System.Drawing.Printing.PrintDocument; $printers = Get-WmiObject -Class Win32_Printer | Where-Object {$_.Default -eq $true}; $pd.PrinterSettings.PrinterName = $printers.Name; $pd.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0,0,0,0); $pd.DefaultPageSettings.PrinterSettings.DefaultPageSettings.Landscape = $false; $pd.add_PrintPage({param($sender, $e) $pageWidth = $e.PageBounds.Width; $pageHeight = $e.PageBounds.Height; $imgWidth = $img.Width; $imgHeight = $img.Height; $scale = [Math]::Min($pageWidth / $imgWidth, $pageHeight / $imgHeight); $newWidth = $imgWidth * $scale; $newHeight = $imgHeight * $scale; $x = ($pageWidth - $newWidth) / 2; $y = ($pageHeight - $newHeight) / 2; $destRect = New-Object System.Drawing.Rectangle($x, $y, $newWidth, $newHeight); $e.Graphics.DrawImage($img, $destRect)}); $pd.Print(); $img.Dispose()}"`;
                    
                    await execAsync(psCommand4, { timeout: 15000 });
                    console.log('✅ Impresión exitosa con PowerShell método 4 (sin bordes)');
                    return true;
                    
                } catch (error4) {
                    console.error('❌ Todos los métodos de impresión fallaron');
                    console.error('Error método 1:', error1.message);
                    console.error('Error método 2:', error2.message);
                    console.error('Error método 3:', error3.message);
                    console.error('Error método 4:', error4.message);
                    return false;
                }
            }
        }
    }
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
            
        } else if (imageUrl.startsWith('/comfy/')) {
            // URL relativa de ComfyUI - convertir a URL completa y remover el proxy
            const urlWithoutProxy = imageUrl.replace('/comfy', '');
            const fullUrl = `http://localhost:8188${urlWithoutProxy}`;
            console.log('🔗 Convirtiendo URL relativa de ComfyUI:', imageUrl);
            console.log('🔗 URL final:', fullUrl);
            buffer = await downloadImage(fullUrl);
            console.log('✅ Imagen descargada desde ComfyUI, tamaño:', buffer.length, 'bytes');
            
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
            
            // Intentar imprimir la imagen silenciosamente
            console.log('🖨️ Iniciando proceso de impresión automática...');
            const printSuccess = await printImageSilently(filepath);
            
            const responseData = {
                success: true,
                message: 'Imagen guardada exitosamente',
                filename: filename,
                path: filepath,
                size: stats.size,
                timestamp: new Date().toISOString(),
                printed: printSuccess,
                printMessage: printSuccess ? 'Imagen enviada a impresora' : 'Error al imprimir - imagen guardada exitosamente'
            };
            
            if (printSuccess) {
                console.log('✅ IMAGEN GUARDADA Y ENVIADA A IMPRESORA');
            } else {
                console.log('⚠️ IMAGEN GUARDADA PERO ERROR AL IMPRIMIR');
            }
            
            res.json(responseData);
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