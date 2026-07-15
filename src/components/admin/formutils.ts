import Swal from "sweetalert2";
import type { RichTextEditorHandle } from "./productos/RichTextEditor";
import type { RefObject } from "react";


/* ===== utilidades ===== */
export const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  };



export const handleAddLink = (link:string, editorRef:RefObject<RichTextEditorHandle|null>, selectedText:string,
                        setIsModalOpen: (isOpen:boolean)=>any, setLink: (link:string)=>any, setSelectedText: (selectedText:string)=>any) => {
    if (!link.trim() || !isValidUrl(link.trim())) {
      Swal.fire("Enlace inválido", "Ingresa una URL válida (https://...).", "error");
      return;
    }
    const linkedText = `<a href="${link.trim()}" style="font-weight: bold;" title="${selectedText}">${selectedText}</a>`;
    editorRef.current?.insertHTML(linkedText);
    setIsModalOpen(false);
    setLink("");
    setSelectedText("");
  };
