import { useState, useDeferredValue, useCallback } from "react";
import BlogList from "./BlogList";
import { FaSearch, FaSortAmountDown } from "react-icons/fa";

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // evita que React bloquee mientras se escribe
  const deferredSearch = useDeferredValue(searchTerm);

  // funcion estable para evitar renders innecesarios
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortOrder(e.target.value as "asc" | "desc");
    },
    []
  );

  return (
    <section className="container mx-auto p-4 md:p-10 lg:px-24">
      <h2 className="text-teal-700 text-3xl md:text-4xl font-bold mb-6">
        Todos los artículos
      </h2>

      <div className="mb-8">
        {/* BUSCADOR */}
        <div className="relative group mb-3">
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full border-2 border-gray-300 rounded-xl px-5 py-3.5 pr-12 text-gray-700 placeholder-gray-400 
              bg-white shadow-sm
              focus:outline-none focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)]
              hover:border-teal-600 transition-all duration-300"
          />

          <FaSearch className="absolute right-4 top-4 text-gray-400 transition-colors duration-300 group-focus-within:text-teal-700" />
        </div>

        <div className="flex items-center justify-end md:justify-start pl-1">
          <div className="flex items-center gap-2 group cursor-pointer relative">
            <FaSortAmountDown className="text-teal-700 group-hover:text-teal-900 transition-colors" />

            <label
              htmlFor="sortOrder"
              className="text-sm font-bold text-gray-700 cursor-pointer group-hover:text-teal-800"
            >
              Ordenar por fecha de publicación:
            </label>

            <div className="relative">
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={handleSortChange}
                className="appearance-none bg-transparent border-none text-sm font-medium text-teal-700 
                           cursor-pointer focus:ring-0 focus:outline-none py-1 pr-6 hover:text-teal-900 transition-colors"
              >
                <option value="desc">Más recientes primero</option>
                <option value="asc">Más antiguos primero</option>
              </select>

              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-2.5 h-2.5 text-teal-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BlogList searchTerm={deferredSearch} sortOrder={sortOrder} />
    </section>
  );
};

export default BlogPage;