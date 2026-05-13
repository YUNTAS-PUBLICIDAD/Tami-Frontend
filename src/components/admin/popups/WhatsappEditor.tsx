import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Strikethrough, Smile, List, ListOrdered } from "lucide-react";

interface WhatsappEditorProps {
  defaultValue?: string;
  inputId?: string;
  updateEventName?: string;
  previewEventName?: string;
}

const COMMON_EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕",
  "👍", "👎", "✌️", "🤞", "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐", "🖖", "👋", "🤙", "💪", "🤖", "🔥", "✨", "🎉", "💯", "✅", "❌", "❤️", "💔"
];

const WhatsappEditor = ({
  defaultValue = "¡Hola! Me gustaría obtener más información sobre la promoción.",
  inputId = "whatsappMessage",
  updateEventName = "update-whatsapp-editor",
  previewEventName = "update-whatsapp-preview"
}: WhatsappEditorProps) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    strikeThrough: false,
    insertOrderedList: false,
    insertUnorderedList: false,
  });
  const editorRef = useRef<HTMLDivElement>(null);

  const checkActiveStyles = () => {
    setActiveStyles({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
    });
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;

    // Dispatch event to update preview
    window.dispatchEvent(new CustomEvent(previewEventName, { detail: content }));

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

  const execCommand = (command: keyof typeof activeStyles) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
    handleInput();
    checkActiveStyles();
  };

  const insertEmoji = (emoji: string) => {
    document.execCommand('insertText', false, emoji);
    setShowEmojis(false);
    editorRef.current?.focus();
    handleInput();
    checkActiveStyles();
  };

  const getBtnClass = (cmd: keyof typeof activeStyles) => {
    const base = "p-1.5 rounded-lg transition-all ";
    if (activeStyles[cmd]) {
      return base + "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/50";
    }
    return base + "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-gray-700";
  };

  return (
    <div className="whatsapp-editor-wrapper border rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm flex flex-col">
      <style>{`
        .whatsapp-editor-content ul {
           list-style-type: disc;
           padding-left: 24px;
           margin: 1em 0;
        }
        .whatsapp-editor-content ol {
           list-style-type: decimal;
           padding-left: 24px;
           margin: 1em 0;
        }
        .whatsapp-editor-content a {
           color: #059669;
           text-decoration: underline;
           font-weight: 500;
        }
        .whatsapp-editor-content:empty:before {
           content: "Escribe el mensaje de WhatsApp aquí...";
           color: #9ca3af;
           font-style: italic;
           pointer-events: none;
           display: block;
        }
        .whatsapp-editor-content .inserted-emoji {
           display: inline-block;
           text-decoration: none !important;
           font-style: normal !important;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2.5 border-b border-emerald-100 dark:border-gray-700 bg-emerald-50/30 dark:bg-gray-800/50 relative rounded-t-xl">
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
          onClick={() => execCommand('strikeThrough')}
          className={getBtnClass('strikeThrough')}
          title="Tachado"
        >
          <Strikethrough size={18} />
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1.5"></div>

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

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1.5"></div>

        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-gray-700 rounded-lg transition-all active:scale-90"
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
                    className="p-1.5 text-lg hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
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
        onMouseOver={checkActiveStyles}
        onFocus={checkActiveStyles}
        className="whatsapp-editor-content block w-full p-4 min-h-[160px] max-h-[400px] overflow-y-auto bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 rounded-b-xl"
      />

      <input type="hidden" id={inputId} name={inputId} />

      <div className="px-4 pb-4">
        <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100/50 dark:border-emerald-800/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span>Usa</span>
          <code className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-800 px-1.5 py-0.5 rounded shadow-sm">
            {"{{nombre}}"}
          </code>
          <span>para insertar el nombre del cliente automáticamente.</span>
        </p>
      </div>
    </div>
  );
};

export default WhatsappEditor;
