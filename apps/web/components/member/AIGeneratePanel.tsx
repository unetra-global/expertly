'use client';

import { useState, useRef } from 'react';
import { X, Sparkles, RotateCcw, Paperclip, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001') + '/api/v1';

// ── Questions ─────────────────────────────────────────────────────────────────

interface QuestionConfig {
  label: string;
  placeholder: string;
}

const DEFAULT_QUESTIONS: QuestionConfig[] = [
  {
    label: 'Topic / Title',
    placeholder: 'e.g. Recent CESTAT ruling on Section 16 ITC eligibility',
  },
  {
    label: 'Specify your target audience and region, if any?',
    placeholder: 'e.g. Indian CA firms and in-house tax teams',
  },
  {
    label: 'Your thoughts / notes',
    placeholder: 'The key points, arguments, or angles you want to cover…',
  },
  {
    label: 'Any recent developments or regulations for this topic?',
    placeholder: 'Notifications, circulars, rulings, amendments — the AI will also search for more',
  },
  {
    label: 'Your practical advice / key takeaways',
    placeholder: 'What should the reader do differently after reading this?',
  },
  {
    label: 'Any illustration / table / case study you wish to include',
    placeholder: 'e.g. Pre vs post-amendment comparison, Facts of X v. CIT, etc.',
  },
  {
    label: 'Any specific prompt / tone you want the AI to consider while generating the article',
    placeholder: 'e.g. More conservative tone, avoid speculation on pending cases, 1,200 words, etc.',
  },
];

const RESEARCH_LINKS_QUESTION = 'Research links the AI should reference';

interface GeneratedResult {
  title: string;
  body: string;
  tags: string[];
  featuredImageUrl?: string;
  categoryId?: string;
}

function normalizeGeneratedResult(input: unknown): GeneratedResult {
  const obj = (input ?? {}) as {
    title?: unknown;
    body?: unknown;
    tags?: unknown;
    featuredImageUrl?: unknown;
    categoryId?: unknown;
  };

  const title = typeof obj.title === 'string' ? obj.title.trim() : '';
  const body = typeof obj.body === 'string' ? obj.body.trim() : '';
  const tags = Array.isArray(obj.tags)
    ? obj.tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean).slice(0, 5)
    : [];
  const featuredImageUrl = typeof obj.featuredImageUrl === 'string' ? obj.featuredImageUrl : undefined;
  const categoryId = typeof obj.categoryId === 'string' ? obj.categoryId : undefined;

  if (!title || !body) {
    throw new Error('AI response is missing title/body content.');
  }

  return { title, body, tags, featuredImageUrl, categoryId };
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  categoryId?: string;
  onGenerated: (result: GeneratedResult) => void;
  onClose: () => void;
}

interface Attachment {
  type: 'text' | 'image';
  content: string;
  filename: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function AIGeneratePanel({ categoryId, onGenerated, onClose }: Props) {
  const [answers, setAnswers] = useState<string[]>(DEFAULT_QUESTIONS.map(() => ''));
  const [researchLinks, setResearchLinks] = useState<string[]>(['']);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setAnswer = (idx: number, val: string) =>
    setAnswers((prev) => prev.map((a, i) => (i === idx ? val : a)));

  const setLink = (idx: number, val: string) =>
    setResearchLinks((prev) => prev.map((l, i) => (i === idx ? val : l)));

  const addLink = () => setResearchLinks((prev) => [...prev, '']);
  const removeLink = (idx: number) =>
    setResearchLinks((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      const supabase = getBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setUploadError('Not authenticated. Please refresh and try again.');
        return;
      }

      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_BYTES) {
          setUploadError(`"${file.name}" exceeds the 5 MB limit.`);
          continue;
        }

        const fd = new FormData();
        fd.append('file', file);

        const resp = await fetch(`${API_BASE}/articles/generate/extract`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        });

        if (!resp.ok) {
          let msg = '';
          try {
            const err = await resp.json() as { message?: string };
            msg = err.message ?? '';
          } catch {
            msg = resp.statusText;
          }
          setUploadError(`"${file.name}" could not be processed: ${msg || resp.status}`);
          continue;
        }

        const payload = await resp.json() as {
          success?: boolean;
          data?: Attachment;
        };
        const att = payload.data;
        if (att?.type && att.content) {
          setAttachments((prev) => [...prev, att]);
        }
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setProgress(0);

    const qa = DEFAULT_QUESTIONS.map((q, i) => ({
      question: q.label,
      answer: answers[i] ?? '',
    }));

    const cleanedLinks = researchLinks.map((l) => l.trim()).filter(Boolean);
    if (cleanedLinks.length > 0) {
      qa.push({
        question: RESEARCH_LINKS_QUESTION,
        answer: cleanedLinks.map((l) => `- ${l}`).join('\n'),
      });
    }

