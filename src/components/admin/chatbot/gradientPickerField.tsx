import React, { useState, useEffect } from 'react';
import apiClient from "src/services/apiClient"; // Ajusta según tu ruta real
import { config } from "config";               // Ajusta según tu ruta real

interface GradientPickerFieldProps {
    label: string;
    description?: string;

    // color inicial editable (actuará como fallback si la API falla o no ha cargado)
    startColor: string;

    // color final fijo (opcional)
    endColor?: string;

    // Callback opcional por si el padre necesita enterarse del cambio de estado interno
    onChange?: (startColor: string) => void;
}

const defaultStart = "#2A938B";

export const GradientPickerField: React.FC<GradientPickerFieldProps> = ({
    label,
    description,
    startColor = defaultStart,
    endColor = "#0D2D2B",
    onChange
}) => {
    // 1. Manejamos el color seleccionado en un estado local interno para poder actualizarlo desde la BD
    const [currentColor, setCurrentColor] = useState<string>(startColor);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    // 2. 🔥 CARGA DESDE LA BD AL ABRIR/MONTAR EL COMPONENTE
    useEffect(() => {
        const fetchColorFromBD = async () => {
            setIsFetching(true);
            try {
                // Mapeamos el endpoint dinámico o usamos tu string fijo alternativo
                const urlGet = config.endpoints?.chatbot?.getHeadColor || "api/v1/chatbot/head-color";
                const response = await apiClient.get(urlGet);

                if (response.data && response.data.success) {
                    // Supongamos que tu backend retorna { success: true, color: "#XXXXXX" } o similar
                    // Ajusta 'response.data.color' u 'head_color' según tu controlador de Laravel
                    const colorDesdeBD = response.data.color || response.data.head_color;
                    
                    if (colorDesdeBD) {
                        // 🖥️ DEBUG: Imprime el color cargado cuando el modal se hace visible
                        console.log("🎨 [GradientPicker] Color cargado con éxito desde la BD:", colorDesdeBD);
                        setCurrentColor(colorDesdeBD);
                        if (onChange) onChange(colorDesdeBD);
                    }
                }
            } catch (error) {
                console.error("❌ [GradientPicker] Error al cargar el color de la cabecera:", error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchColorFromBD();
    }, []);

    // 3. 🔥 ENVIAR EL NUEVO COLOR MEDIANTE LA CONFIGURACIÓN (POST/PUT)
    const handleSaveColor = async () => {
        setIsSaving(true);
        try {
            const urlPost = config.endpoints.chatbot.newHeadColor;
            
            const response = await apiClient.post(urlPost, {
                color_inicial: currentColor, // Envía el color seleccionado (ej: "#2A938B")
                color_final: endColor        // Envía el color final (ej: "#0D2D2B")
            });

            if (response.data && response.data.success) {
                console.log("✅ [GradientPicker] Color guardado correctamente en la BD:", currentColor);
                alert("Color de cabecera actualizado correctamente");
            } else {
                console.warn("⚠️ [GradientPicker] El backend respondió sin éxito:", response.data);
            }
        } catch (error) {
            console.error("❌ [GradientPicker] Error al guardar el color en el servidor:", error);
            alert("Hubo un error al guardar el color.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleColorChange = (value: string) => {
        setCurrentColor(value);
        if (onChange) onChange(value);
    };

    const gradient = `linear-gradient(to right, ${currentColor}, ${endColor})`;

    return (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm relative">
            
            {/* Overlay sutil mientras carga inicialmente */}
            {isFetching && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-xl z-10 text-xs text-gray-500">
                    Cargando color actual...
                </div>
            )}

            <span className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">
                {label}
            </span>

            <div className="flex items-center gap-4">

                {/* Preview */}
                <div
                    className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-600 shadow-md shrink-0 transition-all duration-300"
                    style={{
                        background: gradient
                    }}
                />

                {/* Selector */}
                <div className="flex flex-col gap-1 flex-1">

                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-12 h-12 cursor-pointer rounded border border-gray-200"
                        />
                        
                        {/* 🔥 BOTÓN PARA ENVIAR A LA API */}
                        <button
                            onClick={handleSaveColor}
                            disabled={isSaving || isFetching}
                            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-tr from-[#015f86] to-[#0d9488] rounded-lg shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all duration-300"
                        >
                            {isSaving ? "Guardando..." : "Guardar Color"}
                        </button>

                        <button
                            onClick={()=> {setCurrentColor(defaultStart); handleSaveColor()}}
                            disabled={isSaving || isFetching}
                            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-tr from-[#015f86] to-[#0d9488] rounded-lg shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all duration-300"
                        >
                            {isSaving ? "Guardando..." : "Color por Defecto"}
                        </button>
                    </div>

                    <span className="text-xs text-gray-500 mt-1">
                        Color inicial
                    </span>

                    {description && (
                        <span className="text-xs text-gray-400">
                            {description}
                        </span>
                    )}

                    <span className="text-xs font-mono text-gray-400 break-all mt-1">
                        {gradient}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GradientPickerField;