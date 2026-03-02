'use client';

import { useState, useRef } from 'react';
import { X, Sparkles, RotateCcw, ChevronRight } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// ── Questions ─────────────────────────────────────────────────────────────────

const DEFAULT_QUESTIONS = [
  'What specific topic or issue will this article address?',
  'Who is your target audience for this piece?',
  'What are the key points or arguments you want to make?',
  'Are there any recent developments, regulations, or cases that prompted this article?',
  'What practical advice or takeaways should readers leave with?',
  'Do you have any real examples or anonymised case studies to include?',
];

interface GeneratedResult {
  title: string;
  body: string;
  tags: string[];
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  categoryId?: string;
  onGenerated: (result: GeneratedResult) => void;
  onClose: () => void;
}

export default function AIGeneratePanel({ categoryId, onGenerated, onClose }: Props) {
  const [answers, setAnswers] = useState<string[]>(DEFAULT_QUESTIONS.map(() => ''));
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setAnswer = (idx: number, val: string) =>
    setAnswers((prev) => prev.map((a, i) => (i === idx ? val : a)));

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setProgress(0);
    setStreamedText('');

    const qa = DEFAULT_QUESTIONS.map((question, i) => ({
      question,
      answer: answers[i] ?? '',
    }));

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
        body: JSON.stringify({ qa, categoryId }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        throw new Error('Generation failed. Please try again.');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
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

          try {
            const parsed = JSON.parse(payload) as {
              type?: string;
              token?: string;
              data?: GeneratedResult;
            };

            if (parsed.type === 'done' && parsed.data) {
              // Final structured result
              setProgress(100);
              setIsGenerating(false);
              onGenerated(parsed.data);
              onClose();
              return;
            }

            if (parsed.token) {
              accumulated += parsed.token;
              setStreamedText(accumulated);
              progressTick = Math.min(95, progressTick + 0.5);
              setProgress(Math.round(progressTick));
            }
          } catch {
            // token might be raw text, not JSON
            if (payload) {
              accumulated += payload;
              setStreamedText(accumulated);
            }
          }
        }
      }

      // Stream ended without done event — use accumulated text
      if (accumulated) {
        setIsGenerating(false);
        setProgress(100);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError('AI generation failed. Please try again or write your article manually.');
      setStreamedText('');
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setStreamedText('');
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-blue" />
            <h2 className="font-semibold text-brand-text">Generate with AI</h2>
          </div>
          <button onClick={onClose} className="text-brand-text-muted hover:text-brand-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isGenerating ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-brand-text">Generating your article…</p>
              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-blue rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-brand-text-muted">{progress}% complete</p>
              {/* Streaming preview */}
              {streamedText && (
                <div className="mt-4 p-4 bg-brand-surface rounded-lg border border-slate-200">
                  <p className="text-xs font-medium text-brand-text-muted mb-2 uppercase tracking-wide">Preview</p>
                  <p className="text-sm text-brand-text whitespace-pre-wrap line-clamp-10">{streamedText}</p>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); }}
                className="flex items-center gap-2 text-sm text-brand-blue hover:underline"
              >
                <RotateCcw className="w-4 h-4" />
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-brand-text-secondary">
                Answer these questions to generate a professional article draft. The more detail you provide, the better the result.
              </p>

              {DEFAULT_QUESTIONS.map((question, idx) => (
                <div key={idx}>
                  <label className="flex items-start gap-2 text-sm font-medium text-brand-text mb-1.5">
                    <ChevronRight className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    {question}
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue resize-none transition-colors"
                    rows={3}
                    value={answers[idx] ?? ''}
                    onChange={(e) => setAnswer(idx, e.target.value)}
                    placeholder="Your answer…"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && !error && (
          <div className="px-6 py-4 border-t border-slate-200 shrink-0">
            <button
              onClick={() => void handleGenerate()}
              disabled={answers.every((a) => !a.trim())}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-white bg-brand-blue rounded-xl hover:bg-brand-blue-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate article
            </button>
            <p className="text-xs text-brand-text-muted text-center mt-2">
              You can edit everything after generation before submitting.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="px-6 py-4 border-t border-slate-200 shrink-0">
            <button
              onClick={handleCancel}
              className="w-full py-3 text-sm font-medium border border-slate-200 rounded-xl hover:bg-brand-surface-alt transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
