import useClienteAcciones from "../../../../hooks/admin/seguimiento/useClientesActions";
import { useState } from "react";

interface DeleteClienteModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  clienteId: number;
  onRefetch: () => void;
}

const DeleteClienteModal = ({
  isOpen,
  setIsOpen,
  clienteId,
  onRefetch,
}: DeleteClienteModalProps) => {
  const { deleteCliente } = useClienteAcciones();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteCliente(clienteId);
      onRefetch(); // Recarga la lista o tabla de clientes
      setIsOpen(false); // Cierra el modal
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("No se pudo eliminar el cliente");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          ¿Eliminar cliente?
        </h2>
        <p className="text-gray-700 mb-6">
          Esta acción es permanente y no se puede deshacer.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteClienteModal;
