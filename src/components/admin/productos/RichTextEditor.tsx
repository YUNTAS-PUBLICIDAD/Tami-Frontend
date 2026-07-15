import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// Métodos que el componente padre puede invocar a través del ref
// (por ejemplo, desde un modal externo de "Insertar Enlace").
export interface RichTextEditorHandle {
  getSelectedText: () => string;
  insertLink: (url: string) => void;
}

const LineHeight = Extension.create({
  name: "lineHeight",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },
});

const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(
  function RichTextEditor({ value, onChange }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // Tiptap v3 ya incluye Underline dentro de StarterKit;
          // lo desactivamos acá para evitar el duplicado con la
          // instancia explícita de abajo.
          underline: false,
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        LineHeight,
      ],
      content: value || "",
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          // 1. Añadimos dark:text-gray-200 al texto del editor
          class:
            "min-h-[250px] p-4 outline-none text-gray-700 dark:text-gray-200 text-base leading-relaxed",
        },
      },
    });

    // Exponemos hacia el padre la posibilidad de leer la selección actual
    // del editor y de convertirla en un enlace, sin que el padre tenga
    // que manipular el HTML a mano.
    useImperativeHandle(
      ref,
      () => ({
        getSelectedText: () => {
          if (!editor) return "";
          const { from, to } = editor.state.selection;
          return editor.state.doc.textBetween(from, to, " ");
        },
        insertLink: (url: string) => {
          if (!editor) return;
          const { from, to } = editor.state.selection;
          if (from === to) return;

          const selectedText = editor.state.doc.textBetween(from, to, " ");
          const literalTag = `<a href="${url}">${selectedText}</a>`;

          // Insertamos como nodo de texto explícito (no como HTML a parsear),
          // para que las etiquetas queden visibles como texto literal y
          // el usuario pueda borrarlas o editarlas como cualquier otro texto.
          editor
            .chain()
            .focus()
            .insertContentAt({ from, to }, { type: "text", text: literalTag })
            .run();
        },
      }),
      [editor]
    );

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value || "");
      }
    }, [value, editor]);

    if (!editor) return null;

    // Clases comunes para los botones para que se vean bien en ambos modos
    const btnClass = "px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors";

    return (
      // 2. Contenedor principal: Fondo oscuro y bordes adaptables
      <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200">
          <button type="button" className={btnClass} onClick={() => editor.chain().focus().undo().run()}>
            ↶
          </button>

          <button type="button" className={btnClass} onClick={() => editor.chain().focus().redo().run()}>
            ↷
          </button>

          <button type="button" className={btnClass} onClick={() => editor.chain().focus().toggleBold().run()}>
            <b>B</b>
          </button>

          <button type="button" className={btnClass} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <i>I</i>
          </button>

          <button type="button" className={btnClass} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <u>U</u>
          </button>

          <button type="button" className={btnClass} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            ←
          </button>

          <button type="button" className={btnClass} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            ↔
          </button>

          <button type="button" className={btnClass} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            →
          </button>

          <button type="button" className={btnClass} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
            ☰
          </button>

          {/* 4. Select de interlineado: Fondo y texto adaptables */}
          <select
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-teal-500"
            defaultValue=""
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;

              editor.chain().focus().updateAttributes("paragraph", {
                lineHeight: value,
              }).run();

              editor.chain().focus().updateAttributes("heading", {
                lineHeight: value,
              }).run();
            }}
          >
            <option value="" disabled>
              Interlineado
            </option>
            <option value="1">1.0</option>
            <option value="1.15">1.15</option>
            <option value="1.5">1.5</option>
            <option value="2">2.0</option>
            <option value="2.5">2.5</option>
          </select>
        </div>

        <EditorContent editor={editor} />
      </div>
    );
  }
);

export default RichTextEditor;