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
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`${currentPage === 1 ? '' : 'cursor-pointer'} px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm text-gray-700 dark:text-gray-200`}
              >
                <FaChevronLeft />
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
                <FaChevronRight />
              </button>
            </div>
          )}
      </>
  );
};

export default BlogList;