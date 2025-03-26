import { useEffect, useState } from "react";
import {config, getApiUrl} from "../../../config.js";

export default function useProductos() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const response = await fetch(getApiUrl(config.endpoints.productos.list));
                const data = await response.json();
                setProductos(data.data);
            } catch (error) {
                console.error("Error obteniendo productos", error);
            }
        };
        obtenerProductos();
    }, []);

    return productos;
}