"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Edit3,
  X,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RichDescriptionEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  helperText?: string;
}

export default function RichDescriptionEditor({
  label,
  value,
  onChange,
  rows = 5,
  placeholder = "Add your product description...",
  helperText,
}: RichDescriptionEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isHeadingMenuOpen, setIsHeadingMenuOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Helper to replace or wrap current textarea selection
   */
  const insertText = useCallback(
    (before: string, after: string = "", defaultText: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      const selected = text.substring(start, end) || defaultText;
      const replacement = before + selected + after;

      const nextValue =
        text.substring(0, start) + replacement + text.substring(end);

      onChange(nextValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selected.length
        );
      }, 0);
    },
    [onChange]
  );

  /**
   * Applies Heading (e.g. #, ##, ###, ####, #####, ######) to current line or selection
   */
  const applyHeading = (level: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    setIsHeadingMenuOpen(false);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;

    // Find the start of the current line
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = text.indexOf("\n", start);
    const currentLineEnd = lineEnd === -1 ? text.length : lineEnd;
    const currentLine = text.substring(lineStart, currentLineEnd);

    // Strip any existing heading hashes
    const cleanedLine = currentLine.replace(/^#{1,6}\s*/, "");

    let newLine = cleanedLine;
    if (level === 1) newLine = `# ${cleanedLine}`;
    if (level === 2) newLine = `## ${cleanedLine}`;
    if (level === 3) newLine = `### ${cleanedLine}`;
    if (level === 4) newLine = `#### ${cleanedLine}`;
    if (level === 5) newLine = `##### ${cleanedLine}`;
    if (level === 6) newLine = `###### ${cleanedLine}`;

    const nextValue =
      text.substring(0, lineStart) + newLine + text.substring(currentLineEnd);

    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      const newCursor = lineStart + newLine.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  /**
   * Opens link modal with current selection as default text
   */
  const openLinkModal = () => {
    const textarea = textareaRef.current;
    const selected = textarea
      ? textarea.value.substring(
          textarea.selectionStart,
          textarea.selectionEnd
        )
      : "";

    setLinkText(selected || "");
    setLinkUrl("");
    setIsLinkModalOpen(true);
  };

  /**
   * Confirms and inserts [linkText](linkUrl)
   */
  const handleInsertLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl.trim()) return;

    let finalUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith("/")) {
      finalUrl = `https://${finalUrl}`;
    }

    const displayText = linkText.trim() || finalUrl;
    insertText(`[${displayText}](`, `)`, finalUrl);

    setIsLinkModalOpen(false);
    setLinkText("");
    setLinkUrl("");
  };

  /**
   * Applies bullet or numbered list
   */
  const applyList = (ordered: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = text.indexOf("\n", end);
    const effectiveEnd = lineEnd === -1 ? text.length : lineEnd;

    const selectedLines = text.substring(lineStart, effectiveEnd).split("\n");

    const newLines = selectedLines.map((line, idx) => {
      const stripped = line.replace(/^(\s*[-*+]|\s*\d+\.)\s*/, "");
      return ordered ? `${idx + 1}. ${stripped}` : `- ${stripped}`;
    });

    const replacement = newLines.join("\n");
    const nextValue =
      text.substring(0, lineStart) + replacement + text.substring(effectiveEnd);

    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  /**
   * Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        insertText("**", "**", "bold text");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        insertText("*", "*", "italic text");
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        openLinkModal();
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900">
          {label}
        </label>
        {/* Write / Preview Tab switcher */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "write"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Edit3 size={13} />
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "preview"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Eye size={13} />
            Preview
          </button>
        </div>
      </div>

      <div className="relative bg-white rounded-xl border border-gray-300 shadow-2xs transition-all">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50/90 border-b border-gray-200 text-gray-700 select-none rounded-t-xl">
          {/* Headings Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHeadingMenuOpen(!isHeadingMenuOpen)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
              title="Add Heading"
            >
              <Heading size={14} className="text-gray-600" />
              <span>Heading</span>
              <ChevronDown size={12} className="text-gray-400" />
            </button>

            {isHeadingMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsHeadingMenuOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => applyHeading(1)}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left text-sm hover:bg-purple-50 hover:text-purple-700 font-bold"
                  >
                    <Heading1 size={16} /> Heading 1
                  </button>
                  <button
                    type="button"
                    onClick={() => applyHeading(2)}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left text-sm hover:bg-purple-50 hover:text-purple-700 font-semibold"
                  >
                    <Heading2 size={16} /> Heading 2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyHeading(3)}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left text-sm hover:bg-purple-50 hover:text-purple-700 font-medium"
                  >
                    <Heading3 size={16} /> Heading 3
                  </button>
                  <button
                    type="button"
                    onClick={() => applyHeading(4)}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left text-sm hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Heading4 size={16} /> Heading 4
                  </button>
                  <button
                    type="button"
                    onClick={() => applyHeading(5)}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left text-xs hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Heading5 size={15} /> Heading 5
                  </button>
                  <button
                    type="button"
                    onClick={() => applyHeading(6)}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left text-xs hover:bg-purple-50 hover:text-purple-700 text-gray-500"
                  >
                    <Heading6 size={14} /> Heading 6
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => applyHeading(0)}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-100"
                  >
                    Paragraph (Normal Text)
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Bold */}
          <button
            type="button"
            onClick={() => insertText("**", "**", "bold text")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => insertText("*", "*", "italic text")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Link Option */}
          <button
            type="button"
            onClick={openLinkModal}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-purple-50 hover:text-purple-700 text-gray-700 transition-colors border border-transparent hover:border-purple-200"
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon size={14} className="text-purple-600" />
            <span>Link</span>
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => applyList(false)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
            title="Bullet List"
          >
            <List size={15} />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => applyList(true)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
            title="Numbered List"
          >
            <ListOrdered size={15} />
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Quote */}
          <button
            type="button"
            onClick={() => insertText("> ", "", "Quote")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
            title="Quote"
          >
            <Quote size={15} />
          </button>

          {/* Code */}
          <button
            type="button"
            onClick={() => insertText("`", "`", "code")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
            title="Inline Code"
          >
            <Code size={15} />
          </button>
        </div>

        {/* ── Content View ── */}
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-white text-gray-900 px-3.5 py-3 text-sm border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 ring-0 shadow-none resize-y font-sans leading-relaxed rounded-b-xl"
          />
        ) : (
          <div className="px-4 py-4 min-h-[120px] bg-white text-gray-900 prose prose-sm max-w-none prose-headings:font-bold prose-a:text-purple-600 prose-a:underline overflow-y-auto rounded-b-xl">
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-gray-900 mb-2 mt-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold text-gray-900 mb-2 mt-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold text-gray-900 mb-1 mt-2">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm font-bold text-gray-900 mb-1 mt-2">
                      {children}
                    </h4>
                  ),
                  h5: ({ children }) => (
                    <h5 className="text-xs font-bold text-gray-900 mb-1 mt-2">
                      {children}
                    </h5>
                  ),
                  h6: ({ children }) => (
                    <h6 className="text-xs font-semibold text-gray-600 mb-1 mt-1">
                      {children}
                    </h6>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-gray-800 leading-relaxed mb-2.5">
                      {children}
                    </p>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline inline-flex items-center gap-0.5"
                    >
                      {children}
                      <ExternalLink size={11} className="inline ml-0.5" />
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1 mb-2 text-sm text-gray-800">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1 mb-2 text-sm text-gray-800">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li>{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-300 pl-3 italic text-gray-600 my-2">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Nothing to preview yet. Switch back to Write mode to type.
              </p>
            )}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}

      {/* ── Add Link Modal ── */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <LinkIcon size={18} className="text-purple-600" />
                <span>Insert Link</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Text to display (optional)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Visit our website"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Link URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkUrl.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
