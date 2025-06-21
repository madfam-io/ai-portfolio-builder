'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Github,
  Check,
  RefreshCw,
  Database,
  Activity,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Users,
  Settings,
  Link,
  Unlink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { logger } from '@/lib/utils/logger';
import { showToast } from '@/lib/utils/toast';
import { formatDistanceToNow } from 'date-fns';

interface GitHubConnectionStatus {
  isConnected: boolean;
  username?: string;
  email?: string;
  avatarUrl?: string;
  installedAt?: string;
  lastSync?: string;
  scope?: string[];
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: string;
  };
}

interface RepositoryStats {
  total: number;
  synced: number;
  lastUpdated?: string;
}

export default function GitHubIntegrationPage() {
  const {} = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<GitHubConnectionStatus>({
      isConnected: false,
    });
  const [repositoryStats, setRepositoryStats] = useState<RepositoryStats>({
    total: 0,
    synced: 0,
  });

  const fetchRepositoryStats = async () => {
    try {
      const statsResponse = await fetch('/api/v1/analytics/repositories');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setRepositoryStats({
          total: statsData.data.repositories.length,
          synced: statsData.data.repositories.length,
          lastUpdated: statsData.data.repositories[0]?.updated_at,
        });
      }
    } catch (error) {
      logger.error(
        'Failed to fetch repository stats:',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/integrations/github/status');
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data);

        if (data.isConnected) {
          await fetchRepositoryStats();
        }
      }
    } catch (error) {
      logger.error(
        'Failed to check GitHub connection status:',
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/v1/integrations/github/auth');
      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        showToast.error('Failed to initiate GitHub connection');
      }
    } catch (error) {
      logger.error(
        'GitHub connection failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      showToast.error('Failed to connect to GitHub');
    }
  };

  const handleDisconnect = async () => {
    // TODO: Replace with proper modal dialog
    // eslint-disable-next-line no-alert
    if (
      !window.confirm(
        'Are you sure you want to disconnect GitHub? This will remove all synced repository data.'
      )
    ) {
      return;
    }

    setDisconnecting(true);
    try {
      const response = await fetch('/api/v1/integrations/github/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setConnectionStatus({ isConnected: false });
        setRepositoryStats({ total: 0, synced: 0 });
        showToast.success('GitHub disconnected successfully');
      } else {
        showToast.error('Failed to disconnect GitHub');
      }
    } catch (error) {
      logger.error(
        'GitHub disconnect failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      showToast.error('Failed to disconnect GitHub');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/v1/analytics/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });

      if (response.ok) {
        showToast.success('Repository sync started');
        await checkConnectionStatus();
      } else if (response.status === 429) {
        showToast.error('Please wait before syncing again');
      } else {
        showToast.error('Failed to sync repositories');
      }
    } catch (error) {
      logger.error(
        'Repository sync failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      showToast.error('Failed to sync repositories');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">GitHub Integration</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your GitHub account to import repositories and track your
          development analytics
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-full ${
                connectionStatus.isConnected
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Github
                className={`w-8 h-8 ${
                  connectionStatus.isConnected
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-1">
                {connectionStatus.isConnected ? 'Connected' : 'Not Connected'}
              </h2>

              {connectionStatus.isConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                      {connectionStatus.username}
                    </span>
                    {connectionStatus.email && (
                      <>
                        <span>•</span>
                        <span>{connectionStatus.email}</span>
                      </>
                    )}
                  </div>

                  {connectionStatus.installedAt && (
                    <p className="text-sm text-gray-500">
                      Connected{' '}
                      {formatDistanceToNow(
                        new Date(connectionStatus.installedAt)
                      )}{' '}
                      ago
                    </p>
                  )}

                  {connectionStatus.scope && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {connectionStatus.scope.map(scope => (
                        <Badge key={scope} variant="secondary">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your GitHub account to start tracking your
                  repositories
                </p>
              )}
            </div>
          </div>

          <div>
            {connectionStatus.isConnected ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            ) : (
              <Button variant="default" onClick={handleConnect}>
                <Link className="w-4 h-4 mr-2" />
                Connect GitHub
              </Button>
            )}
          </div>
        </div>

        {/* Rate Limit Info */}
        {connectionStatus.isConnected && connectionStatus.rateLimit && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                API Rate Limit
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {connectionStatus.rateLimit.remaining} /{' '}
                  {connectionStatus.rateLimit.limit}
                </span>
                <span className="text-gray-500">
                  (Resets{' '}
                  {formatDistanceToNow(
                    new Date(connectionStatus.rateLimit.reset)
                  )}{' '}
                  from now)
                </span>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{
                  width: `${(connectionStatus.rateLimit.remaining / connectionStatus.rateLimit.limit) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Repository Stats */}
      {connectionStatus.isConnected && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Repository Overview</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Repositories
                    </p>
                    <p className="text-2xl font-bold">
                      {repositoryStats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Synced
                    </p>
                    <p className="text-2xl font-bold">
                      {repositoryStats.synced}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {repositoryStats.lastUpdated && (
              <p className="mt-4 text-sm text-gray-500">
                Last synced{' '}
                {formatDistanceToNow(new Date(repositoryStats.lastUpdated))} ago
              </p>
            )}
          </Card>

          {/* Features */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <GitCommit className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">Commit Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track your commit history and contribution patterns
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <GitPullRequest className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">Pull Request Insights</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor PR activity and review cycles
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">Contributor Statistics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View collaboration metrics and team contributions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">Activity Tracking</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real-time updates on repository activity
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => router.push('/analytics')}
              >
                <Activity className="w-4 h-4 mr-2" />
                View Analytics Dashboard
              </Button>

              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => router.push('/editor/new?import=github')}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Import Repositories to Portfolio
              </Button>

              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() =>
                  window.open('https://github.com/settings/apps', '_blank')
                }
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage GitHub App Permissions
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Not Connected State */}
      {!connectionStatus.isConnected && (
        <Card className="p-8 text-center">
          <Github className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">
            Connect Your GitHub Account
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Link your GitHub account to import repositories, track development
            metrics, and showcase your coding activity in your portfolio.
          </p>

          <div className="space-y-4 max-w-sm mx-auto text-left">
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                Import repository information automatically
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                Track commits, PRs, and contributors
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">Generate development analytics</span>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            className="mt-6"
            onClick={handleConnect}
          >
            <Github className="w-5 h-5 mr-2" />
            Connect GitHub Account
          </Button>
        </Card>
      )}
    </div>
  );
}
