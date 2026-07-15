import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, forwardRef, useImperativeHandle } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// reemplazando lo que antes se hacía leyendo un <textarea> del DOM.
export interface RichTextEditorHandle {
  getSelectedText: () => string;
  insertHTML: (html: string) => void;
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
  ({ value, onChange }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
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
          class:
            "min-h-[250px] p-4 outline-none text-gray-700 dark:text-gray-200 text-base leading-relaxed",
        },
      },
    });

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value || "");
      }
    }, [value, editor]);

    // exponemos aquí lo que el modal de "Insertar Link" necesita:
    // el texto seleccionado y una forma de insertar HTML en esa selección.
    useImperativeHandle(
      ref,
      () => ({
        getSelectedText: () => {
          if (!editor) return "";
          const { from, to } = editor.state.selection;
          return editor.state.doc.textBetween(from, to, " ");
        },
        insertHTML: (html: string) => {
          if (!editor) return;
          // focus() no borra la selección previa: sigue apuntando al rango
          // que el usuario resaltó antes de abrir el modal, así que
          // insertContent reemplaza exactamente ese texto seleccionado.
          editor.chain().focus().insertContent(html).run();
        },
      }),
      [editor],
    );

    if (!editor) return null;

    const btnClass =
      "px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors";

    return (
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
  },
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;