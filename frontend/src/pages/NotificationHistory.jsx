import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const formatExpiry = (expiryTime) => {
  if (!expiryTime) return null;
  const diff = new Date(expiryTime) - new Date();
  if (diff <= 0) return { text: 'Expired', cls: 'text-red-500' };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const text = h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  const cls = diff < 2 * 3600000 ? 'text-rose-500 font-bold' : diff < 12 * 3600000 ? 'text-amber-500' : 'text-emerald-600';
  return { text, cls };
};

const typeLabel = {
  NEW_FOOD: { label: 'Food Available', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-500' },
  FOOD_CLAIMED: { label: 'Food Claimed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
};

const NotificationHistory = () => {
  const { history, clearHistory } = useNotifications();
  const { user } = useAuth();
  const [filter, setFilter] = useState('ALL');

  const filtered = history.filter(n => filter === 'ALL' || n.type === filter);

  const roleLabel = user?.role === 'donor' ? 'Donor' : user?.role === 'ngo' ? 'NGO' : 'Volunteer';

  return (
    <div className="min-h-screen bg-[#fffdfb] dark:bg-gray-900 px-4 py-10 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1f6f43] dark:text-green-400">Notification History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All past alerts for your <span className="font-semibold">{roleLabel}</span> account
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear all notification history?')) clearHistory(); }}
              className="text-sm font-bold text-red-500 hover:text-red-600 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg transition hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'NEW_FOOD', 'FOOD_CLAIMED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === f
                  ? 'bg-[#2f855a] text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#2f855a] dark:hover:border-green-600'
                }`}
            >
              {f === 'ALL' ? 'All' : f === 'NEW_FOOD' ? '🍱 Food Available' : '🎉 Claimed'}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 dark:text-gray-500 self-center font-medium">
            {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-xl font-bold text-gray-400 dark:text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {filter !== 'ALL' ? 'Try changing the filter above.' : 'Notifications will appear here as they arrive.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => {
              const isClaimed = n.type === 'FOOD_CLAIMED';
              const meta = typeLabel[n.type] || typeLabel['NEW_FOOD'];
              const expiry = !isClaimed ? formatExpiry(n.data?.expiryTime) : null;
              return (
                <div
                  key={n.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 transition hover:shadow-md ${isClaimed
                      ? 'border-green-200 dark:border-green-800 border-l-4 border-l-green-500'
                      : 'border-gray-100 dark:border-gray-700 border-l-4 border-l-blue-400'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-gray-800 dark:text-gray-100">{n.title}</p>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{n.message}</p>

                        {!isClaimed && (
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            {(n.data?.quantity || n.data?.unit) && (
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                📦 {n.data.quantity} {n.data.unit}
                              </span>
                            )}
                            {expiry && (
                              <span className={`font-semibold ${expiry.cls}`}>⏱ {expiry.text}</span>
                            )}
                            {n.data?.location && (
                              <span className="text-orange-600 dark:text-orange-400 font-medium truncate">
                                📍 {n.data.location}
                              </span>
                            )}
                            {n.distance && (
                              <span className="text-green-600 dark:text-green-400 font-bold">
                                {n.distance} km away
                              </span>
                            )}
                            {n.data?.description && (
                              <span className="text-gray-400 dark:text-gray-500 italic w-full">{n.data.description}</span>
                            )}
                          </div>
                        )}

                        {isClaimed && n.data && (
                          <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                            ✅ Claimed by {n.data.claimedByName} ({n.data.claimedByRole})
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap font-medium flex-shrink-0">
                      {formatTime(n.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;
