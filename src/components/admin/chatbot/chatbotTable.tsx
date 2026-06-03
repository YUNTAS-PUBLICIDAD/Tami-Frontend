import React, { useState } from 'react'
import { Button } from 'src/components/ui/button'
import Swal from 'sweetalert2';
import IconUploader from './IconUploader'
import GenericModal from '../ui/GenericModal'
import ChatbotScreen from 'src/components/ui/chatbot/ChatbotScreen'
import ColorPickerField from '../popups/components/ColorPickerField'
import GradientPickerField from './gradientPickerField';
const defaultColor="#2A938B";

const ChatbotTable = () => {
  const [iconModalVisible, setIconModalVisible] = useState(false)
  const [colorPickerVisible, setColorPickerVisible]= useState(false)
  const [headerColor, setHeaderColor] = useState(defaultColor)



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