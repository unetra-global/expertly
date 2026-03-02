'use client';

import { useEffect, useRef } from 'react';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onClear?: () => void;
  hasFilters?: boolean;
  children: React.ReactNode;
}

export function FilterSheet({
  isOpen,
  onClose,
  onClear,
  hasFilters,
  children,
}: FilterSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-brand-navy">Filters</h2>
          <div className="flex items-center gap-3">
            {hasFilters && onClear && (
              <button
                onClick={onClear}
                className="text-sm font-medium text-brand-blue hover:text-brand-blue-dark transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-brand-text"
              aria-label="Close filters"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {children}
        </div>

        {/* Done button */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
