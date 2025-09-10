import React, { useMemo, useState, useEffect } from "react";

type Step = "welcome" | "input" | "loading" | "result" | "printing";
type Avatar = { id: string; src: string; label: string };

// Paleta de colores oficial de Galicia
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

// Configuración de ComfyUI
const COMFY_CONFIG = {
  URL: '/comfy', // Usar proxy de Vite para evitar CORS
  DIRECT_URL: 'http://localhost:8188', // URL directa para cuando esté en producción
  LLM_NODE_ID: '939', // ID del nodo LLM PROMPT GENERATOR
  MODEL: 'Mistral-7B-Instruct-v0.3.Q4_K_M.gguf',
  MAX_TOKENS: 4100,
  INSTRUCTIONS: 'Generate image prompt with many details "{prompt} + {fullbody view, happy, front view, helping a kid person, street enviroment.}"',
  TIMEOUT_ATTEMPTS: 60 // 2 minutos aprox
};

// Virtual Keyboard Component
const VirtualKeyboard: React.FC<{
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onClose: () => void;
}> = ({ onKeyPress, onBackspace, onSpace }) => {
  const keys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['.', ',', '!', '?', '-', '_']
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '1rem',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
      border: '2px solid rgba(93, 74, 160, 0.15)',
      maxWidth: '600px',
      width: '100%',
      margin: '0 auto'
    }}>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem'
      }}>
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.25rem',
            flexWrap: 'wrap'
          }}>
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                style={{
                  minWidth: '42px',
                  height: '44px',
                  padding: '0.4rem 0.6rem',
                  background: 'white',
                  border: '1.5px solid rgba(93, 74, 160, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#333',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.background = 'rgba(93, 74, 160, 0.1)';
                  target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.background = 'white';
                  target.style.transform = 'translateY(0)';
                }}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.3rem',
          marginTop: '0.3rem'
        }}>
          <button
            onClick={onSpace}
            style={{
              flex: '1',
              height: '44px',
              padding: '0.3rem 1rem',
              background: 'white',
              border: '1.5px solid rgba(93, 74, 160, 0.2)',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#333',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'rgba(93, 74, 160, 0.1)';
              target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'white';
              target.style.transform = 'translateY(0)';
            }}
          >
            Espacio
          </button>
          
          <button
            onClick={onBackspace}
            style={{
              minWidth: '100px',
              height: '44px',
              padding: '0.3rem 0.6rem',
              background: 'rgba(239, 68, 68, 0.9)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'white',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'rgba(220, 38, 38, 0.9)';
              target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'rgba(239, 68, 68, 0.9)';
              target.style.transform = 'translateY(0)';
            }}
          >
            ⌫ Borrar
          </button>
        </div>
      </div>
    </div>
  );
};


