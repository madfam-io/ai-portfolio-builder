'use client';

import React, { useState } from 'react';
import { HiSparkles, HiOutlineSparkles } from 'react-icons/hi';
import { FiLoader } from 'react-icons/fi';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { aiClient } from '@/lib/ai/client';
import { BioContext } from '@/lib/ai/types';
import { getErrorMessage } from '@/types/errors';
import { logger } from '@/lib/utils/logger';

interface ProjectContext {
  title?: string;
  description?: string;
  technologies?: string[];
}

interface AIEnhancementButtonProps {
  type: 'bio' | 'project';
  content: string;
  context?: BioContext | ProjectContext;
  onEnhanced: (enhancedContent: string, suggestions?: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function AIEnhancementButton({
  type,
  content,
  context,
  onEnhanced,
  className = '',
  disabled = false,
}: AIEnhancementButtonProps) {
  const { t } = useLanguage();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastEnhanced, setLastEnhanced] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!content.trim() || isEnhancing || disabled) return;

    setIsEnhancing(true);

    try {
      if (type === 'bio') {
        const result = await aiClient.enhanceBio(
          content,
          context as BioContext
        );
        onEnhanced(result.content, result.suggestions);
        setLastEnhanced(result.content);
      } else if (type === 'project') {
        // For project enhancement, we need title, description, and technologies
        const projectContext = context as ProjectContext;
        const title = projectContext?.title || '';
        const description = projectContext?.description || content;
        const technologies = projectContext?.technologies || [];

        const result = await aiClient.optimizeProject(
          title,
          description,
          technologies
        );
        onEnhanced(result.description, result.highlights);
        setLastEnhanced(result.description);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      logger.error('AI enhancement failed', { error: errorMsg, type, content });

      // Show user-friendly error message
      const errorMessage = errorMsg.includes('Authentication')
        ? t.aiEnhancementRequiresAuth
        : errorMsg.includes('quota')
          ? t.aiQuotaExceeded
          : t.aiEnhancementFailed;

      // You could show a toast notification here
      alert(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };

  const wasRecentlyEnhanced = lastEnhanced === content;

  return (
    <button
      onClick={handleEnhance}
      disabled={disabled || isEnhancing || !content.trim()}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${
          wasRecentlyEnhanced
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={
        type === 'bio'
          ? t.enhanceBioWithAI || 'Enhance bio with AI'
          : t.enhanceProjectWithAI || 'Enhance project with AI'
      }
    >
      {isEnhancing ? (
        <FiLoader className="h-4 w-4 animate-spin" />
      ) : wasRecentlyEnhanced ? (
        <HiSparkles className="h-4 w-4" />
      ) : (
        <HiOutlineSparkles className="h-4 w-4" />
      )}

      {isEnhancing
        ? t.enhancing || 'Enhancing...'
        : wasRecentlyEnhanced
          ? t.enhanced || 'Enhanced!'
          : t.enhance || 'Enhance'}
    </button>
  );
}

// Model Selection Modal Component
interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: 'bio' | 'project' | 'template' | 'scoring';
  currentModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelectionModal({
  isOpen,
  onClose,
  taskType,
  currentModel,
  onModelChange,
}: ModelSelectionModalProps) {
  const { t } = useLanguage();
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAvailableModels = React.useCallback(async () => {
    try {
      setLoading(true);
      const models = await aiClient.getAvailableModels();
      setAvailableModels(models.filter(m => m.capabilities.includes(taskType)));
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  }, [taskType]);

  React.useEffect(() => {
    if (isOpen) {
      loadAvailableModels();
    }
  }, [isOpen, loadAvailableModels]);

  const handleModelSelect = async (modelId: string) => {
    try {
      await aiClient.updateModelSelection(taskType, modelId);
      onModelChange(modelId);
      onClose();
    } catch (error) {
      console.error('Failed to update model selection:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {t.selectModelFor} {taskType}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {availableModels.map(model => (
              <div
                key={model.id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-colors
                  ${
                    model.id === currentModel
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                onClick={() => handleModelSelect(model.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{model.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {model.id}
                    </p>
                    {model.isRecommended && (
                      <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {t.recommended || 'Recommended'}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      ${model.costPerRequest.toFixed(4)}/request
                    </div>
                    <div className="text-gray-500 dark:text-gray-500">
                      {(model.avgResponseTime / 1000).toFixed(1)}s avg
                    </div>
                    <div className="text-gray-500 dark:text-gray-500">
                      {Math.round(model.qualityRating * 100)}% quality
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            {t.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
