import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const foodIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const searchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Recenter map when coords change
const RecenterMap = ({ coords, zoom = 13 }) => {
  const map = useMap();
  useEffect(() => { if (coords) map.setView(coords, zoom); }, [coords, zoom, map]);
  return null;
};

// Location search control inside map
const MapSearchControl = ({ onSearch, searching }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="flex gap-2 shadow-xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a location… (e.g. Mangalore, Indiranagar)"
            className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2f855a] dark:focus:ring-green-500 text-sm shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="bg-[#2f855a] hover:bg-[#1f6f43] disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition shadow-sm whitespace-nowrap flex justify-center items-center"
        >
          {searching ? <Loader size="14px" borderSize="2px" color="rgba(255, 255, 255, 0.2)" pulseColor="#ffffff" /> : 'Go'}
        </button>
      </form>
    </div>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(null);
  const [userLocation, setUserLocation] = useState(null);   // GPS location (blue pin)
  const [searchLocation, setSearchLocation] = useState(null); // searched location (red pin)
  const [currentAddress, setCurrentAddress] = useState(''); // Text address
  const [mapCenter, setMapCenter] = useState(null);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState('list');
  const [radius, setRadius] = useState(50);
  const mapInitialized = useRef(false);

  // Active location for filtering = searchLocation ?? userLocation
  const activeLocation = searchLocation || userLocation;

  const fetchPosts = useCallback(async (loc) => {
    const loc_ = loc ?? activeLocation;
    try {
      const params = loc_ ? `?lat=${loc_.lat}&lng=${loc_.lng}&radius=${radius}` : '';
      const { data } = await api.get(`/food${params}`);
      setPosts(data);
    } catch {
      setToast({ message: 'Failed to load food posts', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [activeLocation, radius]);

  useEffect(() => {
    // Handle notification click routing
    if (location.state?.targetFood) {
      const food = location.state.targetFood;
      if (food.coordinates?.lat && food.coordinates?.lng) {
        const targetLoc = { lat: food.coordinates.lat, lng: food.coordinates.lng };
        setSearchLocation(targetLoc);
        setMapCenter([targetLoc.lat, targetLoc.lng]);
        setCurrentAddress(food.location);
        setView('map'); // Switch to map view to show the food location
        fetchPosts(targetLoc); // Fetch posts around that target

        // Clear state so a refresh doesn't trigger it again unnecessarily
        window.history.replaceState({}, document.title)
        return;
      }
    }

    fetchPosts();
  }, [fetchPosts, location.state]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      fallbackToIPLocation();
      return;
    }
    setLocating(true);
    localStorage.removeItem('lastLocation'); // Bypass cached location on explicit request
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setSearchLocation(null); // clear any searched location
        setMapCenter([loc.lat, loc.lng]);
        localStorage.setItem('lastLocation', JSON.stringify(loc));
        fetchPosts(loc);

        // Reverse geocode using BigDataCloud for better local accuracy in India
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${loc.lat}&longitude=${loc.lng}&localityLanguage=en`)
          .then((r) => r.json())
          .then((data) => {
            if (data.locality || data.city) {
              const short = [data.locality, data.city].filter(Boolean).join(', ');
              setCurrentAddress(short);
            }
          })
          .catch(() => { });

        if (!mapInitialized.current) setView('map');
        mapInitialized.current = true;
        setLocating(false);
        setToast({ message: `High-accuracy location found! Showing food within ${radius} km`, type: 'success' });
      },
      (error) => {
        console.warn('GPS failed or denied, trying IP fallback:', error.message);
        setToast({ message: 'GPS access denied or unavailable. Using approximate IP location...', type: 'warning' });
        fallbackToIPLocation();
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  const fallbackToIPLocation = async () => {
    setLocating(true);
    try {
      // Use BigDataCloud IP Geolocation as fallback (more reliable than ipapi)
      const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const loc = { lat: data.latitude, lng: data.longitude };
        setUserLocation(loc);
        setSearchLocation(null);
        setMapCenter([loc.lat, loc.lng]);
        localStorage.setItem('lastLocation', JSON.stringify(loc));
        fetchPosts(loc);

        const short = [data.locality, data.city].filter(Boolean).join(', ');
        setCurrentAddress(short);

        if (!mapInitialized.current) setView('map');
        mapInitialized.current = true;
        setToast({ message: `Location found! Showing food within ${radius} km`, type: 'success' });
      } else {
        throw new Error('Location incomplete');
      }
    } catch {
      setToast({ message: 'Failed to detect location. Please search manually.', type: 'error' });
    } finally {
      setLocating(false);
    }
  };

  // Google Maps geocode search
  const handleLocationSearch = async (query) => {
    setSearching(true);
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`
      );
      const data = await res.json();
      if (!data.features || !data.features.length) {
        setToast({ message: `No location found for "${query}"`, type: 'error' });
        return;
      }
      const [lng, lat] = data.features[0].geometry.coordinates;
      const loc = { lat, lng };
      const display_name = data.features[0].place_name;
      const shortAddress = display_name.split(',').slice(0, 3).join(', ');

      setSearchLocation(loc);
      setCurrentAddress(shortAddress);
      setMapCenter([loc.lat, loc.lng]);
      fetchPosts(loc);
      setView('map');
      setToast({ message: `Showing food near ${shortAddress}`, type: 'success' });
    } catch {
      setToast({ message: 'Search failed. Try again.', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  const clearLocationFilter = () => {
    setUserLocation(null);
    setSearchLocation(null);
    setCurrentAddress('');
    localStorage.removeItem('lastLocation');
    fetchPosts(null);
    setToast({ message: 'Location filter cleared. Showing all available food.', type: 'info' });
  };

  const handleClaim = async (postId, title) => {
    setClaiming(postId);
    try {
      await api.patch(`/food/${postId}/claim`);
      setToast({ message: `Claimed "${title}"`, type: 'success' });
      fetchPosts();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to claim', type: 'error' });
    } finally {
      setClaiming(null);
    }
  };

  const getFreshnessInfo = (expiry) => {
    const diff = new Date(expiry) - new Date();
    if (diff <= 0) return { text: 'Expired', colorClass: 'text-red-500 dark:text-red-400', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', label: 'EXPIRED' };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const timeStr = h > 0 ? `${h}h ${m}m left` : `${m}m left`;

    if (diff < 2 * 3600000) {
      return { text: timeStr, colorClass: 'text-rose-600 dark:text-rose-400 font-bold animate-pulse', badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse', label: 'URGENT' };
    } else if (diff < 12 * 3600000) {
      return { text: timeStr, colorClass: 'text-amber-600 dark:text-amber-400', badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'EAT SOON' };
    }
    return { text: timeStr, colorClass: 'text-emerald-600 dark:text-emerald-400', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'FRESH' };
  };

  const defaultCenter = [12.9141, 74.8560]; // Mangalore (Dynamic placeholder)
  const postsWithCoords = posts.filter((p) => p.coordinates?.lat && p.coordinates?.lng);

  return (
    <div className="w-screen px-4 py-8 sm:py-12 bg-[#fffdfb] dark:bg-gray-900 animate-fade-in min-h-screen transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1f6f43] dark:text-green-400">Available Food</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {activeLocation
                ? <>Showing {posts.length} posts {currentAddress && <span className="font-medium text-gray-700 dark:text-gray-300">near {currentAddress}</span>} within {radius} km</>
                : `${posts.length} available donations`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {activeLocation && (
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#2f855a] dark:focus:ring-green-500 focus:outline-none transition-colors"
              >
                {[5, 10, 20, 50, 100].map((r) => (
                  <option key={r} value={r}>{r} km</option>
                ))}
              </select>
            )}
            {activeLocation && (
              <button
                onClick={clearLocationFilter}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm h-[38px] justify-center border border-red-200 dark:border-red-800/30"
              >
                Clear all
              </button>
            )}
            <button
              onClick={detectLocation}
              disabled={locating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm h-[38px] min-w-[120px] justify-center"
            >
              {locating
                ? <Loader size="16px" borderSize="2px" color="rgba(255, 255, 255, 0.2)" pulseColor="#ffffff" />
                : <>{userLocation ? 'Update GPS' : 'Locate Me'}</>}
            </button>
            <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-colors">
              <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-semibold transition ${view === 'list' ? 'bg-[#2f855a] text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                ☰ List
              </button>
              <button onClick={() => setView('map')} className={`px-4 py-2 text-sm font-semibold transition ${view === 'map' ? 'bg-[#2f855a] text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                Map
              </button>
            </div>
          </div>
        </div>

        {/* MAP VIEW */}
        {view === 'map' && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 relative z-0 transition-colors" style={{ height: '500px' }}>
            <MapContainer
              center={mapCenter || defaultCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={`https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
              />
              <RecenterMap coords={mapCenter} />

              {/* GPS user marker + circle */}
              {userLocation && (
                <>
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup><b>Your GPS Location</b></Popup>
                  </Marker>
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={radius * 1000}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05 }}
                  />
                </>
              )}

              {/* Searched location marker + circle */}
              {searchLocation && (
                <>
                  <Marker position={[searchLocation.lat, searchLocation.lng]} icon={searchIcon}>
                    <Popup><b>Searched Location</b></Popup>
                  </Marker>
                  <Circle
                    center={[searchLocation.lat, searchLocation.lng]}
                    radius={radius * 1000}
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.05 }}
                  />
                </>
              )}

              {/* Food post markers */}
              {postsWithCoords.map((post) => (
                <Marker key={post._id} position={[post.coordinates.lat, post.coordinates.lng]} icon={foodIcon}>
                  <Popup>
                    <div style={{ minWidth: 200 }}>
                      <p style={{ fontWeight: 700, color: '#1f6f43', marginBottom: 4 }}>{post.title}</p>
                      <p style={{ fontSize: 13, color: '#555', margin: '2px 0' }}>Qty: {post.quantity} {post.unit}</p>
                      <p style={{ fontSize: 13, color: '#555', margin: '2px 0' }}>Loc: {post.location}</p>
                      <p style={{ fontSize: 13, color: '#555', margin: '2px 0' }}>Donor: {post.donor?.name}</p>
                      {post.distanceKm !== null && (
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', margin: '2px 0' }}>Dist: {post.distanceKm} km away</p>
                      )}
                      <p style={{ fontSize: 13, fontWeight: 700, color: getFreshnessInfo(post.expiryTime).text === 'Expired' ? '#ef4444' : (getFreshnessInfo(post.expiryTime).label === 'URGENT' ? '#e11d48' : '#059669'), margin: '4px 0' }}>
                        {getFreshnessInfo(post.expiryTime).label}: {getFreshnessInfo(post.expiryTime).text}
                      </p>
                      {user?.role === 'donor' ? (
                        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 6, fontStyle: 'italic' }}>Only volunteers can claim food</p>
                      ) : (
                        <button
                          onClick={() => handleClaim(post._id, post.title)}
                          disabled={claiming === post._id}
                          style={{ marginTop: 8, width: '100%', background: '#2f855a', color: '#fff', border: 'none', padding: '6px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12, height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          {claiming === post._id ? <Loader size="14px" borderSize="2px" color="rgba(255, 255, 255, 0.2)" pulseColor="#ffffff" /> : 'Claim'}
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Search Control overlaid on map */}
              <MapSearchControl onSearch={handleLocationSearch} searching={searching} />
            </MapContainer>
          </div>
        )}

        {/* Legend for map */}
        {view === 'map' && (
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Your GPS location</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Searched location</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Food available</span>
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          loading ? (
            <div className="p-12 flex justify-center"><Loader size="64px" borderSize="6px" color="rgba(47, 133, 90, 0.1)" pulseColor="#2f855a" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                {activeLocation ? `No food within ${radius} km` : 'No food available right now'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {activeLocation ? 'Try increasing the radius or searching a different area.' : 'Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">

                  <div className="p-5 flex-1 flex flex-col relative">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-[#1f6f43] dark:text-green-400">{post.title}</h3>
                      <span className="text-[10px] sm:text-xs bg-green-500 text-white font-bold px-2 py-1 rounded-full shadow-sm">Available</span>
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <p>Qty: <span className="font-medium">{post.quantity} {post.unit}</span></p>
                      <p>Loc: <span className="text-gray-800 dark:text-gray-200 block truncate">{post.location}</span></p>
                      <p>Donor: <span className="text-gray-800 dark:text-gray-200">{post.donor?.name}</span></p>
                      {post.distanceKm !== null && (
                        <p className="text-blue-600 dark:text-blue-400 font-semibold">Dist: {post.distanceKm} km away</p>
                      )}
                      {(() => {
                        const freshness = getFreshnessInfo(post.expiryTime);
                        return (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                            <p className={`font-semibold text-sm ${freshness.colorClass}`}>
                              {freshness.text}
                            </p>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${freshness.badgeClass}`}>
                              {freshness.label}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    {post.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic border-t dark:border-gray-700 pt-2">{post.description}</p>
                    )}
                  </div>
                  <div className="p-4 pt-0">
                    {user?.role === 'donor' ? (
                      <p className="text-xs text-center text-gray-400 dark:text-gray-500 italic py-2">Only volunteers can claim food</p>
                    ) : (
                      <button
                        onClick={() => handleClaim(post._id, post.title)}
                        disabled={claiming === post._id}
                        className="w-full bg-[#2f855a] hover:bg-[#1f6f43] disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition shadow-sm text-sm"
                      >
                        {claiming === post._id ? <Loader size="18px" borderSize="2px" color="rgba(255, 255, 255, 0.2)" pulseColor="#ffffff" /> : 'Claim Food'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
