import { useState } from "react";
import BlogList from "./BlogList";
import { FaSearch } from "react-icons/fa";

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section className="container mx-auto p-4 md:p-10 lg:px-24">
      <h2 className="text-teal-700 text-3xl md:text-4xl font-bold mb-6">
        Todos los productos
      </h2>

      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-teal-700 rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 
              focus:outline-none focus:border-[#00786F]
              hover:border-[#00786F] transition-all duration-300"
          />
          <FaSearch className="absolute right-4 top-3.5 text-teal-700" />
        </div>
      </div>

      <BlogList searchTerm={searchTerm} />
    </section>
  );
};

export default BlogPage;
