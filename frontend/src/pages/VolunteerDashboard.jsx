import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import ChatModal from '../components/ChatModal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const statusColor = {
  accepted: 'bg-blue-100 text-blue-700',
  on_the_way: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};
const statusLabel = { accepted: 'Accepted', on_the_way: 'On the Way', completed: 'Completed' };
const nextStatus = { accepted: 'on_the_way', on_the_way: 'completed' };

const VolunteerDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [updating, setUpdating] = useState(null);
  const { user } = useAuth();
  const { lastEvent } = useNotifications();
  const routerLocation = useLocation();
  const [chatDelivery, setChatDelivery] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);
  const [ratingData, setRatingData] = useState({ averageStars: 0, totalRatings: 0, ratings: [] });

  // 1. Auto-open chat when navigated here from a popup (user was on another page)
  useEffect(() => {
    const openChat = routerLocation.state?.openChat;
    if (!openChat?.deliveryId) return;
    setChatDelivery(openChat.deliveryId);
    setChatTarget({
      _id: openChat.senderId,
      name: openChat.senderName || 'User',
      role: openChat.senderRole || 'donor',
    });
    window.history.replaceState({}, document.title);
  }, [routerLocation.state]);

  // 2. Auto-open chat from SSE event when volunteer is ALREADY on this dashboard
  useEffect(() => {
    if (lastEvent?.type !== 'CHAT_MESSAGE') return;
    const d = lastEvent.data;
    if (!d?.deliveryId) return;
    // Don't override an already-open chat for a different delivery
    if (chatDelivery && chatDelivery !== d.deliveryId) return;
    setChatDelivery(d.deliveryId);
    setChatTarget({
      _id: d.sender,
      name: d.senderName || 'User',
      role: d.senderRole || 'donor',
    });
  }, [lastEvent, chatDelivery]);

  const fetchDeliveries = useCallback(async () => {
    try {
      const { data } = await api.get('/deliveries/my');
      setDeliveries(data);
    } catch {
      setToast({ message: 'Failed to load deliveries', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  // Fetch volunteer own ratings
  useEffect(() => {
    if (!user?._id) return;
    api.get(`/ratings/volunteer/${user._id}`)
      .then(({ data }) => setRatingData(data))
      .catch(() => { });
  }, [user?._id]);

  const updateStatus = async (deliveryId, newStatus) => {
    setUpdating(deliveryId);
    try {
      await api.patch(`/deliveries/${deliveryId}/status`, { status: newStatus });
      setToast({ message: `Status updated to "${statusLabel[newStatus]}"`, type: 'success' });
      fetchDeliveries();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setUpdating(null);
    }
  };

  const stats = {
    total: deliveries.length,
    completed: deliveries.filter((d) => d.status === 'completed').length,
    active: deliveries.filter((d) => d.status !== 'completed').length,
  };

  return (
    <div className="w-screen px-4 py-8 sm:py-12 md:py-16 bg-[#fffdfb] dark:bg-gray-900 animate-fade-in transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1f6f43] dark:text-green-400">Volunteer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your deliveries and help communities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-600 text-white' },
            { label: 'Completed', value: stats.completed, color: 'bg-[#2f855a] text-white' },
            { label: 'Active', value: stats.active, color: 'bg-orange-500 text-white' },
            {
              label: 'Avg Rating',
              value: ratingData.totalRatings > 0
                ? `⭐ ${ratingData.averageStars}`
                : '—',
              sub: ratingData.totalRatings > 0 ? `${ratingData.totalRatings} review${ratingData.totalRatings !== 1 ? 's' : ''}` : 'No reviews yet',
              color: 'bg-amber-500 text-white'
            },
          ].map((s, i) => (
            <div key={i} className={`${s.color} p-5 rounded-xl text-center shadow-md`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-white/80 text-sm mt-1">{s.label}</p>
              {s.sub && <p className="text-white/60 text-xs mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Deliveries */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-transparent dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">My Deliveries</h2>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center"><Loader size="48px" borderSize="5px" color="rgba(47, 133, 90, 0.1)" pulseColor="#2f855a" /></div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">No deliveries yet. Browse food posts and claim one!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {deliveries.map((d) => (
                <div key={d._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">{d.foodPost?.title || 'Food Item'}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-0.5">
                        <p>Loc: {d.foodPost?.location}</p>
                        <p>Donor: {d.foodPost?.donor?.name || '—'} {d.foodPost?.donor?.phone ? `· ${d.foodPost?.donor?.phone}` : ''}</p>
                        <p>Qty: {d.foodPost?.quantity} {d.foodPost?.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {d.foodPost?.donor && (
                        <button
                          onClick={() => {
                            setChatTarget(d.foodPost.donor);
                            setChatDelivery(d._id);
                          }}
                          className="text-[11px] font-bold text-[#2f855a] dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 uppercase tracking-wider"
                        >
                          Chat
                        </button>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[d.status]}`}>
                        {statusLabel[d.status]}
                      </span>
                      {nextStatus[d.status] && (
                        <button
                          onClick={() => updateStatus(d._id, nextStatus[d.status])}
                          disabled={updating === d._id}
                          className="bg-[#2f855a] hover:bg-[#1f6f43] disabled:opacity-60 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition min-w-[80px] h-[30px] flex justify-center items-center"
                        >
                          {updating === d._id ? <Loader size="14px" borderSize="2px" color="rgba(255, 255, 255, 0.2)" pulseColor="#ffffff" /> : d.status === 'accepted' ? 'Start' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ChatModal
        isOpen={!!chatDelivery}
        onClose={() => setChatDelivery(null)}
        deliveryId={chatDelivery}
        currentUser={user}
        targetUser={chatTarget}
      />
    </div>
  );
};

export default VolunteerDashboard;
