'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth/auth';
import { useLanguage } from '@/lib/i18n/minimal-context';
import BaseLayout from '@/components/layouts/BaseLayout';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                {t.emailSent}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {t.resetEmailSent}
              </p>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {t.checkInboxReset}
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/signin"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t.backToSignIn}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              {t.resetPassword}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {t.resetPasswordMessage}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="email" className="sr-only">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder={t.email}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.sending : t.sendResetLink}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {t.backToSignIn}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
}