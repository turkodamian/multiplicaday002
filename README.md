# 🎨 WebGalicia - Experiencia Interactiva de Generación de Imágenes

Una aplicación React interactiva para el evento Multiplica Day de Galicia que permite a los usuarios generar imágenes personalizadas basadas en prompts de mentoría, utilizando inteligencia artificial.

## 🌟 Características

- **Interfaz Intuitiva**: Experiencia guiada paso a paso
- **Generación de Imágenes IA**: Integración con ComfyUI para generación de imágenes
- **Selección de Avatares**: 5 perfiles diferentes para personalización
- **Teclado Virtual**: Interfaz táctil optimizada para kioscos
- **Guardado Automático**: Las imágenes se guardan automáticamente en `C:\Autoprinter`
- **Diseño Responsivo**: Funciona en desktop, tablet y móvil
- **Identidad de Marca**: Colores y elementos de Galicia

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS-in-JS
- **Backend**: Node.js + Express (servidor de guardado)
- **IA**: ComfyUI para generación de imágenes
- **Fonts**: Figtree, Inter, system fonts

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js (v18 o superior)
- ComfyUI ejecutándose en puerto 8188
- Windows (para guardado automático en C:\Autoprinter)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/webgalicia.git
   cd webgalicia
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar ComfyUI**
   - Asegúrate de que ComfyUI esté ejecutándose en `http://localhost:8188`
   - El workflow debe estar en `/MULTIPLICA-DAY-LLM-04_API.json`

4. **Crear carpeta de destino**
   ```bash
   mkdir C:\Autoprinter
   ```

### Ejecutar la aplicación

1. **Iniciar el servidor de guardado**
   ```bash
   node save-server.js
   ```

2. **Iniciar la aplicación frontend** (en otra terminal)
   ```bash
   npm run dev
   ```

3. **Acceder a la aplicación**
   - Frontend: `http://localhost:5173`
   - Servidor de guardado: `http://localhost:3002`
   - ComfyUI: `http://localhost:8188`

## 📱 Flujo de Usuario

### 1. Pantalla de Bienvenida
- Logo de Multiplica Day
- Mensaje de bienvenida
- Botón "Iniciar"

### 2. Pantalla de Input
- Instrucciones para el prompt de mentoría
- Campo de texto con teclado virtual
- Selección de 5 avatares diferentes
- Botón "Generar imagen"

### 3. Pantalla de Carga
- Indicador de progreso
- Mensaje "Generando imagen..."
- Integración con ComfyUI en tiempo real

### 4. Pantalla de Resultado
- Imagen generada
- Mensaje motivacional
- Botones: "Generar otra imagen" e "Imprimir postal"

### 5. Pantalla de Guardado
- Confirmación de guardado exitoso
- Mensaje de agradecimiento
- Reinicio automático después de 2 segundos

## ⚙️ Configuración

### Colores de Marca (Galicia)
```javascript
const GALICIA_COLORS = {
  primary: {
    orange: '#FA6400',
    white3: '#F7F2F0',
    rosa1: '#E89EB7',
    rosa2: '#FFB5CA',
    verde1: '#4CB4A7',
    verde2: '#84CEC3',
    azul1: '#3381ED',
    azul2: '#61A9FF',
    violeta1: '#594D8D',
    violeta2: '#958DC4'
  },
  neutral: {
    white1: '#F4DDCE',
    white2: '#F7E6DC',
    grisOscuro: '#2B2B2B',
    grisClaro: '#F4F4F4',
    blanco: '#FFFFFF',
    negro: '#000000'
  }
};
```

### ComfyUI Configuration
```javascript
const COMFY_CONFIG = {
  URL: '/comfy', // Proxy para desarrollo
  DIRECT_URL: 'http://localhost:8188',
  LLM_NODE_ID: '939',
  MODEL: 'Mistral-7B-Instruct-v0.3.Q4_K_M.gguf',
  MAX_TOKENS: 4100,
  TIMEOUT_ATTEMPTS: 60
};
```

## 🗂️ Estructura del Proyecto

```
webgalicia/
├── public/
│   ├── assets/
│   │   └── avatars/          # Imágenes de avatares
│   ├── logomultiplicaday.png # Logo principal
│   ├── AVATAR_GALICIA.png    # Logo de Galicia
│   └── MARCO_FINAL-13x18.png # Marco para imágenes
├── src/
│   ├── App.tsx               # Componente principal
│   ├── index.css             # Estilos globales
│   └── main.tsx              # Punto de entrada
├── save-server.js            # Servidor para guardado de imágenes
├── MULTIPLICA-DAY-LLM-04_API.json # Workflow de ComfyUI
├── vite.config.ts            # Configuración de Vite
└── package.json
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con HMR
- `npm run build` - Compilación para producción
- `npm run preview` - Vista previa de compilación de producción
- `npm run lint` - Ejecutar ESLint

## 🖼️ Assets Requeridos

### Avatares (en `/public/assets/avatars/`)
- `avatar1.png` - `avatar5.png`: Imágenes de perfiles (recomendado: 200x200px)

### Logos
- `logomultiplicaday.png`: Logo principal del evento
- `AVATAR_GALICIA.png`: Logo de Galicia
- `MARCO_FINAL-13x18.png`: Marco decorativo para imágenes

## 🔒 Características de Seguridad

- Validación de inputs del usuario
- Sanitización de prompts
- Manejo seguro de archivos
- Timeouts para prevenir colgues
- Manejo de errores robusto

## 🚨 Troubleshooting

### ComfyUI no conecta
```bash
# Verificar que ComfyUI esté ejecutándose
curl http://localhost:8188/queue

# Verificar el workflow
curl http://localhost:8188/api/prompt
```

### El servidor de guardado falla
```bash
# Verificar permisos de escritura
mkdir C:\Autoprinter
icacls C:\Autoprinter /grant Everyone:F
```

### Problemas de memoria
- Ajustar `MAX_TOKENS` en la configuración
- Reducir resolución de avatares
- Optimizar el workflow de ComfyUI

## 📋 TODO / Mejoras Futuras

- [ ] Añadir más opciones de personalización
- [ ] Implementar cola de impresión
- [ ] Añadir analytics de uso
- [ ] Optimizar para pantallas táctiles grandes
- [ ] Implementar modo offline con imágenes predefinidas
- [ ] Añadir soporte para múltiples idiomas

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo de Galicia

---

Desarrollado con ❤️ para Multiplica Day - Galicia