    // Get auth token
    const supabase = getBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError('Not authenticated. Please refresh and try again.');
      setIsGenerating(false);
      return;
    }

    abortRef.current = new AbortController();

    try {
      const resp = await fetch(`${API_BASE}/articles/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          qa,
          ...(categoryId ? { categoryId } : {}),
          ...(attachments.length > 0 ? { attachments } : {}),
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        let bodyText = '';
        try {
          bodyText = (await resp.text()).trim();
        } catch {
          bodyText = '';
        }
        const extra = bodyText ? ` ${bodyText.slice(0, 240)}` : '';
        throw new Error(`Generation failed (${resp.status} ${resp.statusText}).${extra}`);
      }

      if (!resp.body) {
        throw new Error('Generation failed: empty response stream.');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let progressTick = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (!payload || payload === '[DONE]') continue;

          let parsed: {
            type?: string;
            token?: string;
            data?: GeneratedResult;
            message?: string;
          } | null = null;

          try {
            parsed = JSON.parse(payload) as {
              type?: string;
              token?: string;
              data?: GeneratedResult;
              message?: string;
            };
          } catch {
            parsed = null;
          }

          if (!parsed) continue;

          if (parsed.type === 'done' && parsed.data) {
            // Final structured result
            setProgress(100);
            setIsGenerating(false);
            const safeResult = normalizeGeneratedResult(parsed.data);
            try {
              onGenerated(safeResult);
              onClose();
            } catch (applyErr) {
              const applyMessage = applyErr instanceof Error ? applyErr.message : 'Unable to apply generated article to editor.';
              throw new Error(`Generated article received, but failed to apply: ${applyMessage}`);
            }
            return;
          }

          if (parsed.type === 'error') {
            throw new Error(parsed.message ?? 'AI generation failed');
          }

          if (parsed.token) {
            progressTick = Math.min(95, progressTick + 0.5);
            setProgress(Math.round(progressTick));
          }
        }
      }

      throw new Error('AI generation was interrupted before completion. Please try again.');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const isFetchNetworkError =
        err instanceof TypeError && /failed to fetch/i.test(err.message);
      const message = isFetchNetworkError
        ? 'Could not connect to AI service. Ensure API is running at http://localhost:4001 and that you are opening the app on localhost/127.0.0.1.'
        : err instanceof Error
          ? err.message
          : 'AI generation failed. Please try again.';
      // Keep this log to troubleshoot SSE failures in production-like envs.
      console.error('AIGeneratePanel.handleGenerate failed', err);
      setError(message);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Modal */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-brand-navy text-sm">Generate with AI</h2>
              <p className="text-xs text-brand-text-muted">Answer a few questions to draft your article</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-text-muted hover:text-brand-navy hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {isGenerating ? (
            <div className="py-6 space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-brand-blue-subtle flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-brand-blue animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-brand-navy mb-1">Writing your article…</p>
                <p className="text-xs text-brand-text-muted">This usually takes 15–30 seconds</p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-blue rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-brand-text-muted text-center">{progress}% complete</p>
            </div>
          ) : error ? (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); }}
                className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline"
              >
                <RotateCcw className="w-4 h-4" />
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-brand-text-muted leading-relaxed">
                The more detail you provide, the better your article draft will be. All fields are optional — fill in whatever is relevant.
              </p>

              {DEFAULT_QUESTIONS.map((q, idx) => (
                <div key={idx} className="group">
                  <label className="flex items-start gap-2.5 text-sm font-semibold text-brand-navy mb-2">
                    <span className="w-5 h-5 rounded-full bg-brand-blue-subtle text-brand-blue flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {q.label}
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue resize-none transition-colors placeholder:text-gray-300"
                    rows={2}
                    value={answers[idx] ?? ''}
                    onChange={(e) => setAnswer(idx, e.target.value)}
                    placeholder={q.placeholder}
                  />
                </div>
              ))}

              {/* Research links */}
              <div className="group">
                <label className="flex items-start gap-2.5 text-sm font-semibold text-brand-navy mb-1">
                  <span className="w-5 h-5 rounded-full bg-brand-blue-subtle text-brand-blue flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {DEFAULT_QUESTIONS.length + 1}
                  </span>
                  Upload relevant documents / links
                </label>
                <p className="text-xs text-brand-text-muted ml-[30px] mb-2">
                  Paste URLs to rulings, notifications, articles, or other sources the AI should reference.
                </p>
                <div className="space-y-2">
                  {researchLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors placeholder:text-gray-300"
                        value={link}
                        onChange={(e) => setLink(idx, e.target.value)}
                        placeholder="https://…"
                      />
                      {researchLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(idx)}
                          className="w-9 h-9 flex items-center justify-center text-brand-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove link"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addLink}
                  className="mt-2 text-xs font-medium text-brand-blue hover:underline"
                >
                  + Add another link
                </button>

                {/* File upload */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-brand-text-muted mb-2">
                    Or upload documents / screenshots the AI should reference (PDF, DOCX, XLSX, images, etc. — max 5 MB each).
                  </p>

                  {attachments.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                        >
                          {att.type === 'image' ? (
                            <ImageIcon className="w-4 h-4 text-brand-blue shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-brand-blue shrink-0" />
                          )}
                          <span className="flex-1 text-sm text-brand-text truncate">
                            {att.filename}
                          </span>
                          <span className="text-[10px] text-brand-text-muted uppercase tracking-wide">
                            {att.type}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="text-brand-text-muted hover:text-red-600 transition-colors"
                            aria-label={`Remove ${att.filename}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => void handleFileUpload(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 text-xs font-medium text-brand-blue hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Paperclip className="w-3.5 h-3.5" />
                        Upload document / image
                      </>
                    )}
                  </button>

                  {uploadError && (
                    <p className="mt-2 text-xs text-red-600">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 shrink-0">
          {isGenerating ? (
            <button
              onClick={handleCancel}
              className="w-full py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel generation
            </button>
          ) : error ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleGenerate()}
                disabled={
                  answers.every((a) => !a.trim()) &&
                  researchLinks.every((l) => !l.trim()) &&
                  attachments.length === 0
                }
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-brand-navy rounded-xl hover:bg-brand-navy/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Generate article draft
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
