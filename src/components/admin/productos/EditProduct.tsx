import React from "react";
import { FaEdit } from "react-icons/fa";
import type { Product } from "src/models/Product";

interface EditProductProps {
    product: Product;
    onProductUpdated: () => Promise<void> | void;
}

const EditProduct: React.FC<EditProductProps> = ({ product, onProductUpdated }) => {
    const handleEdit = () => {
        console.log("Editando producto:", product);
        // Aquí iría tu lógica para editar el producto
        // Cuando termine la edición, llamarías a:
        // onProductUpdated();
    };

    return (
        <button
            className="p-2 text-green-600 hover:text-green-800 transition hover:cursor-pointer"
            title="Editar"
            onClick={handleEdit}
        >
            <FaEdit size={18} />
        </button>
    );
};

export default EditProduct;