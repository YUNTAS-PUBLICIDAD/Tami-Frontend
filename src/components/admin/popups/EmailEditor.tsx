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
    if (hidden) {
      hidden.value = content;
      // Disparar evento de input para que los listeners en popups.astro reaccionen
      hidden.dispatchEvent(new Event('input', { bubbles: true }));
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Disparar evento de sincronización con la vista previa del correo específico para el texto
    const previewBodyText = document.getElementById("previewCorreoBodyText");
    if (previewBodyText) {
      previewBodyText.innerHTML = content;
    }
  };

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      setValue(e.detail);
    };
    window.addEventListener("update-email-editor", handleUpdate as EventListener);
    return () => window.removeEventListener("update-email-editor", handleUpdate as EventListener);
  }, []);

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
      <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md px-3 py-2">
        Usa{" "}
        <code className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 px-1 rounded">
          {"{{nombre}}"}
        </code>{" "}
        para insertar el nombre del cliente automáticamente.
      </p>
    </div>
  );
};

export default EmailEditor;
