// app/contact/page.jsx
'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import { Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { contactAPI } from '@/lib/api/contact';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await contactAPI.submitContact(formData);
      setSuccess(true);
      setFormData({ name: '', subject: '', email: '', message: '' });
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#3b82f6] opacity-90" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl font-bold text-white mb-4">Contact Us</h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="bg-[#ecfeff] py-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Have any queries section */}
          <div className="text-center mb-16">
            <p className="text-gray-600 text-lg mb-2">Have any queries?</p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">We are here to help.</h2>
            <div className="w-24 h-1 bg-[#2563eb] mx-auto"></div>
          </div>

          {/* Need Assistance Card */}
          <div className="bg-white rounded-lg shadow-md p-10 max-w-3xl mx-auto mb-16 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Need assistance?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We are here to help. Reach out with any questions, feedback, or concerns and our team will get back to you shortly.
            </p>
            <div className="space-y-3">
              <a 
                href="tel:+4407721562843" 
                className="text-[#2563eb] hover:text-[#1d4ed8] font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                (+44) 07721562843
              </a>
              <a 
                href="mailto:info@eloravista.com" 
                className="text-[#2563eb] hover:text-[#1d4ed8] font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                info@eloravista.com
              </a>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            
            {/* Left Side - Text Content */}
            <div className="bg-white rounded-lg p-8">
              <p className="text-gray-600 font-semibold mb-2">Do not be a stranger!</p>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">You tell us. We listen.</h3>
              <p className="text-gray-600 leading-relaxed">
                We are always happy to help. Whether you have a question, need support, or want to share feedback, our team is here to assist and will get back to you as soon as possible.
              </p>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              {success && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  Thank you! Your message has been sent successfully. We wll get back to you soon.
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="NAME"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="SUBJECT"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="EMAIL"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <textarea
                    name="message"
                    placeholder="MESSAGE"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingCart />
    </>
  );
}