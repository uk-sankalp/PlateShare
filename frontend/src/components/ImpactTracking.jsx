import React, { useState, useEffect } from 'react';
import { FaUtensils, FaUsers, FaArrowUp } from 'react-icons/fa';
import api from '../api/axios';

const ImpactTracking = () => {
  const [impact, setImpact] = useState({ totalFoodShared: 0, peopleHelped: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const response = await api.get('/api/food/impact');
        setImpact(response.data);
      } catch (error) {
        console.error('Error fetching impact data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);

  return (
    <div className="w-screen px-4 py-16 sm:py-20 md:py-24 bg-[#fffdfb] dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1f6f43] dark:text-green-300 mb-4">
          Our Global Impact
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 sm:mb-16">
          See the real difference we're making together in bridging the gap between food waste and hunger.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Total Food Shared */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-t-4 border-[#2f855a] transform hover:-translate-y-2 transition duration-300">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 dark:bg-gray-700 rounded-full text-[#2f855a] dark:text-green-400">
                <FaUtensils size={40} />
              </div>
            </div>
            <h3 className="text-5xl font-extrabold text-[#2f855a] dark:text-green-400 mb-2">
              {loading ? '...' : impact.totalFoodShared} <span className="text-2xl text-gray-500">kg</span>
            </h3>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
              Food Rescued <FaArrowUp size={16} className="text-green-500" />
            </p>
          </div>

          {/* People Helped */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-t-4 border-[#f4a261] transform hover:-translate-y-2 transition duration-300">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-orange-100 dark:bg-gray-700 rounded-full text-[#f4a261]">
                <FaUsers size={40} />
              </div>
            </div>
            <h3 className="text-5xl font-extrabold text-[#f4a261] mb-2">
              {loading ? '...' : impact.peopleHelped} <span className="text-2xl text-gray-500">+</span>
            </h3>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
              People Fed <FaArrowUp size={16} className="text-orange-500" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactTracking;
