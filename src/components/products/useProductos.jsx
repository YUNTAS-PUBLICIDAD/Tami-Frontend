import { useEffect, useState } from "react";

export default function useProductos() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const response = await fetch("https://apitami.tami-peru.com/api/v1/productos");
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