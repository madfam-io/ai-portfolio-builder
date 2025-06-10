'use client';

import { useLanguage } from '@/lib/i18n/minimal-context';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaBusinessTime,
  FaUserTie,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle URL parameters for specific inquiry types
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('plan') === 'business') {
      setFormData(prev => ({
        ...prev,
        inquiryType: 'business',
        subject: 'Business Plan Inquiry',
      }));
    } else if (urlParams.get('position')) {
      setFormData(prev => ({
        ...prev,
        inquiryType: 'careers',
        subject: `Job Application - Position ${urlParams.get('position')}`,
      }));
    } else if (urlParams.get('gdpr')) {
      setFormData(prev => ({
        ...prev,
        inquiryType: 'gdpr',
        subject: 'GDPR Request',
      }));
    } else if (urlParams.get('general')) {
      setFormData(prev => ({
        ...prev,
        inquiryType: 'general',
        subject: 'General Inquiry',
      }));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSubmitted(true);
    setIsSubmitting(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'general',
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t.contactPageTitle}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.contactSubtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Send us a message
              </h2>

              {submitted ? (
                <div className="text-center py-8">
                  <FaPaperPlane className="text-4xl text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Thank you for contacting us. We&apos;ll get back to you
                    within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="business">Business & Sales</option>
                      <option value="careers">Career Opportunities</option>
                      <option value="gdpr">Data Protection (GDPR)</option>
                      <option value="press">Press & Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Quick Contact */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Get in Touch
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <FaEnvelope className="text-purple-600 text-xl" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        General Inquiries
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        hello@madfam.io
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FaUserTie className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Business & Sales
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        business@madfam.io
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FaBusinessTime className="text-green-600 text-xl" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Support
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        support@madfam.io
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Info */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Office
                </h2>
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-red-600 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      MADFAM HQ
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Mexico City, Mexico
                      <br />
                      Building the future of professional portfolios
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Response Time</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>General Inquiries:</span>
                    <span className="font-semibold">24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Support:</span>
                    <span className="font-semibold">4-8 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business Inquiries:</span>
                    <span className="font-semibold">Same day</span>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Have a quick question? Check our FAQ first.
                </p>
                <Link
                  href="/faq"
                  className="inline-block border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900 transition"
                >
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
