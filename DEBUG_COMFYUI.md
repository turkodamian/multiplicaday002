# Guía de Debugging ComfyUI

## Paso 1: Verificar que ComfyUI esté funcionando

### 1.1 Verificar servidor ComfyUI
Abre en tu navegador: `http://localhost:8188`
- ✅ **Debería mostrar**: Interfaz web de ComfyUI
- ❌ **Si no funciona**: ComfyUI no está corriendo

### 1.2 Verificar API de ComfyUI
Abre en tu navegador: `http://localhost:8188/queue`
- ✅ **Debería mostrar**: JSON con queue info (puede estar vacío)
- ❌ **Si no funciona**: API no está disponible

## Paso 2: Verificar imágenes de avatares

### 2.1 Ubicación de imágenes
Las imágenes deben estar en la carpeta `input` de ComfyUI:
```
ComfyUI/input/
├── a1.png  # Avatar Emprendedor
├── a2.png  # Avatar Técnico
└── a3.png  # Avatar Líder
```

### 2.2 Verificar que se pueden cargar
Prueba cargar manualmente una imagen en ComfyUI:
1. Abrir ComfyUI web interface
2. Agregar un nodo "Load Image"
3. Ver si aparecen `a1.png`, `a2.png`, `a3.png` en la lista

## Paso 3: Verificar workflow

### 3.1 Probar workflow manualmente
1. Cargar `MULTIPLICA-DAY-LLM-02.json` en ComfyUI
2. Verificar que todos los nodos se cargan sin errores
3. Ejecutar workflow manualmente
4. Ver si genera imagen correctamente

### 3.2 Nodos críticos a verificar:
- **Nodo 939**: LLM PROMPT GENERATOR - debe tener el modelo `Mistral-7B-Instruct-v0.3.Q4_K_M.gguf`
- **Nodo 866**: LoadImage - debe poder cargar `a1.png`, `a2.png`, `a3.png`
- **Nodo 619**: SaveImage - debe guardar en carpeta `output/GGUF/`

## Paso 4: Revisar logs

### 4.1 Logs de la aplicación web
1. Abre Developer Tools (F12)
2. Ve a Console
3. Busca mensajes que empiecen con:
   - 🚀 (envío de workflow)
   - ✅ (éxito)
   - ❌ (errores)
   - 📊 (estado del workflow)

### 4.2 Logs de ComfyUI
Revisar la consola donde está corriendo ComfyUI para ver errores.

## Errores Comunes

### Error: "No se pudo obtener la imagen generada"
**Causas posibles:**
1. **Imágenes de avatar faltantes**: Copiar a `ComfyUI/input/`
2. **Modelo LLM faltante**: Descargar `Mistral-7B-Instruct-v0.3.Q4_K_M.gguf`
3. **Nodos faltantes**: Instalar extensiones necesarias en ComfyUI
4. **Workflow incompleto**: Verificar que todos los nodos estén conectados

### Error: "ComfyUI no responde"
**Soluciones:**
1. Iniciar ComfyUI con: `python main.py --enable-cors-header --listen 0.0.0.0`
2. Verificar que está en puerto 8188
3. Verificar firewall/antivirus

### Error: "Failed to fetch"
**Soluciones:**
1. Verificar proxy en `vite.config.ts`
2. Reiniciar servidor de desarrollo
3. Verificar CORS en ComfyUI

## Comandos útiles

### Copiar imágenes de avatar:
```bash
# Desde la carpeta del proyecto
cp src/assets/avatars/a1.png [RUTA_COMFYUI]/input/
cp src/assets/avatars/a2.png [RUTA_COMFYUI]/input/
cp src/assets/avatars/a3.png [RUTA_COMFYUI]/input/
```

### Verificar ComfyUI:
```bash
# Iniciar ComfyUI con CORS
cd [RUTA_COMFYUI]
python main.py --enable-cors-header --listen 0.0.0.0
```

### Verificar API manualmente:
```bash
# Probar endpoint de queue
curl http://localhost:8188/queue

# Probar endpoint de history
curl http://localhost:8188/history
```