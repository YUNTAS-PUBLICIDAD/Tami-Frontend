import React, { useEffect, useState } from "react";
import EditProduct from "./EditProduct";
import { config, getApiUrl } from "config";
import {
  deleteProduct,
  getProducts,
} from "src/hooks/admin/productos/productos";
import type { Product } from "src/models/Product";
import { FaTrash } from "react-icons/fa";
import AddProduct from "./AddProduct";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const ProductosTabla = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null); // ID del producto que se está eliminando

  const fetchData = async () => {
    const data = await getProducts();
    if (data) setProductos(data);
  };

  const deleteProductHandler = (id: number) => {
    setLoadingDeleteId(id);
    deleteProduct(id).then((response) => {
      if (response) {
        alert(response);
        setLoadingDeleteId(null);
        fetchData(); // Refresca la lista de productos después de eliminar uno
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="py-4 px-2">
        <AddProduct onProductAdded={fetchData} />
      </div>
      {/* Tabla */}
      <div className="w-full overflow-x-auto overflow-y-scroll">
        <table className="w-full border-separate border-spacing-2">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="px-4 py-2 rounded-xl">ID</th>
              <th className="px-4 py-2 rounded-xl">NOMBRE</th>
              <th className="px-4 py-2 rounded-xl">SECCION</th>
              <th className="px-4 py-2 rounded-xl">IMAGEN PRINCIPAL</th>
              <th className="px-4 py-2 rounded-xl">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((item, index) => {
              return (
                <tr
                  key={item.id}
                  className={`text-center ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-gray-300"
                  }`}
                >
                  <td className="px-4 font-bold rounded-xl">{item.id}</td>
                  <td className="px-4 font-bold rounded-xl">{item.name}</td>
                  <td className="px-4 font-bold rounded-xl">{item.seccion}</td>
                  <td className="px-4 font-bold rounded-xl overflow-hidden place-items-center py-2">
                    <img src={item.image} alt={item.name} className="h-24" />
                  </td>
                  <td className="px-4 rounded-xl">
                    {/* Contenedor de acciones con íconos */}
                    <div className="flex justify-center gap-2 rounded-xl p-1">
                      <button
                        className="p-2 text-red-600 hover:text-red-800 transition hover:cursor-pointer"
                        title="Eliminar"
                        onClick={() => deleteProductHandler(item.id)}
                        disabled={loadingDeleteId === item.id} // Deshabilita el botón si está en proceso
                      >
                        {loadingDeleteId === item.id ? (
                          <AiOutlineLoading3Quarters
                            className="animate-spin text-red-600"
                            size={18}
                          />
                        ) : (
                          <FaTrash size={18} />
                        )}
                      </button>
                      <EditProduct />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProductosTabla;
