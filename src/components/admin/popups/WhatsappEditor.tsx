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

  const htmlToWhatsappMarkdown = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let result = "";
    const walk = (node: Node) => {
      if (node.nodeType === 3) { // Text node
        result += node.textContent;
      } else if (node.nodeType === 1) { // Element node
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        
        // Define which tags should be treated as line breaks
        const isBlock = tag === 'div' || tag === 'p' || tag === 'li' || tag === 'br';
        
        // Add newline before block elements if not already there
        if (isBlock && result !== "") {
          if (tag === 'br' || !result.endsWith('\n')) {
            result += '\n';
          }
        }
        
        if (tag === 'br') return; // Line break already handled
        
        // Add markdown symbols for formatting
        const isBold = tag === 'b' || tag === 'strong';
        const isItalic = tag === 'i' || tag === 'em';
        const isStrike = tag === 's' || tag === 'strike' || tag === 'del';
        
        if (isBold) result += '*';
        if (isItalic) result += '_';
        if (isStrike) result += '~';
        
        // Process children
        for (let i = 0; i < el.childNodes.length; i++) {
          walk(el.childNodes[i]);
        }
        
        // Close markdown symbols
        if (isBold) result += '*';
        if (isItalic) result += '_';
        if (isStrike) result += '~';
        
        // Add newline after block elements if not already there
        if (isBlock && !result.endsWith('\n')) {
          result += '\n';
        }
      }
    };
    
    for (let i = 0; i < temp.childNodes.length; i++) {
      walk(temp.childNodes[i]);
    }
    
    // Final cleanup: preserve user's intended blank lines with a space for API compatibility
    let finalResult = result.trim();
    
    // Clean spaces inside formatting symbols before final save (so WhatsApp and our preview render them properly)
    finalResult = finalResult.replace(/\*(.*?)\*/g, (match, content) => {
      const leading = content.match(/^\s*/)[0];
      const trailing = content.match(/\s*$/)[0];
      return leading + '*' + content.trim() + '*' + trailing;
    });
    finalResult = finalResult.replace(/_(.*?)_/g, (match, content) => {
      const leading = content.match(/^\s*/)[0];
      const trailing = content.match(/\s*$/)[0];
      return leading + '_' + content.trim() + '_' + trailing;
    });
    finalResult = finalResult.replace(/~(.*?)~/g, (match, content) => {
      const leading = content.match(/^\s*/)[0];
      const trailing = content.match(/\s*$/)[0];
      return leading + '~' + content.trim() + '~' + trailing;
    });

    finalResult = finalResult.replace(/\n(?=\n)/g, '\n ');
    
    return finalResult;
  };

  const whatsappMarkdownToHtml = (text: string) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/~(.*?)~/g, "<del>$1</del>")
      .replace(/\n/g, "<br>");
    return html;
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const markdown = htmlToWhatsappMarkdown(content);

    // Dispatch event to update preview
    window.dispatchEvent(new CustomEvent(previewEventName, { detail: markdown }));

    // Sync hidden input
    const hidden = document.getElementById(inputId) as HTMLInputElement | null;
    if (hidden) {
      hidden.value = markdown;
    }
  };

  useEffect(() => {
    // Initialize default value safely
    if (editorRef.current) {
      document.execCommand('defaultParagraphSeparator', false, 'br');
      if (!editorRef.current.innerHTML && defaultValue) {
        // Check if legacy HTML
        const hasHTML = /<[a-z][\s\S]*>/i.test(defaultValue);
        if (hasHTML) {
          editorRef.current.innerHTML = defaultValue;
        } else {
          editorRef.current.innerHTML = whatsappMarkdownToHtml(defaultValue);
        }
        handleInput();
      }
    }

    const handleUpdate = (e: CustomEvent) => {
      const content = e.detail;
      if (editorRef.current) {
        // Force <br> mode
        document.execCommand('defaultParagraphSeparator', false, 'br');
        // If the content is already what we have (as markdown), don't update
        const currentMarkdown = htmlToWhatsappMarkdown(editorRef.current.innerHTML);
        if (currentMarkdown !== content) {
          const hasHTML = /<[a-z][\s\S]*>/i.test(content);
          if (hasHTML) {
            editorRef.current.innerHTML = content;
          } else {
            editorRef.current.innerHTML = whatsappMarkdownToHtml(content);
          }
        }
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
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
        .whatsapp-editor-content {
           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
           font-size: 14.2px;
           line-height: 1.45;
           padding: 12px;
           min-height: 150px;
           outline: none;
        }
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
        onPaste={handlePaste}
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
