/**
 * DeepSeek AI Service Types
 */

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
      reasoning?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface DeepSeekUsageStats {
  requestsToday: number;
  costToday: number;
  totalResponseTime: number;
  successfulRequests: number;
  failedRequests: number;
}
