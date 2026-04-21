import React from 'react';
import './CookieNotice.css';

const CookieNotice = ({ onAccept }) => {
  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    } else {
      localStorage.setItem('cookiesAccepted', 'true');
      window.location.reload();
    }
  };

  return (
    <div className="cookie-card-container relative z-[9999]">
      <div className="cookie-card bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 max-w-sm mx-4">
        <span className="title text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">🍪 Cookie Notice</span>
        <p className="description text-sm text-gray-600 dark:text-gray-300 mb-6">
          You must accept cookies to access and use PlateShare. Without accepting cookies, you cannot log in or use any application features. <a href="#" className="underline text-blue-500">Read policies</a>.
        </p>
        <div className="actions flex flex-col sm:flex-row gap-3">
          <button className="pref bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition" onClick={() => alert("Cookie consent is strictly required for this app.")}>
            Preferences
          </button>
          <button className="accept bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex-1" onClick={handleAccept}>
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieNotice;
