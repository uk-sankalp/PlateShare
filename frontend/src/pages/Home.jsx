import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import hero1 from '../assets/hero_1.png';
import hero2 from '../assets/hero_2.png';
import hero3 from '../assets/hero_3.png';
import hero4 from '../assets/hero_charity.jpg';
import hero5 from '../assets/hero_waste.png';
import TooltipLinks from '../components/TooltipLinks';
import ImpactTracking from '../components/ImpactTracking';

const heroImages = [hero1, hero2, hero3, hero4, hero5];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-screen text-[#2f855a] relative bg-[#fffdfb] dark:bg-[#0a192f] transition-colors duration-300">

      {/* All page content sits above the overlay */}
      <div className="relative z-10">

        {/* Hero Section */}
        <div className="w-screen px-4 py-16 sm:py-24 md:py-32 text-center bg-[#fffaf4]/80 dark:bg-gray-900/80 backdrop-blur-sm transition-colors duration-300">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 lg:text-left animate-slide-up">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1f6f43] dark:text-green-400 mb-4 sm:mb-6">
                Share Food, Save Lives
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8 sm:mb-12">
                <b>Connect food donors with those in need. Reduce waste. Help communities.</b>
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full px-4">
                <Link
                  to="/donate"
                  className="btn-press bg-[#2f855a] hover:bg-[#1f6f43] text-white font-bold py-4 sm:py-5 px-10 sm:px-14 rounded-full text-lg transition min-h-14 inline-block shadow-md"
                >
                  Donate Food
                </Link>
                <Link
                  to="/dashboard"
                  className="btn-press border-2 border-[#2f855a] dark:border-green-500 text-[#2f855a] dark:text-green-400 hover:bg-[#fffaf4] dark:hover:bg-gray-800 font-bold py-4 sm:py-5 px-10 sm:px-14 rounded-full text-lg transition min-h-14 inline-block"
                >
                  Request Food
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end">
              <div className="animate-float relative w-full max-w-md lg:max-w-lg aspect-square overflow-hidden rounded-2xl shadow-xl scale-105">
                {heroImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Community sharing food ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                  />
                ))}

                {/* Slide indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? 'bg-white scale-125 shadow' : 'bg-white/50 hover:bg-white/80'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="w-screen px-4 py-16 sm:py-20 md:py-24 transition-colors duration-300 bg-[#fffdfb]/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-[#1f6f43] dark:text-green-400">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">

            <div className="bg-[#fffaf4] dark:bg-gray-800 p-8 rounded-lg border-2 border-[#f4a261]/40 dark:border-gray-700 text-center hover:shadow-lg transition">
              <h3 className="text-2xl font-bold text-[#2f855a] dark:text-green-400 mb-3">Post Food</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Donors share available food with details like quantity, location, and expiry time.
              </p>
            </div>

            <div className="bg-[#fffaf4] dark:bg-gray-800 p-8 rounded-lg border-2 border-[#f4a261]/40 dark:border-gray-700 text-center hover:shadow-lg transition">
              <h3 className="text-2xl font-bold text-[#2f855a] dark:text-green-400 mb-3">Find Nearby</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Browse available food in real-time with location and delivery information.
              </p>
            </div>

            <div className="bg-[#fffaf4] dark:bg-gray-800 p-8 rounded-lg border-2 border-[#f4a261]/40 dark:border-gray-700 text-center hover:shadow-lg transition">
              <h3 className="text-2xl font-bold text-[#2f855a] dark:text-green-400 mb-3">Deliver & Help</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Volunteers coordinate delivery and ensure food reaches those in need.
              </p>
            </div>

          </div>
        </div>

        {/* Features */}
        <div className="w-screen px-4 py-16 sm:py-20 md:py-24 transition-colors duration-300 bg-[#fffaf4]/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-[#1f6f43] dark:text-green-400">
            Features
          </h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">

            <div className="hover-lift bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#2f855a] dark:border-green-500 cursor-default">
              <h3 className="text-xl font-bold text-[#2f855a] dark:text-green-400 mb-3">📡 Real-time Location</h3>
              <p className="text-gray-700 dark:text-gray-300">Find food and volunteers near you with instant location tracking.</p>
            </div>

            <div className="hover-lift bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#f4a261] cursor-default">
              <h3 className="text-xl font-bold text-[#f4a261] mb-3">💬 Direct Chat</h3>
              <p className="text-gray-700 dark:text-gray-300">Communicate directly with donors and volunteers for coordination.</p>
            </div>

            <div className="hover-lift bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#2f855a] dark:border-green-500 cursor-default">
              <h3 className="text-xl font-bold text-[#2f855a] dark:text-green-400 mb-3">🔔 Notifications</h3>
              <p className="text-gray-700 dark:text-gray-300">Get instant alerts when new food is posted nearby.</p>
            </div>

            <div className="hover-lift bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#f4a261] cursor-default">
              <h3 className="text-xl font-bold text-[#f4a261] mb-3">📊 Impact Tracking</h3>
              <p className="text-gray-700 dark:text-gray-300">See how much food was shared and people helped.</p>
            </div>

          </div>
        </div>

        {/* Impact Tracking Section */}
        <ImpactTracking />

        {/* CTA Section */}
        <div className="w-screen px-4 py-16 sm:py-20 md:py-24 bg-gradient-to-r from-[#2f855a] to-[#1f6f43] text-white text-center transition-colors duration-300">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            Join thousands of people sharing food and reducing waste
          </p>
          <Link
            to="/register"
            className="btn-press inline-block bg-[#f4a261] text-white hover:bg-[#e76f51] font-bold py-4 sm:py-5 px-10 sm:px-14 rounded-full text-lg transition min-h-14 shadow-md"
          >
            Get Started Today
          </Link>
        </div>

        {/* Footer */}
        <footer className="w-screen bg-[#1f6f43] dark:bg-gray-950 text-white px-4 py-12 sm:py-16 transition-colors duration-300">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Plate Share</h3>
              <p className="text-white/80 dark:text-gray-300">Connecting communities through food sharing and reducing waste.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/80 dark:text-gray-300">
                <li><Link to="/about" className="hover:text-[#f4a261] transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-[#f4a261] transition">Contact</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#f4a261] transition">Browse Food</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-white/80 dark:text-gray-300">
                <li><Link to="/donate" className="hover:text-[#f4a261] transition">Donate Food</Link></li>
                <li><Link to="/register" className="hover:text-[#f4a261] transition">Volunteer</Link></li>
                <li><Link to="/register" className="hover:text-[#f4a261] transition">Join NGO</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/30 pt-8 flex flex-col items-center justify-center text-white/70">
            <TooltipLinks />
            <p className="mt-6">&copy; 2026 Plate Share. Sharing food, saving lives.</p>
          </div>
        </footer>
      </div>{/* end z-10 content wrapper */}
    </div>
  );
};

export default Home;