import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Strikethrough, Smile, List, ListOrdered } from "lucide-react";

interface WhatsappEditorProps {
  defaultValue?: string;
}

const COMMON_EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕",
  "👍", "👎", "✌️", "🤞", "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐", "🖖", "👋", "🤙", "💪", "🤖", "🔥", "✨", "🎉", "💯", "✅", "❌", "❤️", "💔"
];

const WhatsappEditor = ({
  defaultValue = "¡Hola! Me gustaría obtener más información sobre la promoción.",
}: WhatsappEditorProps) => {
  const [value, setValue] = useState(defaultValue);
  const [showEmojis, setShowEmojis] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    syncHiddenInput(newValue);
  };

  const syncHiddenInput = (val: string) => {
    const hidden = document.getElementById("whatsappMessage") as HTMLInputElement | null;
    if (hidden) {
      hidden.value = val;
    }
    // Update preview map
    window.dispatchEvent(new CustomEvent("update-whatsapp-preview", { detail: val }));
  };

  // Sync data from API/storage when available
  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      const content = e.detail;
      setValue(content);
      syncHiddenInput(content);
    };
    window.addEventListener("update-whatsapp-editor", handleUpdate as EventListener);
    return () => window.removeEventListener("update-whatsapp-editor", handleUpdate as EventListener);
  }, []);

  const insertFormatting = (marker: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const textBefore = value.substring(0, start);
    const selectedText = value.substring(start, end);
    const textAfter = value.substring(end);

    const newText = textBefore + marker + (selectedText || "texto") + marker + textAfter;
    setValue(newText);
    syncHiddenInput(newText);

    // Set focus back and adjust cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + selectedText.length + (marker.length * 2));
      } else {
        textarea.setSelectionRange(start + marker.length, start + marker.length + 5);
      }
    }, 0);
  };

  const insertList = (type: 'ordered' | 'bullet') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const textBefore = value.substring(0, start);
    const selectedText = value.substring(start, end);
    const textAfter = value.substring(end);

    const lines = selectedText.split('\n');
    let newSelectedText = lines.map((line, i) => {
      if (!line.trim() && selectedText.length > 0) return line;
      const prefix = type === 'ordered' ? `${i + 1}. ` : '- ';
      return `${prefix}${line}`;
    }).join('\n');

    const marker = type === 'ordered' ? '1. ' : '- ';
    const textToInsert = selectedText ? newSelectedText : `${marker}Elemento de lista`;

    const newText = textBefore + (textBefore && !textBefore.endsWith('\n') ? "\n" : "") + textToInsert + textAfter;
    setValue(newText);
    syncHiddenInput(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (textBefore && !textBefore.endsWith('\n') ? 1 : 0);
      if (selectedText) {
        textarea.setSelectionRange(newCursorPos, newCursorPos + textToInsert.length);
      } else {
        textarea.setSelectionRange(newCursorPos + marker.length, newCursorPos + textToInsert.length);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const textBefore = value.substring(0, start);

      // Encontrar la línea actual (el texto de la última línea antes del cursor)
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];

      // Si la línea es puramente whitespace, no hacer nada especial
      if (!currentLine.trim()) return;

      const orderedMatch = currentLine.match(/^(\d+)\.\s(.*)/);
      const bulletMatch = currentLine.match(/^(-\s)(.*)/);

      if (orderedMatch || bulletMatch) {
        e.preventDefault();

        let prefix = "";
        if (orderedMatch) {
          const num = parseInt(orderedMatch[1], 10);
          if (!orderedMatch[2].trim()) {
            // Enter en una línea numerada vacía = eliminar la lista y agregar un salto de línea normal
            const newTextBefore = textBefore.substring(0, textBefore.length - currentLine.length);
            const newValue = newTextBefore + '\n' + value.substring(start);
            setValue(newValue);
            syncHiddenInput(newValue);
            setTimeout(() => textarea.setSelectionRange(newTextBefore.length + 1, newTextBefore.length + 1), 0);
            return;
          }
          prefix = `\n${num + 1}. `;
        } else if (bulletMatch) {
          if (!bulletMatch[2].trim()) {
            const newTextBefore = textBefore.substring(0, textBefore.length - currentLine.length);
            const newValue = newTextBefore + '\n' + value.substring(start);
            setValue(newValue);
            syncHiddenInput(newValue);
            setTimeout(() => textarea.setSelectionRange(newTextBefore.length + 1, newTextBefore.length + 1), 0);
            return;
          }
          prefix = `\n- `;
        }

        const newValue = textBefore + prefix + value.substring(start);
        setValue(newValue);
        syncHiddenInput(newValue);

        setTimeout(() => {
          const newPos = start + prefix.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    const start = textarea.selectionStart;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(start);

    const newText = textBefore + emoji + textAfter;
    setValue(newText);
    syncHiddenInput(newText);
    setShowEmojis(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <div className="whatsapp-editor-wrapper border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 rounded-t-md relative">
        <button
          type="button"
          onClick={() => insertFormatting('*')}
          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-700 rounded transition-colors"
          title="Negrita"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('_')}
          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-700 rounded transition-colors"
          title="Cursiva"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('~')}
          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-700 rounded transition-colors"
          title="Tachado"
        >
          <Strikethrough size={18} />
        </button>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <button
          type="button"
          onClick={() => insertList('ordered')}
          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-700 rounded transition-colors"
          title="Lista Numerada"
        >
          <ListOrdered size={18} />
        </button>
        <button
          type="button"
          onClick={() => insertList('bullet')}
          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-700 rounded transition-colors"
          title="Lista con Viñetas"
        >
          <List size={18} />
        </button>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-700 rounded transition-colors"
            title="Insertar Emoji"
          >
            <Smile size={18} />
          </button>

          {showEmojis && (
            <div className="absolute top-10 left-0 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-64 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-6 gap-1">
                {COMMON_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1.5 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={6}
        className="block w-full p-3 resize-y bg-transparent focus:outline-none dark:text-gray-200 rounded-b-md"
        placeholder="Escribe tu mensaje aquí... Ej: ¡Hola! Me gustaría obtener el descuento."
      />

      {/* Hidden input to keep API integration intact */}
      {/* Note: The ID whatsappMessage allows Astro/vanilla js to read the value on form submit */}
      <input type="hidden" id="whatsappMessage" name="whatsappMessage" value={value} />
    </div>
  );
};

export default WhatsappEditor;
