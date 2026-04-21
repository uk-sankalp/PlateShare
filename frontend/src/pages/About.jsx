import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="w-screen px-4 py-12 sm:py-16 md:py-20 bg-[#fffdfb] dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto mb-16 animate-slide-up">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400 mb-6">About Plate Share</h1>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">We're on a mission to reduce food waste and hunger by connecting communities through food sharing.</p>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
        <div className="hover-lift bg-green-50 dark:bg-green-900/30 p-8 rounded-lg border-2 border-green-200 dark:border-green-800/50 transition-colors duration-300 cursor-default">
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">🎯 Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300">To bridge the gap between food waste and hunger by creating a platform that empowers communities to share surplus food, reduce waste, and help those in need.</p>
        </div>
        <div className="hover-lift bg-blue-50 dark:bg-blue-900/30 p-8 rounded-lg border-2 border-blue-200 dark:border-blue-800/50 transition-colors duration-300 cursor-default">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">🌟 Our Vision</h2>
          <p className="text-gray-700 dark:text-gray-300">A world where no food is wasted and no one goes hungry. Where communities come together to ensure every meal reaches those who need it most.</p>
        </div>
      </div>

      {/* The Problem */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">The Problem</h2>
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-lg border-l-4 border-red-600 transition-colors duration-300">
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-red-600 dark:text-red-500 font-bold mr-4">•</span>
              <span><strong>1.3 Billion Tons</strong> of food is wasted globally every year</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 dark:text-red-500 font-bold mr-4">•</span>
              <span><strong>690 Million</strong> people suffer from hunger while food is discarded</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 dark:text-red-500 font-bold mr-4">•</span>
              <span><strong>1 in 10</strong> people lack access to adequate nutrition</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 dark:text-red-500 font-bold mr-4">•</span>
              <span>Restaurants and homes throw away perfectly good food daily</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The Solution */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">Our Solution</h2>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-lg border-l-4 border-orange-600 transition-colors duration-300">
          <p className="text-gray-700 dark:text-gray-300 mb-6">Plate Share is a technology platform that makes food sharing easy, safe, and impactful. We connect:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-transparent dark:border-gray-700">
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-3">🧑‍🍳 Donors</h3>
              <p className="text-gray-700 dark:text-gray-300">Post surplus food and reach people who can use it</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-transparent dark:border-gray-700">
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">🤝 Volunteers</h3>
              <p className="text-gray-700 dark:text-gray-300">Coordinate delivery and help the community</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-transparent dark:border-gray-700">
              <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-3">🧍 Recipients</h3>
              <p className="text-gray-700 dark:text-gray-300">Access nutritious food in their area</p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">Our Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="stat-card bg-orange-100 dark:bg-orange-900/30 p-8 rounded-lg text-center border border-transparent dark:border-orange-800/50 transition-colors duration-300 cursor-default">
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">1000+</div>
            <p className="text-gray-700 dark:text-gray-300">Meals Shared</p>
          </div>
          <div className="stat-card bg-emerald-100 dark:bg-emerald-900/30 p-8 rounded-lg text-center border border-transparent dark:border-emerald-800/50 transition-colors duration-300 cursor-default">
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">500+</div>
            <p className="text-gray-700 dark:text-gray-300">Active Donors</p>
          </div>
          <div className="stat-card bg-red-100 dark:bg-red-900/30 p-8 rounded-lg text-center border border-transparent dark:border-red-800/50 transition-colors duration-300 cursor-default">
            <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">200+</div>
            <p className="text-gray-700 dark:text-gray-300">Volunteers</p>
          </div>
          <div className="stat-card bg-slate-100 dark:bg-slate-800 p-8 rounded-lg text-center border border-transparent dark:border-gray-700 transition-colors duration-300 cursor-default">
            <div className="text-4xl font-bold text-slate-600 dark:text-slate-400 mb-2">50+</div>
            <p className="text-gray-700 dark:text-gray-300">NGO Partners</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 sm:p-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-6">Join Our Movement</h2>
        <p className="text-lg mb-8 opacity-90">Be part of the solution. Share food, help communities, reduce waste.</p>
        <Link to="/register" className="btn-press inline-block bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition min-h-12">Get Started</Link>
      </div>
    </div>
  );
};

export default About;
