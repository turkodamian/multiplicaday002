# Configuración ComfyUI para Web App

## Problema CORS
ComfyUI por defecto no permite requests desde otros dominios/puertos.

## Solución 1: Iniciar ComfyUI con CORS habilitado

### Windows:
```bash
python main.py --enable-cors-header --listen 0.0.0.0
```

### Linux/Mac:
```bash
python3 main.py --enable-cors-header --listen 0.0.0.0
```

## Solución 2: Modificar ComfyUI manualmente

Si la opción `--enable-cors-header` no funciona, edita el archivo `server.py` en ComfyUI:

Busca la función que maneja las requests y agrega:

```python
# En server.py, buscar donde se configuran los headers
response.headers['Access-Control-Allow-Origin'] = '*'
response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
```

## Solución 3: Usar proxy en desarrollo

Ver vite.config.ts para configuración de proxy.

## IMPORTANTE: Manejo de Imágenes de Avatares

### ✅ NUEVA IMPLEMENTACIÓN: Subida Automática
La aplicación web ahora **sube automáticamente** las imágenes de avatares a ComfyUI via API.

**NO necesitas copiar manualmente** las imágenes a ComfyUI. El proceso es:
1. Usuario selecciona avatar en la web
2. App carga imagen desde `/assets/avatars/a1.png` (etc.)
3. App sube imagen a ComfyUI usando `/upload/image`
4. ComfyUI recibe imagen y la usa en el workflow

### Estructura esperada:
```
webgalicia/
├── public/
│   └── assets/
│       └── avatars/
│           ├── a1.png  # Avatar Emprendedor
│           ├── a2.png  # Avatar Técnico
│           └── a3.png  # Avatar Líder
└── ComfyUI/
    └── output/
        └── GGUF/   # Carpeta donde se guardarán las imágenes generadas
```

### ⚠️ MÉTODO ANTERIOR (Ya no necesario):
~~Copiar imágenes manualmente a `ComfyUI/input/`~~ - **OBSOLETO**

## Verificar que ComfyUI esté corriendo:
- URL: http://localhost:8188
- Debería mostrar la interfaz web de ComfyUI
- Probar en el navegador: http://localhost:8188/queue

## Workflow Utilizado: MULTIPLICA-DAY-LLM-02.json
- Nodo 939: LLM PROMPT GENERATOR (recibe el prompt del usuario)
- Nodo 866: LoadImage "REDUX STYLE TRANSFER" (recibe la imagen del avatar)
- Nodo 619: SaveImage (guarda la imagen final)
- Nodo 963: SaveImage alternativo (guarda imagen con marco)

## Estructura de salida:
Las imágenes se guardan en:
- `output/GGUF/0_XXXXX.png` (imagen principal)
- `output/GGUF/1_XXXXX.png` (imagen con marco)