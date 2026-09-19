import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { Pagination } from '../../components/Pagination';
import { Search, Power, UserCog } from 'lucide-react';

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
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeIn className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="register">Admin — User Register</span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Manage Users</h1>
            <p className="mt-2 text-sm text-ink-soft sm:text-base">Search, filter, and review user accounts</p>
          </div>
          <Link to="/admin" className="inline-flex min-h-[44px] items-center justify-center border border-hairline bg-stock px-5 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green">
            Back to Dashboard
          </Link>
        </FadeIn>

        <FadeIn delay="0.1s">
          <div className="plate mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by username or email"
                className="w-full border border-hairline bg-stock py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="cursor-pointer border border-hairline bg-stock px-4 py-2.5 text-sm text-ink focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="admin">Admins</option>
            </select>
            <button
              onClick={() => setShowCreate((s) => !s)}
              className="inline-flex min-h-[44px] items-center justify-center bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink"
            >
              {showCreate ? 'Cancel' : 'Create User'}
            </button>
          </div>
          {showCreate && (
            <form
              onSubmit={handleCreate}
              className="plate mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label className="register mb-2 block">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full border border-hairline bg-stock px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex-1">
                <label className="register mb-2 block">Username (optional)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border border-hairline bg-stock px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
                  placeholder="username"
                />
              </div>
              <div className="flex items-center gap-2 py-2.5">
                <input
                  id="new-is-admin"
                  type="checkbox"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                  className="h-4 w-4 border-hairline bg-stock accent-seal-ink"
                />
                <label htmlFor="new-is-admin" className="font-mono text-xs uppercase tracking-[0.14em] text-ink">Admin</label>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink"
              >
                Add User
              </button>
            </form>
          )}
          {createError && (
            <p className="mb-6 border border-strike/60 bg-stock px-4 py-3 font-mono text-sm text-strike">
              {createError}
            </p>
          )}
        </FadeIn>

        <FadeIn delay="0.2s">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-ink bg-stock text-left text-sm text-ink">
              <thead className="bg-stock-drift font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-normal">Username</th>
                  <th className="px-4 py-3 font-normal">Email</th>
                  <th className="px-4 py-3 font-normal">XP</th>
                  <th className="px-4 py-3 font-normal">Verified</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <AsyncSection state={usersData} onRetry={usersData.reload} skeleton={<UsersTableSkeleton />}>
                  {usersData.data.users.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-ink-soft">No users found.</td></tr>
                  ) : (
                    usersData.data.users.map((u) => (
                      <tr key={u.id} className="transition-colors hover:bg-stock-green">
                        <td className="px-4 py-3">{u.username || '—'}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3 font-mono text-xs">{u.total_xp}</td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${u.is_verified ? 'text-confirm' : 'text-ink-soft'}`}>
                            {u.is_verified ? '✓ Yes' : '✗ No'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${u.is_active ? 'text-confirm' : 'text-strike'}`}>
                            {u.is_active ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(u.id, 'toggle_active')}
                              className={`inline-flex items-center border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${u.is_active ? 'border-strike text-strike hover:bg-strike/10' : 'border-confirm text-confirm hover:bg-confirm/10'}`}
                            >
                              <Power className="mr-1.5 h-3.5 w-3.5" /> {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleAction(u.id, 'toggle_admin')}
                              className="inline-flex items-center border border-hairline px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                            >
                              <UserCog className="mr-1.5 h-3.5 w-3.5" /> {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                            <Link to={`/admin/users/${u.id}`} className="ml-1 font-mono text-xs uppercase tracking-[0.14em] text-seal-ink underline-offset-[3px] hover:underline">View</Link>
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
          <FadeIn className="mt-6" delay="0.3s">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function UsersTableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-3"><div className="h-4 w-24 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-4 w-48 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-4 w-12 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-4 w-14 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="ml-auto h-6 w-40 bg-ink-soft/20" /></td>
        </tr>
      ))}
    </>
  );
}
