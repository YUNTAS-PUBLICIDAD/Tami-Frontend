import { useState, useEffect } from "react";
import type Producto from "../../../models/Product";
import { ProductoService } from "../../../services/producto.service";

/**
 * Hook que carga la lista de productos al montar el componente
 * Maneja estado de carga y errores
 * 
 * @returns { products: Producto[], loadingProducts: boolean }
 */
export const useProductsLoad = () => {
    const [products, setProducts] = useState<Producto[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await ProductoService.getAllProductos();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    return { products, loadingProducts };
};
