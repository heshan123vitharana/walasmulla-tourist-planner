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
import PlaceModal from '../../components/admin/PlaceModal';
import { useToast } from '../../context/ToastContext';

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
  const [places, setPlaces]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoad]        = useState(true);
  const [error, setError]         = useState(null);
  const toast = useToast();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const load = useCallback(() => {
    setLoad(true);
    Promise.all([adminGetPlaces(), getCategories()])
      .then(([placesData, catsData]) => {
        setPlaces(placesData);
        setCategories(catsData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  }, []);

  useEffect(load, [load]);

  function handleOpenAdd() {
    setSelectedPlace(null);
    setModalOpen(true);
  }

  function handleOpenEdit(place) {
    setSelectedPlace(place);
    setModalOpen(true);
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete "${name || 'this destination'}"?`)) return;
    try {
      await adminDeletePlace(id);
      load();
      toast.success(`"${name || 'Destination'}" was deleted successfully`, 'Deleted');
    } catch (e) {
      toast.error(e.message || 'Failed to delete place', 'Error');
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="text-primary-400 animate-spin" /></div>;
  if (error)   return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Tourist Destinations
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-card border border-surface-border text-slate-400 font-normal">
              {places.length} places
            </span>
          </h2>
          <p className="text-slate-400 text-xs">Manage places, GPS coordinates, durations, and entry requirements.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          data-tooltip="Open form to add a new tourist place"
          className="btn-primary text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-glow shrink-0"
        >
          <Plus size={16} /> Add New Place
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-surface-border bg-white/[0.02]">
              <th className="py-3 px-4 font-medium">Name & Location</th>
              <th className="py-3 px-4 font-medium hidden sm:table-cell">Categories</th>
              <th className="py-3 px-4 font-medium hidden md:table-cell">Duration</th>
              <th className="py-3 px-4 font-medium hidden md:table-cell">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {places.map((p) => (
              <tr key={p._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="text-slate-200 font-semibold">{p.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    {p.distanceKm !== undefined && <span>{p.distanceKm} km from Walasmulla</span>}
                    {p.location?.coordinates && (
                      <span className="font-mono text-[11px] text-slate-600">
                        [{p.location.coordinates[1].toFixed(3)}, {p.location.coordinates[0].toFixed(3)}]
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 hidden sm:table-cell text-slate-300">
                  <div className="flex flex-wrap gap-1">
                    {p.categories?.map((c) => (
                      <span key={c._id || c} className="badge bg-slate-800/80 text-teal-300 text-[11px]">
                        {c.name || 'Category'}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4 hidden md:table-cell text-slate-400">
                  {p.visitDurationMinutes} min
                </td>
                <td className="py-3.5 px-4 hidden md:table-cell">
                  {p.isActive
                    ? <span className="badge bg-green-900/40 text-green-400 border border-green-700/40">Active</span>
                    : <span className="badge bg-red-900/40 text-red-400 border border-red-700/40">Inactive</span>}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      data-tooltip="Edit destination details"
                      className="btn-ghost p-1.5 text-slate-300 hover:text-teal-400 transition-colors"
                      title="Edit place"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      data-tooltip="Delete destination permanently"
                      className="btn-ghost p-1.5 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete place"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Place Modal */}
      <PlaceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          load();
          toast.success(selectedPlace ? 'Destination updated successfully!' : 'New destination created!', 'Success');
        }}
        place={selectedPlace}
        categories={categories}
      />
    </div>
  );
}

/* ─── Categories Tab ──────────────────────────────────────────── */
function CategoriesTab() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoad]    = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const toast = useToast();

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
      toast.success(`Category "${newName.trim()}" created successfully!`, 'Category Created');
      setNewName('');
      load();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to create category', 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete category "${name || 'this category'}"?`)) return;
    try {
      await adminDeleteCategory(id);
      load();
      toast.success('Category removed successfully', 'Deleted');
    } catch (e) {
      toast.error(e.message || 'Failed to delete category', 'Error');
    }
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
            placeholder="e.g. Wildlife, Waterfalls, Sacred Sites"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          data-tooltip="Create new destination category"
          className="btn-primary shrink-0"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}

      {/* List */}
      <ul className="space-y-2">
        {cats.map((c) => (
          <li key={c._id} className="card p-4 flex items-center gap-3">
            <span className="flex-1 text-slate-200 font-medium">{c.name}</span>
            <span className="text-slate-500 text-xs font-mono">{c.slug}</span>
            <button
              onClick={() => handleDelete(c._id, c.name)}
              data-tooltip="Delete category"
              className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
            >
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
  const toast = useToast();

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
    try {
      await adminSetUserStatus(user._id, next);
      load();
      if (next === 'blocked') {
        toast.warning(`User ${user.username} has been blocked`, 'Access Blocked');
      } else {
        toast.success(`User ${user.username} is now active`, 'Access Restored');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to update user status', 'Error');
    }
  }

  async function handleDelete(id, username) {
    if (!confirm(`Permanently delete account for "${username || 'this user'}"?`)) return;
    try {
      await adminDeleteUser(id);
      load();
      toast.success(`Account for "${username || 'user'}" deleted`, 'User Deleted');
    } catch (e) {
      toast.error(e.message || 'Failed to delete user', 'Error');
    }
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
                    data-tooltip={u.status === 'active' ? 'Block user account' : 'Unblock user account'}
                    title={u.status === 'active' ? 'Block user' : 'Unblock user'}
                  >
                    {u.status === 'active'
                      ? <XCircle size={15} className="text-amber-400" />
                      : <CheckCircle size={15} className="text-green-400" />}
                  </button>
                )}
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleDelete(u._id, u.username)}
                    data-tooltip="Delete user account"
                    className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
                  >
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