/** Hook para manejo responsivo inteligente */
function useResponsiveLayout() {
  const [layout, setLayout] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
    scale: 1,
    orientation: 'portrait' as 'portrait' | 'landscape'
  });

  useEffect(() => {
    const calc = () => {
      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      
      const isMobile = vw < 768;
      const isTablet = vw >= 768 && vw < 1200;
      const isDesktop = vw >= 1200;
      const orientation = vw > vh ? 'landscape' : 'portrait';
      
      // Para mobile: usar todo el viewport
      // Para desktop: escalar el diseño fijo
      let scale = 1;
      if (isDesktop) {
        const baseW = 1080;
        const baseH = 1920;
        scale = Math.min(vw / baseW, vh / baseH);
      }
      
      setLayout({
        isMobile,
        isTablet,
        isDesktop,
        width: vw,
        height: vh,
        scale,
        orientation
      });
    };
    
    calc();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", calc);
    vv?.addEventListener("scroll", calc);
    window.addEventListener("resize", calc);
    screen.orientation?.addEventListener?.("change", calc);

    return () => {
      vv?.removeEventListener("resize", calc);
      vv?.removeEventListener("scroll", calc);
      window.removeEventListener("resize", calc);
      screen.orientation?.removeEventListener?.("change", calc);
    };
  }, []);

  return layout;
}

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [step, setStep] = useState<Step>("welcome");
  const [prompt, setPrompt] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Generando tu imagen inspiradora");

  // Simular carga inicial de la app
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500); // 2.5 segundos de loader inicial
    
    return () => clearTimeout(timer);
  }, []);

  const avatars: Avatar[] = useMemo(
    () => [
      { id: "avatar1", src: "/assets/avatars/avatar1.png", label: "Perfil 1" },
      { id: "avatar2", src: "/assets/avatars/avatar2.png", label: "Perfil 2" },
      { id: "avatar3", src: "/assets/avatars/avatar3.png", label: "Perfil 3" },
      { id: "avatar4", src: "/assets/avatars/avatar4.png", label: "Perfil 4" },
      { id: "avatar5", src: "/assets/avatars/avatar5.png", label: "Perfil 5" },
    ],
    []
  );

  // Removemos las imágenes de fondo por ahora

  async function sendToComfy(userPrompt: string, avatarId: string): Promise<string> {
    try {
      // setLoadingMessage("Preparando el workflow..."); // Silenciado
      setLoadingProgress(5);
      
      // Subir imagen del avatar a ComfyUI
      // setLoadingMessage("Subiendo imagen del avatar..."); // Silenciado
      const avatarImageMap = {
        "avatar1": "/assets/avatars/avatar1.png",
        "avatar2": "/assets/avatars/avatar2.png",
        "avatar3": "/assets/avatars/avatar3.png",
        "avatar4": "/assets/avatars/avatar4.png",
        "avatar5": "/assets/avatars/avatar5.png"
      };
      
      const avatarImagePath = avatarImageMap[avatarId as keyof typeof avatarImageMap];
      if (!avatarImagePath) {
        throw new Error(`Avatar no válido: ${avatarId}`);
      }
      
      // Cargar imagen desde la web app
      const imageResponse = await fetch(avatarImagePath);
      if (!imageResponse.ok) {
        throw new Error(`No se pudo cargar la imagen del avatar: ${avatarImagePath}`);
      }
      
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], `${avatarId}.png`, { type: 'image/png' });
      
      // Subir imagen a ComfyUI
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('subfolder', '');
      formData.append('type', 'input');
      
      const uploadResponse = await fetch(`${COMFY_CONFIG.URL}/upload/image`, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Error subiendo imagen: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      const uploadedFilename = uploadResult.name;
      console.log('✅ Imagen subida exitosamente:', uploadedFilename);
      
      // setLoadingMessage("Preparando el workflow..."); // Silenciado
      setLoadingProgress(10);
      
      // Cargar el workflow completo y modificar los inputs necesarios
      const workflowResponse = await fetch('/MULTIPLICA-DAY-LLM-04_API.json');
      const workflow = await workflowResponse.json();
      
      // Actualizar el prompt del usuario en el nodo LLM (939)
      if (workflow["939"]) {
        workflow["939"].inputs.text = userPrompt;
        workflow["939"].inputs.random_seed = Math.floor(Math.random() * 1000000);
      }
      
      // Usar la imagen subida en el nodo LoadImage (866)
      if (workflow["866"]) {
        workflow["866"].inputs.image = uploadedFilename;
        console.log('📸 Avatar configurado en nodo 866:', uploadedFilename);
      } else {
        console.warn('⚠️ No existe el nodo 866');
      }
      
      // Verificar que los nodos críticos estén presentes
      const criticalNodes = ["939", "866", "619"];
      const missingNodes = criticalNodes.filter(nodeId => !workflow[nodeId]);
      if (missingNodes.length > 0) {
        throw new Error(`Nodos críticos faltantes en el workflow: ${missingNodes.join(', ')}`);
      }

      console.log('🚀 Enviando workflow completo a ComfyUI:', {
        prompt: userPrompt,
        avatar: avatarId,
        uploadedFilename: uploadedFilename,
        url: COMFY_CONFIG.URL,
        workflowNodes: Object.keys(workflow).length
      });

      // setLoadingMessage("Verificando ComfyUI..."); // Silenciado
      setLoadingProgress(15);
      
      // Verificar que ComfyUI esté funcionando
      try {
        const healthCheck = await fetch(`${COMFY_CONFIG.URL}/queue`);
        if (!healthCheck.ok) {
          throw new Error(`ComfyUI no responde: ${healthCheck.status}`);
        }
        console.log('✅ ComfyUI está funcionando correctamente');
      } catch (error) {
        console.error('❌ ComfyUI no está disponible:', error);
        throw new Error('ComfyUI no está funcionando. Verificar que esté corriendo en localhost:8188');
      }

      // setLoadingMessage("Enviando workflow a ComfyUI..."); // Silenciado
      setLoadingProgress(20);

      // 1. Enviar el workflow a ComfyUI
      const queueResponse = await fetch(`${COMFY_CONFIG.URL}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: workflow,
          client_id: Math.random().toString(36).substring(7)
        })
      });

      if (!queueResponse.ok) {
        const errorText = await queueResponse.text();
        console.error('ComfyUI Queue Error:', errorText);
        throw new Error(`Error en queue: ${queueResponse.status} - ${errorText}`);
      }

      const queueResult = await queueResponse.json();
      const promptId = queueResult.prompt_id;
      
      console.log('✅ Prompt enviado, ID:', promptId);
      // setLoadingMessage("Generando imagen con IA..."); // Silenciado - ya se muestra "Generando imagen..."
      setLoadingProgress(30);

      // 2. Esperar a que se complete la generación
      let completed = false;
      let attempts = 0;

      while (!completed && attempts < COMFY_CONFIG.TIMEOUT_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
        attempts++;
        
        // Actualizar progreso basado en intentos
        const progressIncrement = Math.min(50, (attempts / COMFY_CONFIG.TIMEOUT_ATTEMPTS) * 50);
        setLoadingProgress(30 + progressIncrement);

        try {
          const historyResponse = await fetch(`${COMFY_CONFIG.URL}/history/${promptId}`);
          
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            
            if (historyData[promptId]) {
              const promptData = historyData[promptId];
              
              // Log completo del estado para debugging
              console.log('📊 Estado completo del prompt:', JSON.stringify(promptData, null, 2));
              
              if (promptData.status?.completed) {
                completed = true;
                // setLoadingMessage("Finalizando imagen..."); // Eliminado - va directo al resultado
                setLoadingProgress(90);
                
                // 3. Obtener la imagen generada
                const outputs = promptData.outputs;
                console.log('📄 Outputs recibidos:', Object.keys(outputs));
                console.log('📄 Outputs completos:', JSON.stringify(outputs, null, 2));
                
                // Buscar específicamente en el nodo SaveImage (619) que contiene la imagen final
                if (outputs["619"] && outputs["619"].images && outputs["619"].images.length > 0) {
                  const imageInfo = outputs["619"].images[0];
                  const imageUrl = `${COMFY_CONFIG.URL}/view?filename=${imageInfo.filename}&subfolder=${imageInfo.subfolder || ''}&type=${imageInfo.type || 'output'}`;
                  console.log('🖼️ Imagen final generada desde nodo 619:', imageUrl);
                  setLoadingProgress(100);
                  return imageUrl;
                }
                
                // Buscar en el nodo alternativo (963)
                if (outputs["963"] && outputs["963"].images && outputs["963"].images.length > 0) {
                  const imageInfo = outputs["963"].images[0];
                  const imageUrl = `${COMFY_CONFIG.URL}/view?filename=${imageInfo.filename}&subfolder=${imageInfo.subfolder || ''}&type=${imageInfo.type || 'output'}`;
                  console.log('🖼️ Imagen encontrada en nodo 963 (con marco):', imageUrl);
                  setLoadingProgress(100);
                  return imageUrl;
                }
                
                // Fallback: buscar en cualquier nodo con imágenes
                for (const nodeId in outputs) {
                  const output = outputs[nodeId];
                  console.log(`🔍 Revisando nodo ${nodeId}:`, output);
                  if (output.images && output.images.length > 0) {
                    const imageInfo = output.images[0];
                    const imageUrl = `${COMFY_CONFIG.URL}/view?filename=${imageInfo.filename}&subfolder=${imageInfo.subfolder || ''}&type=${imageInfo.type || 'output'}`;
                    console.log(`🖼️ Imagen encontrada en nodo ${nodeId}:`, imageUrl);
                    setLoadingProgress(100);
                    return imageUrl;
                  }
                }
                
                console.warn('⚠️ No se encontraron imágenes en ningún nodo de salida');
                console.warn('🔍 Nodos disponibles:', Object.keys(outputs));
                
              } else if (promptData.status?.status_str) {
                const statusMsg = promptData.status.status_str;
                setLoadingMessage(`Estado: ${statusMsg}`);
                console.log('📊 Estado del workflow:', statusMsg);
                
                // Si hay errores, mostrarlos
                if (promptData.status?.messages) {
                  console.error('❌ Mensajes de error:', promptData.status.messages);
                }
              }
            }
          }
        } catch {
          console.log(`⏳ Verificando estado... (${attempts}/${COMFY_CONFIG.TIMEOUT_ATTEMPTS})`);
          setLoadingMessage(`Procesando... (${attempts}/${COMFY_CONFIG.TIMEOUT_ATTEMPTS})`);
        }
      }

      if (!completed) {
        throw new Error('Timeout: La generación de imagen tardó demasiado');
      }

      throw new Error('No se pudo obtener la imagen generada del workflow');

    } catch (error) {
      console.error('❌ Error conectando con ComfyUI:', error);
      
      // Fallback para desarrollo - mostrar imagen de ejemplo
      console.log('🔄 Usando imagen de ejemplo para desarrollo...');
      setLoadingMessage("Usando imagen de ejemplo (ComfyUI no disponible)");
      setLoadingProgress(50);
      await new Promise((r) => setTimeout(r, 2500));
      setLoadingProgress(100);
      return "/assets/demo/final.jpg";
    }
  }

  async function handleGenerate() {
    if (!prompt.trim() || !selectedAvatar) return;
    
    // Reset loading state
    setLoadingProgress(0);
    setLoadingMessage("Generando imagen...");
    setStep("loading");
    
    try {
      const url = await sendToComfy(prompt.trim(), selectedAvatar);
      setFinalImageUrl(url);
      setStep("result");
    } catch (e) {
      console.error(e);
      setLoadingMessage("Error en la generación. Intentando de nuevo...");
      // Esperar un poco antes de volver al input
      setTimeout(() => {
        setStep("input");
      }, 2000);
    }
  }

  function printImage() {
    if (!finalImageUrl) return;
    setStep("printing");
    setIsPrinting(true);
    setPrintingProgress(0);
    
    // Simular proceso de impresión realista con progreso
    const printingSteps = [
      { message: "Preparando imagen para impresión...", duration: 800 },
      { message: "Enviando a impresora...", duration: 1200 },
      { message: "Imprimiendo tu postal...", duration: 2000 },
      { message: "Finalizando impresión...", duration: 600 },
      { message: "¡Impresión completada!", duration: 1000 }
    ];
    
    let currentStep = 0;
    let totalDuration = 0;
    const totalTime = printingSteps.reduce((sum, step) => sum + step.duration, 0);
    
    const updatePrintingStep = () => {
      if (currentStep < printingSteps.length) {
        const step = printingSteps[currentStep];
        setLoadingMessage(step.message);
        
        // Simular subida de imagen a carpeta de impresión
        if (currentStep === 1) {
          // Aquí se simula subir la imagen a la carpeta de impresión
          console.log('📤 Simulando subida de imagen a carpeta de impresión:', finalImageUrl);
        }
        
        setTimeout(() => {
          totalDuration += step.duration;
          setPrintingProgress(Math.round((totalDuration / totalTime) * 100));
          currentStep++;
          
          if (currentStep < printingSteps.length) {
            updatePrintingStep();
          } else {
            // Impresión completada, mostrar ventana de impresión
            setLoadingMessage("¡Postal lista! Abriendo ventana de impresión...");
            
            setTimeout(() => {
              // Simular envío a carpeta de impresión
              console.log('📁 Imagen guardada en carpeta de impresión exitosamente');
              console.log('🗺️ Ruta simulada: /print-queue/' + Date.now() + '.jpg');
              
              const w = window.open("", "_blank");
              if (w) {
                w.document.write(`
                  <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #5D4AA0; margin-bottom: 20px;">🎆 ¡Tu Postal Inspiradora!</h2>
                    <img src="${finalImageUrl}" 
                         style="max-width: 90%; max-height: 80vh; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);" 
                         onload="setTimeout(() => window.print(), 500);" />
                    <p style="margin-top: 20px; color: #666; font-style: italic;">
                      Una experiencia única del Programa de Becas Galicia
                    </p>
                  </div>
                `);
                w.document.close();
              }
              
              // Mostrar mensaje de finalización
              setLoadingMessage("¡Gracias por participar! 🙏");
              
              // Countdown para reiniciar
              let countdown = 5;
              const countdownInterval = setInterval(() => {
                countdown--;
                setLoadingMessage(`¡Gracias por participar! 🙏\nReiniciando en ${countdown} segundos...`);
                
                if (countdown <= 0) {
                  clearInterval(countdownInterval);
                  resetExperience();
                }
              }, 1000);
              
            }, 1000);
          }
        }, step.duration);
      }
    };
    
    updatePrintingStep();
  }
  
  function resetExperience() {
    // Transición suave al reiniciar
    setLoadingMessage("🎆 ¡Preparando nueva experiencia!");
    
    setTimeout(() => {
      setStep("welcome");
      setPrompt("");
      setSelectedAvatar(null);
      setFinalImageUrl(null);
      setLoadingProgress(0);
      setLoadingMessage("Generando tu imagen inspiradora");
      setIsPrinting(false);
      setPrintingProgress(0);
      
      console.log('🎉 ¡Experiencia reiniciada exitosamente!');
      console.log('👋 Lista para recibir al próximo usuario');
    }, 800);
  }

  // Funciones del teclado virtual
  const handleKeyPress = (key: string) => {
    const newPrompt = prompt.slice(0, cursorPosition) + key + prompt.slice(cursorPosition);
    setPrompt(newPrompt);
    setCursorPosition(cursorPosition + 1);
  };

  const handleBackspace = () => {
    if (cursorPosition > 0) {
      const newPrompt = prompt.slice(0, cursorPosition - 1) + prompt.slice(cursorPosition);
      setPrompt(newPrompt);
      setCursorPosition(cursorPosition - 1);
    }
  };

  const handleSpace = () => {
    handleKeyPress(' ');
  };

  const handleTextareaClick = () => {
    // Ya no necesario - el teclado está siempre visible
  };

  const handleKeyboardClose = () => {
    setShowKeyboard(false);
  };

  const layout = useResponsiveLayout();
  
  // Detectar pantallas muy pequeñas (menos de 640px de alto)
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const screenHeight = window.visualViewport?.height ?? window.innerHeight;
      setIsSmallScreen(screenHeight < 640);
    };
    
    checkScreenSize();
    
    const vv = window.visualViewport;
    vv?.addEventListener("resize", checkScreenSize);
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      vv?.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Mostrar loader inicial
  if (isAppLoading) {
    return (
      <div
        style={{
          width: "100dvw",
          height: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${GALICIA_COLORS.primary.violeta1}`,
          position: "fixed",
          top: 0,
          left: 0,
          boxSizing: "border-box",
          zIndex: 9999
        }}
      >
        <div style={{
          textAlign: 'center',
          animation: 'fadeInUp 1s ease-out',
          padding: window.innerWidth < 768 ? '2rem 1rem' : '0'
        }}>
          {/* Logo con animación de pulso */}
          <div style={{
            marginBottom: window.innerWidth < 768 ? '2rem' : '3rem',
            position: 'relative'
          }}>
            <img 
              src="/logomultiplicaday.png" 
              alt="Multiplica Day"
              style={{
                height: window.innerWidth < 768 ? '140px' : '240px',
                width: 'auto',
                filter: 'brightness(0) invert(1) drop-shadow(0 8px 40px rgba(255, 255, 255, 0.3))',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          </div>
          
          {/* Spinner animado */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: window.innerWidth < 768 ? '0.4rem' : '0.5rem'
          }}>
            <div style={{
              width: window.innerWidth < 768 ? '10px' : '12px',
              height: window.innerWidth < 768 ? '10px' : '12px',
              backgroundColor: 'white',
              borderRadius: '50%',
              animation: 'bounce 1.4s ease-in-out infinite',
              animationDelay: '0s'
            }}></div>
            <div style={{
              width: window.innerWidth < 768 ? '10px' : '12px',
              height: window.innerWidth < 768 ? '10px' : '12px',
              backgroundColor: 'white',
              borderRadius: '50%',
              animation: 'bounce 1.4s ease-in-out infinite',
              animationDelay: '0.2s'
            }}></div>
            <div style={{
              width: window.innerWidth < 768 ? '10px' : '12px',
              height: window.innerWidth < 768 ? '10px' : '12px',
              backgroundColor: 'white',
              borderRadius: '50%',
              animation: 'bounce 1.4s ease-in-out infinite',
              animationDelay: '0.4s'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100dvw",
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `${GALICIA_COLORS.primary.violeta1}`,
        overflow: "hidden",
        margin: 0,
        padding: 0,
        position: "fixed",
        top: 0,
        left: 0,
        boxSizing: "border-box"
      }}
    >
      {layout.isDesktop ? (
        // Desktop: Escenario fijo escalado
        <div
          style={{
            width: 1080,
            height: 1920,
            transform: `scale(${layout.scale})`,
            transformOrigin: "center center",
            willChange: "transform",
            maxWidth: '100vw',
            maxHeight: '100vh',
            overflow: 'hidden'
          }}
        >
          <div className="screen" style={{ background: `${GALICIA_COLORS.primary.violeta1}` }}>
            {renderScreenContent(layout)}
          </div>
        </div>
      ) : (
        // Mobile/Tablet: Layout responsivo 
        <div style={{
          width: '100%',
          height: '100vh',
          maxWidth: '100vw',
          position: 'relative',
          background: `${GALICIA_COLORS.primary.violeta1}`,
          display: 'flex',
          flexDirection: 'column',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box'
        }}>
          {renderScreenContent(layout)}
        </div>
      )}
    </div>
  );

  function renderScreenContent() {
    return (
      <>
        {step === "welcome" && (
          <section style={{
            width: '100%',
            minHeight: '100vh',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${GALICIA_COLORS.primary.violeta1}`,
            padding: '2rem',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Elementos decorativos de fondo */}
            <div style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(93, 74, 160, 0.08) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '15%',
              left: '8%',
              width: '80px',
              height: '80px',
              background: 'radial-gradient(circle, rgba(93, 74, 160, 0.06) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite 2s'
            }}></div>
            <div style={{ 
              textAlign: 'center', 
              maxWidth: '900px', 
              width: '100%',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ 
                marginBottom: '2rem',
                animation: 'fadeInUp 1s ease-out'
              }}>
                
                {/* Logo Multiplica Day arriba del todo y más grande */}
                <div style={{
                  marginBottom: '5rem',
                  textAlign: 'center',
                  marginTop: '-2rem'
                }}>
                  <img 
                    src="/logomultiplicaday.png" 
                    alt="Multiplica Day"
                    style={{
                      height: '240px',
                      width: 'auto',
                      filter: 'brightness(0) invert(1) drop-shadow(0 6px 30px rgba(0, 0, 0, 0.4))'
                    }}
                  />
                </div>
                
                {/* Título "Te damos la bienvenida" en el centro */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '2rem',
                  width: '100%'
                }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    <h1 style={{
                      fontSize: '3.5rem',
                      fontWeight: '900',
                      color: 'white',
                      margin: '0',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      letterSpacing: '-0.03em',
                      lineHeight: '1.1',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      Te damos la bienvenida
                    </h1>
                  </div>
                </div>
                
              </div>

              <div style={{
                animation: 'fadeInUp 1s ease-out 0.6s both',
                marginTop: '4rem'
              }}>
                <button
                  onClick={() => setStep("input")}
                  style={{
                    padding: '22px 50px',
                    borderRadius: '50px',
                    background: `${GALICIA_COLORS.primary.violeta1}`,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `
                      0 8px 25px rgba(89, 77, 141, 0.3),
                      0 4px 12px rgba(89, 77, 141, 0.1)
                    `,
                    transform: 'translateY(0)',
                    letterSpacing: '0.02em',
                    position: 'relative',
                    overflow: 'hidden',
                    width: window.innerWidth < 768 ? '100%' : 'auto',
                    maxWidth: window.innerWidth < 768 ? '320px' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(-4px) scale(1.02)';
                    target.style.boxShadow = `
                      0 20px 50px rgba(93, 74, 160, 0.5),
                      0 12px 25px rgba(93, 74, 160, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `;
                    target.style.background = `${GALICIA_COLORS.primary.violeta2}`;
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(0) scale(1)';
                    target.style.boxShadow = `
                      0 15px 40px rgba(93, 74, 160, 0.4),
                      0 8px 20px rgba(93, 74, 160, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.3)
                    `;
                    target.style.background = `${GALICIA_COLORS.primary.violeta1}`;
                  }}
                >
                  {/* Brillo interno */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 3s infinite',
                    zIndex: 0
                  }}></div>
                  
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    🚀 Iniciar
                  </span>
                </button>
                
                {/* "Desarrollar Talento" con subrayado violeta */}
                <div style={{
                  marginTop: window.innerWidth < 768 ? '4rem' : '5rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    <span style={{
                      fontSize: window.innerWidth < 768 ? '1.4rem' : '1.8rem',
                      fontWeight: '800',
                      color: 'white',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      letterSpacing: '0.02em',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}>
                      Desarrollar Talento
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Logo Galicia al final - positioned absolute */}
              <div style={{
                position: 'absolute',
                bottom: 'calc(1rem - 440px)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1
              }}>
                <img 
                  src="/AVATAR_GALICIA.png" 
                  alt="Galicia"
                  style={{
                    height: '120px',
                    width: 'auto',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.9
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {step === "input" && (
          <section style={{
            width: '100%',
            minHeight: '100vh',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#594D8D',
            padding: '1rem',
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Contenido principal distribuido uniformemente */}
            <div style={{ 
              maxWidth: '1080px', 
              width: '100%',
              flex: '1',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              position: 'relative',
              zIndex: 1,
              padding: '1rem 0',
              minHeight: 0
            }}>
              {/* Logo Multiplica Day */}
              <div style={{ flex: 'none', textAlign: 'center' }}>
                <img 
                  src="/logomultiplicaday.png" 
                  alt="Multiplica Day"
                  style={{
                    height: '80px',
                    width: 'auto',
                    filter: 'brightness(0) invert(1) drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))'
                  }}
                />
              </div>

              {/* Cuadro de instrucciones */}
              <div style={{ flex: 'none', textAlign: 'center', padding: '0 1rem' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: `1px solid ${GALICIA_COLORS.primary.violeta2}`,
                  boxShadow: '0 8px 30px rgba(149, 141, 196, 0.15)'
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    color: `${GALICIA_COLORS.primary.violeta1}`,
                    margin: '0 0 0.5rem 0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    lineHeight: '1.3'
                  }}>
                    Imaginate acompañando a un joven de <em>Potenciamos Tu Talento</em> en su camino de crecimiento.
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: '400',
                    color: `${GALICIA_COLORS.primary.violeta1}`,
                    margin: '0.25rem 0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    lineHeight: '1.5'
                  }}>
                    Escribí una frase breve que capture un momento especial de esa experiencia de mentoría.
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    fontWeight: '400',
                    color: `${GALICIA_COLORS.primary.violeta2}`,
                    margin: '0.25rem 0 0 0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    fontStyle: 'italic',
                    lineHeight: '1.4'
                  }}>
                    Esa frase se transformará en una imagen única
                  </p>
                </div>
              </div>

              {/* Campo de texto */}
              <div style={{ flex: 'none', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '16px',
                  padding: '1rem',
                  boxShadow: '0 8px 25px rgba(93, 74, 160, 0.12)',
                  border: '2px solid rgba(93, 74, 160, 0.15)',
                  width: '100%',
                  maxWidth: '600px',
                  transition: 'all 0.3s ease'
                }}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Tu frase inspiradora sobre mentoría..."
                    rows={3}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '1rem',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      lineHeight: '1.4',
                      resize: 'none',
                      caretColor: '#5D4AA0',
                      color: '#1E1E1E',
                      fontWeight: '400'
                    }}
                    onClick={handleTextareaClick}
                  />
                </div>
              </div>

              {/* Teclado virtual */}
              <div style={{ 
                flex: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}>
                <VirtualKeyboard
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onSpace={handleSpace}
                  onClose={handleKeyboardClose}
                />
              </div>

              {/* Selección de avatares */}
              <div style={{ flex: 'none', textAlign: 'center' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.95)',
                    margin: '0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    Seleccioná tu perfil
                  </h3>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '16px', 
                  width: '100%', 
                  maxWidth: '900px',
                  margin: '0 auto',
                  flexWrap: 'nowrap',
                  padding: '0 1rem',
                  boxSizing: 'border-box',
                  overflowX: 'visible'
                }}>
                  {avatars.map((a, index) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAvatar(a.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: selectedAvatar === a.id 
                          ? `3px solid ${GALICIA_COLORS.primary.violeta1}` 
                          : '2px solid rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        flex: '0 0 auto',
                        width: '130px',
                        height: '130px',
                        boxShadow: selectedAvatar === a.id 
                          ? `
                            0 15px 40px rgba(93, 74, 160, 0.3),
                            0 8px 25px rgba(93, 74, 160, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.9)
                          ` 
                          : '0 6px 20px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.06)',
                        transform: selectedAvatar === a.id 
                          ? 'translateY(-4px) scale(1.05)' 
                          : 'translateY(0) scale(1)',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `fadeInUp 0.6s ease-out ${0.6 + index * 0.1}s both`
                      }}
                      onMouseEnter={(e) => {
                        if (selectedAvatar !== a.id) {
                          const target = e.target as HTMLButtonElement;
                          target.style.transform = 'translateY(-1px) scale(1.01)';
                          target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedAvatar !== a.id) {
                          const target = e.target as HTMLButtonElement;
                          target.style.transform = 'translateY(0) scale(1)';
                          target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        }
                      }}
                    >
                      {/* Brillo de selección */}
                      {selectedAvatar === a.id && (
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                          animation: 'shimmer 2s infinite',
                          zIndex: 0
                        }}></div>
                      )}
                      
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          margin: '0 auto',
                          boxShadow: selectedAvatar === a.id 
                            ? '0 10px 30px rgba(93, 74, 160, 0.5), 0 5px 15px rgba(93, 74, 160, 0.3)'
                            : '0 8px 20px rgba(0, 0, 0, 0.2)',
                          border: 'none'
                        }}>
                          <img 
                            src={a.src} 
                            alt={a.label} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        </div>
                        
                        
                        {selectedAvatar === a.id && (
                          <div style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '20px',
                            height: '20px',
                            background: `${GALICIA_COLORS.primary.violeta1}`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            color: 'white',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(93, 74, 160, 0.4)'
                          }}>
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón generar */}
              <div style={{ 
                flex: 'none',
                textAlign: 'center',
                animation: 'fadeInUp 0.8s ease-out 0.8s both'
              }}>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || !selectedAvatar}
                  style={{
                    padding: '20px 40px',
                    borderRadius: '50px',
                    background: (!prompt.trim() || !selectedAvatar) 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : `${GALICIA_COLORS.primary.violeta1}`,
                    border: (!prompt.trim() || !selectedAvatar)
                      ? '2px solid rgba(255, 255, 255, 0.4)'
                      : '2px solid rgba(255, 255, 255, 0.2)',
                    color: (!prompt.trim() || !selectedAvatar) ? 'rgba(255, 255, 255, 0.6)' : 'white',
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    cursor: (!prompt.trim() || !selectedAvatar) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: (!prompt.trim() || !selectedAvatar) 
                      ? 'none' 
                      : `
                        0 8px 25px rgba(89, 77, 141, 0.3),
                        0 4px 12px rgba(89, 77, 141, 0.1)
                      `,
                    transform: (!prompt.trim() || !selectedAvatar) ? 'none' : 'translateY(0)',
                    opacity: (!prompt.trim() || !selectedAvatar) ? 0.7 : 1,
                    width: 'auto',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '0.02em'
                  }}
                  onMouseEnter={(e) => {
                    if (prompt.trim() && selectedAvatar) {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(-3px) scale(1.02)';
                      target.style.boxShadow = `
                        0 20px 50px rgba(0, 0, 0, 0.5),
                        0 10px 30px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3)
                      `;
                      target.style.background = 'linear-gradient(135deg, #000000 0%, #1E1E1E 50%, #2D2D2D 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (prompt.trim() && selectedAvatar) {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(0) scale(1)';
                      target.style.boxShadow = `
                        0 15px 40px rgba(0, 0, 0, 0.4),
                        0 8px 25px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `;
                      target.style.background = `${GALICIA_COLORS.primary.violeta2}`;
                    }
                  }}
                >
                  {/* Brillo interno */}
                  {prompt.trim() && selectedAvatar && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 3s infinite',
                      zIndex: 0
                    }}></div>
                  )}
                  
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    ✨ Generar imagen
                  </span>
                </button>
              </div>
            </div>

            {/* Logo Galicia al final - ahora como parte normal del layout */}
            <div style={{
              padding: '1rem 0 0 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/AVATAR_GALICIA.png" 
                alt="Galicia"
                style={{
                  height: '100px',
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                  opacity: 0.9
                }}
              />
            </div>
          </section>
        )}

        {step === "loading" && (
          <section style={{
            width: '100%',
            minHeight: '100vh',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${GALICIA_COLORS.primary.violeta1}`,
            position: 'relative',
            overflow: 'hidden',
            padding: '2rem',
            boxSizing: 'border-box'
          }}>
            {/* Botón "Generando imagen..." más arriba */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}>
              <button
                style={{
                  padding: '20px 40px',
                  borderRadius: '50px',
                  background: `${GALICIA_COLORS.primary.violeta1}`,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  cursor: 'default',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                  animation: 'pulse 2s ease-in-out infinite',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {loadingMessage}
              </button>
              
              {/* Barra de progreso */}
              <div style={{
                width: '200px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
                marginTop: '1rem',
                overflow: 'hidden',
                margin: '1rem auto 0 auto'
              }}>
                <div style={{
                  width: `${loadingProgress}%`,
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              
              {/* Logo Galicia al final - positioned absolute */}
              <div style={{
                position: 'absolute',
                bottom: 'calc(1rem - 640px)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1
              }}>
                <img 
                  src="/AVATAR_GALICIA.png" 
                  alt="Galicia"
                  style={{
                    height: '120px',
                    width: 'auto',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.9
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {step === "result" && (
          <section style={{
            width: '100%',
            minHeight: '100vh',
            height: window.innerWidth < 768 ? 'auto' : '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${GALICIA_COLORS.neutral.white1}`,
            padding: window.innerWidth < 768 ? '1rem 1rem 2rem 1rem' : '1rem 2rem',
            boxSizing: 'border-box',
            overflow: window.innerWidth < 768 ? 'visible' : 'hidden'
          }}>
            <div style={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
              maxWidth: window.innerWidth < 768 ? '100%' : '900px',
              width: '100%',
              minHeight: window.innerWidth < 768 ? 'auto' : '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: window.innerWidth < 768 ? 'flex-start' : 'space-evenly',
              gap: window.innerWidth < 768 ? '1rem' : '0'
            }}>
              
              {/* Sección superior: Logo y mensaje */}
              <div style={{ flex: 'none' }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: window.innerWidth < 768 ? '0.25rem' : '0.75rem'
                }}>
                  <img 
                    src="/logomultiplicaday.png" 
                    alt="Multiplica Day"
                    style={{
                      maxWidth: isSmallScreen ? '60px' : (window.innerWidth < 768 ? '80px' : '140px'),
                      height: 'auto'
                    }}
                  />
                </div>

                <div style={{
                  marginBottom: window.innerWidth < 768 ? '0.5rem' : '1rem'
                }}>
                  <p style={{
                    fontSize: window.innerWidth < 768 ? '0.75rem' : '1rem',
                    color: 'white',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    fontWeight: '600',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    background: `${GALICIA_COLORS.primary.violeta1}`,
                    padding: window.innerWidth < 768 ? '0.3rem 0.6rem' : '0.4rem 0.8rem',
                    borderRadius: window.innerWidth < 768 ? '12px' : '16px',
                    margin: '0 auto',
                    display: 'inline-block',
                    backdropFilter: 'blur(3px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    Este momento se puede volver realidad
                  </p>
                </div>
              </div>

              {/* Sección central: Imagen */}
              <div style={{ 
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
                maxHeight: window.innerWidth < 768 ? '400px' : '65%'
              }}>
                {finalImageUrl ? (
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: window.innerWidth < 768 ? 'auto' : '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={finalImageUrl} 
                      alt="Imagen generada"
                      style={{
                        maxWidth: '100%',
                        maxHeight: window.innerWidth < 768 ? '400px' : '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: window.innerWidth < 768 ? '280px' : '400px',
                    height: window.innerWidth < 768 ? '350px' : '480px',
                    background: `${GALICIA_COLORS.primary.violeta1}`,
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: 'white',
                    textAlign: 'center',
                    padding: '2rem',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                  }}>
                    ✨ Generando tu imagen personalizada...
                  </div>
                )}
              </div>

              {/* Sección inferior: Mensaje final y botones */}
              <div style={{ flex: 'none' }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: window.innerWidth < 768 ? '0.5rem' : '1.25rem',
                  maxWidth: window.innerWidth < 768 ? '95%' : '500px',
                  margin: window.innerWidth < 768 ? '0 auto 0.5rem auto' : '0 auto 1rem auto'
                }}>
                  <div style={{
                    background: `${GALICIA_COLORS.primary.violeta1}`,
                    borderRadius: window.innerWidth < 768 ? '8px' : '10px',
                    padding: window.innerWidth < 768 ? '0.5rem' : '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 6px 15px rgba(93, 74, 160, 0.3)'
                  }}>
                    <h2 style={{
                      fontSize: window.innerWidth < 768 ? '0.8rem' : '1.1rem',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 0.1rem 0',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      lineHeight: '1.2'
                    }}>
                      Este momento se puede volver realidad
                    </h2>
                    <span style={{
                      fontSize: window.innerWidth < 768 ? '0.7rem' : '0.9rem',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                    }}>
                      Sumate a Desarrollar Talento
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                {finalImageUrl && (
                  <div style={{ 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                    gap: window.innerWidth < 768 ? '0.75rem' : '1.5rem',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  {/* Botón de volver a generar */}
                  <button
                    onClick={() => setStep("input")}
                    style={{
                      padding: window.innerWidth < 768 ? '12px 24px' : '18px 36px',
                      borderRadius: '50px',
                      background: 'transparent',
                      border: `2px solid ${GALICIA_COLORS.primary.violeta1}`,
                      color: `${GALICIA_COLORS.primary.violeta1}`,
                      fontSize: window.innerWidth < 768 ? '0.9rem' : '1.2rem',
                      fontWeight: '600',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(93, 74, 160, 0.2)',
                      transition: 'all 0.3s ease',
                      width: window.innerWidth < 768 ? '100%' : 'auto',
                      maxWidth: window.innerWidth < 768 ? '200px' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = `${GALICIA_COLORS.primary.violeta1}`;
                      target.style.color = 'white';
                      target.style.transform = 'translateY(-2px)';
                      target.style.boxShadow = '0 8px 25px rgba(93, 74, 160, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = 'transparent';
                      target.style.color = `${GALICIA_COLORS.primary.violeta1}`;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = '0 4px 15px rgba(93, 74, 160, 0.2)';
                    }}
                  >
                    🔄 Generar otra imagen
                  </button>

                  {/* Botón de impresión */}
                  <button
                    onClick={printImage}
                    style={{
                      padding: window.innerWidth < 768 ? '14px 28px' : '20px 40px',
                      borderRadius: '50px',
                      background: `${GALICIA_COLORS.primary.violeta1}`,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontSize: window.innerWidth < 768 ? '1rem' : '1.3rem',
                      fontWeight: '700',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      cursor: 'pointer',
                      boxShadow: '0 8px 25px rgba(93, 74, 160, 0.4)',
                      transition: 'all 0.3s ease',
                      width: window.innerWidth < 768 ? '100%' : 'auto',
                      maxWidth: window.innerWidth < 768 ? '200px' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(-2px) scale(1.02)';
                      target.style.boxShadow = '0 12px 35px rgba(93, 74, 160, 0.6)';
                      target.style.background = `${GALICIA_COLORS.primary.violeta2}`;
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(0) scale(1)';
                      target.style.boxShadow = '0 8px 25px rgba(93, 74, 160, 0.4)';
                      target.style.background = `${GALICIA_COLORS.primary.violeta1}`;
                    }}
                  >
                    🖨️ Imprimir postal
                  </button>
                </div>
                )}
              </div>
            </div>
          </section>
        )}

        {step === "printing" && (
          <section style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Partículas de fondo */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 10% 90%, rgba(255,255,255,0.1) 1px, transparent 1px),
                radial-gradient(circle at 90% 10%, rgba(255,255,255,0.08) 1px, transparent 1px),
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06) 1px, transparent 1px)
              `,
              animation: 'float 15s ease-in-out infinite'
            }}></div>

            <div style={{
              textAlign: 'center',
              color: 'white',
              maxWidth: window.innerWidth < 768 ? '90vw' : '500px',
              position: 'relative'
            }}>
              
              {/* Icono de impresión animado */}
              <div style={{
                marginBottom: window.innerWidth < 768 ? '2rem' : '3rem',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  width: window.innerWidth < 768 ? '100px' : '120px',
                  height: window.innerWidth < 768 ? '100px' : '120px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  animation: 'pulse 2s ease-in-out infinite',
                  backdropFilter: 'blur(3px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <span style={{
                    fontSize: window.innerWidth < 768 ? '3rem' : '4rem',
                    zIndex: 2
                  }}>🖨️</span>
                  
                  {/* Ondas de impresión */}
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={i}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100%',
                        height: '100%',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        animation: `wave 2s ease-out infinite ${i * 0.7}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <h2 style={{
                fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem',
                marginBottom: '1rem',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                fontWeight: '700'
              }}>
                Imprimiendo tu postal personalizada
              </h2>
              
              <p style={{
                fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem',
                marginBottom: '2rem',
                opacity: 0.9,
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                padding: window.innerWidth < 768 ? '1rem 1.5rem' : '1.5rem 2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}>
                Tu postal personalizada se está imprimiendo...
              </p>

              {/* Indicador de progreso de impresión */}
              <div style={{
                marginTop: '2rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '10px',
                      height: '10px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '50%',
                      animation: `pulse 1.5s ease-in-out infinite ${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </>
    );
  }
};

export default App;