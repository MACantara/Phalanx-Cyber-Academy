import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { Search, ChevronLeft, ChevronRight, Power, UserCog } from 'lucide-react';

interface UserRecord {
  id: number;
  username: string | null;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  total_xp: number;
  created_at?: string;
}

interface UsersResponse {
  users: UserRecord[];
  total: number;
}

const initialUsers: UsersResponse = { users: [], total: 0 };

export default function Users() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const usersData = useData<UsersResponse>(async () => {
    const res = await api.get('/users/', { params: { page, per_page: perPage, search, status_filter: statusFilter } });
    return { users: res.data.users || [], total: res.data.total || 0 };
  }, [page, perPage, search, statusFilter], { initial: initialUsers });

  const totalPages = Math.max(1, Math.ceil(usersData.data.total / perPage));

  const handleAction = async (id: number, action: 'toggle_active' | 'toggle_admin') => {
    try {
      await api.put(`/admin/users/${id}/actions`, { action });
      usersData.reload();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setCreateError('Enter a valid email address');
      return;
    }
    try {
      setCreateError(null);
      await api.post('/admin/users', { email: newEmail, username: newUsername || null, is_admin: newIsAdmin });
      setNewEmail('');
      setNewUsername('');
      setNewIsAdmin(false);
      setShowCreate(false);
      usersData.reload();
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-white md:text-5xl">Manage Users</h1>
            <p className="mt-2 text-lg text-slate-300">Search, filter, and review user accounts</p>
          </div>
          <Link to="/admin" className="rounded-xl bg-slate-700 px-5 py-2 font-semibold text-white transition-all hover:bg-slate-600">
            Back to Dashboard
          </Link>
        </FadeIn>

        <FadeIn delay="0.1s">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-4 shadow-lg backdrop-blur-md md:flex-row md:items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by username or email"
                className="w-full rounded-xl border border-slate-600 bg-slate-900 py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="cursor-pointer rounded-xl border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="admin">Admins</option>
            </select>
            <button
              onClick={() => setShowCreate((s) => !s)}
              className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white transition-all hover:bg-blue-500"
            >
              {showCreate ? 'Cancel' : 'Create User'}
            </button>
          </div>
          {showCreate && (
            <form
              onSubmit={handleCreate}
              className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-4 shadow-lg backdrop-blur-md md:flex-row md:items-start"
            >
              <div className="flex-1">
                <label className="mb-1 block text-xs text-slate-400">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-slate-400">Username (optional)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="username"
                />
              </div>
              <div className="flex items-center gap-2 py-3 md:py-0">
                <input
                  id="new-is-admin"
                  type="checkbox"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="new-is-admin" className="text-sm text-slate-300">Admin</label>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-green-600 px-5 py-2 font-semibold text-white transition-all hover:bg-green-500"
              >
                Add User
              </button>
            </form>
          )}
          {createError && (
            <p className="mb-6 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
              {createError}
            </p>
          )}
        </FadeIn>

        <FadeIn delay="0.2s">
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 shadow-lg backdrop-blur-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-600 bg-slate-700/50 text-slate-200">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                <AsyncSection state={usersData} onRetry={usersData.reload} skeleton={<UsersTableSkeleton />}>
                  {usersData.data.users.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center">No users found.</td></tr>
                  ) : (
                    usersData.data.users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="px-4 py-3">{u.username || '—'}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.total_xp}</td>
                        <td className="px-4 py-3">{u.is_verified ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${u.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(u.id, 'toggle_active')}
                              title={u.is_active ? 'Deactivate' : 'Activate'}
                              className="rounded bg-slate-700 p-1.5 text-slate-200 transition-colors hover:bg-slate-600"
                            >
                              <Power className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction(u.id, 'toggle_admin')}
                              title={u.is_admin ? 'Revoke admin' : 'Make admin'}
                              className="rounded bg-slate-700 p-1.5 text-slate-200 transition-colors hover:bg-slate-600"
                            >
                              <UserCog className="h-4 w-4" />
                            </button>
                            <Link to={`/admin/users/${u.id}`} className="ml-2 text-blue-400 hover:underline">View</Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </AsyncSection>
              </tbody>
            </table>
          </div>
        </FadeIn>

        {totalPages > 1 && (
          <FadeIn className="mt-6 flex items-center justify-between text-slate-300" delay="0.3s">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center rounded-xl bg-slate-800 px-4 py-2 text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center rounded-xl bg-slate-800 px-4 py-2 text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function UsersTableSkeleton() {
  return (
    <>
      <tr className="border-b border-slate-600">
        <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-slate-500/30" /></td>
        <td className="px-4 py-3"><div className="h-4 w-48 rounded bg-slate-500/30" /></td>
        <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-slate-500/30" /></td>
        <td className="px-4 py-3"><div className="h-4 w-14 rounded bg-slate-500/30" /></td>
        <td className="px-4 py-3"><div className="h-6 w-16 rounded-full bg-slate-500/30" /></td>
        <td className="px-4 py-3"><div className="h-4 w-8 rounded bg-slate-500/30" /></td>
      </tr>
      {[...Array(4)].map((_, i) => (
        <tr key={i} className="border-b border-slate-700/50">
          <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-48 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-10 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-6 w-16 rounded-full bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-8 rounded bg-slate-500/30" /></td>
        </tr>
      ))}
    </>
  );
}
