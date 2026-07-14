import React from "react";

interface InsertLinkModalProps {
  isOpen: boolean;
  selectedText: string;
  link: string;
  setLink: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const InsertLinkModal: React.FC<InsertLinkModalProps> = ({
  isOpen,
  selectedText,
  link,
  setLink,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-white p-6 rounded-xl w-96">
        <h3 className="text-xl font-bold mb-4">Insertar Enlace</h3>
        <p className="text-sm text-gray-600 mb-2">
          Enlace para: <strong>{selectedText}</strong>
        </p>
        <input
          type="text"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-teal-500"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
          >
            Insertar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsertLinkModal;