import React from "react";
import { motion } from "framer-motion";

const AboutHeroBackground = ({ imageSrc }) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
      <motion.div
        className="relative w-full h-full"
        initial={{ opacity: 0, scale: 1.2 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={imageSrc}
          alt="Fondo Nosotros"
          className="w-full h-full object-cover object-center"
        />
        
       
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,120,111,.75), rgba(0,0,0,.75))"
          }}
        />
      </motion.div>
    </div>
  );
};

export default AboutHeroBackground;