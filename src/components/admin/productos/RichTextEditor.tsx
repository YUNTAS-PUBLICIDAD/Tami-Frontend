import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
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

export default function RichTextEditor({ value, onChange }: Props) {
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
          "min-h-[250px] p-4 outline-none text-gray-700 text-base leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-2 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().undo().run()}>
          ↶
        </button>

        <button type="button" onClick={() => editor.chain().focus().redo().run()}>
          ↷
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>B</b>
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          ←
        </button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          ↔
        </button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          →
        </button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          ☰
        </button>
       <select
        className="border rounded px-2 py-1 text-sm bg-white"
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