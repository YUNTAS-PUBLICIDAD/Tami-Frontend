import Swal from "sweetalert2";
import useProductoAcciones from "../../../../hooks/admin/productos/useProductosActions.ts";

interface DeleteProductoModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  productoId: number;
  onRefetch: () => void;
}

const DeleteProductoModal = ({
                              isOpen,
                              setIsOpen,
                              productoId,
                              onRefetch,
                            }: DeleteProductoModalProps) => {
  const { deleteProducto } = useProductoAcciones();

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar producto?",
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
        await deleteProducto(productoId);
        Swal.fire("Eliminado", "El producto ha sido eliminado exitosamente.", "success");
        onRefetch(); // Recarga la lista de productos
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      }
    }

    setIsOpen(false);
  };

  if (!isOpen) return null;

  handleDelete(); // Llamar directamente a SweetAlert al abrir el modal

  return null; // Ya no es necesario el modal personalizado
};

export default DeleteProductoModal;