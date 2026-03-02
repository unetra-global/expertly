'use client';

import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { MemberListItem } from '@/types/api';

interface ConsultationModalProps {
  member: MemberListItem | null;
  onClose: () => void;
}

export function ConsultationModal({ member, onClose }: ConsultationModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset state when member changes
  useEffect(() => {
    setSubject('');
    setMessage('');
    setSubmitted(false);
    setError(null);
  }, [member]);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!member) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [member, onClose]);

  if (!member) return null;

  const displayName =
    member.user.fullName ||
    [member.user.firstName, member.user.lastName].filter(Boolean).join(' ') ||
    'this expert';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/consultations', {
        recipientMemberId: member.id,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
    } catch {
      setError('Failed to send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-brand-navy">
              Request Consultation
            </h2>
            <p className="text-xs text-brand-text-muted mt-0.5">
              with {displayName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          {submitted ? (
            /* Success state */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">Request Sent</h3>
              <p className="text-sm text-brand-text-secondary">
                Your consultation request has been sent to {displayName}. They will respond to you directly.
              </p>
              <button onClick={onClose} className="mt-6 btn-primary">
                Close
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-brand-text mb-1.5">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Transfer pricing advice for Singapore entity"
                  required
                  maxLength={200}
                  className="input-base"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-brand-text mb-1.5">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Briefly describe what you need help with…"
                  required
                  rows={5}
                  maxLength={2000}
                  className="input-base resize-none"
                />
                <p className="mt-1 text-xs text-brand-text-muted text-right">
                  {message.length}/2000
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !message.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
                <button type="button" onClick={onClose} className="flex-1 btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
