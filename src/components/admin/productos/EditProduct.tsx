import React from "react";
import { FaEdit } from "react-icons/fa";

const EditProduct = () => {
  return (
    <>
      <button
        className="p-2 text-green-600 hover:text-green-800 transition hover:cursor-pointer"
        title="Editar"
        onClick={() => {
          console.log("ola");
        }}
      >
        <FaEdit size={18} />
      </button>
    </>
  );
};

export default EditProduct;
