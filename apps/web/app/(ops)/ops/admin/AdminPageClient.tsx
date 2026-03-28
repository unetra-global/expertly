'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { AdminUser } from '@/types/api';

const ROLE_OPTIONS = ['user', 'member', 'ops', 'backend_admin'];

const ROLE_COLORS: Record<string, string> = {
  user: 'bg-slate-100 text-slate-600',
  member: 'bg-blue-100 text-blue-700',
  ops: 'bg-purple-100 text-purple-700',
  backend_admin: 'bg-red-100 text-red-700',
};

export default function AdminPage() {
  const qc = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [roleEditing, setRoleEditing] = useState<string | null>(null);
  const [roleValue, setRoleValue] = useState('');
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: queryKeys.ops.users(),
    queryFn: () => apiClient.get<AdminUser[]>('/admin/users'),
  });

  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: queryKeys.ops.users() });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiClient.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      invalidate();
      setRoleEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () => {
      invalidate();
      setDeleteConfirm(null);
    },
  });

  const startRoleEdit = (user: AdminUser) => {
    setRoleEditing(user.id);
    setRoleValue(user.role);
  };

  const filtered = search.trim()
    ? users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin — Users</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${filtered.length} user${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <input
          type="search"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {(roleMutation.error || deleteMutation.error) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {String(roleMutation.error || deleteMutation.error)}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className={user.isDeleted ? 'opacity-50 line-through' : ''}
                  >
                    <td className="px-4 py-3">
                      <p className="text-slate-900">{user.email}</p>
                      <p className="text-xs text-slate-400 font-mono">{user.id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3">
                      {roleEditing === user.id ? (
                        <div className="flex gap-2 items-center">
                          <select
                            value={roleValue}
                            onChange={(e) => setRoleValue(e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => roleMutation.mutate({ id: user.id, role: roleValue })}
                            disabled={roleMutation.isPending || roleValue === user.role}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-60"
                          >
                            {roleMutation.isPending ? '…' : 'Save'}
                          </button>
                          <button
                            onClick={() => setRoleEditing(null)}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startRoleEdit(user)}
                          disabled={!!user.isDeleted}
                          className="group flex items-center gap-1"
                        >
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              ROLE_COLORS[user.role] ?? 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {user.role}
                          </span>
                          {!user.isDeleted && (
                            <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              ✎
                            </span>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.isDeleted ? (
                        <span className="text-xs text-red-500 font-medium">Deleted</span>
                      ) : user.isActive === false ? (
                        <span className="text-xs text-amber-600 font-medium">Inactive</span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {!user.isDeleted && (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-500 mb-1">
              The user will be soft-deleted and anonymised. Their data is retained but
              they cannot log in.
            </p>
            <p className="text-xs text-slate-400 mb-4 font-mono break-all">
              ID: {deleteConfirm}
            </p>
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
                {deleteMutation.isPending ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
