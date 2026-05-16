/**
 * @fileoverview useProductsLoad Hook
 * Loads product list on component mount
 * 
 * Responsibilities:
 * - Fetch all products from ProductoService on mount
 * - Manage loading state during fetch
 * - Handle errors gracefully (empty array on error)
 * - Return products and loading state
 * 
 * @example
 * const { products, loadingProducts } = useProductsLoad();
 * if (loadingProducts) return <Loading />;
 * return products.map(p => <ProductOption key={p.id} product={p} />);
 */
import { useState, useEffect, useCallback } from "react";
import type Producto from "src/models/Product";
import { ProductoService } from "../../../../services/producto.service";

interface UseProductsLoadReturn {
    products: Producto[];
    loadingProducts: boolean;
    loadError: string | null;
    retry: () => void;
}

export const useProductsLoad = (): UseProductsLoadReturn => {
    const [products, setProducts] = useState<Producto[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        setLoadError(null);
        try {
            const data = await ProductoService.getAllProductos();
            setProducts(data);
            if (data.length === 0) {
                setLoadError("No se encontraron productos disponibles.");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
            setLoadError("Error al cargar los productos. Reintenta de nuevo.");
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loadingProducts, loadError, retry: fetchProducts };
};
