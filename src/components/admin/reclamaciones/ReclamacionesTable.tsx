import React, { useEffect, useState, useMemo } from "react";
import { FaSearch, FaSyncAlt, FaExclamationTriangle, FaEye, FaTimes, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaIdCard, FaChevronLeft, FaChevronRight, FaFilter } from "react-icons/fa";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/admin/ui/Table";
import { SearchInput } from "src/components/admin/ui/SearchInput";
import LoadingComponent from "src/components/admin/ui/LoadingComponent";
import ErrorComponent from "src/components/admin/ui/ErrorComponent";
import useReclamaciones from "src/hooks/admin/reclamaciones/useReclamaciones";
import type Reclamacion from "src/models/Reclamacion";

const ITEMS_PER_PAGE = 8;

const ReclamacionesTable = () => {
  // --- ESTADOS ---
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // <-- NUEVO: Filtro de estado
  const [selectedReclamacion, setSelectedReclamacion] = useState<Reclamacion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { reclamaciones, loading, error } = useReclamaciones(refetchTrigger);

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    return (reclamaciones || []).filter((r: Reclamacion) => {
      // 1. Filtro por término de búsqueda
      const matchesSearch = [r.id, r.first_name, r.last_name, r.email, r.document_number].some(
        field => field?.toString().toLowerCase().includes(term)
      );

      // 2. Filtro por estado (claim_status_id)
      const matchesStatus = statusFilter === "" || r.claim_status?.id === Number(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [reclamaciones, searchTerm, statusFilter]); // Agregado statusFilter a dependencias

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayed = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Resetear a página 1 cuando cambia búsqueda o filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleRefetch = () => setRefetchTrigger(prev => !prev);

  const openModal = (reclamacion: Reclamacion) => {
    setSelectedReclamacion(reclamacion);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReclamacion(null);
    setIsModalOpen(false);
  };

  const handleStatusChange = async (newStatusId: number) => {
    if (!selectedReclamacion) return;
    const baseUrl = import.meta.env.PUBLIC_API_URL;

    try {
      const response = await fetch(`${baseUrl}/api/v1/admin/claims/${selectedReclamacion.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status_id: newStatusId })
      });

      const result = await response.json();

      if (result.success) {
        const statusNames: Record<number, string> = { 1: 'Pendiente', 2: 'En Proceso', 3: 'Atendido' };
        setSelectedReclamacion((prev: Reclamacion | null) => {
          if (!prev) return null;
          return {
            ...prev,
            claim_status_id: newStatusId,
            claim_status: {
              ...prev.claim_status,
              id: newStatusId,
              name: statusNames[newStatusId] || prev.claim_status?.name
            }
          } as Reclamacion;
        });
        handleRefetch();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  };

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | undefined }) => (
    <div className="flex items-start gap-3">
      <div className="text-red-500 mt-1 opacity-70">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{value || '---'}</span>
      </div>
    </div>
  );

  if (loading) return <LoadingComponent message="Sincronizando base de datos..." />;
  if (error) return <ErrorComponent error={error} handleRefetch={handleRefetch} />;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">

      {/* MODAL DETALLE (Sin cambios en tu lógica) */}
      {isModalOpen && selectedReclamacion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in duration-200">
            <div className="bg-red-600 px-8 py-6 flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Detalle de Reclamación</h3>
                <p className="text-red-100 text-xs font-bold opacity-80">Expediente N° {selectedReclamacion.id}</p>
              </div>
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem icon={<FaUser />} label="Cliente" value={`${selectedReclamacion.first_name} ${selectedReclamacion.last_name}`} />
                <InfoItem icon={<FaEnvelope />} label="Email" value={selectedReclamacion.email} />
                <InfoItem icon={<FaIdCard />} label="Documento" value={`${selectedReclamacion.document_type?.code || ''} - ${selectedReclamacion.document_number}`} />
                <InfoItem icon={<FaPhone />} label="Teléfono" value={selectedReclamacion.phone} />
                <InfoItem icon={<FaCalendarAlt />} label="Fecha Compra" value={selectedReclamacion.purchase_date?.split('T')[0].split('-').reverse().join('/') || '---'} />
                <InfoItem icon={<FaExclamationTriangle />} label="Tipo de Reclamo" value={selectedReclamacion.claim_type?.name} />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Gestión de Estado</h4>
                  <p className="text-xs text-blue-400">Cambia el progreso</p>
                </div>
                <select
                  value={selectedReclamacion.claim_status?.id || 1}
                  onChange={(e) => handleStatusChange(Number(e.target.value))}
                  className="w-full sm:w-48 p-2.5 rounded-xl border-none bg-white dark:bg-gray-800 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={1}>🟡 Pendiente</option>
                  <option value={2}>🔵 En Proceso</option>
                  <option value={3}>🟢 Atendido</option>
                </select>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Descripción</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{selectedReclamacion.detail}"</p>
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/30 flex justify-end">
              <button onClick={closeModal} className="px-8 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-black text-xs hover:scale-105 transition-transform">CERRAR EXPEDIENTE</button>
            </div>
          </div>
        </div>
      )}

      {/* --- VISTA PRINCIPAL (TABLA) --- */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase">
              <FaExclamationTriangle size={28} /> Reclamaciones
            </h2>
            <p className="text-red-100 text-sm font-medium opacity-80 mt-1">Panel Administrativo de Atención al Cliente</p>
          </div>
          <button onClick={handleRefetch} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-2.5 rounded-2xl text-sm font-black transition-all backdrop-blur-md">
            <FaSyncAlt className={loading ? "animate-spin" : ""} /> ACTUALIZAR
          </button>
        </div>

        {/* BARRA DE FILTROS MODIFICADA */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por nombre, DNI, email..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            
            {/* NUEVO SELECTOR DE ESTADO */}
            <div className="w-full md:w-64 relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-red-500 outline-none appearance-none transition-all cursor-pointer"
              >
                <option value="">📂 Todos los Estados</option>
                <option value="1">🟡 Pendientes</option>
                <option value="2">🔵 En Proceso</option>
                <option value="3">🟢 Atendidos</option>
              </select>
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>
          </div>

          <div className="px-5 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black border border-red-100 dark:border-red-900/30 shrink-0">
            {filtered.length} REGISTROS ENCONTRADOS
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
              <TableRow>
                {["Expediente", "Consumidor", "Documento", "Tipo", "Fecha", "Acciones"].map((h) => (
                  <TableHead key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest py-5 px-6 text-center">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center text-gray-300 dark:text-gray-700">
                      <FaSearch size={48} className="mb-4 opacity-20" />
                      <p className="text-xl font-bold italic tracking-tight">No se hallaron coincidencias</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((r) => (
                  <TableRow key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell className="text-center font-mono font-black text-red-600">#{r.id}</TableCell>
                    <TableCell className="px-6 text-left">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-gray-100 leading-none mb-1">{r.first_name} {r.last_name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{r.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold text-gray-500">{r.document_number}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        r.claim_status?.id === 1 ? 'bg-yellow-50 text-yellow-600' : 
                        r.claim_status?.id === 2 ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {r.claim_status?.name || 'S/E'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-xs text-gray-400 font-medium">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center px-6">
                      <button onClick={() => openModal(r)} className="bg-gray-900 dark:bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:scale-105 active:scale-95 transition-all shadow-lg inline-flex items-center gap-2">
                        <FaEye /> VER DETALLE
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 border-2 border-gray-100 dark:border-gray-700 rounded-xl disabled:opacity-20 hover:bg-white dark:hover:bg-gray-800 transition-all"><FaChevronLeft size={12} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 border-2 border-gray-100 dark:border-gray-700 rounded-xl disabled:opacity-20 hover:bg-white dark:hover:bg-gray-800 transition-all"><FaChevronRight size={12} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReclamacionesTable;