import { logger } from '@/lib/utils/logger';

import { BioContext, UserProfile } from './types';

/**
 * Lazy loading wrapper for AI services
 * Loads AI modules only when enhancement features are used
 */

// Cache for loaded services
let huggingFaceService: unknown = null;

/**
 * Lazy load HuggingFace service
 */
async function getHuggingFaceService(): Promise<unknown> {
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
  return service.enhanceBio(bio, context, selectedModel);
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
  return service.optimizeProjectDescription(
    title,
    description,
    technologies,
    selectedModel
  );
}

/**
 * Recommend template - lazy loaded
 */
async function recommendTemplateLazy(
  profile: UserProfile,
  selectedModel?: string
): Promise<unknown> {
  const service = await getHuggingFaceService();
  return service.recommendTemplate(profile, selectedModel);
}

/**
 * Get available models - lazy loaded
 */
async function getAvailableModelsLazy(task?: string): Promise<unknown[]> {
  const service = await getHuggingFaceService();
  return service.getAvailableModels(task);
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
