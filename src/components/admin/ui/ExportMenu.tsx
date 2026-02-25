import { useState, useRef, useEffect } from "react";
import { FaFilePdf, FaFileExcel, FaFileCsv, FaDownload, FaChevronDown } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type Producto from "src/models/Product"; 


interface ExportMenuProps {
  data: Producto[];
  fileName?: string;
}

const ExportMenu = ({ data, fileName = "reporte-productos" }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatData = (data: Producto[]) => {
    return data.map((item) => ({
      ID: item.id,
      Nombre: item.nombre,
      Titulo: item.titulo,
      Seccion: item.seccion,
      Precio: item.precio || 0,
      Stock: item.stock || 0,
      Keywords: item.etiqueta?.keywords || "",
      Fecha: new Date().toLocaleDateString(),
    }));
  };

  const exportToExcel = () => {
    try {
      const formattedData = formatData(data);
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      setIsOpen(false);
    } catch (error) {
      console.error("Error Excel:", error);
    }
  };

  const exportToCSV = () => {
    try {
      const formattedData = formatData(data);
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsOpen(false);
    } catch (error) {
      console.error("Error CSV:", error);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Encabezado
      doc.setFontSize(18);
      doc.text("Reporte de Productos - TAMI", 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28);

      const tableColumn = ["ID", "Nombre", "Sección", "Precio", "Stock"];
      
      const tableRows = data.map(item => [
        item.id,
        item.nombre,
        item.seccion,
        `S/ ${item.precio || 0}`,
        item.stock || 0
      ]);


      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166] },
        styles: { fontSize: 8 },
      });

      doc.save(`${fileName}.pdf`);
      setIsOpen(false);
    } catch (error) {
      console.error("Error generando el PDF:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Desconocido"}`);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-all duration-300 px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-teal-200 cursor-pointer"
      >
        <FaDownload className="h-4 w-4" />
        <span>Exportar</span>
        <FaChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in-down">
          <div className="py-1">
            <button
              onClick={exportToPDF}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer"
            >
              <FaFilePdf className="mr-3 h-5 w-5 text-red-500" />
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer"
            >
              <FaFileExcel className="mr-3 h-5 w-5 text-green-600" />
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer"
            >
              <FaFileCsv className="mr-3 h-5 w-5 text-blue-500" />
              CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;