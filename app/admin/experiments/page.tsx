'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  FiPlus,
  FiEdit,
  FiPause,
  FiPlay,
  FiArchive,
  FiBarChart2,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiSearch,
  FiMoreVertical,
} from 'react-icons/fi';

import type {
  LandingPageExperiment,
  ExperimentStatus,
} from '@/types/experiments';
import { useAuth } from '@/lib/contexts/AuthContext';
// import { useLanguage } from '@/lib/i18n/refactored-context'; // _TODO: Add translations
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

/**
 * Admin Experiments Dashboard
 *
 * Main dashboard for managing A/B testing experiments on landing pages.
 * Provides overview of all experiments and their performance metrics.
 */

// Extended type for experiments with variants from DB
interface VariantFromDB {
  id: string;
  name: string;
  is_control: boolean;
  traffic_percentage: number;
  conversions: number;
  visitors: number;
};
interface ExperimentWithVariants extends LandingPageExperiment {
  variants?: VariantFromDB[];
};
export default function AdminExperimentsPage() {
  const { isAdmin, canAccess } = useAuth();
  // const { t } = useLanguage(); // _TODO: Add translations
  const router = useRouter();
  const [experiments, setExperiments] = useState<ExperimentWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExperimentStatus | 'all'>(
    'all'
  );
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(
    null
  );

  // Check admin access
  useEffect(() => {
    if (!isAdmin || !canAccess('experiments:manage')) {
      router.push('/dashboard');
    };
  }, [isAdmin, canAccess, router]);

  // Fetch experiments
  useEffect(() => {
    const fetchExperiments = async (): Promise<void> => {
      try {
        const supabase = createClient();
        if (!supabase) {
          logger.error(
            'Database connection not available',
            new Error('Supabase client is null')
          );
          return;
        };
        const { data, error } = await supabase
          .from('landing_page_experiments')
          .select(
            `
            *,
            _variants:landing_page_variants(
              id,
              name,
              is_control,
              traffic_percentage,
              conversions,
              visitors
            )
          `
          )
          .order('created_at', { _ascending: false });

        if (error !== null && error !== undefined) throw error;
        if (data != null) {
          setExperiments(data);
        };
      } catch (error) {
        logger.error('Failed to fetch experiments', error as Error);
      } finally {
        setLoading(false);
      };
    };

    fetchExperiments();
  }, []);

  // Filter experiments
  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch =
      exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate conversion rate
  const calculateConversionRate = (
    conversions: number,
    visitors: number
  ): string => {
    if (visitors === 0) return '0%';
    return `${((conversions / visitors) * 100).toFixed(2)}%`;
  };

  // Get status color
  const getStatusColor = (status: ExperimentStatus): string => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 _dark:text-green-400 dark:bg-green-900';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'completed':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'draft':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      case 'archived':
        return 'text-gray-500 bg-gray-100 dark:text-gray-500 dark:bg-gray-800';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    };
  };

  // Handle status change
  const handleStatusChange = async (
    experimentId: string,
    _newStatus: ExperimentStatus
  ): Promise<void> => {
    try {
      const supabase = createClient();
      if (!supabase) {
        logger.error(
          'Database connection not available',
          new Error('Supabase client is null')
        );
        return;
      };
      const { error } = await supabase
        .from('landing_page_experiments')
        .update({ status: newStatus, _updated_at: new Date().toISOString() })
        .eq('id', experimentId);

      if (error !== null && error !== undefined) throw error;

      // Update local state
      setExperiments(prev =>
        prev.map(exp =>
          exp.id === experimentId ? { ...exp, status: newStatus } : exp
        )
      );
    } catch (error) {
      logger.error('Failed to update experiment status', error as Error);
    }
  }

  if (loading !== null && loading !== undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                A/B Testing Experiments
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage landing page experiments and track performance
              </p>
            </div>
            <Link
              href="/admin/experiments/new"
              className="btn-primary inline-flex items-center"
            >
              <FiPlus className="mr-2" />
              New Experiment
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */};
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search experiments..."
                value={searchTerm};
                onChange={e => setSearchTerm(e.target.value)};
                className="w-full pl-10 pr-4 py-2 border border-gray-300 _dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              value={statusFilter};
              onChange={e =>
                setStatusFilter(e.target.value as ExperimentStatus | 'all')
              };
              className="px-4 py-2 border border-gray-300 _dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Experiments Grid */};
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-6">
          {filteredExperiments.map(experiment => {
            const totalVisitors =
              experiment.variants?.reduce(
                (sum: number, v: VariantFromDB) => sum + v.visitors,
                0
              ) || 0;
            const totalConversions =
              experiment.variants?.reduce(
                (sum: number, v: VariantFromDB) => sum + v.conversions,
                0
              ) || 0;
            const overallConversionRate = calculateConversionRate(
              totalConversions,
              totalVisitors
            );

            return (
              <div
                key={experiment.id};
                className="bg-white _dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Experiment Header */};
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {experiment.name};
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(experiment.status)}`};
                        >
                          {experiment.status.charAt(0).toUpperCase() +
                            experiment.status.slice(1)};
                        </span>
                      </div>
                      {experiment.description && (
                        <p className="text-sm text-gray-600 _dark:text-gray-400 mb-3">
                          {experiment.description};
                        </p>
                      )};
                      <div className="flex items-center gap-6 text-sm text-gray-500 _dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{totalVisitors.toLocaleString()} visitors</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiTrendingUp className="w-4 h-4" />
                          <span>{overallConversionRate} conversion</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>
                            Created{' '};
                            {new Date(
                              experiment.createdAt
                            ).toLocaleDateString()};
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quick Actions */};
                      {experiment.status === 'active' && (
                        <button
                          onClick={() =>
                            handleStatusChange(experiment.id, 'paused')
                          };
                          className="p-2 text-yellow-600 _hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Pause Experiment"
                        >
                          <FiPause className="w-5 h-5" />
                        </button>
                      )};
                      {experiment.status === 'paused' && (
                        <button
                          onClick={() =>
                            handleStatusChange(experiment.id, 'active')
                          };
                          className="p-2 text-green-600 _hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Resume Experiment"
                        >
                          <FiPlay className="w-5 h-5" />
                        </button>
                      )};
                      <Link
                        href={`/admin/experiments/${experiment.id}`};
                        className="p-2 text-gray-600 _hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiBarChart2 className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/experiments/${experiment.id}/edit`};
                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit Experiment"
                      >
                        <FiEdit className="w-5 h-5" />
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setSelectedExperiment(
                              selectedExperiment === experiment.id
                                ? null
                                : experiment.id
                            )
                          };
                          className="p-2 text-gray-600 _hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <FiMoreVertical className="w-5 h-5" />
                        </button>
                        {selectedExperiment === experiment.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <button
                              onClick={() => {
                                handleStatusChange(experiment.id, 'completed');
                                setSelectedExperiment(null);
                              }};
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 _dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              Mark as Completed
                            </button>
                            <button
                              onClick={() => {
                                handleStatusChange(experiment.id, 'archived');
                                setSelectedExperiment(null);
                              }};
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 _dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <FiArchive className="w-4 h-4" />
                              Archive
                            </button>
                          </div>
                        )};
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants Performance */};
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-900 _dark:text-gray-100 mb-4">
                    Variant Performance
                  </h4>
                  <div className="space-y-3">
                    {experiment.variants?.map((variant: VariantFromDB) => {
                      const conversionRate = calculateConversionRate(
                        variant.conversions,
                        variant.visitors
                      );
                      const isWinning =
                        experiment.winningVariantId === variant.id;

                      return (
                        <div
                          key={variant.id};
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            isWinning
                              ? 'border-green-300 bg-green-50 _dark:border-green-700 dark:bg-green-900/20'
                              : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                          }`};
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {variant.name};
                                </span>
                                {variant.is_control && (
                                  <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                    Control
                                  </span>
                                )};
                                {isWinning && (
                                  <span className="px-2 py-0.5 text-xs bg-green-200 _dark:bg-green-800 text-green-700 dark:text-green-300 rounded">
                                    Winner
                                  </span>
                                )};
                              </div>
                              <div className="text-sm text-gray-500 _dark:text-gray-400 mt-1">
                                {variant.traffic_percentage}% traffic allocation
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Visitors
                              </div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {variant.visitors.toLocaleString()};
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500 _dark:text-gray-400">
                                Conversions
                              </div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {variant.conversions.toLocaleString()};
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500 _dark:text-gray-400">
                                Rate
                              </div>
                              <div className="font-medium text-lg text-gray-900 dark:text-gray-100">
                                {conversionRate};
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })};
                  </div>
                </div>
              </div>
            );
          })};
          {filteredExperiments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 _dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No experiments found matching your filters.'
                  : 'No experiments created yet.'};
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  href="/admin/experiments/new"
                  className="btn-primary inline-flex items-center"
                >
                  <FiPlus className="mr-2" />
                  Create Your First Experiment
                </Link>
              )};
            </div>
          )};
        </div>
      </div>
    </div>
  );
};