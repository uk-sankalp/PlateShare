import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('users');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes, postsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/posts'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to load admin data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBlock = async (userId, name) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/block`);
      setToast({ message: `${name} ${data.isBlocked ? 'blocked' : 'unblocked'}`, type: 'success' });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isBlocked: data.isBlocked } : u));
    } catch {
      setToast({ message: 'Action failed', type: 'error' });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this food post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setToast({ message: 'Post deleted', type: 'success' });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-purple-600 text-white' },
    { label: 'Donors', value: stats.donors, color: 'bg-[#2f855a] text-white' },
    { label: 'Volunteers', value: stats.volunteers, color: 'bg-blue-600 text-white' },
    { label: 'NGOs', value: stats.ngos, color: 'bg-orange-500 text-white' },
    { label: 'Total Posts', value: stats.totalPosts, color: 'bg-indigo-600 text-white' },
    { label: 'Delivered', value: stats.deliveredPosts, color: 'bg-teal-600 text-white' },
  ] : [];

  const roleBadge = { donor: 'bg-green-100 text-green-700', volunteer: 'bg-blue-100 text-blue-700', ngo: 'bg-orange-100 text-orange-700', admin: 'bg-purple-100 text-purple-700' };
  const statusColor = { available: 'bg-green-100 text-green-700', claimed: 'bg-blue-100 text-blue-700', delivered: 'bg-purple-100 text-purple-700', expired: 'bg-red-100 text-red-600' };

  return (
    <div className="w-screen px-4 py-8 sm:py-12 md:py-16 bg-[#fffdfb] dark:bg-gray-900 animate-fade-in transition-colors duration-300 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1f6f43] dark:text-green-400">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users, posts, and platform activity</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="mb-10 p-12 flex justify-center"><Loader size="64px" borderSize="6px" color="rgba(47, 133, 90, 0.1)" pulseColor="#2f855a" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {statCards.map((s, i) => (
              <div key={i} className={`${s.color} p-4 rounded-xl text-center shadow-md`}>
                <div className="text-2xl font-bold">{s.value}</div>
                <p className="text-white/80 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['users', 'posts'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${tab === t ? 'bg-[#2f855a] text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
            >
              {t === 'users' ? 'Users' : 'Food Posts'}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {tab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-transparent dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">User Management</h2>
            </div>
            {loading ? <div className="p-12 flex justify-center"><Loader size="48px" borderSize="5px" color="rgba(47, 133, 90, 0.1)" pulseColor="#2f855a" /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-b border-transparent dark:border-gray-700">
                    <tr>
                      {['Name', 'Email', 'Role', 'Status', 'Joined', 'Action'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{u.name}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roleBadge[u.role]}`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleBlock(u._id, u.name)}
                            className={`text-xs font-bold px-3 py-1 rounded-lg transition ${u.isBlocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Posts Table */}
        {tab === 'posts' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-transparent dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Food Posts</h2>
            </div>
            {loading ? <div className="p-12 flex justify-center"><Loader size="48px" borderSize="5px" color="rgba(47, 133, 90, 0.1)" pulseColor="#2f855a" /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-b border-transparent dark:border-gray-700">
                    <tr>
                      {['Food', 'Donor', 'Location', 'Status', 'Posted', 'Action'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr key={p._id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{p.title}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{p.donor?.name || '—'}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400 max-w-[160px] truncate">{p.location}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor[p.status]}`}>{p.status}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleDeletePost(p._id)} className="text-xs font-bold px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;