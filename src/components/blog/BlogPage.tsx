import { useState } from "react";
import BlogList from "./BlogList";
import { FaSearch } from "react-icons/fa";

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section className="container mx-auto p-4 md:p-10 lg:px-24">
      <h2 className="text-teal-700 text-3xl md:text-4xl font-bold mb-6">
        Artículos del Blog
      </h2>

      <div className="mb-8">
        <div className="relative group">
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl px-5 py-3.5 pr-12 text-gray-700 placeholder-gray-400 
              bg-white shadow-sm
              focus:outline-none focus:border-teal-600 focus:shadow-[0_0_0_3px_rgba(0,120,111,0.1)]
              hover:border-teal-500 transition-all duration-300"
          />
          <FaSearch className="absolute right-4 top-4 text-gray-400 transition-colors duration-300 group-focus-within:text-teal-600" />
        </div>
      </div>

      <BlogList searchTerm={searchTerm} />
    </section>
  );
};

export default BlogPage;
