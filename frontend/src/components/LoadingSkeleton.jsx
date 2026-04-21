import React from 'react';

const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl shadow-md p-6 animate-pulse transition-colors duration-300">
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
  </div>
);

const LoadingSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export default LoadingSkeleton;
