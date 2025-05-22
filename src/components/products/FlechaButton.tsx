import React from "react";

type Direction = "left" | "right";
interface ButtonProps {
  direccion: Direction;
}
const FlechaButton: React.FC<ButtonProps> = ({ direccion }) => {
  return (
    <svg
      className="w-full h-full"
      style={{ filter: "drop-shadow(2px 1px 5px #000000)" }}
      width="50"
      height="50"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={direccion === "left" ? "M16 4L8 12L16 20" : "M8 4L16 12L8 20"}
        stroke="currentColor"
        strokeWidth="0.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FlechaButton;
