import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Strikethrough, Smile, List, ListOrdered, Underline } from "lucide-react";

interface EmailEditorProps {
  defaultValue?: string;
  onChangeHtml?: (html: string) => void;
  inputId?: string;
  updateEventName?: string;
  previewEventName?: string;
}

const COMMON_EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕",
  "👍", "👎", "✌️", "🤞", "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐", "🖖", "👋", "🤙", "💪", "🤖", "🔥", "✨", "🎉", "💯", "✅", "❌", "❤️", "💔"
];

const EmailEditor = ({
  defaultValue = "¡Hola! Me interesa la oferta mostrada en su página web y me gustaría recibir más detalles.",
  onChangeHtml,
  inputId = "emailBody",
  updateEventName = "update-email-editor",
  previewEventName = "update-email-preview"
}: EmailEditorProps) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertOrderedList: false,
    insertUnorderedList: false,
  });
  const editorRef = useRef<HTMLDivElement>(null);

  const checkActiveStyles = () => {
    setActiveStyles({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
    });
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    onChangeHtml?.(content);

    // Dispatch event to update preview using the provided preview event name only.
    // Avoid emitting the generic `update-email-preview` here to prevent cross-tab preview overrides.
    const previewEvent = previewEventName && previewEventName.length ? previewEventName : 'update-email-preview';
    window.dispatchEvent(new CustomEvent(previewEvent, { detail: content }));

    // Sync hidden input
    const hidden = document.getElementById(inputId) as HTMLInputElement | null;
    if (hidden) {
      hidden.value = content;
    }
  };

  useEffect(() => {
    // Initialize default value safely
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = defaultValue;
      handleInput();
    }

    const handleUpdate = (e: CustomEvent) => {
      const content = e.detail;
      if (editorRef.current && editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
      const hidden = document.getElementById(inputId) as HTMLInputElement | null;
      if (hidden) {
        hidden.value = content;
      }
    };

    window.addEventListener(updateEventName, handleUpdate as EventListener);
    return () => window.removeEventListener(updateEventName, handleUpdate as EventListener);
  }, [inputId, updateEventName]);

  // Keep editor in sync if defaultValue changes (e.g., after product load)
  useEffect(() => {
    if (!editorRef.current) return;
    const current = editorRef.current.innerHTML || "";
    if (defaultValue !== undefined && defaultValue !== null && defaultValue !== current) {
      // Only update if editor is empty or differs from the incoming default (to avoid clobbering user edits sometimes)
      // If user is actively editing, we assume defaultValue won't change frequently.
      editorRef.current.innerHTML = defaultValue;
      const hidden = document.getElementById(inputId) as HTMLInputElement | null;
      if (hidden) hidden.value = defaultValue;
    }
  }, [defaultValue, inputId]);

  const execCommand = (command: keyof typeof activeStyles) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
    handleInput();
    checkActiveStyles();
  };

  const insertEmoji = (emoji: string) => {
    // Al usar inline-block, los emojis no heredan físicamente la línea del subrayado/tachado de su contenedor
    const html = `<span class="inserted-emoji" contenteditable="false">${emoji}</span>&#8203;`;
    document.execCommand('insertHTML', false, html);
    setShowEmojis(false);
    editorRef.current?.focus();
    handleInput();
    checkActiveStyles();
  };

  const getBtnClass = (cmd: keyof typeof activeStyles) => {
    const base = "p-1.5 rounded transition-colors ";
    if (activeStyles[cmd]) {
      return base + "text-blue-700 bg-blue-200 dark:text-blue-300 dark:bg-blue-900/80";
    }
    return base + "text-gray-600 hover:text-blue-600 hover:bg-blue-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700";
  };

  return (
    <div className="email-editor-wrapper border rounded-md border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm flex flex-col">
      <style>{`
        .email-editor-content ul {
           list-style-type: disc;
           padding-left: 24px;
        }
        .email-editor-content ol {
           list-style-type: decimal;
           padding-left: 24px;
        }
        .email-editor-content a {
           color: #2563eb;
           text-decoration: underline;
        }
        .email-editor-content:empty:before {
           content: "Escribe el cuerpo del correo aquí...";
           color: #9ca3af;
           pointer-events: none;
           display: block;
        }
        .email-editor-content .inserted-emoji {
           display: inline-block;
           text-decoration: none !important;
           font-style: normal !important;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-blue-200 dark:border-gray-700 bg-blue-50/50 dark:bg-gray-800/80 rounded-t-md relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('bold')}
          className={getBtnClass('bold')}
          title="Negrita"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('italic')}
          className={getBtnClass('italic')}
          title="Cursiva"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('underline')}
          className={getBtnClass('underline')}
          title="Subrayado"
        >
          <Underline size={18} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('strikeThrough')}
          className={getBtnClass('strikeThrough')}
          title="Tachado"
        >
          <Strikethrough size={18} />
        </button>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('insertOrderedList')}
          className={getBtnClass('insertOrderedList')}
          title="Lista Numerada"
        >
          <ListOrdered size={18} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('insertUnorderedList')}
          className={getBtnClass('insertUnorderedList')}
          title="Lista con Viñetas"
        >
          <List size={18} />
        </button>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <div className="relative border-none m-0 p-0">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700 rounded transition-colors"
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
                    onMouseDown={(e) => e.preventDefault()}
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
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { handleInput(); checkActiveStyles(); }}
        onBlur={() => { handleInput(); checkActiveStyles(); }}
        onKeyUp={checkActiveStyles}
        onMouseUp={checkActiveStyles}
        onFocus={checkActiveStyles}
        className="email-editor-content block w-full p-4 min-h-[180px] max-h-[400px] overflow-y-auto bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 rounded-b-md"
      />

      <input type="hidden" id={inputId} />

      <p className="m-2 mt-0 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md px-3 py-2">
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
