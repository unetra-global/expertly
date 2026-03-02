'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Link2, List, ListOrdered, Quote,
  Heading2, Heading3, ImageIcon, X, Sparkles, Send, CheckCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { MemberArticle, ServiceCategory } from '@/types/api';
import AIGeneratePanel from './AIGeneratePanel';

// ── Word Count Helper ────────────────────────────────────────────────────────

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

// ── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, isActive = false, disabled = false, title, children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-brand-blue text-white'
          : 'text-brand-text-secondary hover:bg-slate-100 hover:text-brand-text'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ── Confirm Submit Dialog ────────────────────────────────────────────────────

function SubmitDialog({ onConfirm, onCancel, isSubmitting }: {
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="font-semibold text-brand-text mb-2">Submit for review?</h3>
        <p className="text-sm text-brand-text-secondary mb-5">
          Your article will be reviewed by our team. We will notify you within 2 business days.
          You will not be able to edit while it is under review.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-brand-surface-alt transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Submitting…' : 'Submit article'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({ tags, setTags }: { tags: string[]; setTags: (t: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const t = input.toLowerCase().trim().slice(0, 30);
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
    }
    setInput('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-blue-subtle text-brand-blue text-xs rounded-full">
            {tag}
            <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {tags.length < 5 && (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            placeholder="Add tag…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          />
          <button
            onClick={addTag}
            className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-brand-surface-alt transition-colors"
          >
            Add
          </button>
        </div>
      )}
      <p className="text-xs text-brand-text-muted mt-1">{tags.length}/5 tags</p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface Props { articleId?: string }

export default function ArticleEditor({ articleId: initialArticleId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentArticleId, setCurrentArticleId] = useState(initialArticleId ?? '');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const featImageRef = useRef<HTMLInputElement>(null);
  const articleInlineImageRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCreatingRef = useRef(false);

  // ── Load categories ──────────────────────────────────────────────────────

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.taxonomy.categories(),
    queryFn: () => apiClient.get<ServiceCategory[]>('/taxonomy/categories'),
    staleTime: 3600_000,
  });

  // ── Load existing article ────────────────────────────────────────────────

  const { data: existingArticle } = useQuery({
    queryKey: queryKeys.articles.byId(currentArticleId),
    queryFn: () => apiClient.get<MemberArticle>(`/articles/id/${currentArticleId}`),
    enabled: !!currentArticleId,
    staleTime: 0,
  });

  // ── Tiptap Editor ────────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // ── Populate editor from existing article ────────────────────────────────

  useEffect(() => {
    if (!existingArticle || !editor) return;
    setTitle(existingArticle.title ?? '');
    setTags(existingArticle.tags ?? []);
    setCategoryId(existingArticle.categoryId ?? existingArticle.category?.id ?? '');
    setFeaturedImageUrl(existingArticle.featuredImageUrl ?? '');
    setRejectionReason(existingArticle.rejectionReason ?? '');
    if (existingArticle.body && editor.isEmpty) {
      editor.commands.setContent(existingArticle.body);
    }
  }, [existingArticle, editor]);

  // ── Auto-save ────────────────────────────────────────────────────────────

  const doSave = useCallback(async () => {
    if (!editor || editor.isEmpty) return;
    const body = editor.getHTML();

    setSaveStatus('saving');
    try {
      if (!currentArticleId && !isCreatingRef.current) {
        isCreatingRef.current = true;
        const draft = await apiClient.post<MemberArticle>('/articles', {
          title: title || 'Untitled',
          body,
          tags,
          categoryId: categoryId || undefined,
          featuredImageUrl: featuredImageUrl || undefined,
        });
        setCurrentArticleId(draft.id);
        // Update URL without hard navigation
        window.history.replaceState(null, '', `/member/articles/${draft.id}/edit`);
        isCreatingRef.current = false;
      } else if (currentArticleId) {
        await apiClient.patch(`/articles/${currentArticleId}`, {
          title: title || 'Untitled',
          body,
          tags,
          categoryId: categoryId || undefined,
          featuredImageUrl: featuredImageUrl || undefined,
        });
      }
      setSavedAt(new Date());
      setSaveStatus('saved');
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles.mine() });
    } catch {
      setSaveStatus('idle');
    }
  }, [editor, currentArticleId, title, tags, categoryId, featuredImageUrl, queryClient]);

  useEffect(() => {
    autoSaveRef.current = setInterval(() => { void doSave(); }, 30_000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [doSave]);

  // ── Word count ───────────────────────────────────────────────────────────

  const wordCount = editor ? countWords(editor.getHTML()) : 0;
  const canSubmit = wordCount >= 300 && !!featuredImageUrl && title.length >= 10 && !!currentArticleId;

  // ── Featured image upload ────────────────────────────────────────────────

  const uploadFeaturedImage = async (file: File) => {
    setFeaturedImageUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/upload/article-image`,
        { method: 'POST', body: form },
      );
      const json = (await resp.json()) as { data?: { url: string } };
      if (json.data?.url) setFeaturedImageUrl(json.data.url);
    } catch {
      // fail silently — user can retry
    } finally {
      setFeaturedImageUploading(false);
    }
  };

  // ── Inline image upload ──────────────────────────────────────────────────

  const uploadInlineImage = async (file: File) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/upload/article-image`,
        { method: 'POST', body: form },
      );
      const json = (await resp.json()) as { data?: { url: string } };
      if (json.data?.url && editor) {
        editor.chain().focus().setImage({ src: json.data.url }).run();
      }
    } catch {
      // fail silently
    }
  };

  // ── Link insertion ───────────────────────────────────────────────────────

  const insertLink = () => {
    const url = prompt('Enter URL');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // ── Submit article ───────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!currentArticleId) return;
    setIsSubmitting(true);
    try {
      await doSave(); // ensure latest saved
      await apiClient.post(`/articles/${currentArticleId}/submit`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles.mine() });
      router.push('/member/articles');
    } catch {
      setIsSubmitting(false);
    }
  };

  // ── AI panel callback ────────────────────────────────────────────────────

  const handleAIGenerated = useCallback((result: { title: string; body: string; tags: string[] }) => {
    setTitle(result.title);
    setTags(result.tags.slice(0, 5));
    if (editor) {
      editor.commands.setContent(result.body);
    }
  }, [editor]);

  // ── Save status label ────────────────────────────────────────────────────

  const saveLabel = saveStatus === 'saving'
    ? 'Saving…'
    : saveStatus === 'saved' && savedAt
      ? `Saved ${savedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : '';

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors';
  const labelCls = 'block text-xs font-medium text-brand-text-secondary mb-1';

  return (
    <>
      {showSubmitDialog && (
        <SubmitDialog
          onConfirm={() => { void handleSubmit(); }}
          onCancel={() => { setShowSubmitDialog(false); setIsSubmitting(false); }}
          isSubmitting={isSubmitting}
        />
      )}

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden relative">
        {/* AI Panel */}
        {showAI && editor && (
          <AIGeneratePanel
            categoryId={categoryId}
            onGenerated={handleAIGenerated}
            onClose={() => setShowAI(false)}
          />
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 bg-white flex-wrap">
            {editor && (
              <>
                <ToolbarBtn
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  isActive={editor.isActive('heading', { level: 2 })}
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  isActive={editor.isActive('heading', { level: 3 })}
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </ToolbarBtn>
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <ToolbarBtn
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editor.isActive('bold')}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={insertLink} isActive={editor.isActive('link')} title="Insert link">
                  <Link2 className="w-4 h-4" />
                </ToolbarBtn>
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <ToolbarBtn
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  isActive={editor.isActive('bulletList')}
                  title="Bullet list"
                >
                  <List className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive('orderedList')}
                  title="Numbered list"
                >
                  <ListOrdered className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  isActive={editor.isActive('blockquote')}
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => articleInlineImageRef.current?.click()}
                  title="Insert image"
                >
                  <ImageIcon className="w-4 h-4" />
                </ToolbarBtn>
                <input
                  type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  ref={articleInlineImageRef}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadInlineImage(f); }}
                />
              </>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Save status */}
            {saveLabel && (
              <span className="flex items-center gap-1.5 text-xs text-brand-text-muted mr-2">
                {saveStatus === 'saved' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                {saveLabel}
              </span>
            )}

            {/* AI Generate button */}
            <button
              onClick={() => setShowAI(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-brand-blue text-brand-blue rounded-lg hover:bg-brand-blue-subtle transition-colors mr-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate with AI
            </button>

            {/* Submit button */}
            <button
              onClick={() => setShowSubmitDialog(true)}
              disabled={!canSubmit}
              title={!canSubmit ? 'Complete all requirements before submitting' : 'Submit for review'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </button>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto bg-white">
            {rejectionReason && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-red-700 mb-0.5">Rejection reason</p>
                <p className="text-sm text-red-600">{rejectionReason}</p>
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-72 border-l border-slate-200 bg-brand-surface overflow-y-auto p-5 space-y-6 shrink-0">
          {/* Title */}
          <div>
            <label className={labelCls}>Title ({title.length} chars, min 10)</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title…"
            />
          </div>

          {/* Word count */}
          <div>
            <label className={labelCls}>Word count</label>
            <p className={`text-xl font-bold ${wordCount >= 300 ? 'text-green-600' : 'text-red-500'}`}>
              {wordCount}
              <span className="text-sm font-normal text-brand-text-muted ml-1">/ min 300</span>
            </p>
          </div>

          {/* Featured image */}
          <div>
            <label className={labelCls}>Featured image {!featuredImageUrl && <span className="text-red-500">(required)</span>}</label>
            {featuredImageUrl ? (
              <div className="relative">
                <img src={featuredImageUrl} alt="Featured" className="w-full h-32 object-cover rounded-lg" />
                <button
                  onClick={() => setFeaturedImageUrl('')}
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-0.5"
                >
                  <X className="w-4 h-4 text-brand-text" />
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file" accept="image/jpeg,image/png" className="hidden"
                  ref={featImageRef}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadFeaturedImage(f); }}
                />
                <button
                  onClick={() => featImageRef.current?.click()}
                  disabled={featuredImageUploading}
                  className="w-full flex items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-200 rounded-lg text-sm text-brand-text-muted hover:border-brand-blue hover:text-brand-blue disabled:opacity-50 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                  {featuredImageUploading ? 'Uploading…' : 'Upload image'}
                </button>
              </>
            )}
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category {!categoryId && <span className="text-red-500">(required)</span>}</label>
            <select
              className={inputCls}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>Tags</label>
            <TagInput tags={tags} setTags={setTags} />
          </div>

          {/* Submit requirements */}
          <div className="border border-slate-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">Requirements</p>
            {[
              { ok: title.length >= 10, label: 'Title (10+ chars)' },
              { ok: wordCount >= 300, label: `300+ words (${wordCount})` },
              { ok: !!featuredImageUrl, label: 'Featured image' },
              { ok: !!categoryId, label: 'Category selected' },
            ].map((req) => (
              <div key={req.label} className={`flex items-center gap-2 text-xs ${req.ok ? 'text-green-600' : 'text-brand-text-muted'}`}>
                <CheckCircle className={`w-3.5 h-3.5 ${req.ok ? 'text-green-500' : 'text-slate-300'}`} />
                {req.label}
              </div>
            ))}
          </div>

          {/* Manual save */}
          <button
            onClick={() => void doSave()}
            disabled={saveStatus === 'saving'}
            className="w-full py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            Save draft now
          </button>
        </aside>
      </div>
    </>
  );
}
