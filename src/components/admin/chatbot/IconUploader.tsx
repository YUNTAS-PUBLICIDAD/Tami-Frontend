import React, { useState, useEffect } from 'react';
import robotIcon from "../../../assets/icons/Icono-para--oficialpng.png";
import apiClient from 'src/services/apiClient'; // Importación nativa de tu cliente estructurado
import { config } from "../../../../config.ts";

export default function IconModal() {
  const placeholderSRC = robotIcon.src;

  // Estados del flujo del ícono
  const [iconUrl, setIconUrl] = useState<string>(placeholderSRC);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  /**
   * 1. PETICIÓN GET: Obtiene el ícono actual a través de tu apiClient protegido
   */
  const fetchCurrentIcon = async () => {
    try {
      // apiClient ya cuenta con el baseURL pre-configurado internamente
      const response = await apiClient.get(config.endpoints.chatbot.getIcon);
      
      // En apiClient (Axios), la respuesta del servidor se aloja directamente en .data
      const data = response.data;
      if (data && data.url_icono) {
        setIconUrl(data.url_icono);
        console.log(data);
      }
    } catch (err) {
      console.error("Error al obtener el ícono del chatbot:", err);
    }
  };

  useEffect(() => {
    fetchCurrentIcon();
  }, []);

  /**
   * 2. ACCIÓN SELECT: Manejo local del archivo cargado
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setSelectedFile(file);
    
    // Genera la vista previa en caliente para el usuario
    setPreviewUrl(URL.createObjectURL(file));
  };

  /**
   * 3. PETICIÓN POST: Sube el archivo igual que el handleSubmit
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formDataToSend = new FormData();
    
    formDataToSend.append('chatbot_icon', selectedFile); 

    try {
      // Estructura idéntica a la creación de productos de tu backend:
      // 1° Parámetro: URL de configuración
      // 2° Parámetro: El FormData con los archivos
      // 3° Parámetro: Objeto de configuraciones (Headers)
      const response = await apiClient.post(
        config.endpoints.chatbot.newIcon,
        formDataToSend,

      );

      // Evaluación de estados bajo los estándares de tu apiClient
      if (response.status === 200 || response.status === 201) {
        alert('¡Icono actualizado con éxito!');
        setSelectedFile(null);
        setPreviewUrl(null);
        // Volvemos a consultar para sincronizar la nueva ruta guardada en el servidor
        await fetchCurrentIcon();
      } else {
        alert('Hubo un error al subir el icono.');
      }
    } catch (error: any) {
      // ESTO TE DIRÁ EL ERROR EXACTO EN CONSOLA SI VUELVE A FALLAR
      if (error.response?.data?.errors) {
        console.error("Detalles de la validación fallida:", error.response.data.errors);
        alert(`Error de validación: ${JSON.stringify(error.response.data.errors)}`);
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    }finally {
      setIsUploading(false);
    }
  };

  // Cancela la operación y destruye la vista previa temporal
  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  /**
   * 4. RENDERIZADOR SEGURO DE LA IMAGEN (Basado en ProductosTabla)
   */
  const getFinalSrc = () => {
    if (previewUrl) return previewUrl; // Si hay vista previa local, la muestra primero
  
    // 🛡️ CONTROL DE SEGURIDAD: Si por alguna razón iconUrl NO es un texto...
    if (!iconUrl || typeof iconUrl !== 'string') {
      
      // Si accidentalmente es el objeto completo de Laravel, intentamos rescatar la URL interna
      if (iconUrl && typeof iconUrl === 'object' && 'url_icono' in iconUrl) {
        const urlRescatada = (iconUrl as any).url_icono;
        if (typeof urlRescatada === 'string') {
          return urlRescatada.startsWith("http") ? urlRescatada : `${config.apiUrl}${urlRescatada}`;
        }
      }
      
      // Si no se puede rescatar nada, cae seguro al ícono por defecto en lugar de romper la app
      return placeholderSRC;
    }
  
    // Si ya es el placeholder de fábrica, lo devuelve tal cual
    if (iconUrl === placeholderSRC) return placeholderSRC;
  
    // Si es un string normal, opera de forma idéntica a antes
    return iconUrl.startsWith("http") ? iconUrl : `${config.apiUrl}${iconUrl}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm w-64">
      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
        {previewUrl ? "Vista Previa" : "Icono Actual"}
      </span>
      
      {/* VISTA PREVIA O ICONO ACTUAL */}
      <img 
        src={getFinalSrc()} 
        alt="Icono de la aplicación" 
        className="w-20 h-20 object-cover rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-inner"
        onError={(e) => {
          (e.target as HTMLImageElement).src = placeholderSRC; 
        }}
      />

      {/* SECCIÓN DE CONTROLADORES */}
      <div className="w-full space-y-2">
        {/* BOTÓN SELECCIONAR */}
        <label className={`cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center block w-full border border-gray-200 dark:border-gray-600 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {selectedFile ? "Cambiar Imagen" : "Seleccionar Imagen"}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isUploading}
          />
        </label>

        {/* ACCIONES (Confirmar / Descartar) - Solo visibles tras elegir un archivo */}
        {selectedFile && (
          <div className="flex gap-2">
            <button
              onClick={handleCancelSelection}
              disabled={isUploading}
              className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-1 cursor-pointer disabled:opacity-50"
            >
              Quitar
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-1 font-bold cursor-pointer disabled:opacity-50"
            >
              {isUploading ? "Subiendo..." : "Guardar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}