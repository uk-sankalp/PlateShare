import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useNotifications } from '../context/NotificationContext';
import { IoClose, IoSend, IoImageOutline, IoCloseCircle } from 'react-icons/io5';

// WhatsApp-style tick icon
const TickIcon = ({ read }) => (
  <svg viewBox="0 0 16 11" width="16" height="11" className="inline-block ml-1 flex-shrink-0">
    {/* First tick */}
    <path
      d={read
        ? 'M1 5.5L4.5 9 10 3'
        : 'M1.5 5.5L5 9 10.5 3.5'}
      fill="none"
      stroke={read ? '#2f855a' : '#8696a0'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Second tick (slightly offset right) */}
    <path
      d={read
        ? 'M5 5.5L8.5 9 14 3'
        : 'M5.5 5.5L9 9 14.5 3.5'}
      fill="none"
      stroke={read ? '#2f855a' : '#8696a0'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatModal = ({ isOpen, onClose, deliveryId, currentUser, targetUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const { lastEvent, messagesReadEvent } = useNotifications();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && deliveryId) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, deliveryId]);

  useEffect(() => {
    if (!lastEvent) return;
    // Real-time new chat message arriving
    if (lastEvent.type === 'CHAT_MESSAGE' && lastEvent.data?.delivery === deliveryId) {
      setMessages(prev => {
        if (prev.find(m => m._id === lastEvent.data._id)) return prev;
        return [...prev, lastEvent.data];
      });
      scrollToBottom();
    }
  }, [lastEvent, deliveryId]);

  // Blue tick: when MESSAGES_READ fires for this delivery, silently re-fetch
  // (server is authoritative — avoids any SSE ID comparison issues)
  useEffect(() => {
    if (!messagesReadEvent) return;
    if (messagesReadEvent.deliveryId?.toString() !== deliveryId?.toString()) return;
    // Silent re-fetch — no loading spinner
    api.get(`/messages/${deliveryId}`).then(({ data }) => {
      setMessages(data);
    }).catch(() => { });
  }, [messagesReadEvent, deliveryId]);

  // Fallback polling: re-fetch every 5s while chat is open (catches ticks if SSE misses)
  useEffect(() => {
    if (!isOpen || !deliveryId) return;
    const interval = setInterval(() => {
      api.get(`/messages/${deliveryId}`).then(({ data }) => {
        setMessages(data);
      }).catch(() => { });
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, deliveryId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${deliveryId}`);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    setSending(true);
    let uploadedImageUrl = '';

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/messages/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrl = uploadRes.data.imageUrl;
      }

      const { data } = await api.post('/messages', {
        deliveryId,
        receiverId: targetUser._id || targetUser.id,
        text: text.trim(),
        imageUrl: uploadedImageUrl
      });

      setMessages(prev => [...prev, data]);
      setText('');
      removeImage();
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-fade-in border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="px-5 py-4 bg-[#2f855a] text-white flex justify-between items-center shadow-md z-10 shrink-0">
          <div>
            <h3 className="font-bold text-lg">{targetUser?.name || 'User'}</h3>
            <p className="text-xs text-green-100 opacity-90">{targetUser?.role ? targetUser.role.charAt(0).toUpperCase() + targetUser.role.slice(1) : ''}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition cursor-pointer">
            <IoClose size={24} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundColor: '#efeae2',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232f855a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-200 border-t-[#2f855a] rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm">
                <p>No messages yet.</p>
                <p className="text-sm mt-1">Send a message to coordinate with {targetUser?.name.split(' ')[0]}!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender === currentUser._id || msg.sender === currentUser.id;

              // Handle formatting for date separation
              const msgDate = new Date(msg.createdAt).toLocaleDateString();
              const prevMsgDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toLocaleDateString() : null;
              const showDateLabel = msgDate !== prevMsgDate;

              return (
                <div key={msg._id || idx}>
                  {showDateLabel && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded-full">{msgDate}</span>
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                    <div
                      className={`relative px-3 pt-1.5 pb-5 rounded-lg max-w-[85%] sm:max-w-[75%] break-words shadow-sm text-[15px]
                        ${isMe
                          ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-none'
                          : 'bg-white text-gray-900 rounded-tl-none'
                        }`}
                    >
                      {/* WhatsApp-style tail */}
                      <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-2 bg-[#dcf8c6]' : '-left-2 bg-white'}`} style={{ clipPath: isMe ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 0 0, 100% 100%)' }} />

                      {msg.imageUrl && (
                        <div className="mb-1 -mx-2 -mt-1 pt-1 px-1">
                          <img
                            src={`http://${window.location.hostname}:5000${msg.imageUrl}`}
                            alt="Attachment"
                            className="rounded-lg max-h-60 w-auto object-cover cursor-pointer hover:opacity-95 transition"
                          />
                        </div>
                      )}

                      {msg.text && (
                        <div className={`leading-snug ${isMe ? 'pr-14' : 'pr-10'}`}>
                          {msg.text}
                        </div>
                      )}

                      <div className="text-[10px] text-gray-500 absolute bottom-1.5 right-2 flex items-center gap-0.5 opacity-80 whitespace-nowrap">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <TickIcon read={!!msg.read} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-[#f0f2f5] dark:bg-gray-900 flex flex-col gap-2 shrink-0">

          {/* Image Preview Area */}
          {imagePreview && (
            <div className="relative w-max mb-1">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <img src={imagePreview} alt="Preview" className="h-20 w-auto object-contain rounded-md" />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-white text-gray-600 hover:text-red-500 rounded-full shadow-md"
                >
                  <IoCloseCircle size={24} />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-end gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700 bg-white p-2.5 rounded-full shadow-sm transition flex-shrink-0 self-end mb-0.5"
            >
              <IoImageOutline size={22} />
            </button>

            <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm px-4 py-2 min-h-[44px] flex items-center">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent text-gray-800 dark:text-gray-100 text-[15px] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending || (!text.trim() && !imageFile)}
              className="bg-[#2f855a] hover:bg-[#1f6f43] disabled:opacity-50 text-white p-3 rounded-full transition shadow-sm flex-shrink-0 self-end mb-0.5"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <IoSend size={20} className="ml-0.5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
