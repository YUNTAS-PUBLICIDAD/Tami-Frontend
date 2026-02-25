import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaSearch, FaSyncAlt, FaUsers, FaChartBar, FaWhatsapp } from "react-icons/fa";
import AddDataModal from "./modals/AddUpdateModal.tsx";
import DeleteClienteModal from "./modals/DeleteModal.tsx";
import useClientes from "../../../hooks/admin/seguimiento/useClientes.ts";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Paginator from "../ui/Paginator.tsx";
import Swal from "sweetalert2";
import type Cliente from "../../../models/Clients.ts";
import { SearchInput } from "src/components/admin/ui/SearchInput.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/admin/ui/Table.tsx";
import LoadingComponent from "src/components/admin/ui/LoadingComponent.tsx";
import ErrorComponent from "src/components/admin/ui/ErrorComponent.tsx";

const MONITORING_MODE_KEY = "seguimiento_monitoring_mode";

const ClientesTable = () => {
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { clientes, globalTotals, loading, error } = useClientes(refetchTrigger);
  
  // Estado para modo monitoreo - inicializa desde localStorage
  const [monitoringMode, setMonitoringMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(MONITORING_MODE_KEY) === "true";
    }
    return false;
  });

  // Persistir estado de monitoreo en localStorage
  const toggleMonitoringMode = () => {
    const newValue = !monitoringMode;
    setMonitoringMode(newValue);
    localStorage.setItem(MONITORING_MODE_KEY, String(newValue));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clienteIdToDelete, setClienteIdToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const ITEMS_PER_PAGE = 5;

  // Primero filtramos los clientes según búsqueda
  const filteredClientes = clientes.filter(cliente =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.celular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.id.toString().includes(searchTerm)
  );

  const totalFiltered = filteredClientes.length;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);

  // Ahora, aplicamos paginación con slice sobre los clientes filtrados
  const displayedClientes = filteredClientes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  const handleRefetch = () => setRefetchTrigger(prev => !prev);

  const openModalForEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const openModalForCreate = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setClienteIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleClienteFormSuccess = (msg?: string) => {
    setRefetchTrigger(prev => !prev);
    setIsModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "Operación exitosa",
      text: msg || "El cliente se ha guardado correctamente",
      confirmButtonColor: "#14b8a6",
    });
  };

  if (loading) return <LoadingComponent message="Cargando clientes..."/>
  if (error) return <ErrorComponent handleRefetch={handleRefetch} error={error}/>
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6 rounded-t-2xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold flex items-center gap-3 text-white">
                <FaUsers />
                <span>Gestión de Clientes</span>
              </h2>
              <p className="text-teal-50 mt-2 text-lg">
                Seguimiento y administración de clientes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={toggleMonitoringMode}
                className={`flex items-center gap-2 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg ${
                  monitoringMode
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white text-purple-600 hover:bg-purple-50"
                }`}
              >
                <FaChartBar /> {monitoringMode ? "Monitoreo ON" : "Monitoreo"}
              </button>
              <button
                onClick={openModalForCreate}
                className="flex items-center gap-2 bg-white text-teal-600 hover:bg-teal-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg"
              >
                <FaPlus /> Agregar Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <SearchInput placeholder="Buscar clientes..." value={searchTerm} onChange={setSearchTerm} />

            <button
              onClick={handleRefetch}
              disabled={loading}
              className="flex items-center gap-2 bg-white text-teal-600 border-2 border-teal-500 hover:bg-teal-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold w-full sm:w-auto justify-center shadow-sm"
            >
              <FaSyncAlt className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-teal-50 p-4 rounded-xl border border-teal-100 shadow-sm">
            <div className="text-sm font-medium text-teal-700 flex items-center gap-2">
              <span className="bg-teal-500 text-white text-sm font-bold py-1 px-3 rounded-full">
                {totalFiltered}
              </span>
              {totalFiltered === 1 ? "cliente" : "clientes"} encontrados
            </div>
            
            {/* Stats globales de WhatsApp - solo en modo monitoreo */}
            {monitoringMode && globalTotals && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                  <FaWhatsapp className="text-green-600" />
                  <span className="font-semibold">{globalTotals.whatsapp.popup.total_messages}</span>
                  <span className="text-green-600">msgs totales</span>
                </div>
                {globalTotals.whatsapp.popup.ult_envio && (
                  <div className="text-gray-500 text-xs">
                    Último: {new Date(globalTotals.whatsapp.popup.ult_envio).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabla de clientes */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "ID", 
                  "NOMBRE", 
                  "EMAIL", 
                  "TELÉFONO", 
                  "PRODUCTO", 
                  "ORIGEN", 
                  ...(monitoringMode ? ["MSGS WA", "ÚLT. ENVÍO"] : []),
                  "FECHA DE INICIO", 
                  "ACCIÓN"
                ].map((header, index) => (
                  <TableHead key={index} className={`text-xs whitespace-nowrap ${monitoringMode && (header === "MSGS WA" || header === "ÚLT. ENVÍO") ? "bg-purple-50 text-purple-700" : ""}`}>
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={monitoringMode ? 10 : 8} >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="bg-teal-50 p-6 rounded-full">
                        <FaUsers className="h-10 w-10 text-teal-300" />
                      </div>
                      <p className="text-xl font-medium text-gray-600 mt-4">
                        {searchTerm
                          ? "No se encontraron clientes que coincidan con tu búsqueda"
                          : "No hay clientes registrados"}
                      </p>
                      <p className="text-gray-400 max-w-md mx-auto">
                        {searchTerm
                          ? "Intenta con otros términos de búsqueda"
                          : "Comienza agregando clientes a tu sistema con el botón 'Agregar Cliente'"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Filas reales */}
                  {displayedClientes.map((item) => (
                    <TableRow key={item.id} >
                      <TableCell className="px-6 py-4 font-medium whitespace-nowrap text-teal-700">
                        #{item.id}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-blue-500">{item.email}</TableCell>
                      <TableCell >
                        {item.celular || (
                          <span className="text-gray-400 italic text-xs">No disponible</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        < span className="text-gray-500 text-sm">{item.producto ?? "-"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-500 text-sm">{item.source ?? "-"}</span>
                      </TableCell>
                      
                      {/* Columnas de monitoreo WhatsApp */}
                      {monitoringMode && (
                        <>
                          <TableCell className="bg-purple-50/50">
                            <div className="flex items-center gap-2">
                              <FaWhatsapp className="text-green-500" />
                              <span className={`font-semibold ${
                                (item.stats?.whatsapp?.popup?.total_messages ?? 0) > 0 
                                  ? "text-green-600" 
                                  : "text-gray-400"
                              }`}>
                                {item.stats?.whatsapp?.popup?.total_messages ?? 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="bg-purple-50/50 whitespace-nowrap">
                            <span className="text-gray-500 text-xs">
                              {item.stats?.whatsapp?.popup?.ult_envio 
                                ? new Date(item.stats.whatsapp.popup.ult_envio).toLocaleString()
                                : "-"
                              }
                            </span>
                          </TableCell>
                        </>
                      )}
                      
                      <TableCell className="whitespace-nowrap">
                        <span className="text-gray-500 text-sm">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</span>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-3 items-center">
                          <button
                            className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors duration-200 border border-transparent hover:border-green-200"
                            title="Editar"
                            onClick={() => openModalForEdit(item)}
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            className="p-2 rounded-full text-red-500 border border-transparent transition-colors duration-200 hover:bg-red-100 hover:border-red-200"
                            title="Eliminar"
                            onClick={() => openDeleteModal(item.id)}
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Filas vacías para mantener altura */}
                  {Array.from({ length: ITEMS_PER_PAGE - displayedClientes.length }).map((_, idx) => (
                    <TableRow key={`empty-${idx}`} className="h-17"> 
                      <TableCell colSpan={monitoringMode ? 10 : 8} className="px-6 py-4">&nbsp;</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
          {filteredClientes.length > 0 && (
            <div className="flex justify-center gap-2 mt-8 px-4 pb-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`${currentPage === 1 ? '' : 'cursor-pointer'} px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm text-gray-700 dark:text-gray-200`}
              >
                Anterior
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageToShow: number;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  pageToShow = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i;
                } else {
                  pageToShow = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageToShow)}
                    className={`px-3 py-1 border rounded-md text-sm cursor-pointer ${currentPage === pageToShow
                        ? "bg-teal-500 text-white border-teal-500"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    {pageToShow}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`${currentPage === totalPages ? '' : 'cursor-pointer'} px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm text-gray-700 dark:text-gray-200`}
              >
                Siguiente
              </button>
            </div>
          )}
      </div>

      {/* Modales */}
      <AddDataModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        cliente={selectedCliente}
        onRefetch={handleClienteFormSuccess}
      />

      {clienteIdToDelete !== null && (
        <DeleteClienteModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          clienteId={clienteIdToDelete}
          onRefetch={handleRefetch}
        />
      )}
    </div>
  );
  
};

export default ClientesTable;