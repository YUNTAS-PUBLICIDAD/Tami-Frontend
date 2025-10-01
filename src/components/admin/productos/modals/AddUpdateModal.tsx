// /**
//  * @file AddUpdateProducto.tsx
//  * @description Modal para añadir o editar productos.
//  * Incluye múltiples páginas del formulario, selección de imágenes y productos relacionados.
//  */

// import useProductoForm from "../../../../hooks/admin/productos/useProductoForm.ts";
// import type Producto from "../../../../models/Product.ts";
// import React, { useRef } from "react";
// import { IoMdCloseCircle } from "react-icons/io";
// import type { ProductFormularioPOST } from "../../../../models/Product";
// type Imagen = ProductFormularioPOST["imagenes"][number];

// {
//     /* Interfaz de modals, Typescript */
// }
// interface AddDataModalProps {
//     isOpen: boolean;
//     setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
//     producto: Producto | null; // Producto a editar o null para añadir uno nuevo
//     onRefetch: () => void;
//     productos: Producto[]; // Lista de productos para relacionar
// }

// const AddUpdateProducto = ({
//                                isOpen,
//                                setIsOpen,
//                                producto,
//                                onRefetch,
//                                productos,
//                            }: AddDataModalProps) => {
//     const {
//         formData,
//         handleChange,
//         handleSubmit,
//         handleFileChange,
//         handleNestedChange,
//         handleRelacionadosChange,
//         handleImagesChange,
//         setFormData,
//         isLoading,
//     } = useProductoForm(producto, () => {
//         onRefetch();
//         setIsOpen(false);
//     });

//     const formContainerRef = useRef<HTMLDivElement>(null);
//     const [formPage, setFormPage] = React.useState(1);
//     const [isExiting, setIsExiting] = React.useState(false);

//     const goNextForm = () => {
//         setFormPage((prev) => prev + 1);
//         scrollToTop(); // Ajusta el scroll al inicio
//     };

//     const goBackForm = () => {
//         setFormPage((prev) => prev - 1);
//         scrollToTop(); // Ajusta el scroll al inicio
//     };

//     // Función para reiniciar el scroll
//     const scrollToTop = () => {
//         if (formContainerRef.current) {
//             formContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="h-screen w-screen bg-black/75 absolute top-0 left-0 z-50 flex justify-center items-center">
//             <button
//                 className="absolute top-5 right-5 text-red-200 hover:text-red-600 transition-all duration-300 hover:cursor-pointer text-4xl"
//                 onClick={() => setIsOpen(false)}
//             >
//                 <IoMdCloseCircle />
//             </button>

//             <div
//                 ref={formContainerRef}
//                 className={`bg-teal-700 w-1/2 h-10/12 rounded-xl p-10 relative transition-all duration-500 ${
//                     formPage !== 1 ? "overflow-hidden" : "overflow-y-scroll"
//                 }`}
//             >
//                 <h4 className="text-2xl text-center mb-5 font-bold text-white">
//                     {producto ? "Editar Producto" : "Agregar Producto"}
//                 </h4>

//                 <form onSubmit={handleSubmit} className="relative">
//                     {/* Primera página del formulario */}
//                     <div
//                         className={`absolute w-full transition-all duration-500 ${
//                             isExiting && formPage === 1
//                                 ? "-translate-x-full opacity-0 pointer-events-none"
//                                 : ""
//                         } ${
//                             !isExiting && formPage === 1
//                                 ? "translate-x-0 opacity-100 pointer-events-auto"
//                                 : "opacity-0 pointer-events-none"
//                         }`}
//                     >
//                         <div className="form-input">
//                             <label>Nombre:</label>
//                             <input
//                                 required
//                                 value={formData.nombre}
//                                 onChange={handleChange}
//                                 type="text"
//                                 name="nombre"
//                                 placeholder="Nombre del producto..."
//                             />
//                         </div>
//                         <div className="form-input">
//                             <label>Descripción:</label>
//                             <textarea
//                                 required
//                                 value={formData.descripcion}
//                                 onChange={handleChange}
//                                 name="descripcion"
//                                 placeholder="Descripción del producto..."
//                             />
//                         </div>
//                         <div className="form-input">
//                             <label>Título:</label>
//                             <input
//                                 required
//                                 value={formData.titulo}
//                                 onChange={handleChange}
//                                 type="text"
//                                 name="titulo"
//                                 placeholder="Título..."
//                             />
//                         </div>
//                         <div className="form-input">
//                             <label>Subtitulo:</label>
//                             <input
//                                 required
//                                 value={formData.subtitulo}
//                                 onChange={handleChange}
//                                 type="text"
//                                 name="subtitulo"
//                                 placeholder="Subtitulo..."
//                             />
//                         </div>
//                         <div className="form-input">
//                             <label>Imagen Principal del Producto:</label>
//                             <input
//                                 required
//                                 accept="image/png, image/jpeg, image/jpg"
//                                 onChange={handleFileChange}
//                                 type="file"
//                                 name="miniatura"
//                             />
//                         </div>
//                         <div className="form-input">
//                             <label>Sección del Producto:</label>
//                             <select
//                                 required
//                                 value={formData.seccion}
//                                 onChange={handleChange}
//                                 name="seccion"
//                             >
//                                 <option value="Trabajo">Trabajo</option>
//                                 <option value="Decoración">Decoración</option>
//                                 <option value="Negocio">Negocio</option>
//                             </select>
//                         </div>
//                         {/*
//                         <div className="group-form">
//                           {Object.entries(formData.especificaciones).map(([key, value]) => (
//                             <div className="form-input" key={key}>
//                               <label>{key}:</label>
//                               <input
//                                 type="text"
//                                 name={key}
//                                 value={value}
//                                 onChange={(e) =>
//                                   setFormData((prev) => ({
//                                     ...prev,
//                                     especificaciones: {
//                                       ...prev.especificaciones,
//                                       [key]: e.target.value,
//                                     },
//                                   }))
//                                 }
//                               />
//                             </div>
//                           ))}
//                         </div>
//                         */}
//                         <div className="group-form">
//                             <div className="form-input">
//                                 <label>Alto:</label>
//                                 <input
//                                     required
//                                     value={formData.dimensiones.alto}
//                                     onChange={(e) => handleNestedChange(e, "dimensiones")}
//                                     name="alto"
//                                     type="number"
//                                     placeholder="cm"
//                                 />
//                             </div>
//                             <div className="form-input">
//                                 <label>Ancho</label>
//                                 <input
//                                     required
//                                     value={formData.dimensiones.ancho}
//                                     onChange={(e) => handleNestedChange(e, "dimensiones")}
//                                     name="ancho"
//                                     type="number"
//                                     placeholder="cm"
//                                 />
//                             </div>
//                             <div className="form-input">
//                                 <label>Largo</label>
//                                 <input
//                                     required
//                                     value={formData.dimensiones.largo}
//                                     onChange={(e) => handleNestedChange(e, "dimensiones")}
//                                     name="largo"
//                                     type="number"
//                                     placeholder="cm"
//                                 />
//                             </div>
//                         </div>
//                         <button
//                             onClick={goNextForm}
//                             className="admin-act-btn w-full mb-6"
//                             type="button"
//                         >
//                             Siguiente
//                         </button>
//                     </div>

