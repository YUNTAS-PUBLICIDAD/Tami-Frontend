import { useRef, useState } from "react";
import Swal from "sweetalert2";
import type { RichTextEditorHandle } from "./productos/RichTextEditor";

/**
 * Encapsula todo lo que necesita el flujo "botón -> modal de link -> insertar en el editor"
 * para UN campo de RichTextEditor. Si tienes varios campos (descripción, "¿por qué elegirnos?",
 * etc.) en el mismo formulario, llama a este hook una vez por campo — cada llamada
 * tiene su propio ref, su propio modal y su propio estado, sin pisarse entre sí.
 *
 * Uso:
 *   const descripcionLink = useLinkInsertion();
 *   ...
 *   <button onClick={descripcionLink.handleInsertLinkClick}>Insertar Link</button>
 *   <RichTextEditor ref={descripcionLink.editorRef} ... />
 *   <InsertLinkModal
 *     isOpen={descripcionLink.isModalOpen}
 *     selectedText={descripcionLink.selectedText}
 *     link={descripcionLink.link}
 *     setLink={descripcionLink.setLink}
 *     onClose={() => descripcionLink.setIsModalOpen(false)}
 *     onConfirm={() => handleAddLink(
 *       descripcionLink.link,
 *       descripcionLink.editorRef,
 *       descripcionLink.selectedText,
 *       descripcionLink.setIsModalOpen,
 *       descripcionLink.setLink,
 *       descripcionLink.setSelectedText,
 *     )}
 *   />
 */
export function useLinkInsertion() {
  const editorRef = useRef<RichTextEditorHandle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [link, setLink] = useState("");

  const handleInsertLinkClick = () => {
    const selected = editorRef.current?.getSelectedText();
    if (!selected) {
      Swal.fire("Selecciona texto", "Resalta el texto que deseas enlazar.", "warning");
      return;
    }
    setSelectedText(selected);
    setIsModalOpen(true);
  };

  return {
    editorRef,
    isModalOpen,
    setIsModalOpen,
    selectedText,
    setSelectedText,
    link,
    setLink,
    handleInsertLinkClick,
  };
}