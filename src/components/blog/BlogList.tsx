import { useEffect, useState } from "react";
import CardBlog from "./CardBlog";
import type Blog from "src/models/Blog";
import { getApiUrl, config } from "config";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


const BlogList = ({ searchTerm }: { searchTerm: string }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const apiUrlBlogs = getApiUrl(config.endpoints.blogs.list);

    const fetchBlogs = async () => {
      try {
        const res = await fetch(apiUrlBlogs);
        if (!res.ok) throw new Error("HTTP error blogs!");

        const data = await res.json();
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error("No se pudieron obtener los blogs");
        }

        setBlogs(data.data);
      } catch (err) {
        setError(
          "Error al obtener blogs: " +
          (err instanceof Error ? err.message : "Error desconocido")
        );
      }
    };

    fetchBlogs();
  }, []);
  const filteredBlogs = blogs.filter((blog) => {
    const search = searchTerm.toLowerCase();
    return (
      blog.titulo.toLowerCase().includes(search) ||
      blog.nombre_producto?.toLowerCase().includes(search)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

  return (
    <>
      {error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : filteredBlogs.length > 0 ? (
        currentItems.map((blog) => <CardBlog key={blog.id} blog={blog} />)
      ) : (
        <p className="text-center text-teal-800">No se encontraron resultados.</p>
      )}

      {/* Paginación */}
      {filteredBlogs.length > 0 && (
        <div className="flex justify-center items-center gap-1.5 mt-10 mb-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-teal-50 hover:-translate-y-0.5 hover:shadow-md'} 
                  p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600
                  transition-all duration-300 ease-out`}
            aria-label="Página anterior"
          >
            <FaChevronLeft className="w-3 h-3" />
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
                className={`min-w-[40px] px-3 py-2 border rounded-lg text-sm font-medium cursor-pointer
                      transition-all duration-300 ease-out
                      ${currentPage === pageToShow
                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-teal-50 hover:border-teal-300 hover:-translate-y-0.5 hover:shadow-sm"
                  }`}
              >
                {pageToShow}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-teal-50 hover:-translate-y-0.5 hover:shadow-md'} 
                  p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600
                  transition-all duration-300 ease-out`}
            aria-label="Página siguiente"
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  );
};

export default BlogList;