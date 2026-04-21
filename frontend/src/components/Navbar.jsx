import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { useNotifications } from '../context/NotificationContext';
import ThemeToggle from './ThemeToggle';
import { FiBell, FiClock } from 'react-icons/fi';
import api from '../api/axios';

const roleBadge = {
  donor: { label: 'Donor', bg: 'bg-green-100 text-[#2f855a]' },
  volunteer: { label: 'Volunteer', bg: 'bg-blue-100 text-blue-700' },
  ngo: { label: 'NGO', bg: 'bg-orange-100 text-orange-700' },
  admin: { label: 'Admin', bg: 'bg-purple-100 text-purple-700' },
};

// Format expiry for notification cards
const formatExpiry = (expiryTime) => {
  if (!expiryTime) return null;
  const diff = new Date(expiryTime) - new Date();
  if (diff <= 0) return { text: 'Expired', cls: 'text-red-500' };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const text = h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  const cls = diff < 2 * 3600000 ? 'text-rose-500 font-bold animate-pulse' : diff < 12 * 3600000 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400';
  return { text, cls };
};

const getNavLinks = (user) => {
  const links = [['Home', '/']];
  if (!user || user.role === 'volunteer' || user.role === 'ngo') {
    links.push(['Find Food', '/dashboard']);
  }
  if (!user || user.role === 'donor' || user.role === 'ngo') {
    links.push(['Donate Food', '/donate']);
  }
  links.push(['About', '/about']);
  return links;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll, popup, dismissPopup } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAccept = async (e, n) => {
    e.stopPropagation();
    try {
      if (!n.data || !n.data._id) return;
      await api.patch(`/food/${n.data._id}/claim`);
      if (!n.read) markAsRead();
      setNotifOpen(false);
      navigate(user?.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/volunteer');
    } catch (err) {
      console.error('Failed to claim food:', err);
      // Small alert to notify if it was already claimed by someone else
      alert(err.response?.data?.message || 'Failed to claim food. It might have been claimed already.');
    }
  };

  const badge = user ? roleBadge[user.role] : null;

  return (
    <>
      {/* ── Floating Popup (Claim / Chat) ─────────────────── */}
      {popup && (() => {
        const isChat = popup.type === 'CHAT_MESSAGE';
        const borderColor = isChat ? 'border-blue-200 dark:border-blue-700' : 'border-green-200 dark:border-green-700';
        const barBg = isChat ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900';
        const bar = isChat ? 'bg-blue-500' : 'bg-green-500';
        const icon = isChat ? '💬' : '🎉';
        const dashRoute = user?.role === 'donor' ? '/dashboard/donor'
          : user?.role === 'ngo' ? '/dashboard/ngo'
            : '/dashboard/volunteer';

        const handlePopupAction = () => {
          dismissPopup();
          // deliveryId is explicitly added; delivery comes from Message schema — check both
          const deliveryId = popup.data?.deliveryId || popup.data?.delivery;
          if (isChat && deliveryId) {
            navigate(dashRoute, {
              state: {
                openChat: {
                  deliveryId: deliveryId.toString(),
                  senderName: popup.data?.senderName,
                  senderRole: popup.data?.senderRole,
                  senderId: popup.data?.sender?.toString?.() || popup.data?.sender,
                }
              }
            });
          } else {
            navigate('/notifications/history');
          }
        };

        return (
          <div className="fixed bottom-6 right-6 z-[9999] w-80 animate-slide-up">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border ${borderColor} overflow-hidden`}>
              <div className={`h-1 ${barBg}`}>
                <div className={`h-1 ${bar} animate-shrink-x`} style={{ animationDuration: '5s' }} />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">{popup.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{popup.message}</p>
                  </div>
                  <button
                    onClick={dismissPopup}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-lg leading-none flex-shrink-0"
                    aria-label="Dismiss"
                  >×</button>
                </div>
                <button
                  onClick={handlePopupAction}
                  className={`mt-3 w-full text-xs font-bold hover:underline text-left ${isChat ? 'text-blue-600 dark:text-blue-400' : 'text-[#2f855a] dark:text-green-400'}`}
                >
                  {isChat ? 'Open chat to reply →' : 'View notification history →'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Main Navbar ──────────────────────────────────── */}
      <nav className="bg-[#fffaf4]/80 dark:bg-[#0a192f]/90 backdrop-blur-md text-[#2f855a] dark:text-green-400 sticky top-0 z-50 shadow-md border-b border-[#f4a261]/40 dark:border-blue-900/50 transition-colors duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[#1f6f43] hover:text-[#145a32] transition" to="/">
              <img src="/plateshare-logo.png" alt="PlateShare Logo" className="h-8 w-8 object-contain" />
              Plate Share
            </Link>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-3">
              {user && (
                <div className="relative">
                  <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-full hover:bg-orange-100 dark:hover:bg-gray-800 transition relative">
                    <FiBell size={22} />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>}
                  </button>
                </div>
              )}
              <ThemeToggle />
              <button
                className="p-2 rounded-md text-[#2f855a] dark:text-gray-300 hover:bg-[#fff0dd] dark:hover:bg-gray-800 transition"
                onClick={() => setIsOpen(!isOpen)}
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <ul className="flex items-center gap-1 lg:gap-2">
                {getNavLinks(user).map(([label, path]) => (
                  <li key={label}>
                    <Link to={path} className="px-3 py-2 rounded-md text-sm lg:text-base font-medium hover:bg-[#fff0dd] hover:text-[#1f6f43] transition-all duration-200 relative group">
                      {label}
                      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#1f6f43] transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}

                {/* Dashboard Link */}
                {user && (
                  <li>
                    <Link to={`/dashboard/${user.role}`} className="px-3 py-2 rounded-md text-sm lg:text-base font-medium hover:bg-[#fff0dd] hover:text-[#1f6f43] transition-all duration-200 relative group">
                      My Dashboard
                      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#1f6f43] transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                )}
              </ul>

              {/* User area */}
              <div className="ml-4 flex items-center gap-3">
                {/* Notification Bell */}
                {user && (
                  <div className="relative mr-2">
                    <button
                      onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAsRead(); }}
                      className="p-2 rounded-full hover:bg-orange-100 dark:hover:bg-gray-800 transition relative group"
                    >
                      <FiBell size={22} className="group-hover:scale-110 transition" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-orange-100 dark:border-gray-700 overflow-hidden animate-slide-down transition-all duration-300 z-[100]">
                        <div className="px-4 py-3 bg-orange-50 dark:bg-gray-700/50 border-b border-orange-100 dark:border-gray-700 flex justify-between items-center">
                          <span className="font-bold text-sm text-orange-800 dark:text-orange-400 uppercase tracking-wider">Alerts</span>
                          <button onClick={() => clearAll()} className="text-[10px] font-bold text-[#2f855a] dark:text-green-400 hover:underline">Clear all</button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                              <FiBell className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={32} />
                              <p className="text-gray-400 dark:text-gray-500 text-sm">No new alerts yet</p>
                            </div>
                          ) : (
                            notifications.map((n) => {
                              const isClaimed = n.type === 'FOOD_CLAIMED';
                              const expiry = !isClaimed ? formatExpiry(n.data?.expiryTime) : null;
                              return (
                                <div
                                  key={n.id}
                                  onClick={() => {
                                    setNotifOpen(false);
                                    if (!n.read) markAsRead();
                                    if (!isClaimed) navigate('/dashboard', { state: { targetFood: n.data } });
                                  }}
                                  className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer ${isClaimed ? 'bg-green-50/40 dark:bg-green-900/10 border-l-4 border-l-green-500' :
                                    !n.read ? 'bg-orange-50/30' : ''
                                    }`}
                                >
                                  <div className="flex gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${isClaimed ? 'bg-green-500' : 'bg-orange-400'}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{n.title}</p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                        {n.message}
                                        {n.distance && <span className="ml-1 text-green-600 dark:text-green-400 font-bold">({n.distance} km)</span>}
                                      </p>
                                      {!isClaimed && (
                                        <>
                                          {(n.data?.quantity || n.data?.unit) && (
                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                                              📦 {n.data.quantity} {n.data.unit}
                                            </p>
                                          )}
                                          {expiry && (
                                            <p className={`text-[10px] mt-0.5 font-semibold ${expiry.cls}`}>
                                              ⏱ {expiry.text}
                                            </p>
                                          )}
                                          {n.data?.description && (
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 italic truncate">{n.data.description}</p>
                                          )}
                                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">Just now · {n.data?.location}</p>
                                        </>
                                      )}
                                      {user?.role !== 'donor' && n.type === 'NEW_FOOD' && (
                                        <button
                                          onClick={(e) => handleAccept(e, n)}
                                          className="mt-2 bg-[#2f855a] hover:bg-[#1f6f43] text-white text-[10px] font-bold px-3 py-1.5 rounded transition"
                                        >
                                          Accept & Claim
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                          <button
                            onClick={() => { setNotifOpen(false); navigate('/notifications/history'); }}
                            className="text-xs font-bold text-[#2f855a] dark:text-green-400 hover:underline flex items-center gap-1"
                          >
                            <FiClock size={12} /> View History
                          </button>
                          <button onClick={() => setNotifOpen(false)} className="text-xs font-bold text-gray-500 hover:text-gray-700 transition">Close</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mr-2">
                  <ThemeToggle />
                </div>

                {user && badge && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.bg}`}>{badge.label}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden lg:block">{user.name}</span>
                  </div>
                )}
                {user ? (
                  <button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md font-semibold transition shadow-sm text-sm">
                    Logout
                  </button>
                ) : (
                  <Link to="/login" className="bg-[#2f855a] text-white hover:bg-[#1f6f43] px-4 py-2 rounded-md font-semibold transition shadow-sm text-sm">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Notification Slider (Drawer) */}
          {notifOpen && (
            <div className="md:hidden fixed inset-0 z-[100] transition-opacity duration-300">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={() => setNotifOpen(false)}
              />

              {/* Top Sheet - Now comes down from top */}
              <div className="absolute top-0 left-0 right-0 bg-white dark:bg-[#0a192f] rounded-b-3xl shadow-2xl border-b border-blue-900/40 animate-slide-down max-h-[90vh] flex flex-col transition-colors duration-300">

                <div className="px-6 pt-10 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-blue-900/20">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Alerts</h2>
                  <button
                    onClick={() => clearAll()}
                    className="text-xs font-bold text-[#2f855a] dark:text-green-400 py-1 px-3 bg-green-50 dark:bg-green-900/20 rounded-full"
                  >
                    Clear all
                  </button>
                </div>

                <div className="overflow-y-auto px-4 py-4 flex-grow">
                  {notifications.length === 0 ? (
                    <div className="py-20 text-center">
                      <FiBell size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                      <p className="text-gray-400 dark:text-gray-500 font-medium">No new alerts</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const isClaimed = n.type === 'FOOD_CLAIMED';
                      const expiry = !isClaimed ? formatExpiry(n.data?.expiryTime) : null;
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifOpen(false);
                            if (!isClaimed) navigate('/dashboard', { state: { targetFood: n.data } });
                          }}
                          className={`p-4 mb-3 cursor-pointer rounded-2xl shadow-sm transition-all hover:shadow-md ${isClaimed
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 border-l-4 border-l-green-500'
                            : `bg-[#fffaf4] dark:bg-[#112240] border border-orange-100 dark:border-blue-900/30 ${!n.read ? 'border-l-4 border-l-green-500' : ''}`
                            }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-base">{n.title}</p>
                            <span className="text-[10px] bg-white dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-500 font-bold border border-gray-100 dark:border-gray-700 italic">Just now</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{n.message}</p>
                          {!isClaimed && (
                            <>
                              {(n.data?.quantity || n.data?.unit) && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-semibold">
                                  📦 {n.data.quantity} {n.data.unit}
                                </p>
                              )}
                              {expiry && (
                                <p className={`text-xs mt-1 font-semibold ${expiry.cls}`}>⏱ {expiry.text}</p>
                              )}
                              {n.data?.description && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{n.data.description}</p>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                <p className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-tighter">Nearby · {n.data?.location}</p>
                                {n.distance && <span className="text-[11px] font-black text-green-600 dark:text-green-400">{n.distance} km</span>}
                              </div>
                            </>
                          )}
                          {user?.role !== 'donor' && n.type === 'NEW_FOOD' && (
                            <div className="mt-3">
                              <button
                                onClick={(e) => handleAccept(e, n)}
                                className="w-full bg-[#2f855a] hover:bg-[#1f6f43] text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm"
                              >
                                Accept & Claim
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom control area */}
                <div className="p-6 border-t border-gray-50 dark:border-blue-900/10 flex flex-col items-center gap-3">
                  <button
                    onClick={() => { setNotifOpen(false); navigate('/notifications/history'); }}
                    className="w-full py-2.5 bg-[#2f855a]/10 dark:bg-green-900/20 text-[#2f855a] dark:text-green-400 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm active:scale-95 transition-transform"
                  >
                    <FiClock size={14} /> View Notification History
                  </button>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl active:scale-95 transition-transform"
                  >
                    Close
                  </button>
                  {/* Visual handle at the very bottom */}
                  <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" onClick={() => setNotifOpen(false)} />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-[#f4a261]/20 dark:border-gray-700 p-2 space-y-1">
              {user && (
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge?.bg}`}>{badge?.label}</span>
                </div>
              )}
              {getNavLinks(user).map(([label, path]) => (
                <Link key={label} to={path} className="block px-4 py-2 rounded-md hover:bg-[#fffaf4] dark:hover:bg-gray-700 dark:text-gray-300 hover:text-[#1f6f43] dark:hover:text-green-400 transition" onClick={() => setIsOpen(false)}>
                  {label}
                </Link>
              ))}
              {user && (
                <Link to={`/dashboard/${user.role}`} className="block px-4 py-2 rounded-md hover:bg-[#fffaf4] dark:hover:bg-gray-700 dark:text-gray-300 hover:text-[#1f6f43] dark:hover:text-green-400 transition" onClick={() => setIsOpen(false)}>
                  My Dashboard
                </Link>
              )}

              {user ? (
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="block bg-[#2f855a] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#1f6f43] transition" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
