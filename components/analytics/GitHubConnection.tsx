'use client';

import { Github } from 'lucide-react';
import React from 'react';

import { useLanguage } from '@/lib/i18n/refactored-context';

interface GitHubConnectionProps {
  loading: boolean;
}

export default function GitHubConnection({
  loading,
}: GitHubConnectionProps): React.ReactElement {
  const { t } = useLanguage();

  return (
    <div className="text-center">
      <Github className="text-6xl text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {t.connectGitHub}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {t.connectGitHubDescription}
      </p>
      <a
        href="/api/integrations/github/auth"
        className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        onClick={e => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <Github className="mr-2" />
        {loading ? t.connecting : t.connectGitHub}
      </a>
    </div>
  );
}
