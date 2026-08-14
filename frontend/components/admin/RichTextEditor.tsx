"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

interface RichTextEditorProps {
  value: string | null;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string; // e.g. "80px", "120px"
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
        isActive
          ? "bg-cyan-500 text-slate-950"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = "120px", }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-cyan-400 underline" },
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
            "prose prose-invert prose-sm max-w-none min-h-[120px] px-3 py-2.5 focus:outline-none leading-relaxed",
            style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Keep editor content in sync if the parent resets/loads new data
  // (e.g. after fetching About settings from the API).
  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="w-full min-h-[156px] bg-slate-950 border border-slate-800 rounded-xl animate-pulse" />
    );
  }

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-500 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-1 px-2 py-1.5 border-b border-slate-800 bg-slate-900/60">
        <ToolbarButton
          label="Bold"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <span className="w-px h-4 bg-slate-800 mx-1" />

        <ToolbarButton
          label="Heading"
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          "
        </ToolbarButton>

        <span className="w-px h-4 bg-slate-800 mx-1" />

        <ToolbarButton
          label="Link"
          isActive={editor.isActive("link")}
          onClick={setLink}
        >
          🔗
        </ToolbarButton>

        <span className="w-px h-4 bg-slate-800 mx-1" />

        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↺
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↻
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <div className="relative">
        {editor.isEmpty && placeholder && (
          <p className="pointer-events-none absolute top-2.5 left-3 text-slate-600 text-xs">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} className="text-white" />
      </div>
    </div>
  );
}