# AI Development Guide - PRISMA Portfolio Builder

**Last Updated**: June 21, 2025  
**Version**: 0.3.0-beta  
**Primary Provider**: HuggingFace

## Overview

This guide provides comprehensive information for developing and maintaining AI features in PRISMA Portfolio Builder. Our AI implementation focuses on enhancing user content while maintaining authenticity and quality.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [HuggingFace Integration](#huggingface-integration)
3. [Implementing AI Features](#implementing-ai-features)
4. [Prompt Engineering](#prompt-engineering)
5. [Model Selection](#model-selection)
6. [Performance Optimization](#performance-optimization)
7. [Error Handling](#error-handling)
8. [Testing AI Features](#testing-ai-features)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Best Practices](#best-practices)

## Architecture Overview

### AI Service Layer Architecture

```
┌─────────────────────────────────────────────────┐
│                User Interface                    │
│         (AI Enhancement Components)              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              AI Client                           │
│         (lib/ai/client.ts)                      │
│   • Request orchestration                        │
│   • Model selection                              │
│   • Response formatting                          │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│          Service Providers                       │
├─────────────────────────────────────────────────┤
│ HuggingFace │ DeepSeek │ Future Providers      │
│  (Primary)  │ (Backup) │                       │
└─────────────────────────────────────────────────┘
```

### Key Components

1. **AI Client** (`lib/ai/client.ts`): Central orchestrator
2. **Service Implementations** (`lib/ai/*-service.ts`): Provider-specific logic
3. **Prompt Builders** (`lib/ai/prompts/`): Structured prompt generation
4. **Model Manager** (`lib/ai/huggingface/ModelManager.ts`): Model selection logic
5. **Content Scorer** (`lib/ai/huggingface/ContentScorer.ts`): Quality assessment

## HuggingFace Integration

### Configuration

```typescript
// Environment variables
HUGGINGFACE_API_KEY=your_api_key_here

// Service initialization
const huggingFaceService = new HuggingFaceService(
  process.env.HUGGINGFACE_API_KEY,
  userModelPreferences // Optional user preferences
);
```

### Available Models

```typescript
export const AI_MODELS = {
  'llama-3.1-70b': {
    id: 'meta-llama/Llama-3.1-70B-Instruct',
    name: 'Llama 3.1 70B',
    strengths: ['Comprehensive', 'Nuanced', 'Multi-lingual'],
    bestFor: ['Bio enhancement', 'Long content'],
    avgResponseTime: 4500, // ms
  },
  'phi-3.5': {
    id: 'microsoft/Phi-3.5-mini-instruct',
    name: 'Phi-3.5 Mini',
    strengths: ['Fast', 'Efficient', 'Structured'],
    bestFor: ['Quick edits', 'Formatting'],
    avgResponseTime: 2000, // ms
  },
  'mistral-7b': {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B',
    strengths: ['Balanced', 'Reliable', 'Consistent'],
    bestFor: ['Project descriptions', 'General use'],
    avgResponseTime: 3000, // ms
  },
};
```

### API Integration Pattern

```typescript
// Making HuggingFace API calls
private async callModel(
  modelId: string,
  prompt: string,
  retries = 2
): Promise<ModelResponse> {
  const response = await fetch(`${this.baseUrl}/${modelId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  return this.handleResponse(response);
}
```

## Implementing AI Features

### Step-by-Step Guide

#### 1. Define the Feature Interface

```typescript
// types/ai.ts
export interface SkillsEnhancement {
  input: {
    skills: string[];
    profession: string;
    experienceLevel: 'entry' | 'mid' | 'senior';
  };
  output: {
    enhanced: string[];
    categories: Record<string, string[]>;
    suggestions: string[];
    confidence: number;
  };
}
```

#### 2. Create Prompt Builder

```typescript
// lib/ai/prompts/skills-prompt.ts
export function buildSkillsPrompt(input: SkillsEnhancement['input']): string {
  return `
You are a professional resume consultant specializing in skills optimization.

Task: Enhance and categorize these professional skills for a ${input.experienceLevel}-level ${input.profession}.

Current skills: ${input.skills.join(', ')}

Requirements:
1. Expand abbreviated skills to full names
2. Add 2-3 relevant missing skills based on profession
3. Categorize skills (Technical, Soft Skills, Tools, etc.)
4. Order by relevance to the profession
5. Maximum 20 skills total

Output format:
Enhanced: [comma-separated list]
Categories: {category: [skills]}
Suggestions: [additional skills to consider]
`;
}
```

#### 3. Implement Service Method

```typescript
// lib/ai/huggingface-service.ts
async enhanceSkills(
  input: SkillsEnhancement['input']
): Promise<SkillsEnhancement['output']> {
  try {
    // Generate cache key
    const cacheKey = this.generateCacheKey('skills', JSON.stringify(input));
    
    // Check cache
    const cached = await this.checkCache(cacheKey);
    if (cached) return cached;
    
    // Build prompt
    const prompt = buildSkillsPrompt(input);
    
    // Select model
    const model = this.modelManager.getRecommendedModel('skills');
    
    // Call AI
    const response = await this.callModel(model, prompt);
    
    // Parse response
    const parsed = this.parseSkillsResponse(response.content);
    
    // Score quality
    const confidence = this.calculateConfidence(parsed);
    
    // Build result
    const result: SkillsEnhancement['output'] = {
      enhanced: parsed.enhanced,
      categories: parsed.categories,
      suggestions: parsed.suggestions,
      confidence,
    };
    
    // Cache result
    await this.cacheResult(cacheKey, result);
    
    return result;
    
  } catch (error) {
    logger.error('Skills enhancement failed', error);
    throw this.handleError(error, 'skills enhancement');
  }
}
```

#### 4. Create UI Component

```typescript
// components/ai/SkillsEnhancer.tsx
export function SkillsEnhancer({ 
  skills, 
  onEnhanced 
}: {
  skills: string[];
  onEnhanced: (enhanced: string[]) => void;
}) {
  const { t } = useLanguage();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<SkillsEnhancement['output'] | null>(null);
  
  const enhance = async () => {
    setIsEnhancing(true);
    
    try {
      const enhanced = await aiClient.enhanceSkills({
        skills,
        profession: userProfile.profession,
        experienceLevel: userProfile.experienceLevel,
      });
      
      setResult(enhanced);
      
      // Auto-apply if high confidence
      if (enhanced.confidence > 0.85) {
        onEnhanced(enhanced.enhanced);
        toast.success(t.ai.skillsEnhanced);
      }
      
    } catch (error) {
      toast.error(t.ai.enhancementFailed);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Button
        onClick={enhance}
        disabled={isEnhancing || skills.length === 0}
        variant="secondary"
      >
        {isEnhancing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t.ai.enhancing}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            {t.ai.enhanceSkills}
          </>
        )}
      </Button>
      
      {result && (
        <SkillsPreview
          original={skills}
          enhanced={result.enhanced}
          categories={result.categories}
          suggestions={result.suggestions}
          onAccept={() => onEnhanced(result.enhanced)}
          onReject={() => setResult(null)}
        />
      )}
    </div>
  );
}
```

## Prompt Engineering

### Best Practices

1. **Clear Instructions**
   ```
   You are a [specific role].
   Task: [specific action]
   Context: [relevant information]
   Requirements: [numbered list]
   Output format: [expected structure]
   ```

2. **Consistent Format**
   ```typescript
   const PROMPT_TEMPLATE = `
   Role: ${role}
   Task: ${task}
   
   Input:
   ${formatInput(input)}
   
   Requirements:
   ${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}
   
   Output only the enhanced version.
   `;
   ```

3. **Context Inclusion**
   ```typescript
   // Include relevant context
   const context = {
     industry: user.industry,
     targetAudience: portfolio.targetAudience,
     tone: portfolio.preferredTone,
     previousExamples: getRelevantExamples(user),
   };
   ```

### Prompt Templates

#### Bio Enhancement
```typescript
const BIO_PROMPT = `
You are a professional bio writer specializing in ${industry} professionals.

Enhance this bio: "${originalBio}"

Context:
- Professional level: ${experienceLevel}
- Target audience: ${targetAudience}
- Desired tone: ${tone}

Requirements:
1. Keep it under 150 words
2. Include specific achievements or metrics if possible
3. Maintain authenticity - don't invent facts
4. Use active voice and strong verbs
5. End with a forward-looking statement

Output the enhanced bio only.
`;
```

#### Project Description
```typescript
const PROJECT_PROMPT = `
Transform this project description using the STAR method.

Project: ${projectTitle}
Original description: ${description}
Technologies used: ${technologies.join(', ')}

Format as:
Situation: [Context and challenge]
Task: [Your specific objectives]
Action: [What you did]
Result: [Measurable outcomes]

Keep it concise (50-150 words) and highlight technical achievements.
`;
```

## Model Selection

### Dynamic Model Selection Algorithm

```typescript
class ModelSelector {
  selectModel(task: string, constraints: Constraints): string {
    // Factor 1: Task type
    const taskScores = this.getTaskScores(task);
    
    // Factor 2: User preferences
    const userPreferences = this.getUserPreferences();
    
    // Factor 3: Recent performance
    const performanceScores = this.getPerformanceScores();
    
    // Factor 4: Current load
    const availability = this.checkAvailability();
    
    // Calculate composite score
    const models = Object.keys(AI_MODELS).map(model => ({
      model,
      score: this.calculateScore({
        taskScore: taskScores[model],
        userPreference: userPreferences[model],
        performance: performanceScores[model],
        available: availability[model],
      }),
    }));
    
    // Return best available model
    return models
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.model || 'mistral-7b';
  }
}
```

### Model Performance Tracking

```typescript
interface ModelMetrics {
  model: string;
  task: string;
  responseTime: number;
  userAccepted: boolean;
  errorRate: number;
  qualityScore: number;
}

class ModelPerformanceTracker {
  async recordMetric(metric: ModelMetrics) {
    // Store in database
    await db.aiMetrics.create({ data: metric });
    
    // Update running averages
    this.updateAverages(metric);
    
    // Adjust model preferences if needed
    if (metric.errorRate > 0.1) {
      this.deprioritizeModel(metric.model, metric.task);
    }
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
class AICache {
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  async get(key: string): Promise<any> {
    // Try memory cache first
    const memoryHit = this.memoryCache.get(key);
    if (memoryHit) return memoryHit;
    
    // Try Redis
    const redisHit = await redis.get(key);
    if (redisHit) {
      const parsed = JSON.parse(redisHit);
      this.memoryCache.set(key, parsed);
      return parsed;
    }
    
    return null;
  }
  
  async set(key: string, value: any) {
    // Set in both caches
    this.memoryCache.set(key, value);
    await redis.setex(key, this.TTL / 1000, JSON.stringify(value));
  }
}
```

### Request Batching

```typescript
class AIRequestBatcher {
  private queue: PendingRequest[] = [];
  private timer: NodeJS.Timeout | null = null;
  
  async add(request: AIRequest): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 100);
      }
    });
  }
  
  private async flush() {
    const batch = this.queue.splice(0, 10); // Max 10 per batch
    this.timer = null;
    
    try {
      const responses = await this.processBatch(batch);
      batch.forEach((item, index) => {
        item.resolve(responses[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}
```

### Response Streaming

```typescript
async function* streamAIResponse(prompt: string): AsyncGenerator<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ prompt, stream: true }),
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    yield chunk;
  }
}

// Usage in component
const [content, setContent] = useState('');

useEffect(() => {
  async function stream() {
    for await (const chunk of streamAIResponse(prompt)) {
      setContent(prev => prev + chunk);
    }
  }
  stream();
}, [prompt]);
```

## Error Handling

### Comprehensive Error Strategy

```typescript
class AIErrorHandler {
  async handle(error: unknown, context: string): Promise<AIResponse> {
    if (error instanceof QuotaExceededError) {
      // Try fallback provider
      return this.tryFallbackProvider(context);
    }
    
    if (error instanceof ModelUnavailableError) {
      // Try different model
      return this.tryAlternativeModel(context);
    }
    
    if (error instanceof RateLimitError) {
      // Queue for retry
      return this.queueForRetry(context);
    }
    
    if (error instanceof NetworkError) {
      // Return cached or default response
      return this.getCachedOrDefault(context);
    }
    
    // Unknown error - log and return safe default
    logger.error('Unexpected AI error', { error, context });
    return this.getSafeDefault(context);
  }
  
  private getSafeDefault(context: string): AIResponse {
    // Return context-appropriate defaults
    const defaults = {
      bio: { enhanced: '', suggestions: ['Try writing about your experience'] },
      project: { enhanced: '', metrics: [] },
      skills: { enhanced: [], categories: {} },
    };
    
    return defaults[context] || { error: 'Enhancement unavailable' };
  }
}
```

### User-Friendly Error Messages

```typescript
const ERROR_MESSAGES = {
  quota_exceeded: {
    es: 'Hemos alcanzado el límite diario de mejoras. Intenta mañana.',
    en: 'We\'ve reached our daily enhancement limit. Please try tomorrow.',
  },
  model_unavailable: {
    es: 'El servicio está temporalmente ocupado. Intenta en unos momentos.',
    en: 'The service is temporarily busy. Please try again in a moment.',
  },
  network_error: {
    es: 'Error de conexión. Verifica tu internet.',
    en: 'Connection error. Please check your internet.',
  },
  enhancement_failed: {
    es: 'No pudimos mejorar el contenido. Tu texto original se mantiene.',
    en: 'We couldn\'t enhance the content. Your original text is preserved.',
  },
};
```

## Testing AI Features

### Unit Testing

```typescript
describe('AI Enhancement Service', () => {
  describe('Bio Enhancement', () => {
    it('should enhance a basic bio', async () => {
      const input = 'Software developer with 5 years experience';
      const result = await aiService.enhanceBio(input, {
        industry: 'Technology',
        experienceLevel: 'mid',
      });
      
      expect(result.enhanced).toContain('software');
      expect(result.enhanced.length).toBeGreaterThan(input.length);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
    
    it('should handle special characters', async () => {
      const input = 'Developer & designer with UI/UX focus';
      const result = await aiService.enhanceBio(input, mockContext);
      
      expect(result.enhanced).toBeDefined();
      expect(result.error).toBeUndefined();
    });
    
    it('should respect word limits', async () => {
      const input = 'Very long bio...'.repeat(50);
      const result = await aiService.enhanceBio(input, mockContext);
      
      const wordCount = result.enhanced.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(150);
    });
  });
});
```

### Integration Testing

```typescript
describe('AI Feature Integration', () => {
  it('should enhance bio end-to-end', async () => {
    // Render component
    render(<BioSection initialBio="Developer" />);
    
    // Click enhance button
    const enhanceBtn = screen.getByText('Enhance with AI');
    await userEvent.click(enhanceBtn);
    
    // Wait for loading
    expect(screen.getByText('Enhancing...')).toBeInTheDocument();
    
    // Verify enhancement appears
    await waitFor(() => {
      expect(screen.getByText(/experienced developer/i)).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Test accept/reject
    const acceptBtn = screen.getByText('Accept');
    await userEvent.click(acceptBtn);
    
    // Verify applied
    expect(screen.getByRole('textbox')).toHaveValue(/experienced developer/i);
  });
});
```

### Performance Testing

```typescript
describe('AI Performance', () => {
  it('should respond within 5 seconds', async () => {
    const start = Date.now();
    
    await aiService.enhanceBio('Test bio', mockContext);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });
  
  it('should use cache for repeated requests', async () => {
    // First request
    const result1 = await aiService.enhanceBio('Test', mockContext);
    
    // Second request (should be cached)
    const start = Date.now();
    const result2 = await aiService.enhanceBio('Test', mockContext);
    const duration = Date.now() - start;
    
    expect(result1).toEqual(result2);
    expect(duration).toBeLessThan(50); // Cache hit should be instant
  });
});
```

## Monitoring & Analytics

### Tracking AI Usage

```typescript
interface AIUsageMetrics {
  feature: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  responseTime: number;
  userAccepted: boolean;
  errorOccurred: boolean;
  userId: string;
  timestamp: Date;
}

class AIAnalytics {
  async trackUsage(metrics: AIUsageMetrics) {
    // Send to analytics
    await analytics.track('ai_feature_used', metrics);
    
    // Store in database
    await db.aiUsage.create({ data: metrics });
    
    // Update real-time dashboard
    await this.updateDashboard(metrics);
  }
  
  async generateReport(timeframe: string) {
    const usage = await db.aiUsage.aggregate({
      where: { timestamp: { gte: getTimeframeStart(timeframe) } },
      _avg: { responseTime: true },
      _sum: { promptTokens: true, completionTokens: true },
      _count: { userAccepted: true },
    });
    
    return {
      avgResponseTime: usage._avg.responseTime,
      totalTokens: usage._sum.promptTokens + usage._sum.completionTokens,
      acceptanceRate: usage._count.userAccepted / usage._count.total,
      estimatedCost: this.calculateCost(usage._sum),
    };
  }
}
```

### Quality Monitoring

```typescript
class AIQualityMonitor {
  async assessQuality(original: string, enhanced: string, userAction: 'accepted' | 'rejected' | 'edited') {
    const metrics = {
      lengthIncrease: enhanced.length / original.length,
      readabilityScore: this.calculateReadability(enhanced),
      keywordDensity: this.analyzeKeywords(enhanced),
      sentimentShift: this.compareSentiment(original, enhanced),
      userSatisfaction: userAction === 'accepted' ? 1 : 0,
    };
    
    // Store for analysis
    await db.aiQuality.create({ data: metrics });
    
    // Alert if quality drops
    if (metrics.userSatisfaction < 0.7) {
      await this.alertQualityIssue(metrics);
    }
  }
}
```

## Best Practices

### 1. Always Provide Context
```typescript
// ❌ Bad: Minimal context
const result = await enhance(text);

// ✅ Good: Rich context
const result = await enhance(text, {
  userProfession: user.profession,
  experienceLevel: user.experienceLevel,
  targetAudience: portfolio.targetAudience,
  preferredTone: portfolio.tone,
  industry: user.industry,
});
```

### 2. Handle Failures Gracefully
```typescript
// Always have fallbacks
try {
  const enhanced = await aiService.enhance(content);
  return enhanced;
} catch (error) {
  // Log for monitoring
  logger.warn('AI enhancement failed, using original', error);
  
  // Return original content
  return {
    enhanced: content,
    wasEnhanced: false,
    fallbackReason: error.message,
  };
}
```

### 3. Respect User Control
```typescript
// Always show before/after
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label>Original</Label>
    <div className="p-4 bg-gray-50 rounded">
      {original}
    </div>
  </div>
  <div>
    <Label>Enhanced</Label>
    <div className="p-4 bg-blue-50 rounded">
      {enhanced}
    </div>
  </div>
</div>

// Allow editing AI output
<Textarea
  value={enhanced}
  onChange={(e) => setEnhanced(e.target.value)}
  placeholder="Edit the enhanced version..."
/>
```

### 4. Monitor and Iterate
```typescript
// Track what works
useEffect(() => {
  if (userAccepted) {
    trackAISuccess({
      feature: 'bio_enhancement',
      model: selectedModel,
      promptVersion: 'v2',
      acceptanceTime: Date.now() - enhancementTime,
    });
  }
}, [userAccepted]);
```

### 5. Cost Management
```typescript
// Implement usage limits
const canEnhance = await checkUserQuota(userId);
if (!canEnhance) {
  return {
    error: 'Daily enhancement limit reached',
    resetTime: getQuotaResetTime(userId),
  };
}

// Track costs
const cost = calculateTokenCost(promptTokens, completionTokens);
await trackUsageCost(userId, cost);
```

## Troubleshooting

### Common Issues

1. **Slow Response Times**
   - Check model availability
   - Verify API key limits
   - Consider using faster model
   - Implement streaming responses

2. **Poor Quality Output**
   - Review prompt engineering
   - Check context completeness
   - Try different model
   - Analyze user feedback

3. **Rate Limiting**
   - Implement request queuing
   - Add retry logic
   - Consider caching more aggressively
   - Upgrade API plan if needed

4. **Inconsistent Results**
   - Reduce temperature parameter
   - Add more specific constraints
   - Use few-shot examples
   - Implement output validation

## Future Enhancements

### Planned Features

1. **Custom Model Training**
   - Fine-tune on successful portfolios
   - Industry-specific models
   - User preference learning

2. **Multi-modal AI**
   - Image optimization
   - Resume parsing
   - Voice-to-portfolio

3. **Advanced Analytics**
   - Predictive success metrics
   - A/B testing AI variations
   - Personalization engine

4. **Real-time Collaboration**
   - AI pair programming
   - Suggestion streaming
   - Collaborative editing

This guide will be updated as we implement new AI features and learn from user feedback.