"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

/**
 * Wraps TipTap for the admin panel's *_html fields (answer_html, body_html,
 * bio_html, description_html). Emits sanitized-on-the-server HTML via
 * onChange — the Go API re-sanitizes with bluemonday regardless, so this
 * only needs to produce reasonable markup, not guarantee safety client-side.
 *
 * The toolbar carries what a clinic writing a column actually reaches for: bold,
 * italic, both lists, two heading levels, a blockquote for citing a statute, and
 * links. H3 and the quote were reachable by keyboard shortcut but had no button,
 * so in practice nobody used them. The public site already styles everything
 * StarterKit can emit, whether it arrives from these buttons or from a paste.
 */
export function HubRichTextEditor({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "hub-rich-text__content",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={`hub-rich-text ${className}`.trim()}>
      <div className="hub-rich-text__toolbar">
        <button
          type="button"
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Lista
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Lista
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Cita
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("URL del enlace");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Enlace
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
