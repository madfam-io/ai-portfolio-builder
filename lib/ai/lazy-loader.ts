/**
 * Lazy loading wrapper for AI services
 * Loads AI modules only when enhancement features are used
 */

import { BioContext, UserProfile } from './types';
import { logger } from '@/lib/utils/logger';

// Cache for loaded services
let huggingFaceService: any = null;

/**
 * Lazy load HuggingFace service
 */
async function getHuggingFaceService() {
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
export async function enhanceBioLazy(
  bio: string,
  context: BioContext,
  selectedModel?: string
) {
  const service = await getHuggingFaceService();
  return service.enhanceBio(bio, context, selectedModel);
}

/**
 * Optimize project description - lazy loaded
 */
export async function optimizeProjectLazy(
  title: string,
  description: string,
  technologies: string[],
  selectedModel?: string
) {
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
export async function recommendTemplateLazy(
  profile: UserProfile,
  selectedModel?: string
) {
  const service = await getHuggingFaceService();
  return service.recommendTemplate(profile, selectedModel);
}

/**
 * Get available models - lazy loaded
 */
export async function getAvailableModelsLazy(task?: string) {
  const service = await getHuggingFaceService();
  return service.getAvailableModels(task);
}

/**
 * Preload AI services (useful for predictive loading)
 */
export async function preloadAIServices(): Promise<void> {
  await getHuggingFaceService();
}

/**
 * Clear service cache (useful for memory management)
 */
export function clearAIServiceCache(): void {
  huggingFaceService = null;
  logger.info('AI service cache cleared');
}
