// src/components/products/RelatedBlogs.tsx

import React, { useState, useEffect } from 'react';
import type Blog from '../../models/Blog';
import { config } from 'config';
import CardBlog from '../blog/CardBlog';

interface Props {
  productId: number;
}

const RelatedBlogs: React.FC<Props> = ({ productId }) => {
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("--- [Depuración] El componente RelatedBlogs se ha montado. ---");

    const fetchAndFilterBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}${config.endpoints.blogs.list}`);
        const result = await response.json();
                
        const allBlogs: Blog[] = result.data || result || [];
        const filtered = allBlogs.filter(blog => Number(blog.producto_id) === Number(productId));
        
        setRelatedBlogs(filtered);
      } catch (error) {
        console.error("Error al cargar los blogs relacionados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterBlogs();
  }, [productId]);

  if (loading || relatedBlogs.length === 0) {
    return null;
  }

  return (
    <div className="max-w-[1825px] mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
          {relatedBlogs.slice(0, 2).map((blog) => (
            <CardBlog key={blog.id} blog={blog} />
          ))}
        </div>
        <div className="w-full lg:w-[184px] flex-shrink-0 bg-[#07625b] text-white rounded-2xl rounded-l-[40px] flex items-center justify-center p-6 min-h-[150px] lg:min-h-0">
          <span className="text-4xl font-extrabold uppercase [writing-mode:vertical-rl] transform rotate-180 tracking-[.5em]">
            BLOG
          </span>
        </div>
      </div>
    </div>
  );
};

export default RelatedBlogs;