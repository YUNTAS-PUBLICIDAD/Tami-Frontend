import Swal from "sweetalert2";
import useClienteAcciones from "../../../../hooks/admin/seguimiento/useClientesActions.ts";

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

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: "Esta acción es permanente y no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteCliente(clienteId);
        Swal.fire("Eliminado", "El cliente ha sido eliminado exitosamente.", "success");
        onRefetch(); // Recarga la lista de clientes
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
      }
    }

    setIsOpen(false);
  };

  if (!isOpen) return null;

  handleDelete(); // Llamar directamente a SweetAlert al abrir el modal

  return null; // Ya no es necesario el modal personalizado
};

export default DeleteClienteModal;