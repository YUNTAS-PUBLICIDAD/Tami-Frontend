import React, { useState, useEffect, useRef } from 'react';

interface TimePickerProps {
  id: string;
  name: string;
  label: string;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
}

export default function TimePicker({ id, name, label, defaultValue = 0, value, onChange }: TimePickerProps) {
  const resolvedValue = value ?? defaultValue;
  const isExternalSyncRef = useRef(false);

  // Determinar el estado inicial basándonos en el valor recibido
  const getInitialMode = (val: number) => {
    if (val === -1) return 'nosend';
    if (val === 0) return 'immediate';
    // Si no es -1 ni 0, y coincide con opciones fijas del select anterior
    // if ([10, 15, 20, 30, 60].includes(val)) return 'static';
    return 'custom';
  };

  const initialMode = getInitialMode(resolvedValue);
  
  // Estados reactivos internos del componente
  const [mode, setMode] = useState<string>(initialMode);
  const [selectValue, setSelectValue] = useState<string>(initialMode === 'custom' ? 'custom' : resolvedValue === -1 ? '-1' : '0');
  const [hours, setHours] = useState<number>(initialMode === 'custom' ? Math.floor(resolvedValue / 60) : 0);
  const [minutes, setMinutes] = useState<number>(initialMode === 'custom' ? resolvedValue % 60 : 10);
  const [totalMinutes, setTotalMinutes] = useState<number>(resolvedValue);

  const applyValueToState = (nextValue: number) => {
    const nextMode = getInitialMode(nextValue);

    isExternalSyncRef.current = true;
    setMode(nextMode);
    setSelectValue(nextMode === 'custom' ? 'custom' : nextValue === -1 ? '-1' : '0');
    setHours(nextMode === 'custom' ? Math.floor(nextValue / 60) : 0);
    setMinutes(nextMode === 'custom' ? nextValue % 60 : 10);
    setTotalMinutes(nextValue);
  };

  // Escucha cambios externos en el valor para mantener sincronizado el reloj
  useEffect(() => {
    applyValueToState(resolvedValue);
  }, [resolvedValue, id, name]);

  useEffect(() => {
    const handleExternalSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string; value?: number }>;
      if (!customEvent.detail || customEvent.detail.id !== id || typeof customEvent.detail.value !== 'number') {
        return;
      }

      applyValueToState(customEvent.detail.value);
    };

    window.addEventListener('timepicker-sync', handleExternalSync as EventListener);

    return () => {
      window.removeEventListener('timepicker-sync', handleExternalSync as EventListener);
    };
  }, [id]);
  

  // Cada vez que cambie el modo o las horas/minutos del reloj, recalculamos el total
  useEffect(() => {
    if (isExternalSyncRef.current) {
      isExternalSyncRef.current = false;
      return;
    }

    let calculated = 0;
    if (mode === 'nosend') calculated = -1;
    else if (mode === 'immediate') calculated = 0;
    // else if (mode === 'static') calculated = parseInt(selectValue);
    else if (mode === 'custom') {
      calculated = (hours * 60) + minutes;
      if (calculated === 0) calculated = 1; // Evita colisión con inmediato
    }
    setTotalMinutes(calculated);
    onChange?.(calculated);

    window.dispatchEvent(new CustomEvent('timepicker-change', {
      detail: {
        id,
        value: calculated,
      },
    }));
  }, [mode, hours, minutes]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectValue(val);
    
    if (val === 'custom') {
      setMode('custom');
    } else if (val === '-1') {
      setMode('nosend');
    } else if (val === '0') {
      setMode('immediate')
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      {/* Input oculto que interactúa de forma nativa con el formulario de Astro */}
      <input type="hidden" id={id} name={name} value={totalMinutes} />

      {/* Selector principal */}
      <select 
        value={selectValue}
        onChange={handleSelectChange}
        className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
      >
        <option value="-1">No enviar</option>
        <option value="0">Inmediato</option>
        <option value="custom">🕒 Personalizado (Configurar Reloj)...</option>
      </select>

      {/* Reloj Digital Reactivo */}
      {mode === 'custom' && (
        <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm max-w-[260px] mx-auto transition-all">
          {/* Horas */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Horas</span>
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-16 p-2 text-center text-2xl font-black bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          
          <span className="text-2xl font-black text-gray-400 dark:text-gray-600 pt-4 select-none">:</span>
          
          {/* Minutos */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Minutos</span>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-16 p-2 text-center text-2xl font-black bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}