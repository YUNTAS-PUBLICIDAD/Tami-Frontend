import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface EmailEditorProps {
  defaultValue?: string;
  onChangeHtml?: (html: string) => void;
}

const TOOLBAR_OPTIONS = [
  [{ header: [false, 1, 2, 3] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "clean"],
];

const EmailEditor = ({
  defaultValue = "¡Hola! Me interesa la oferta mostrada en su página web y me gustaría recibir más detalles.",
  onChangeHtml,
}: EmailEditorProps) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (content: string) => {
    setValue(content);
    onChangeHtml?.(content);
    // Mantener el campo hidden sincronizado para que popups.astro pueda leerlo
    const hidden = document.getElementById("emailBodyValue") as HTMLInputElement | null;
    if (hidden) hidden.value = content;
    // Disparar evento de sincronización con la vista previa del correo
    const previewBody = document.getElementById("previewCorreoBody");
    if (previewBody) previewBody.innerHTML = content;
  };

  return (
    <div className="email-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={{ toolbar: TOOLBAR_OPTIONS }}
        placeholder="Escribe el cuerpo del correo aquí..."
        style={{ minHeight: "180px" }}
      />
      {/* Campo oculto para que el script de popups.astro pueda leer el valor */}
      <input type="hidden" id="emailBodyValue" defaultValue={defaultValue} />
      <p className="mt-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
        Usa{" "}
        <code className="font-mono font-bold text-blue-700 bg-blue-100 px-1 rounded">
          {"{{nombre}}"}
        </code>{" "}
        para insertar el nombre del cliente automáticamente.
      </p>
    </div>
  );
};

export default EmailEditor;
