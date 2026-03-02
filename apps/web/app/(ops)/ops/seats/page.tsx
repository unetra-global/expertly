'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { Seat } from '@/types/api';

function UtilizationBar({ claimed, capacity }: { claimed: number; capacity: number }) {
  const pct = capacity > 0 ? Math.round((claimed / capacity) * 100) : 0;
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="w-32">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={pct >= 100 ? 'text-red-600 font-semibold' : 'text-slate-500'}>
          {pct}%
        </span>
        <span className="text-slate-400">{claimed}/{capacity}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function SeatsPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCapacity, setEditCapacity] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: seats = [], isLoading } = useQuery({
    queryKey: queryKeys.ops.seats(),
    queryFn: () => apiClient.get<Seat[]>('/ops/seats'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, capacity }: { id: string; capacity: number }) =>
      apiClient.patch(`/ops/seats/${id}`, { capacity }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.ops.seats() });
      setEditingId(null);
      setEditCapacity('');
      setError(null);
    },
    onError: (err) => setError(String(err)),
  });

  const startEdit = (seat: Seat) => {
    setEditingId(seat.id);
    setEditCapacity(String(seat.capacity));
    setError(null);
  };

  const saveEdit = (id: string) => {
    const cap = parseInt(editCapacity, 10);
    if (isNaN(cap) || cap < 0) {
      setError('Capacity must be a non-negative number');
      return;
    }
    updateMutation.mutate({ id, capacity: cap });
  };

  const fullSeats = seats.filter((s) => s.capacity > 0 && s.claimedCount >= s.capacity);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Seat Allocations</h2>
          <p className="text-sm text-slate-500 mt-1">
            {seats.length} allocation{seats.length !== 1 ? 's' : ''}
            {fullSeats.length > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                ⚠ {fullSeats.length} at 100% capacity
              </span>
            )}
          </p>
        </div>
      </div>

      {fullSeats.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>Capacity warning:</strong> The following allocations are full:{' '}
          {fullSeats.map((s) => s.id).join(', ')}. New applications for these services will be
          waitlisted automatically.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

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
                  Seat ID
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Service ID
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category ID
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {seats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No seat allocations found
                  </td>
                </tr>
              ) : (
                seats.map((seat) => {
                  const isFull = seat.claimedCount >= seat.capacity && seat.capacity > 0;
                  return (
                    <tr
                      key={seat.id}
                      className={isFull ? 'bg-red-50/50' : ''}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {seat.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {seat.serviceId ? `${seat.serviceId.slice(0, 8)}…` : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {seat.categoryId ? `${seat.categoryId.slice(0, 8)}…` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <UtilizationBar claimed={seat.claimedCount} capacity={seat.capacity} />
                      </td>
                      <td className="px-4 py-3">
                        {editingId === seat.id ? (
                          <input
                            type="number"
                            value={editCapacity}
                            onChange={(e) => setEditCapacity(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(seat.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            min={0}
                            className="w-20 border border-blue-400 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <span className={`font-medium ${isFull ? 'text-red-700' : 'text-slate-900'}`}>
                            {seat.capacity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium ${
                            seat.isActive ? 'text-green-600' : 'text-slate-400'
                          }`}
                        >
                          {seat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === seat.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(seat.id)}
                              disabled={updateMutation.isPending}
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-60"
                            >
                              {updateMutation.isPending ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs border border-slate-300 px-2 py-1 rounded hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(seat)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Edit capacity
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
