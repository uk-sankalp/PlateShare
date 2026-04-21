import React, { useState } from 'react';
import api from '../api/axios';
import { IoClose } from 'react-icons/io5';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

const RatingModal = ({ isOpen, onClose, delivery, volunteerName, onSuccess }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selected) { setError('Please pick a star rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/ratings', {
        deliveryId: delivery,
        stars: selected,
        note: note.trim(),
      });
      setDone(true);
      setTimeout(() => {
        onSuccess(selected);
        onClose();
      }, 1600);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStars = hovered || selected;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Rate your Volunteer</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              How was <span className="font-semibold text-[#2f855a]">{volunteerName || 'the volunteer'}</span>?
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1">
            <IoClose size={22} />
          </button>
        </div>

        {done ? (
          <div className="px-6 pb-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold text-[#2f855a] text-lg">Thank you for rating!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your feedback helps build trust in the community.</p>
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-5">

            {/* Star Picker */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setSelected(star)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={star <= activeStars ? '#f59e0b' : 'none'}
                        stroke={star <= activeStars ? '#f59e0b' : '#d1d5db'}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        className="transition-all duration-150"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <p className={`text-sm font-bold transition-all duration-200 ${activeStars ? 'text-amber-500' : 'text-gray-400'}`}>
                {activeStars ? LABELS[activeStars] : 'Tap a star'}
              </p>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Add a note <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                maxLength={300}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Share your experience..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-[#2f855a]/40 resize-none"
              />
              <p className="text-right text-[10px] text-gray-400 mt-0.5">{note.length}/300</p>
            </div>

            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !selected}
              className="w-full py-3 bg-[#2f855a] hover:bg-[#1f6f43] disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-sm active:scale-95"
            >
              {submitting ? 'Submitting…' : 'Submit Rating'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
