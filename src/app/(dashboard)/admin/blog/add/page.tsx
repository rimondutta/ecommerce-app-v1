"use client";

import React, { useState, useRef, useCallback } from "react"
import { Megaphone, Image as ImageIcon, Bold, Italic, List, Quote, Minus } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/playshelf/Toast"

// ─── Toolbar button definition ───────────────────────────────────────────────
interface ToolbarItem {
  label: string;
  title: string;
  action: () => void;
  active?: boolean;
}

// ─── Heading levels ──────────────────────────────────────────────────────────
const HEADINGS = [
  { tag: "h1", label: "H1", title: "Heading 1 — <h1>" },
  { tag: "h2", label: "H2", title: "Heading 2 — <h2>" },
  { tag: "h3", label: "H3", title: "Heading 3 — <h3>" },
  { tag: "h4", label: "H4", title: "Heading 4 — <h4>" },
  { tag: "h5", label: "H5", title: "Heading 5 — <h5>" },
  { tag: "h6", label: "H6", title: "Heading 6 — <h6>" },
];

export default function BlogUploadPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  // ─── Insert HTML tag around selection or at cursor ─────────────────────────
  const insertTag = useCallback((openTag: string, closeTag: string, defaultText = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || defaultText;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const inserted = `${openTag}${selected}${closeTag}`;
    const newContent = `${before}${inserted}${after}`;
    setContent(newContent);

    // Restore caret position after react re-render
    requestAnimationFrame(() => {
      if (!ta) return;
      const cursorPos = start + openTag.length + selected.length + closeTag.length;
      ta.selectionStart = cursorPos;
      ta.selectionEnd = cursorPos;
      ta.focus();
    });
  }, [content]);

  // ─── Insert a block tag on its own line ────────────────────────────────────
  const insertBlockTag = useCallback((tag: string, defaultText = "Heading text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || defaultText;
    const before = content.slice(0, start);
    const after = content.slice(end);
    // Ensure new line before and after block tags
    const prefix = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const suffix = after.length > 0 && !after.startsWith("\n") ? "\n" : "";
    const inserted = `${prefix}<${tag}>${selected}</${tag}>${suffix}`;
    const newContent = `${before}${inserted}${after}`;
    setContent(newContent);

    requestAnimationFrame(() => {
      if (!ta) return;
      const cursorPos = before.length + prefix.length + `<${tag}>`.length + selected.length + `</${tag}>`.length + suffix.length;
      ta.selectionStart = cursorPos;
      ta.selectionEnd = cursorPos;
      ta.focus();
    });
  }, [content]);

  // ─── Insert line tag (hr) ──────────────────────────────────────────────────
  const insertHr = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    const start = ta.selectionStart;
    const before = content.slice(0, start);
    const after = content.slice(start);
    const prefix = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const inserted = `${prefix}<hr />\n`;
    setContent(before + inserted + after);
    requestAnimationFrame(() => {
      if (!ta) return;
      const pos = before.length + inserted.length;
      ta.selectionStart = pos;
      ta.selectionEnd = pos;
      ta.focus();
    });
  }, [content]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !file) {
      showToast("Please fill all required fields including image.", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload image");
      const imageUrl = uploadData.url;

      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const blogRes = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, excerpt, content, category,
          tags: tagArray,
          featuredImage: { url: imageUrl, alt: title },
          isPublished: true,
          publishedAt: new Date(),
        }),
      });

      if (!blogRes.ok) {
        const blogData = await blogRes.json();
        throw new Error(blogData.error || "Failed to publish post");
      }

      showToast("Blog post published successfully!", "success");
      setTitle(""); setExcerpt(""); setContent(""); setTags(""); setFile(null); setPreview("");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Build toolbar items ───────────────────────────────────────────────────
  const inlineTools: ToolbarItem[] = [
    { label: "B", title: "Bold — <strong>", action: () => insertTag("<strong>", "</strong>", "bold text") },
    { label: "I", title: "Italic — <em>",   action: () => insertTag("<em>", "</em>", "italic text") },
  ];

  const blockTools: ToolbarItem[] = [
    { label: "UL", title: "Unordered List — <ul>", action: () => insertTag("<ul>\n  <li>", "</li>\n</ul>", "List item") },
    { label: "OL", title: "Ordered List — <ol>",   action: () => insertTag("<ol>\n  <li>", "</li>\n</ol>", "List item") },
    { label: "❝",  title: "Blockquote — <blockquote>", action: () => insertBlockTag("blockquote", "Quote text") },
    { label: "P",  title: "Paragraph — <p>",           action: () => insertBlockTag("p", "Paragraph text") },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center border border-gray-200">
          <Megaphone size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Upload Blog Post</h1>
          <p className="text-sm text-gray-500 mt-1">Publish new content to the storefront</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form className="space-y-6" onSubmit={handlePublish}>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">Post Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full !bg-white !text-black border border-gray-300 rounded-md py-2 px-3 text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400"
              placeholder="Enter an engaging title..."
              required
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full !bg-white !text-black border border-gray-300 rounded-md py-2 px-3 min-h-[80px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y placeholder:text-gray-400"
              placeholder="A short summary of the post..."
              required
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">Cover Image</label>
            <div className="relative w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer bg-gray-50 overflow-hidden min-h-[200px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
              />
              {preview ? (
                <Image src={preview} alt="Preview" fill unoptimized sizes="(max-width: 768px) 100vw, 800px" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" />
              ) : null}
              <div className="z-10 flex flex-col items-center bg-white/80 p-4 rounded-xl shadow-sm pointer-events-none">
                <ImageIcon size={32} className="mb-3 text-gray-800" />
                <p className="font-medium text-sm text-gray-900">Click or drag image to upload</p>
                <p className="text-xs text-gray-600 mt-1">Recommended size: 1200x630px</p>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">Content</label>

            {/* ── Toolbar ── */}
            <div className="border border-gray-300 rounded-t-md bg-gray-50 flex flex-wrap items-center gap-1 px-2 py-1.5">

              {/* Heading buttons H1–H6 */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-1">
                {HEADINGS.map(({ tag, label, title }) => (
                  <button
                    key={tag}
                    type="button"
                    title={title}
                    onClick={() => insertBlockTag(tag, `${label} Heading`)}
                    className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded transition-colors font-mono"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Inline tools */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-1">
                {inlineTools.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    title={t.title}
                    onClick={t.action}
                    className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded transition-colors font-mono"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Block tools */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-1">
                {blockTools.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    title={t.title}
                    onClick={t.action}
                    className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded transition-colors font-mono flex items-center gap-1"
                  >
                    {t.label === "UL" && <List size={12} />}
                    {t.label === "OL" && <List size={12} />}
                    {t.label === "❝" && <Quote size={12} />}
                    {t.label === "P" && "P"}
                    {t.label !== "P" && t.label !== "❝" ? "" : ""}
                    <span>{t.label === "❝" ? "Quote" : t.label === "P" ? "" : t.label}</span>
                  </button>
                ))}
              </div>

              {/* HR */}
              <button
                type="button"
                title="Horizontal Rule — <hr />"
                onClick={insertHr}
                className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
              >
                <Minus size={12} />
                <span>HR</span>
              </button>

              {/* Help hint */}
              <span className="ml-auto text-[10px] text-gray-400 hidden sm:block">
                Select text then click a tag, or click to insert at cursor
              </span>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full !bg-white !text-black border border-gray-300 border-t-0 rounded-b-md py-3 px-3 min-h-[380px] text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y placeholder:text-gray-400"
              placeholder={`<h2>Section Heading</h2>\n\n<p>Start writing your blog content here. Use the toolbar above to insert headings, bold, italic, lists, and more.</p>\n\n<h3>Subheading</h3>\n\n<p>More content...</p>`}
              required
            />

            {/* Preview hint */}
            <p className="text-[11px] text-gray-400">
              HTML tags are rendered on the blog page. Use the toolbar above to insert formatted tags.
            </p>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full !bg-white !text-black border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. Technology, Fashion, Education"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full !bg-white !text-black border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400"
                placeholder="toys, kids, education"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white border border-transparent text-sm font-medium py-3 rounded-md hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
