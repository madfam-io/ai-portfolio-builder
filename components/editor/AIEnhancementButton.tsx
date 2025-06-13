'use client';

import { Loader, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

import { aiClient } from '@/lib/ai/client';
import { BioContext } from '@/lib/ai/types';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { logger } from '@/lib/utils/logger';
import { showToast } from '@/lib/utils/toast';
import { getErrorMessage } from '@/types/errors';

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

// Helper function to enhance bio content
async function enhanceBioContent(
  content: string,
  context: BioContext,
  onEnhanced: (content: string, suggestions?: string[]) => void
): Promise<string> {
  const result = await aiClient.enhanceBio(content, context);
  onEnhanced(result.content, result.suggestions);
  return result.content;
}

// Helper function to enhance project content
async function enhanceProjectContent(
  content: string,
  context: ProjectContext | undefined,
  onEnhanced: (content: string, suggestions?: string[]) => void
): Promise<string> {
  const description = context?.description || content;
  const technologies = context?.technologies || [];
  const industryContext = context?.title; // Use title as industry context if provided

  const result = await aiClient.optimizeProject(
    description,
    technologies,
    industryContext
  );
  onEnhanced(result.enhanced, result.keyAchievements);
  return result.enhanced;
}

// Helper function to determine error message
function getEnhancementErrorMessage(
  errorMsg: string,
  t: Record<string, string>
): string {
  if (errorMsg.includes('Authentication')) {
    return (
      t.aiEnhancementRequiresAuth ||
      'Authentication required for AI enhancement'
    );
  }
  if (errorMsg.includes('quota')) {
    return t.aiQuotaExceeded || 'AI quota exceeded';
  }
  return t.aiEnhancementFailed || 'AI enhancement failed';
}

// Helper function to get button styling
function getButtonStyling(
  wasRecentlyEnhanced: boolean,
  className: string
): string {
  const baseClasses =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200';
  const stateClasses = wasRecentlyEnhanced
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50';
  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';

  return `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`;
}

// Helper function to get button title
function getButtonTitle(
  type: 'bio' | 'project',
  t: Record<string, string>
): string {
  if (type === 'bio') {
    return t.enhanceBioWithAI || 'Enhance bio with AI';
  }
  return t.enhanceProjectWithAI || 'Enhance project with AI';
}

// Helper function to get button text
function getButtonText(
  isEnhancing: boolean,
  wasRecentlyEnhanced: boolean,
  t: Record<string, string>
): string {
  if (isEnhancing) {
    return t.enhancing || 'Enhancing...';
  }
  if (wasRecentlyEnhanced) {
    return t.enhanced || 'Enhanced!';
  }
  return t.enhance || 'Enhance';
}

export function AIEnhancementButton({
  type,
  content,
  context,
  onEnhanced,
  className = '',
  disabled = false,
}: AIEnhancementButtonProps): React.ReactElement {
  const { t } = useLanguage();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastEnhanced, setLastEnhanced] = useState<string | null>(null);

  const handleEnhance = async (): Promise<void> => {
    if (!content.trim() || isEnhancing || disabled) return;

    setIsEnhancing(true);

    try {
      let enhancedContent: string;

      if (type === 'bio') {
        enhancedContent = await enhanceBioContent(
          content,
          context as BioContext,
          onEnhanced
        );
      } else {
        enhancedContent = await enhanceProjectContent(
          content,
          context as ProjectContext,
          onEnhanced
        );
      }

      setLastEnhanced(enhancedContent);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      logger.error('AI enhancement failed', { error: errorMsg, type, content });

      const errorMessage = getEnhancementErrorMessage(errorMsg, t);
      showToast.error(errorMessage || 'Enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  const wasRecentlyEnhanced = lastEnhanced === content;
  const isDisabled = disabled || isEnhancing || !content.trim();

  return (
    <button
      onClick={handleEnhance}
      disabled={isDisabled}
      className={getButtonStyling(wasRecentlyEnhanced, className)}
      title={getButtonTitle(type, t)}
    >
      {isEnhancing ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : wasRecentlyEnhanced ? (
        <Sparkles className="h-4 w-4" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}

      {getButtonText(isEnhancing, wasRecentlyEnhanced, t)}
    </button>
  );
}

// Model Selection Modal Component
interface AIModel {
  id: string;
  name: string;
  capabilities: string[];
  costPerRequest: number;
  avgResponseTime: number;
  qualityRating: number;
  isRecommended?: boolean;
}

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
}: ModelSelectionModalProps): React.ReactElement | null {
  const { t } = useLanguage();
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAvailableModels = React.useCallback(async () => {
    try {
      setLoading(true);
      const models = await aiClient.getAvailableModels();
      setAvailableModels(models.filter(m => m.capabilities.includes(taskType)));
    } catch (error) {
      logger.error('Failed to load AI models', error as Error);
    } finally {
      setLoading(false);
    }
  }, [taskType]);

  React.useEffect(() => {
    if (isOpen) {
      loadAvailableModels();
    }
  }, [isOpen, loadAvailableModels]);

  const handleModelSelect = async (modelId: string): Promise<void> => {
    try {
      await aiClient.updateModelSelection(taskType, modelId);
      onModelChange(modelId);
      onClose();
    } catch (error) {
      logger.error('Failed to update AI model selection', error as Error);
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
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
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
                    {model.isRecommended === true && (
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
