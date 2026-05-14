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
import { useState, useEffect } from "react";
import type Producto from "../../../models/Product";
import { ProductoService } from "../../../services/producto.service";

/**
 * @typedef {Object} UseProductsLoadReturn
 * @property {Producto[]} products - Array of products fetched from API
 * @property {boolean} loadingProducts - Loading state (true while fetching, false when complete)
 */
interface UseProductsLoadReturn {
    products: Producto[];
    loadingProducts: boolean;
}
export const useProductsLoad = (): UseProductsLoadReturn => {
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
