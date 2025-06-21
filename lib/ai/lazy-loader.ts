import { logger } from '@/lib/utils/logger';

import { BioContext, UserProfile, AIService } from './types';

/**
 * Lazy loading wrapper for AI services
 * Loads AI modules only when enhancement features are used
 */

// Cache for loaded services
let huggingFaceService: AIService | null = null;

/**
 * Lazy load HuggingFace service
 */
async function getHuggingFaceService(): Promise<AIService> {
  if (!huggingFaceService) {
    logger.info('Loading HuggingFace service...');
    const { HuggingFaceService } = await import('./huggingface-service');
    huggingFaceService = new HuggingFaceService();
  }
  return huggingFaceService;
}

/**
 * Enhance bio with AI - lazy loaded
 */
async function enhanceBioLazy(
  bio: string,
  context: BioContext,
  selectedModel?: string
): Promise<string> {
  const service = await getHuggingFaceService();
  const result = await service.enhanceBio(bio, context);
  return result.content;
}

/**
 * Optimize project description - lazy loaded
 */
async function optimizeProjectLazy(
  title: string,
  description: string,
  technologies: string[],
  selectedModel?: string
): Promise<string> {
  const service = await getHuggingFaceService();
  const result = await service.optimizeProjectDescription(
    description,
    technologies,
    title // Using title as industryContext
  );
  return result.enhanced;
}

/**
 * Recommend template - lazy loaded
 */
async function recommendTemplateLazy(
  profile: UserProfile,
  selectedModel?: string
): Promise<unknown> {
  const service = await getHuggingFaceService();
  return service.recommendTemplate(profile);
}

/**
 * Get available models - lazy loaded
 */
async function getAvailableModelsLazy(task?: string): Promise<unknown[]> {
  const service = await getHuggingFaceService();
  // getAvailableModels is HuggingFace-specific, not part of AIService interface
  // So we need to check if it exists
  if (
    'getAvailableModels' in service &&
    typeof service.getAvailableModels === 'function'
  ) {
    return service.getAvailableModels();
  }
  return [];
}

/**
 * Preload AI services (useful for predictive loading)
 */
async function preloadAIServices(): Promise<void> {
  await getHuggingFaceService();
}

/**
 * Clear service cache (useful for memory management)
 */
function clearAIServiceCache(): void {
  huggingFaceService = null;
  logger.info('AI service cache cleared');
}
