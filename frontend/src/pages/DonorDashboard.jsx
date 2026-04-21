import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import ChatModal from '../components/ChatModal';
import RatingModal from '../components/RatingModal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';


const STATUS_STYLES = {
  available: 'bg-[#e6f4ea] text-[#188038]',
  claimed: 'bg-[#e8f0fe] text-[#1a73e8]',
  delivered: 'bg-[#f3e8fd] text-[#8430ce]',
  expired: 'bg-[#fce8e6] text-[#d93025]',
};

const STATS = (s) => [
  { label: 'Total Posts', value: s.total, color: 'text-[#1a73e8]', bg: 'bg-[#e8f0fe]' },
  { label: 'Delivered', value: s.delivered, color: 'text-[#188038]', bg: 'bg-[#e6f4ea]' },
  { label: 'Active', value: s.active, color: 'text-[#e8710a]', bg: 'bg-[#fef3e2]' },
  { label: 'Food Shared', value: s.totalQty, color: 'text-[#8430ce]', bg: 'bg-[#f3e8fd]' },
];

const DonorDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const { lastEvent } = useNotifications();
  const routerLocation = useLocation();
  const [chatDelivery, setChatDelivery] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);
  const [highlightedPostDeliveryId, setHighlightedPostDeliveryId] = useState(null);
  const donationsSectionRef = useRef(null);
  // Rating state
  const [ratingMap, setRatingMap] = useState({});  // deliveryId -> stars
  const [ratingTarget, setRatingTarget] = useState(null); // { deliveryId, volunteerName }

  // Helper: open chat + scroll to donations section + highlight the row
  const openChatAndScroll = useCallback((deliveryId, target) => {
    setChatDelivery(deliveryId);
    setChatTarget(target);
    setHighlightedPostDeliveryId(deliveryId);
    // Scroll to donations table
    setTimeout(() => {
      donationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    // Remove highlight after 3 seconds
    setTimeout(() => setHighlightedPostDeliveryId(null), 3000);
  }, []);

  // 1. Auto-open chat when navigated here via popup click (from another page)
  useEffect(() => {
    const openChat = routerLocation.state?.openChat;
    if (!openChat?.deliveryId) return;
    openChatAndScroll(openChat.deliveryId, {
      _id: openChat.senderId,
      name: openChat.senderName || 'User',
      role: openChat.senderRole || 'volunteer',
    });
    window.history.replaceState({}, document.title);
  }, [routerLocation.state, openChatAndScroll]);

  // 2. Auto-open chat from SSE when donor is ALREADY on this dashboard
  useEffect(() => {
    if (lastEvent?.type !== 'CHAT_MESSAGE') return;
    const d = lastEvent.data;
    if (!d?.deliveryId) return;
    if (chatDelivery && chatDelivery !== d.deliveryId) return;
    openChatAndScroll(d.deliveryId, {
      _id: d.sender,
      name: d.senderName || 'User',
      role: d.senderRole || 'volunteer',
    });
  }, [lastEvent, openChatAndScroll, chatDelivery]);

  const fetchPosts = useCallback(async () => {
    try {
      const [postsRes, ratingsRes] = await Promise.all([
        api.get('/food/my'),
        api.get('/ratings/my'),
      ]);
      setPosts(postsRes.data);
      // Build map: deliveryId -> stars
      const map = {};
      ratingsRes.data.forEach(r => { map[r.delivery] = r.stars; });
      setRatingMap(map);
    } catch {
      setToast({ message: 'Failed to load your donations', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food post?')) return;
    try {
      await api.delete(`/food/${id}`);
      setToast({ message: 'Post deleted', type: 'success' });
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Delete failed', type: 'error' });
    }
  };

  const stats = {
    total: posts.length,
    delivered: posts.filter((p) => p.status === 'delivered').length,
    active: posts.filter((p) => p.status === 'available' || p.status === 'claimed').length,
    totalQty: posts.reduce((sum, p) => sum + parseFloat(p.quantity || 0), 0).toFixed(1),
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen w-screen bg-[#f8f9fa] dark:bg-gray-900 px-4 py-10 animate-fade-in transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 animate-slide-up">
          <div>
            <h1 className="text-2xl font-semibold text-[#202124] dark:text-gray-100">Donor Dashboard</h1>
            <p className="text-[#5f6368] dark:text-gray-400 text-sm mt-0.5">Manage your food donations and track deliveries</p>
          </div>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 bg-[#2f855a] hover:bg-[#1f6f43] text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm btn-press transition-all"
          >
            Post New Food
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STATS(stats).map((s, i) => (
            <div key={i} className={`stat-card bg-white dark:bg-gray-800 rounded-2xl border border-[#e8eaed] dark:border-gray-700 p-5 shadow-sm flex items-center gap-4 animate-slide-up-delay-${i + 1}`}>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <p className="text-xs text-[#5f6368] dark:text-gray-400 mt-0.5 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Posts Table */}
        <div
          ref={donationsSectionRef}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e8eaed] dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300 scroll-mt-20"
        >
          <div className="px-6 py-4 border-b border-[#e8eaed] dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#202124] dark:text-gray-200">Your Donations</h2>
            <span className="text-xs text-[#5f6368] dark:text-gray-400 bg-[#f8f9fa] dark:bg-gray-700 border border-[#e8eaed] dark:border-gray-600 px-2.5 py-1 rounded-full">
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader size="48px" borderSize="5px" color="rgba(47, 133, 90, 0.1)" pulseColor="#2f855a" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-[#5f6368] dark:text-gray-400 text-sm mb-5">No donations yet. Start sharing food!</p>
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 bg-[#2f855a] hover:bg-[#1f6f43] text-white text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm transition-all"
              >
                Post Your First Donation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8f9fa] dark:bg-gray-700/50 border-b border-[#e8eaed] dark:border-gray-700">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#5f6368] dark:text-gray-400 uppercase tracking-wide">Photo</th>
                    {['Food', 'Qty', 'Location', 'Claimed By', 'Status', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#5f6368] dark:text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const isHighlighted = post.deliveryId && post.deliveryId.toString() === highlightedPostDeliveryId;
                    return (
                      <tr
                        key={post._id}
                        className={`row-hover border-t border-[#f1f3f4] dark:border-gray-700 transition-all duration-500 ${isHighlighted ? 'ring-2 ring-inset ring-blue-400 dark:ring-blue-500 bg-blue-50/60 dark:bg-blue-900/20' : ''
                          }`}
                      >
                        <td className="px-5 py-4">
                          <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {post.imageUrl ? (
                              <img src={`http://${window.location.hostname}:5000${post.imageUrl}`} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#202124] dark:text-gray-200">{post.title}</td>
                        <td className="px-5 py-4 text-[#5f6368] dark:text-gray-400">{post.quantity} {post.unit}</td>
                        <td className="px-5 py-4 text-[#5f6368] dark:text-gray-400 max-w-[160px] truncate">{post.location}</td>
                        <td className="px-5 py-4 text-[#5f6368] dark:text-gray-400">{post.claimedBy?.name || <span className="text-[#9aa0a6] dark:text-gray-500">—</span>}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[post.status]}`}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {isHighlighted && (
                              <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                                💬 New msg
                              </span>
                            )}
                            {post.status === 'available' && (
                              <button
                                onClick={() => handleDelete(post._id)}
                                className="text-xs font-medium text-[#d93025] dark:text-red-400 hover:text-[#a50e0e] hover:underline transition-colors"
                              >
                                Delete
                              </button>
                            )}
                            {post.deliveryId && post.claimedBy && (
                              <button
                                onClick={() => openChatAndScroll(post.deliveryId, post.claimedBy)}
                                className="text-xs font-semibold text-[#2f855a] dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                              >
                                Message
                              </button>
                            )}
                            {/* Rate button for delivered posts */}
                            {post.status === 'delivered' && post.deliveryId && (
                              ratingMap[post.deliveryId] ? (
                                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                                  {'⭐'.repeat(ratingMap[post.deliveryId])} Rated
                                </span>
                              ) : (
                                <button
                                  onClick={() => setRatingTarget({ deliveryId: post.deliveryId, volunteerName: post.claimedBy?.name })}
                                  className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                >
                                  ⭐ Rate
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

      <RatingModal
        isOpen={!!ratingTarget}
        onClose={() => setRatingTarget(null)}
        delivery={ratingTarget?.deliveryId}
        volunteerName={ratingTarget?.volunteerName}
        onSuccess={(stars) => {
          setRatingMap(prev => ({ ...prev, [ratingTarget.deliveryId]: stars }));
          setRatingTarget(null);
          setToast({ message: '⭐ Rating submitted! Thank you.', type: 'success' });
        }}
      />
    </div>
  );
};

export default DonorDashboard;
