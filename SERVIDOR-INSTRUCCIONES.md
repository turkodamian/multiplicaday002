# Servidor de Guardado Automático - ComfyUI Kiosk

## 🚀 Cómo usar el guardado automático

### Opción 1: Iniciar ambos servidores juntos (Recomendado)
```bash
npm run start
```

### Opción 2: Iniciar servidores por separado
```bash
# Terminal 1 - Aplicación React
npm run dev

# Terminal 2 - Servidor de guardado
npm run server
```

## 📁 Funcionamiento

1. **Carpeta de destino**: `D:\FotoEvento`
   - Se crea automáticamente si no existe
   - Las imágenes se guardan con nombre único: `imagen-generada-YYYY-MM-DDTHH-MM-SS.jpg`

2. **Botón "💾 Guardar para continuar"**:
   - Guarda la imagen automáticamente en `D:\FotoEvento`
   - **NO abre ninguna ventana de guardado**
   - Muestra mensajes progresivos: "Guardando" → "La foto está saliendo" → "Gracias por participar"
   - Regresa automáticamente al inicio

3. **Fallback automático**:
   - Si el servidor no está disponible, guarda en la carpeta de descargas del navegador
   - El usuario no nota la diferencia en la experiencia

## 🔧 Configuración técnica

- **Puerto del servidor**: 3001
- **Puerto de la app**: 5180 (o el puerto que asigne Vite)
- **API Endpoint**: `POST http://localhost:3001/api/save-image`

## ✅ Verificar funcionamiento

El servidor muestra estos mensajes al iniciarse:
```
🚀 Servidor de guardado corriendo en http://localhost:3001
📁 Las imágenes se guardarán en: D:\FotoEvento
```

Cuando se guarda una imagen:
```
✅ Imagen guardada en: D:\FotoEvento\imagen-generada-2023-12-15T10-30-45-123Z.jpg
```