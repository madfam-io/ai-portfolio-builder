'use client';

import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/minimal-context';
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
        subject: t.contactBusinessPlanInquiry || 'Business Plan Inquiry',
      }));
    } else if (urlParams.get('position')) {
      setFormData(prev => ({
        ...prev,
        inquiryType: 'careers',
        subject: `${t.contactJobApplication || 'Job Application - Position'} ${urlParams.get('position')}`,
      }));
    } else if (urlParams.get('gdpr')) {
      setFormData(prev => ({
        ...prev,
        inquiryType: 'gdpr',
        subject: t.contactGDPRRequest || 'GDPR Request',
      }));
    } else if (urlParams.get('general')) {
      setFormData(prev => ({
        ...prev,
        inquiryType: 'general',
        subject: t.contactGeneralInquiry || 'General Inquiry',
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
    <BaseLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
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
                {t.contactSendMessage}
              </h2>

              {submitted ? (
                <div className="text-center py-8">
                  <FaPaperPlane className="text-4xl text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t.contactMessageSent}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t.contactThankYou}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.contactFullName}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        placeholder={
                          t.contactFullNamePlaceholder ||
                          t.contactFullName.replace(' *', '')
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.contactEmailAddress}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        placeholder={
                          t.contactEmailPlaceholder || 'email@example.com'
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.contactInquiryType}
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="general">{t.contactGeneral}</option>
                      <option value="support">{t.contactSupport}</option>
                      <option value="business">{t.contactBusinessSales}</option>
                      <option value="careers">{t.contactCareers}</option>
                      <option value="gdpr">{t.contactGdpr}</option>
                      <option value="press">{t.contactPress}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.contactSubject}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder={
                        t.contactSubjectPlaceholder ||
                        t.contactSubject.replace(' *', '')
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.contactMessage}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder={
                        t.contactMessagePlaceholder ||
                        t.contactMessage.replace(' *', '')
                      }
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
                        {t.contactSending}
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        {t.contactSendButton}
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
                  {t.contactGetInTouch}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <FaEnvelope className="text-purple-600 text-xl" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t.contactGeneralInquiries}
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
                        {t.contactBusinessSalesLabel}
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
                        {t.contactSupportLabel}
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
                  {t.contactOffice}
                </h2>
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-red-600 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t.contactMadfamHq}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t.contactOfficeDesc.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index === 0 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">
                  {t.contactResponseTime}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t.contactGeneralTime}</span>
                    <span className="font-semibold">{t.contactTime24h}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.contactTechnicalTime}</span>
                    <span className="font-semibold">{t.contactTime48h}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.contactBusinessTime}</span>
                    <span className="font-semibold">
                      {t.contactTimeSameDay}
                    </span>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t.contactQuickQuestion}
                </p>
                <Link
                  href="/faq"
                  className="inline-block border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900 transition"
                >
                  {t.contactViewFaq}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
