'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsEvent } from '@/types/api';

const FORMAT_OPTIONS = ['online', 'in_person', 'hybrid'];

interface EventForm {
  title: string;
  shortDescription: string;
  description: string;
  format: string;
  country: string;
  city: string;
  venue: string;
  startDate: string;
  endDate: string;
  registrationUrl: string;
  coverImageUrl: string;
  regions: string;
  tags: string;
}

const EMPTY_FORM: EventForm = {
  title: '',
  shortDescription: '',
  description: '',
  format: 'online',
  country: '',
  city: '',
  venue: '',
  startDate: '',
  endDate: '',
  registrationUrl: '',
  coverImageUrl: '',
  regions: '',
  tags: '',
};

export default function EventsPage() {
  const qc = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: queryKeys.ops.events(),
    queryFn: () => apiClient.get<OpsEvent[]>('/ops/events'),
    select: (data) => (Array.isArray(data) ? data : (data as { data?: OpsEvent[] }).data ?? []),
  });

  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: queryKeys.ops.events() });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/ops/events', {
        ...form,
        regions: form.regions ? form.regions.split(',').map((r) => r.trim()) : [],
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
        endDate: form.endDate || undefined,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        country: form.country || undefined,
        city: form.city || undefined,
        venue: form.venue || undefined,
        registrationUrl: form.registrationUrl || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiClient.patch(`/ops/events/${id}/publish`, { isPublished }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/ops/events/${id}`),
    onSuccess: () => {
      invalidate();
      setDeleteConfirm(null);
    },
  });

  const field = (key: keyof EventForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Events</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${events.length} event${events.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Create Event
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No events found
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{event.title}</p>
                      {(event.shortDescription ?? event.description) && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {event.shortDescription ?? event.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize">
                      {event.eventFormat?.replace('_', ' ') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {[event.city, event.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(event.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          publishMutation.mutate({
                            id: event.id,
                            isPublished: !event.isPublished,
                          })
                        }
                        disabled={publishMutation.isPending}
                        className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          event.isPublished
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {event.isPublished ? '✓ Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteConfirm(event.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create event modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Event</h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title *"
                {...field('title')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Short description"
                {...field('shortDescription')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <textarea
                placeholder="Full description"
                {...field('description')}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />

              <select
                {...field('format')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f} value={f} className="capitalize">
                    {f.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Country"
                  {...field('country')}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="City"
                  {...field('city')}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <input
                type="text"
                placeholder="Venue"
                {...field('venue')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Start Date *</label>
                  <input
                    type="datetime-local"
                    {...field('startDate')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                  <input
                    type="datetime-local"
                    {...field('endDate')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <input
                type="url"
                placeholder="Registration URL"
                {...field('registrationUrl')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Cover image URL"
                {...field('coverImageUrl')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Regions (comma-separated, e.g. IN, SG)"
                {...field('regions')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                {...field('tags')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {createMutation.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {String(createMutation.error)}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setForm(EMPTY_FORM);
                }}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!form.title.trim() || !form.startDate || createMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {createMutation.isPending ? 'Creating…' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Event?</h3>
            <p className="text-sm text-slate-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
