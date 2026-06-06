import React, { useEffect, useState } from 'react'
import { Button } from 'src/components/ui/button'
import Swal from 'sweetalert2';
import IconUploader from './IconUploader'
import GenericModal from '../ui/GenericModal'
import ChatbotScreen from 'src/components/ui/chatbot/ChatbotScreen'
import ColorPickerField from '../popups/components/ColorPickerField'
import GradientPickerField from './gradientPickerField';
import apiClient from 'src/services/apiClient';
import { config } from 'config';
const defaultColor="#2A938B";

const ChatbotTable = () => {
  const [iconModalVisible, setIconModalVisible] = useState(false)
  const [colorPickerVisible, setColorPickerVisible]= useState(false)
  const [headerColor, setHeaderColor] = useState(defaultColor)
  const [salute, setSalute] = useState<string>("");
  const [loadingSaludo, setLoadingSaludo] = useState<boolean>(true);
  const [isSavingSaludo, setIsSavingSaludo] = useState<boolean>(false);
  // --- 🔥 NUEVO ESTADO PARA LA POSICIÓN ---
  const [isLeft, setIsLeft] = useState<boolean>(false);
  const [isSavingPosicion, setIsSavingPosicion] = useState<boolean>(false);

  // --- 🔥 EFECTO INICIAL (CARGA SALUDO Y POSICIÓN) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSaludo(true);
        
        // 1. Cargar saludo
        const resSaludo = await apiClient.get(config.endpoints.chatbot.getSalute);
        if (resSaludo.data && resSaludo.data.success) {
          setSalute(resSaludo.data.salute ?? "");
        }

        // 2. Cargar posición
        const resPosicion = await apiClient.get(config.endpoints.chatbot.getPosition);
        if (resPosicion.data && resPosicion.data.success) {
          setIsLeft(!!resPosicion.data.is_left);
        }

      } catch (error) {
        console.error("Error al cargar configuración inicial del chatbot:", error);
      } finally {
        setLoadingSaludo(false);
      }
    };

    fetchData();
  }, []);





  const handleSaveSaludo = async () => {
    if (!salute.trim()) return;

    try {
      setIsSavingSaludo(true);

      // Enviamos el mensaje al backend. 
      // Nota: Usamos .post para enviar datos de forma segura en el cuerpo (body) de la petición.
      const response = await apiClient.post(config.endpoints.chatbot.newSalute, {
        salute: salute
      });

      if (response.data && response.data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Guardado!",
          text: "El saludo inicial se ha actualizado correctamente.",
          confirmButtonColor: "#0f766e",
        });
      }
    } catch (error) {
      console.error("Error al guardar el saludo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al intentar guardar el saludo.",
        confirmButtonColor: "#0f766e",
      });
    } finally {
      setIsSavingSaludo(false);
    }
  };

  const handleSavePosicion = async (positionLeft: boolean) => {
    try {
      setIsSavingPosicion(true);
      // Actualizamos el estado local inmediatamente para feedback visual rápido
      setIsLeft(positionLeft);

      const response = await apiClient.post(config.endpoints.chatbot.newPosition, { is_left: positionLeft });
      
      if (response.data && response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Posición Actualizada",
          text: `El widget del chatbot ahora aparecerá en la esquina ${positionLeft ? 'izquierda' : 'derecha'}.`,
          confirmButtonColor: "#0f766e",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error al guardar posición:", error);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo cambiar la posición.", confirmButtonColor: "#0f766e" });
    } finally {
      setIsSavingPosicion(false);
    }
  };

return (
  <div className="container mx-auto max-w-6xl">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-6">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
          </svg>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Gestión de Chatbot</h2>
            <p className="text-teal-50 text-sm mt-0.5">Configura el comportamiento del chatbot</p>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">

        {/* RIGHT: Edit options */}
        <div className="md:col-span-2 p-8 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5">Opciones de configuración</p>

          {/* Botón 1: Cambiar Logo */}
          <button
            onClick={() => setIconModalVisible(true)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-teal-400 hover:shadow-md dark:hover:border-teal-500 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Cambiar Logo</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Sube una imagen personalizada para el ícono del chatbot</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-teal-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Botones Dinámicos Activos (Color de Cabecera y Avanzada) */}
          {[
            { 
              icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z", 
              label: "Color de Cabecera", 
              desc: "Color de Header de pantalla de Chat", 
              func: () => setColorPickerVisible(!colorPickerVisible)
            },
            { 
              icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", 
              label: "Configuración avanzada", 
              desc: "Ajusta parámetros de comportamiento", 
              func: () => console.log('Configuración avanzada abierta')
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.func}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-teal-400 hover:shadow-md dark:hover:border-teal-500 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-teal-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}

          {/* --- 🟢 NUEVA SECCIÓN: UBICACIÓN DEL WIDGET --- */}
          <div className="pt-5 pb-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-100">
                  Ubicación del Botón Flotante (Widget)
                  </label>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                  Elige en qué esquina inferior de la pantalla de tu tienda se cargará el chatbot.
                  </p>
                        
                  <div className="grid grid-cols-2 gap-3 max-w-xs pt-1">
                    <button
                      type="button"
                      disabled={isSavingPosicion}
                      onClick={() => handleSavePosicion(true)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      isLeft 
                      ? "bg-teal-500 border-teal-500 text-white shadow-md font-extrabold" 
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-teal-400"
                      }`}
                      >
                        Esquina Izquierda
                      </button>
                      <button
                        type="button"
                        disabled={isSavingPosicion}
                        onClick={() => handleSavePosicion(false)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        !isLeft 
                        ? "bg-teal-500 border-teal-500 text-white shadow-md font-extrabold" 
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-teal-400"
                        }`}>
                            Esquina Derecha
                        </button>
                      </div>
                    </div>
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-100">
                          Mensaje de Saludo Inicial
              </label>
              <p className="text-xs text-gray-400 dark:text-gray-500">
              Escribe el primer mensaje automático que verá el usuario cuando abra la ventana del chat.
              </p>
                        
              <textarea
                  value={salute}
                  onChange={(e) => setSalute(e.target.value)}
                  disabled={loadingSaludo || isSavingSaludo}
                  rows={4}
                  placeholder={loadingSaludo ? "Cargando saludo actual..." : "Ej: ¡Hola! ¿En qué te puedo ayudar hoy?"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all outline-none text-sm resize-none disabled:opacity-60"
              />

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveSaludo}
                            disabled={isSavingSaludo || loadingSaludo || !salute.trim()}
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                          >
                            {isSavingSaludo ? "Guardando..." : "Guardar Saludo"}
                          </button>
                        </div>
          </div>


        </div>
        
        {/* LEFT: Preview */}
        <div className="md:col-span-1 flex flex-col items-center justify-center gap-4 p-8 bg-gray-50 dark:bg-gray-900/40">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Vista Previa</p>

          <div className="absolute inset-0 bg-white/15 rounded-[24px] scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          <ChatbotScreen />

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Vista actual del chatbot</p>
        </div>
      </div>

    </div>

    {/* Modales */}
    <GenericModal isOpen={iconModalVisible} title="Icono de Chatbot" onClose={() => setIconModalVisible(false)}>
      <IconUploader />
    </GenericModal>

    <GenericModal isOpen={colorPickerVisible} title="Color Pantalla de Chat" onClose={() => setColorPickerVisible(false)}>
    <GradientPickerField label="Header Chatbot" startColor={headerColor} onChange={setHeaderColor}/>    
    </GenericModal>
  </div>
)}

export default ChatbotTable