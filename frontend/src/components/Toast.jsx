import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-[#2f855a] text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-lg shadow-xl animate-fade-in ${colors[type]}`}>
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
};

export default Toast;
