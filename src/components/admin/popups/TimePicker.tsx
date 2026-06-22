import React, { useState, useEffect } from 'react';

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

  const getInitialMode = (val: number) => {
    if (val === -1) return 'nosend';
    if (val === 0) return 'immediate';
    return 'custom';
  };

  const initialMode = getInitialMode(resolvedValue);
  
  const [mode, setMode] = useState<string>(initialMode);
  const [selectValue, setSelectValue] = useState<string>(initialMode === 'custom' ? 'custom' : resolvedValue === -1 ? '-1' : '0');
  const [hours, setHours] = useState<number>(initialMode === 'custom' ? Math.floor(resolvedValue / 60) : 0);
  const [minutes, setMinutes] = useState<number>(initialMode === 'custom' ? resolvedValue % 60 : 10);
  const [totalMinutes, setTotalMinutes] = useState<number>(resolvedValue);

  // Sincronizar cuando el valor inicial o externo cambie de verdad
  useEffect(() => {
    const nextMode = getInitialMode(resolvedValue);
    setMode(nextMode);
    setSelectValue(nextMode === 'custom' ? 'custom' : resolvedValue === -1 ? '-1' : '0');
    setHours(nextMode === 'custom' ? Math.floor(resolvedValue / 60) : 0);
    setMinutes(nextMode === 'custom' ? resolvedValue % 60 : 10);
    setTotalMinutes(resolvedValue);
  }, [resolvedValue]);

  // Función unificada para propagar los cambios de forma segura sin bucles
  const propagateChange = (currentMode: string, currentHours: number, currentMinutes: number) => {
    let calculated = 0;
    if (currentMode === 'nosend') calculated = -1;
    else if (currentMode === 'immediate') calculated = 0;
    else if (currentMode === 'custom') {
      const h = isNaN(currentHours) ? 0 : currentHours;
      const m = isNaN(currentMinutes) ? 0 : currentMinutes;
      calculated = (h * 60) + m;
      if (calculated === 0) calculated = 1; // Evita colisión con inmediato
    }

    setTotalMinutes(calculated);
    onChange?.(calculated);

    window.dispatchEvent(new CustomEvent('timepicker-change', {
      detail: { id, value: calculated },
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectValue(val);
    
    let nextMode = 'custom';
    if (val === '-1') nextMode = 'nosend';
    if (val === '0') nextMode = 'immediate';
    
    setMode(nextMode);
    propagateChange(nextMode, hours, minutes);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <input type="hidden" id={id} name={name} value={totalMinutes} />

      <select 
        value={selectValue}
        onChange={handleSelectChange}
        className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
      >
        <option value="-1">No enviar</option>
        <option value="0">Inmediato</option>
        <option value="custom">🕒 Personalizado (Configurar Reloj)...</option>
      </select>

      {mode === 'custom' && (
        <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm max-w-[260px] mx-auto transition-all">
          {/* Horas */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Horas</span>
            <input
              type="number"
              min="0"
              max="23"
              value={isNaN(hours) ? "" : hours} 
              onChange={(e) => {
                const val = e.target.value;
                const nextHours = val === "" ? NaN : Math.min(23, Math.max(0, parseInt(val) || 0));
                setHours(nextHours);
                propagateChange(mode, nextHours, minutes);
              }}
              onBlur={() => {
                if (isNaN(hours)) {
                  setHours(0);
                  propagateChange(mode, 0, minutes);
                }
              }}
              className="w-16 p-2 text-center text-2xl font-black bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all [appearance:textfield]"
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
              value={isNaN(minutes) ? "" : minutes} 
              onChange={(e) => {
                const val = e.target.value;
                const nextMinutes = val === "" ? NaN : Math.min(59, Math.max(0, parseInt(val) || 0));
                setMinutes(nextMinutes);
                propagateChange(mode, hours, nextMinutes);
              }}
              onBlur={() => {
                if (isNaN(minutes)) {
                  setMinutes(0);
                  propagateChange(mode, hours, 0);
                }
              }}
              className="w-16 p-2 text-center text-2xl font-black bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all [appearance:textfield]"
            />
          </div>
        </div>
      )}
    </div>
  );
}