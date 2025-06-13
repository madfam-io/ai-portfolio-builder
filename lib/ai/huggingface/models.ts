/**
 * HuggingFace Model Management
 * Handles model selection, availability, and recommendations
 */

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
   * Initialize available models with default data
   */
  private loadAvailableModels(): void {
    this.availableModels = [
      {
        id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B Instruct',
        provider: 'huggingface',
        capabilities: ['bio', 'project', 'template'],
        costPerRequest: 0.0002,
        avgResponseTime: 2500,
        qualityRating: 9.2,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'microsoft/Phi-3.5-mini-instruct',
        name: 'Phi-3.5 Mini Instruct',
        provider: 'huggingface',
        capabilities: ['bio', 'project'],
        costPerRequest: 0.0001,
        avgResponseTime: 1500,
        qualityRating: 8.5,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'mistralai/Mistral-7B-Instruct-v0.3',
        name: 'Mistral 7B v0.3',
        provider: 'huggingface',
        capabilities: ['bio', 'project', 'template'],
        costPerRequest: 0.00015,
        avgResponseTime: 2000,
        qualityRating: 8.8,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct',
        name: 'DeepSeek Coder V2 Lite',
        provider: 'huggingface',
        capabilities: ['project'],
        costPerRequest: 0.00008,
        avgResponseTime: 1200,
        qualityRating: 8.0,
        isRecommended: false,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'google/flan-t5-xl',
        name: 'Flan-T5 XL',
        provider: 'huggingface',
        capabilities: ['bio', 'template'],
        costPerRequest: 0.00012,
        avgResponseTime: 1800,
        qualityRating: 7.5,
        isRecommended: false,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get all available models
   */
  getAvailableModels(): AvailableModel[] {
    return [...this.availableModels];
  }

  /**
   * Get current model selection
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
   * Get model for a specific task
   */
  getModelForTask(taskType: string): string {
    return this.selectedModels[taskType] || this.getRecommendedModel(taskType);
  }

  /**
   * Get recommended model for task type
   */
  getRecommendedModel(taskType: string): string {
    const recommended = this.availableModels
      .filter(
        m => m.capabilities.includes(taskType as unknown) && m.isRecommended
      )
      .sort(
        (a, b) =>
          b.qualityRating / b.costPerRequest -
          a.qualityRating / a.costPerRequest
      )[0];

    return (
      recommended?.id ||
      this.defaultModels[taskType as keyof typeof this.defaultModels] ||
      this.defaultModels.bio
    );
  }

  /**
   * Get model info by ID
   */
  getModelInfo(modelId: string): AvailableModel | undefined {
    return this.availableModels.find(m => m.id === modelId);
  }

  /**
   * Check if model supports a capability
   */
  modelSupportsCapability(modelId: string, capability: string): boolean {
    const model = this.getModelInfo(modelId);
    return model ? model.capabilities.includes(capability as unknown) : false;
  }

  /**
   * Get models for a specific capability
   */
  getModelsForCapability(capability: string): AvailableModel[] {
    return this.availableModels.filter(m =>
      m.capabilities.includes(capability as unknown)
    );
  }

  /**
   * Refresh available models (placeholder for future API integration)
   */
  async refreshAvailableModels(): Promise<void> {
    // In the future, this could fetch live model availability from HuggingFace
    // For now, we use the static list
    this.loadAvailableModels();
  }
}
