import React from 'react'

interface SaluteEditorProps {
  salute: string;
  isLoading: boolean;
  isSaving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}

const SaluteEditor = ({ salute, isLoading, isSaving, onChange, onSave }: SaluteEditorProps) => {
  return (
    <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
      <label className="block text-sm font-bold text-gray-800 dark:text-gray-100">
        Mensaje de Saludo Inicial
      </label>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Escribe el primer mensaje automático que verá el usuario cuando abra la ventana del chat.
      </p>

      <textarea
        value={salute}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading || isSaving}
        rows={4}
        placeholder={isLoading ? 'Cargando saludo actual...' : 'Ej: ¡Hola! ¿En qué te puedo ayudar hoy?'}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all outline-none text-sm resize-none disabled:opacity-60"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isLoading || !salute.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSaving ? 'Guardando...' : 'Guardar Saludo'}
        </button>
      </div>
    </div>
  )
}

export default SaluteEditor