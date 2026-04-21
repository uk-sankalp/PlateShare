import React, { useState } from 'react';
import TooltipLinks from '../components/TooltipLinks';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message sent:", formData);
    alert("Thank you for contacting us! We'll get back to you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="w-screen px-4 py-12 sm:py-16 md:py-20 bg-[#fffdfb] dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400 mb-6 text-center">Contact Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-12">Have questions or want to partner with us? We'd love to hear from you!</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
          {/* Email */}
          <div className="hover-lift animate-slide-up-delay-1 bg-teal-50 dark:bg-teal-900/30 p-8 rounded-lg text-center border-2 border-teal-200 dark:border-teal-800/50 transition-colors duration-300 cursor-default">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-2">Email</h3>
            <p className="text-gray-700 dark:text-gray-300">hello@plateshare.com</p>
          </div>

          {/* Phone */}
          <div className="hover-lift animate-slide-up-delay-2 bg-yellow-50 dark:bg-yellow-900/30 p-8 rounded-lg text-center border-2 border-yellow-200 dark:border-yellow-800/50 transition-colors duration-300 cursor-default">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">Phone</h3>
            <p className="text-gray-700 dark:text-gray-300">+1 (555) 123-4567</p>
          </div>

          {/* Address */}
          <div className="hover-lift animate-slide-up-delay-3 bg-orange-50 dark:bg-orange-900/30 p-8 rounded-lg text-center border-2 border-orange-200 dark:border-orange-800/50 transition-colors duration-300 cursor-default">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-2">Address</h3>
            <p className="text-gray-700 dark:text-gray-300">123 Main Street<br />Bangalore, India</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto bg-gray-50 dark:bg-gray-800 p-8 sm:p-12 rounded-lg shadow-lg border border-transparent dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                className="input-glow w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base transition-all duration-200"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                className="input-glow w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base transition-all duration-200"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                className="input-glow w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base transition-all duration-200"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Message</label>
              <textarea
                name="message"
                className="input-glow w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base transition-all duration-200"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message here..."
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-press w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 px-4 rounded-lg transition text-base min-h-12">Send Message</button>
          </form>
        </div>

        {/* Social Media / Additional Info */}
        <div className="max-w-2xl mx-auto mt-16 bg-green-50 dark:bg-green-900/30 p-8 rounded-lg text-center border-2 border-green-200 dark:border-green-800/50 transition-colors duration-300 relative pb-12 overflow-hidden">
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Follow Us</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-12">Connect with us on social media for updates and stories</p>
          <div className="flex justify-center h-16 relative z-10">
            <TooltipLinks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
