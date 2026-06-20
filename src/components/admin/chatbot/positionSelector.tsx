import React from 'react'

interface PositionSelectorProps {
  isLeft: boolean;
  isSaving: boolean;
  onSave: (positionLeft: boolean) => void;
}

const PositionSelector = ({ isLeft, isSaving, onSave }: PositionSelectorProps) => {
  return (
    <div className="pt-5 pb-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
      <label className="block text-sm font-bold text-gray-800 dark:text-gray-100">
        Ubicación del Botón Flotante (Widget)
      </label>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Elige en qué esquina inferior de la pantalla de tu tienda se cargará el chatbot.
      </p>

      <div className="flex items-center gap-3 pt-1">
        <span className={`text-xs font-semibold transition-colors ${isLeft ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`}>
          Izquierda
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={!isLeft}
          disabled={isSaving}
          onClick={() => onSave(!isLeft)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
            ${isSaving ? 'bg-gray-300 dark:bg-gray-600' : 'bg-teal-500'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300
              ${isLeft ? 'translate-x-1' : 'translate-x-6'}`}
          />
        </button>

        <span className={`text-xs font-semibold transition-colors ${!isLeft ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`}>
          Derecha
        </span>
      </div>
    </div>
  )
}

export default PositionSelector