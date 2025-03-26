import useProductos from "./useProductos";

export default function Productos() {
    const productos = useProductos();

    return (
        <div>
            {productos.length > 0 ? (
                productos.map((producto) => (
                    <div key={producto.id}>
                        <h3>{producto.nombreProducto}</h3>
                        <p>Precio: {producto.precioProducto}</p>
                        <img src={producto.image} alt={producto.nombreProducto} />
                    </div>
                ))
            ) : (
                <p>Cargando productos...</p>
            )}
        </div>
    );
}