//                     {/* Segunda página del formulario */}
//                     <div
//                         className={`absolute w-full transition-all duration-500 ${
//                             isExiting && formPage === 2
//                                 ? "-translate-x-full opacity-0 pointer-events-none"
//                                 : ""
//                         } ${
//                             !isExiting && formPage === 2
//                                 ? "translate-x-0 opacity-100 pointer-events-auto"
//                                 : "opacity-0 pointer-events-none"
//                         }`}
//                     >
//                         {formData.imagenes.map((_: Imagen, index: number) => (
//                             <div key={index} className="form-input">
//                                 <label>Imagen {index + 1}:</label>
//                                 <input
//                                     required
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={(e) => handleImagesChange(e, index)}
//                                 />
//                             </div>
//                         ))}
//                         <button
//                             type="button"
//                             onClick={goNextForm}
//                             className="admin-act-btn w-full"
//                         >
//                             Siguiente
//                         </button>
//                         <button
//                             onClick={goBackForm}
//                             className="neutral-btn w-full mb-6"
//                             type="button"
//                         >
//                             Volver
//                         </button>
//                     </div>

//                     {/* Tercera página del form */}
//                     <div
//                         className={`absolute w-full transition-all duration-500 ${
//                             isExiting && formPage === 3
//                                 ? "-translate-x-full opacity-0 pointer-events-none"
//                                 : ""
//                         } ${
//                             !isExiting && formPage === 3
//                                 ? "translate-x-0 opacity-100 pointer-events-auto"
//                                 : "opacity-0 pointer-events-none"
//                         }`}
//                     >
//                         <div className="form-input">
//                             <label>Productos Relacionados:</label>
//                             {productos.length > 0 ? (
//                                 <div className="grid grid-cols-3 gap-4 auto-rows-auto overflow-y-scroll h-72 p-2">
//                                     {productos.map((item) => (
//                                         <div
//                                             key={item.id}
//                                             className="w-full h-full flex items-center justify-center gap-2"
//                                         >
//                                             <label className="flex flex-col text-white items-center gap-2">
//                                                 <input
//                                                     type="checkbox"
//                                                     className="peer hidden"
//                                                     value={item.id}
//                                                     onChange={(e) =>
//                                                         handleRelacionadosChange(e, item.id)
//                                                     }
//                                                 />
//                                                 <img
//                                                     src={
//                                                         typeof item.imagenes?.[0]?.url_imagen === "string"
//                                                             ? (item.imagenes[0].url_imagen.startsWith("https")
//                                                                 ? item.imagenes[0].url_imagen
//                                                                 : `${import.meta.env.PUBLIC_API_URL.replace(/\/$/, "")}${item.imagenes[0].url_imagen}`)
//                                                             : `https://placehold.co/100x100/orange/white?text=${encodeURIComponent(item.nombre)}`
//                                                     }
//                                                     alt={item.imagenes?.[0]?.texto_alt_SEO || item.nombre}
//                                                     className="w-36 h-36 rounded-full border-2 border-teal-700 peer-checked:border-slate-900 object-cover"
//                                                 />
//                                             </label>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <p className="col-span-3 text-center py-4 text-gray-500">
//                                     Cargando productos...
//                                 </p>
//                             )}
//                         </div>
//                         <button
//                             onClick={goBackForm}
//                             className="neutral-btn w-full mb-6"
//                             type="button"
//                         >
//                             Volver
//                         </button>
//                         <button
//                             disabled={isLoading}
//                             type="submit"
//                             className={`admin-act-btn w-full transition ${
//                                 isLoading
//                                     ? "disabled:opacity-75 disabled:hover:cursor-not-allowed disabled:cursor-not-allowed disabled:bg-teal-950"
//                                     : ""
//                             } `}
//                         >
//                             {isLoading ? (
//                                 <span className="w-full text-center flex justify-center items-center gap-2">
//                       <svg
//                           className="animate-spin h-5 w-5 text-white"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                       >
//                         <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                         ></circle>
//                         <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                         ></path>
//                       </svg>
//                       Guardando...
//                     </span>
//                             ) : (
//                                 "Guardar Producto"
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AddUpdateProducto;