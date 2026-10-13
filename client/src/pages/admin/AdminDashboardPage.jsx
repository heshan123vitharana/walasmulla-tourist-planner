/**
 * AdminDashboardPage.jsx — Admin interface for places, categories, and users.
 */
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Pencil, Trash2, Users, MapPin, Tag, CheckCircle, XCircle } from 'lucide-react';
import {
  adminGetPlaces, adminDeletePlace,
  adminGetUsers, adminSetUserStatus, adminDeleteUser,
  adminCreateCategory, adminDeleteCategory,
  getCategories,
} from '../../api/api';

const tabs = ['Places', 'Categories', 'Users'];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('Places');

  return (
    <div className="page-container">
      <h1 className="text-gradient mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 mb-6">Manage places, categories, and tourist accounts.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-surface-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-primary-500 text-primary-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'Places' ? <><MapPin size={14} className="inline mr-1" />Places</> :
             t === 'Categories' ? <><Tag size={14} className="inline mr-1" />Categories</> :
             <><Users size={14} className="inline mr-1" />Users</>}
          </button>
        ))}
      </div>

      {tab === 'Places'     && <PlacesTab />}
      {tab === 'Categories' && <CategoriesTab />}
      {tab === 'Users'      && <UsersTab />}
    </div>
  );
}

/* ─── Places Tab ──────────────────────────────────────────────── */
function PlacesTab() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState(null);

  const load = useCallback(() => {
    setLoad(true);
    adminGetPlaces()
      .then(setPlaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(id) {
    if (!confirm('Delete this place?')) return;
    try { await adminDeletePlace(id); load(); }
    catch (e) { alert(e.message); }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="text-primary-400 animate-spin" /></div>;
  if (error)   return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-400 text-sm">{places.length} places total</p>
        <span className="text-slate-500 text-xs">Add places via seed script or API</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-surface-border">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium hidden sm:table-cell">Categories</th>
              <th className="py-2 pr-4 font-medium hidden md:table-cell">Status</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {places.map((p) => (
              <tr key={p._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 pr-4 text-slate-200 font-medium">{p.name}</td>
                <td className="py-3 pr-4 hidden sm:table-cell text-slate-400">
                  {p.categories?.map((c) => c.name).join(', ')}
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  {p.isActive
                    ? <span className="badge bg-green-900/40 text-green-400 border border-green-700/40">Active</span>
                    : <span className="badge bg-red-900/40 text-red-400 border border-red-700/40">Inactive</span>}
                </td>
                <td className="py-3">
                  <button onClick={() => handleDelete(p._id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Categories Tab ──────────────────────────────────────────── */
function CategoriesTab() {
  const [cats, setCats]      = useState([]);
  const [loading, setLoad]   = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState(null);

  const load = useCallback(() => {
    setLoad(true);
    getCategories()
      .then(setCats)
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  }, []);

  useEffect(load, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await adminCreateCategory({ name: newName.trim() });
      setNewName('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    try { await adminDeleteCategory(id); load(); }
    catch (e) { alert(e.message); }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="text-primary-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Create */}
      <form onSubmit={handleCreate} className="card p-5 flex gap-3 items-end">
        <div className="flex-1">
          <label className="label" htmlFor="new-cat">New Category Name</label>
          <input
            id="new-cat"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input"
            placeholder="e.g. Wildlife"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary shrink-0">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}

      {/* List */}
      <ul className="space-y-2">
        {cats.map((c) => (
          <li key={c._id} className="card p-4 flex items-center gap-3">
            <span className="flex-1 text-slate-200 font-medium">{c.name}</span>
            <span className="text-slate-500 text-xs">{c.slug}</span>
            <button onClick={() => handleDelete(c._id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300">
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Users Tab ───────────────────────────────────────────────── */
function UsersTab() {
  const [users, setUsers]  = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setError]  = useState(null);

  const load = useCallback(() => {
    setLoad(true);
    adminGetUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  }, []);

  useEffect(load, [load]);

  async function toggleStatus(user) {
    const next = user.status === 'active' ? 'blocked' : 'active';
    try { await adminSetUserStatus(user._id, next); load(); }
    catch (e) { alert(e.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Permanently delete this user?')) return;
    try { await adminDeleteUser(id); load(); }
    catch (e) { alert(e.message); }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="text-primary-400 animate-spin" /></div>;
  if (error)   return <p className="text-red-400">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <p className="text-slate-400 text-sm mb-4">{users.length} accounts</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 border-b border-surface-border">
            <th className="py-2 pr-4 font-medium">Username</th>
            <th className="py-2 pr-4 font-medium">Role</th>
            <th className="py-2 pr-4 font-medium hidden sm:table-cell">Status</th>
            <th className="py-2 pr-4 font-medium hidden md:table-cell">Joined</th>
            <th className="py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-white/5 transition-colors">
              <td className="py-3 pr-4 text-slate-200 font-medium">{u.username}</td>
              <td className="py-3 pr-4">
                <span className={`badge ${u.role === 'admin' ? 'bg-purple-900/40 text-purple-300 border-purple-700/40' : 'badge-primary'}`}>
                  {u.role}
                </span>
              </td>
              <td className="py-3 pr-4 hidden sm:table-cell">
                {u.status === 'active'
                  ? <span className="badge bg-green-900/40 text-green-400 border border-green-700/40">Active</span>
                  : <span className="badge bg-red-900/40 text-red-400 border border-red-700/40">Blocked</span>}
              </td>
              <td className="py-3 pr-4 hidden md:table-cell text-slate-400">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 flex gap-1">
                {u.role !== 'admin' && (
                  <button
                    onClick={() => toggleStatus(u)}
                    className="btn-ghost p-1.5"
                    title={u.status === 'active' ? 'Block user' : 'Unblock user'}
                  >
                    {u.status === 'active'
                      ? <XCircle size={15} className="text-amber-400" />
                      : <CheckCircle size={15} className="text-green-400" />}
                  </button>
                )}
                {u.role !== 'admin' && (
                  <button onClick={() => handleDelete(u._id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300">
                    <Trash2 size={15} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
