import { useState } from "react";
import BlogList from "./BlogList";
import { FaSearch } from "react-icons/fa";
import {IoIosArrowDown} from "react-icons/io";

const BlogPage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <section className="container mx-auto p-4 md:p-10 lg:px-24">
            <h2 className="text-teal-800 text-3xl font-bold mb-4 mx-4">
                Todos los artículos</h2>
            <div className="flex flex-wrap items-center gap-4 mx-4 mb-6">
                <div className="relative flex items-center flex-grow">
                    <FaSearch className="absolute left-3 text-teal-800" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-teal-800 rounded-3xl pl-10 pr-4 py-2 text-teal-800 focus:outline-none focus:border-2 focus:border-teal-800"
                    />
                </div>
            </div>
            <BlogList searchTerm={searchTerm} />
        </section>
    );
};
export default BlogPage;



