/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const HISTORY_KEY = 'notif_history';

const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Persist history per user in localStorage
const loadHistory = (userId) => {
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { /* ignore */ return []; }
};

const saveHistory = (userId, history) => {
  try {
    // Keep last 100 items
    localStorage.setItem(`${HISTORY_KEY}_${userId}`, JSON.stringify(history.slice(0, 100)));
  } catch { /* ignore */ }
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [history, setHistory] = useState([]);
  // popup: { title, message, type } | null
  const [popup, setPopup] = useState(null);
  const popupTimer = useRef(null);
  // Dedicated state for read receipts — avoids lastEvent race conditions
  const [messagesReadEvent, setMessagesReadEvent] = useState(null);

  // Load history from localStorage whenever the logged-in user changes
  useEffect(() => {
    if (user?._id) {
      setHistory(loadHistory(user._id));
    } else {
      setHistory([]);
    }
  }, [user?._id]);

  // Helper: push to history and persist
  const addToHistory = useCallback((notif) => {
    if (!user?._id) return;
    setHistory(prev => {
      const updated = [notif, ...prev].slice(0, 100);
      saveHistory(user._id, updated);
      return updated;
    });
  }, [user?._id]);

  // Show popup for 5 seconds, then auto-dismiss
  const showPopup = useCallback((notification) => {
    setPopup(notification);
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => {
      setPopup(null);
    }, 5000);
  }, []);

  const dismissPopup = useCallback(() => {
    setPopup(null);
    if (popupTimer.current) clearTimeout(popupTimer.current);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem('token');
    const url = `http://${window.location.hostname}:5000/api/notifications/stream?token=${token}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastEvent(data);

        if (data.type === 'NEW_FOOD') {
          const lastLoc = JSON.parse(localStorage.getItem('lastLocation') || 'null');
          let isNearby = true;
          let distance = null;

          if (lastLoc && data.data?.coordinates?.lat && data.data?.coordinates?.lng) {
            distance = haversine(
              lastLoc.lat, lastLoc.lng,
              data.data.coordinates.lat, data.data.coordinates.lng
            );
            isNearby = distance <= 50;
          }

          if (isNearby) {
            const newNotif = {
              id: Date.now(),
              ...data,
              distance: distance ? distance.toFixed(1) : null,
              read: false,
              timestamp: new Date().toISOString()
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Add to history (volunteers/NGOs)
            addToHistory(newNotif);

            if (Notification.permission === 'granted') {
              new Notification(data.title, {
                body: `${data.message}${distance ? ` (${distance.toFixed(1)} km away)` : ''}`
              });
            }
          }
        }

        if (data.type === 'FOOD_CLAIMED') {
          const newNotif = {
            id: Date.now(),
            ...data,
            read: false,
            timestamp: new Date().toISOString()
          };
          // Add to bell
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          // Add to history (donor)
          addToHistory(newNotif);
          // Show floating popup
          showPopup(newNotif);

          if (Notification.permission === 'granted') {
            new Notification(data.title, { body: data.message });
          }

          // Auto-remove from bell after 5 seconds
          setTimeout(() => {
            setNotifications(prev => {
              const filtered = prev.filter(n => n.id !== newNotif.id);
              const removed = prev.length - filtered.length;
              if (removed > 0) setUnreadCount(c => Math.max(0, c - removed));
              return filtered;
            });
          }, 5000);
        }

        if (data.type === 'FOOD_REMOVED') {
          setNotifications(prev => {
            const filtered = prev.filter(
              n => !(n.type === 'NEW_FOOD' && n.data?._id === data.foodPostId)
            );
            const removedUnread = prev.filter(
              n => n.type === 'NEW_FOOD' && n.data?._id === data.foodPostId && !n.read
            ).length;
            if (removedUnread > 0) setUnreadCount(c => Math.max(0, c - removedUnread));
            return filtered;
          });
        }

        if (data.type === 'CHAT_MESSAGE') {
          const msgData = data.data || {};
          // Normalize: use explicit deliveryId, or fall back to the 'delivery' field from the message schema
          const deliveryId = msgData.deliveryId || msgData.delivery;
          showPopup({
            type: 'CHAT_MESSAGE',
            title: data.title || '💬 New Message',
            message: data.message || '',
            data: {
              ...msgData,
              deliveryId: deliveryId ? deliveryId.toString() : undefined,
              sender: msgData.sender ? msgData.sender.toString() : undefined,
            },
          });

          if (Notification.permission === 'granted') {
            new Notification(data.title || '💬 New Message', { body: data.message });
          }
        }

        if (data.type === 'MESSAGES_READ') {
          // Use dedicated state to avoid being overwritten by other SSE events
          setMessagesReadEvent({
            deliveryId: data.deliveryId,
            readIds: data.readIds || [],
            ts: Date.now(), // force React to re-trigger even if same delivery
          });
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [user, addToHistory, showPopup]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const clearHistory = useCallback(() => {
    if (!user?._id) return;
    setHistory([]);
    localStorage.removeItem(`${HISTORY_KEY}_${user._id}`);
  }, [user?._id]);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, markAsRead, clearAll,
      requestPermission, lastEvent,
      history, clearHistory,
      popup, dismissPopup,
      messagesReadEvent,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
