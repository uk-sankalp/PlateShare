import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

/* ─── Reusable floating-label field (defined OUTSIDE Donate so React never
       recreates its identity on re-render, which would unmount the input
       and lose focus after every keystroke) ─────────────────────────── */
const Field = ({ id, label, name, type = 'text', required = false, min, formData, onChange }) => {
  const isDatetime = type === 'datetime-local';
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        name={name}
        value={formData[name]}
        onChange={onChange}
        required={required}
        min={min}
        placeholder=" "
        className="peer w-full px-3.5 pt-5 pb-2 text-sm border border-[#dadce0] dark:border-gray-600 rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-blue-500"
      />
      <label
        htmlFor={id}
        className={
          isDatetime
            ? 'absolute left-3.5 top-2 text-xs font-medium text-[#5f6368] dark:text-gray-400 peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400 pointer-events-none transition-all'
            : 'absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#5f6368] dark:text-gray-400 pointer-events-none transition-all duration-200 ' +
            'peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400 ' +
            'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium'
        }
      >
        {label}
      </label>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────── */

const Donate = () => {
  const [formData, setFormData] = useState({
    title: '',
    quantity: '',
    unit: 'kg',
    location: '',
    preparedTime: '',
    expiryTime: '',
    description: '',
  });
  const [coordinates, setCoordinates] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { detectLocation(); }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setToast({ message: 'Geolocation not supported by your browser.', type: 'error' });
      return;
    }
    setLocating(true);
    setFormData((prev) => ({ ...prev, location: 'Locating...' })); // Temporary loading state
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
          headers: { 'User-Agent': 'PlateShareApp/1.0' }
        })
          .then((r) => r.json())
          .then((data) => {
            if (data && data.display_name) {
              const fullAddress = data.display_name;
              setFormData((prev) => ({ ...prev, location: fullAddress }));
              setToast({ message: 'Location detected successfully!', type: 'success' });
            } else {
              setToast({ message: 'Could not fetch address name from Map.', type: 'error' });
            }
          })
          .catch(() => {
            setToast({ message: 'Could not fetch address name.', type: 'error' });
          })
          .finally(() => setLocating(false));
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setToast({ message: 'GPS Denied. Please unblock "localhost" in browser site settings.', type: 'error' });
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setToast({ message: 'Location info is unavailable.', type: 'error' });
        } else if (error.code === error.TIMEOUT) {
          setToast({ message: 'Location request timed out.', type: 'error' });
        } else {
          setToast({ message: `Error: ${error.message}`, type: 'error' });
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setToast({ message: 'Please select an image file', type: 'error' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Image size should be less than 5MB', type: 'error' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';

    try {
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadRes = await api.post('/food/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      await api.post('/food', { ...formData, coordinates, imageUrl });
      setToast({ message: 'Food posted successfully! Volunteers will contact you soon.', type: 'success' });
      setFormData({ title: '', quantity: '', unit: 'kg', location: '', preparedTime: '', expiryTime: '', description: '' });
      setCoordinates(null);
      removeImage();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to post food', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen w-screen bg-[#f8f9fa] dark:bg-gray-900 px-4 py-10 animate-fade-in transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#202124] dark:text-gray-100">Post a Food Donation</h1>
          <p className="text-[#5f6368] dark:text-gray-400 text-sm mt-1">Share surplus food and let volunteers deliver it to those in need</p>
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#dadce0] dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-6 py-4 border-b border-[#e8eaed] dark:border-gray-700 flex items-center gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#202124] dark:text-gray-200">New Food Listing</h2>
              <p className="text-xs text-[#5f6368] dark:text-gray-400">Fill in the details below</p>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Food name */}
              <Field id="title" label="Food name (e.g. Rice & Curry, Biryani)" name="title" required formData={formData} onChange={handleChange} />

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <Field id="quantity" label="Quantity" name="quantity" type="number" required min="1" formData={formData} onChange={handleChange} />
                <div className="relative">
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3.5 pt-5 pb-2 text-sm border border-[#dadce0] dark:border-gray-600 rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-blue-500 appearance-none"
                  >
                    {['kg', 'g', 'litre', 'ml', 'pieces', 'plates'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <label className="absolute left-3.5 top-2 text-xs font-medium text-[#5f6368] dark:text-gray-400 pointer-events-none">Unit</label>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-[#202124] dark:text-gray-200 mb-2">Food Photo</label>
                {!imagePreview ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#dadce0] dark:border-gray-600 border-dashed rounded-lg hover:border-[#1a73e8] dark:hover:border-blue-500 transition-colors bg-[#f8f9fa] dark:bg-gray-800/50">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-[#9aa0a6] dark:text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-[#5f6368] dark:text-gray-400 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-[#1a73e8] dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1a73e8] px-1">
                          <span>Take a photo or upload</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" capture="environment" onChange={handleImageChange} />
                        </label>
                      </div>
                      <p className="text-xs text-[#9aa0a6] dark:text-gray-500 mt-2">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-[#dadce0] dark:border-gray-600 inline-block w-full">
                    <div className="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative group">
                      <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={removeImage} className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors shadow-sm" title="Remove photo">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup location */}
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder=" "
                      className="peer w-full px-3.5 pt-5 pb-2 text-sm border border-[#dadce0] dark:border-gray-600 rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-blue-500"
                    />
                    <label
                      htmlFor="location"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#5f6368] dark:text-gray-400 pointer-events-none transition-all duration-200
                        peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400
                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
                    >
                      Pickup address
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    title="Auto-detect location"
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#e8f0fe] dark:bg-blue-900/30 hover:bg-[#d2e3fc] dark:hover:bg-blue-900/50 text-[#1a73e8] dark:text-blue-400 text-xs font-medium rounded-lg border border-[#d2e3fc] dark:border-blue-800/50 transition-all disabled:opacity-60"
                  >
                    {locating ? (
                      <Loader size="14px" borderSize="2px" color="rgba(26, 115, 232, 0.2)" pulseColor="#1a73e8" />
                    ) : (
                      <>Detect</>
                    )}
                  </button>
                </div>
                {coordinates && (
                  <p className="text-xs text-[#188038] mt-1.5 flex items-center gap-1">
                    GPS captured ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})
                  </p>
                )}
              </div>

              {/* Prepared Date/Time & Available until */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="preparedTime" label="Prepared at" name="preparedTime" type="datetime-local" required formData={formData} onChange={handleChange} />
                <Field id="expiryTime" label="Available until" name="expiryTime" type="datetime-local" required formData={formData} onChange={handleChange} />
              </div>

              {/* Description */}
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder=" "
                  className="peer w-full px-3.5 pt-5 pb-2 text-sm border border-[#dadce0] dark:border-gray-600 rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-blue-500 resize-none"
                />
                <label
                  className="absolute left-3.5 top-4 text-sm text-[#5f6368] dark:text-gray-400 pointer-events-none transition-all duration-200
                    peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400
                    peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
                >
                  Description <span className="text-[#9aa0a6] dark:text-gray-500 font-normal">(optional)</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2f855a] hover:bg-[#1f6f43] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-all text-sm shadow-sm hover:shadow-md duration-200 flex justify-center items-center"
              >
                {loading ? <Loader size="20px" borderSize="2px" color="rgba(255, 255, 255, 0.2)" pulseColor="#ffffff" /> : 'Post Food Now'}
              </button>
            </form>
          </div>
        </div>

        {/* Tips card */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-[#dadce0] dark:border-gray-700 p-5 shadow-sm transition-colors duration-300">
          <div className="flex items-start gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#202124] dark:text-gray-200 mb-2">Tips for better results</h3>
              <ul className="text-xs text-[#5f6368] dark:text-gray-400 space-y-1.5">
                <li className="flex items-start gap-1.5"><span className="text-[#188038] mt-0.5">-</span> Click "Detect" to auto-fill your location and appear on the map</li>
                <li className="flex items-start gap-1.5"><span className="text-[#188038] mt-0.5">-</span> Be accurate about quantity and expiry time</li>
                <li className="flex items-start gap-1.5"><span className="text-[#188038] mt-0.5">-</span> Include dietary info and allergens in the description</li>
                <li className="flex items-start gap-1.5"><span className="text-[#188038] mt-0.5">-</span> Respond quickly to volunteer messages</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Donate;