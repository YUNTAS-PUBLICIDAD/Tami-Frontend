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

    // Dispatch event to update preview in popups.astro
    window.dispatchEvent(new CustomEvent('update-email-preview', { detail: content }));

    // Sync hidden input
    const hidden = document.getElementById("emailBody") as HTMLInputElement | null;
    if (hidden) {
      hidden.value = content;
    }
  };

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      const content = e.detail;
      setValue(content);
      // Sync hidden input when data comes from API
      const hidden = document.getElementById("emailBody") as HTMLInputElement | null;
      if (hidden) {
        hidden.value = content;
      }
    };
    window.addEventListener("update-email-editor", handleUpdate as EventListener);
    return () => window.removeEventListener("update-email-editor", handleUpdate as EventListener);
  }, []);

  return (
    <div className="email-editor-wrapper dark:text-white">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={{ toolbar: TOOLBAR_OPTIONS }}
        placeholder="Escribe el cuerpo del correo aquí..."
        className="dark:bg-gray-900 rounded-lg overflow-hidden"
      />
      {/* Campo oculto para que el script de popups.astro pueda leer el valor actual */}
      <input type="hidden" id="emailBody" value={value} />
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
