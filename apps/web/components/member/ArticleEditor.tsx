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
  Heading2, Heading3, ImageIcon, X, Sparkles, Send,
  CheckCircle, ArrowLeft, Clock, Save,
} from 'lucide-react';
import NextLink from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { MemberArticle, Category } from '@/types/api';
import AIGeneratePanel from './AIGeneratePanel';

// ── Word Count ────────────────────────────────────────────────────────────────

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

// ── Toolbar Button ────────────────────────────────────────────────────────────

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
      className={`p-2 rounded-lg transition-colors text-sm ${
        isActive
          ? 'bg-brand-navy text-white'
          : 'text-brand-text-secondary hover:bg-gray-100 hover:text-brand-navy'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ── Submit Dialog ─────────────────────────────────────────────────────────────

function SubmitDialog({ onConfirm, onCancel, isSubmitting, error }: {
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-7">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <Send className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-base font-bold text-brand-navy text-center mb-2">Submit for review?</h3>
        <p className="text-sm text-brand-text-muted text-center leading-relaxed mb-4">
          Your article will be reviewed by our editorial team. We will notify you within 2 business days.
          You won&apos;t be able to edit while it&apos;s under review.
        </p>
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 text-center">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-navy rounded-xl hover:bg-brand-navy/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Submitting…' : 'Submit article'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tag Input ─────────────────────────────────────────────────────────────────

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
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-blue-subtle border border-blue-100 text-brand-blue text-xs font-medium rounded-full">
            #{tag}
            <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-500 transition-colors ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {tags.length < 5 && (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
            placeholder="Type tag and press Enter…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Add
          </button>
        </div>
      )}
      <p className="text-[11px] text-brand-text-muted mt-1.5">{tags.length}/5 tags · press Enter to add</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const featImageRef = useRef<HTMLInputElement>(null);
  const articleInlineImageRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCreatingRef = useRef(false);
  const triggerSaveAfterAI = useRef(false);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.taxonomy.categories(),
    queryFn: () => apiClient.get<Category[]>('/taxonomy/categories'),
    staleTime: 3600_000,
  });

  const { data: existingArticle } = useQuery({
    queryKey: queryKeys.articles.byId(currentArticleId),
    queryFn: () => apiClient.get<MemberArticle>(`/articles/id/${currentArticleId}`),
    enabled: !!currentArticleId,
    staleTime: 0,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: [
          'prose prose-base max-w-none',
          'prose-headings:text-brand-navy prose-headings:font-bold prose-headings:leading-snug',
          'prose-p:text-brand-text-secondary prose-p:leading-relaxed',
          'prose-strong:text-brand-navy',
          'prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline',
          'prose-blockquote:border-l-4 prose-blockquote:border-brand-blue prose-blockquote:pl-4 prose-blockquote:text-brand-text-secondary prose-blockquote:not-italic',
          'prose-ul:text-brand-text-secondary prose-ol:text-brand-text-secondary',
          'prose-code:bg-gray-50 prose-code:text-brand-navy prose-code:rounded prose-code:px-1 prose-code:text-sm',
          'focus:outline-none min-h-[500px] px-1 py-2',
        ].join(' '),
      },
    },
  });

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

  const doSave = useCallback(async (): Promise<string | null> => {
    if (!editor || editor.isEmpty) return null;
    const body = editor.getHTML();
    setSaveStatus('saving');
    try {
      let articleId = currentArticleId;
      if (!articleId) {
        if (isCreatingRef.current) return null;
        isCreatingRef.current = true;
        try {
          const draft = await apiClient.post<MemberArticle>('/articles', {
            title: title || 'Untitled',
            body,
            tags,
            categoryId: categoryId || undefined,
            featuredImageUrl: featuredImageUrl || undefined,
          });
          articleId = draft.id;
          setCurrentArticleId(draft.id);
          window.history.replaceState(null, '', `/member/articles/${draft.id}/edit`);
        } finally {
          isCreatingRef.current = false;
        }
      } else {
        await apiClient.patch(`/articles/${articleId}`, {
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
      return articleId;
    } catch {
      setSaveStatus('idle');
      return null;
    }
  }, [editor, currentArticleId, title, tags, categoryId, featuredImageUrl, queryClient]);

  useEffect(() => {
    autoSaveRef.current = setInterval(() => { void doSave(); }, 30_000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [doSave]);

  // Auto-save once after AI generation populates all fields
  useEffect(() => {
    if (triggerSaveAfterAI.current) {
      triggerSaveAfterAI.current = false;
      void doSave();
    }
  }, [doSave]);

  const wordCount = editor ? countWords(editor.getHTML()) : 0;
  const canSubmit = wordCount >= 300 && !!featuredImageUrl && title.length >= 10 && !!categoryId;

  const uploadFeaturedImage = async (file: File) => {
    setFeaturedImageUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const result = await apiClient.upload<{ url: string }>('/upload/article-image', form);
      if (result?.url) setFeaturedImageUrl(result.url);
    } catch {
      // fail silently
    } finally {
      setFeaturedImageUploading(false);
    }
  };

  const uploadInlineImage = async (file: File) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const result = await apiClient.upload<{ url: string }>('/upload/article-image', form);
      if (result?.url && editor) {
        editor.chain().focus().setImage({ src: result.url }).run();
      }
    } catch {
      // fail silently
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const articleId = await doSave();
      if (!articleId) {
        setSubmitError('Could not save your article. Please try again.');
        setIsSubmitting(false);
        return;
      }
      await apiClient.post(`/articles/${articleId}/submit`, {});
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles.mine() });
      setShowSubmitDialog(false);
      router.push('/member/articles');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  const handleAIGenerated = useCallback((result: { title: string; body: string; tags: string[]; featuredImageUrl?: string; categoryId?: string }) => {
    setTitle(result.title);
    setTags(result.tags.slice(0, 5));
    if (result.featuredImageUrl) setFeaturedImageUrl(result.featuredImageUrl);
    if (result.categoryId) setCategoryId(result.categoryId);
    triggerSaveAfterAI.current = true;
    if (editor) {
      editor.commands.setContent(result.body);
    }
  }, [editor]);

  const saveLabel = saveStatus === 'saving'
    ? 'Saving…'
    : saveStatus === 'saved' && savedAt
      ? `Saved at ${savedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : null;

  const requirements = [
    { ok: title.length >= 10, label: 'Title (10+ chars)' },
    { ok: wordCount >= 300, label: `300+ words (${wordCount} now)` },
    { ok: !!featuredImageUrl, label: 'Featured image uploaded' },
    { ok: !!categoryId, label: 'Category selected' },
  ];

  return (
    <>
      {showSubmitDialog && (
        <SubmitDialog
          onConfirm={() => { void handleSubmit(); }}
          onCancel={() => { setShowSubmitDialog(false); setIsSubmitting(false); setSubmitError(null); }}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      )}

      {showAI && editor && (
        <AIGeneratePanel
          categoryId={categoryId}
          onGenerated={handleAIGenerated}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* ── Page Header (navy) ───────────────────────────────────────────── */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NextLink
            href="/member/articles"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            My Articles
          </NextLink>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-label mb-1">Member Portal</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {currentArticleId ? 'Edit Article' : 'Write Article'}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0 mt-1">
              {/* Save status */}
              {saveLabel && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 mr-1">
                  <Clock className="w-3.5 h-3.5" />
                  {saveLabel}
                </span>
              )}

              {/* Generate with AI */}
              <button
                onClick={() => setShowAI(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">

          {/* ── Main Editor Column ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Rejection banner */}
            {rejectionReason && (
              <div className="flex gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-0.5 uppercase tracking-wide">Rejection reason</p>
                  <p className="text-sm text-red-600">{rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Editor card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">

              {/* Title input */}
              <div className="px-8 pt-8 pb-4 border-b border-gray-50">
                <textarea
                  className="w-full text-2xl sm:text-3xl font-bold text-brand-navy placeholder:text-gray-300 bg-transparent border-none outline-none resize-none leading-snug"
                  rows={2}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title…"
                />
                <p className="text-xs text-brand-text-muted mt-1">
                  {title.length} chars
                  {title.length > 0 && title.length < 10 && (
                    <span className="text-amber-500 ml-1">· needs 10+ characters</span>
                  )}
                </p>
              </div>

              {/* Formatting toolbar */}
              <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 flex-wrap">
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
                    <div className="w-px h-5 bg-gray-200 mx-1.5" />
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
                    <div className="w-px h-5 bg-gray-200 mx-1.5" />
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

                    {/* Word count in toolbar */}
                    <div className="flex-1" />
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      wordCount >= 300
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {wordCount} words{wordCount < 300 ? ` · ${300 - wordCount} to go` : ' ✓'}
                    </span>
                  </>
                )}
              </div>

              {/* Editor body */}
              <div className="px-8 py-6">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 shrink-0 sticky top-6 self-start">

            {/* Featured image */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-3">
                Featured Image
                {!featuredImageUrl && <span className="text-red-400 ml-1">(required)</span>}
              </p>
              {featuredImageUrl ? (
                <div className="relative rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredImageUrl} alt="Featured" className="w-full h-36 object-cover" />
                  <button
                    onClick={() => setFeaturedImageUrl('')}
                    className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-brand-navy" />
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
                    className="w-full flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-gray-200 rounded-xl text-sm text-brand-text-muted hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue-subtle/30 disabled:opacity-50 transition-all"
                  >
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs">{featuredImageUploading ? 'Uploading…' : 'Click to upload'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-3">
                Category
                {!categoryId && <span className="text-red-400 ml-1">(required)</span>}
              </p>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-3">Tags</p>
              <TagInput tags={tags} setTags={setTags} />
            </div>

            {/* Submission requirements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-3">
                Submission Requirements
              </p>
              <div className="space-y-2.5">
                {requirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      req.ok ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <CheckCircle className={`w-3 h-3 ${req.ok ? 'text-green-600' : 'text-gray-300'}`} />
                    </div>
                    <span className={`text-xs ${req.ok ? 'text-green-700 font-medium' : 'text-brand-text-muted'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => void doSave()}
                  disabled={saveStatus === 'saving'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold border border-gray-200 text-brand-navy rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' ? 'Saving…' : 'Save Draft'}
                </button>
                <button
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={!canSubmit}
                  title={!canSubmit ? 'Complete all requirements before submitting' : undefined}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-brand-blue rounded-xl hover:bg-brand-blue-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Submit for Review
                </button>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}
