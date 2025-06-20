import { cache } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';

export interface AvailableModel {
  id: string;
  name: string;
  provider: 'huggingface';
  capabilities: ('bio' | 'project' | 'template' | 'scoring')[];
  costPerRequest: number;
  avgResponseTime: number;
  qualityRating: number;
  isRecommended: boolean;
  lastUpdated: string;
}

/**
 * Model Manager for HuggingFace Service
 * Handles model discovery, selection, and management
 */
export class ModelManager {
  private availableModels: AvailableModel[] = [];
  private selectedModels: Record<string, string> = {};

  // Default "best bang for buck" models (updated dynamically)
  private readonly defaultModels = {
    bio: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    project: 'microsoft/Phi-3.5-mini-instruct',
    template: 'mistralai/Mistral-7B-Instruct-v0.3',
    scoring: 'microsoft/DialoGPT-medium',
  };

  constructor(userModelPreferences?: Record<string, string>) {
    this.selectedModels = userModelPreferences || {};
    this.loadAvailableModels();
  }

  /**
   * Get all available models with live updates
   */
  async getAvailableModels(): Promise<AvailableModel[]> {
    await this.refreshAvailableModels();
    return this.availableModels;
  }

  /**
   * Get current model selection for user
   */
  getSelectedModels(): Record<string, string> {
    return { ...this.selectedModels };
  }

  /**
   * Update user's model preferences
   */
  updateModelSelection(taskType: string, modelId: string): void {
    this.selectedModels[taskType] = modelId;
  }

  /**
   * Get best model for a specific task based on user preferences
   */
  getRecommendedModel(taskType: string): string {
    // First check user preferences
    if (this.selectedModels[taskType]) {
      return this.selectedModels[taskType];
    }

    // Then check available models for best performer
    const capable = this.availableModels.filter(m =>
      m.capabilities.includes(taskType as unknown)
    );
    const recommended = capable.find(m => m.isRecommended);

    if (recommended) {
      return recommended.id;
    }

    // Fall back to default
    return (
      this.defaultModels[taskType as keyof typeof this.defaultModels] ||
      this.defaultModels.bio
    );
  }

  /**
   * Load available models from cache or defaults
   */
  private loadAvailableModels(): void {
    // Initialize with defaults immediately
    this.availableModels = this.getDefaultAvailableModels();
  }

  /**
   * Refresh model list with latest availability
   */
  private async refreshAvailableModels(): Promise<void> {
    try {
      // Check cache first
      const cached = await cache.get('huggingface:available_models');
      if (cached) {
        this.availableModels = JSON.parse(cached as string);
        return;
      }

      // Fetch latest models
      const models = this.fetchLatestModels();
      this.availableModels = models;

      // Cache for 1 hour
      await cache.set(
        'huggingface:available_models',
        JSON.stringify(models),
        3600
      );
    } catch (error) {
      logger.warn('Failed to refresh model list, using defaults', { error });
    }
  }

  /**
   * Fetch latest model status from HuggingFace
   */
  private fetchLatestModels(): AvailableModel[] {
    // For now, return enhanced defaults
    // In production, this would check actual API status
    const models = this.getDefaultAvailableModels();

    // Simulate dynamic updates
    return models.map(model => ({
      ...model,
      avgResponseTime: Math.random() * 2000 + 500, // 500-2500ms
      lastUpdated: new Date().toISOString(),
    }));
  }

  /**
   * Get default available models
   */
  private getDefaultAvailableModels(): AvailableModel[] {
    return [
      {
        id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B',
        provider: 'huggingface',
        capabilities: ['bio', 'project', 'template'],
        costPerRequest: 0.001,
        avgResponseTime: 1200,
        qualityRating: 95,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'microsoft/Phi-3.5-mini-instruct',
        name: 'Phi 3.5 Mini',
        provider: 'huggingface',
        capabilities: ['bio', 'project'],
        costPerRequest: 0.0005,
        avgResponseTime: 800,
        qualityRating: 85,
        isRecommended: false,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'mistralai/Mistral-7B-Instruct-v0.3',
        name: 'Mistral 7B v0.3',
        provider: 'huggingface',
        capabilities: ['bio', 'project', 'template', 'scoring'],
        costPerRequest: 0.0008,
        avgResponseTime: 1000,
        qualityRating: 90,
        isRecommended: false,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }
}
