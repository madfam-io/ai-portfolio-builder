# Prompt Template: AI Enhancement Features

## Context
You're implementing or improving AI-powered features that help users create better portfolio content through intelligent enhancement and optimization.

## Understanding AI in PRISMA

### Current AI Capabilities
1. **Bio Enhancement**: Transform basic bios into professional narratives
2. **Project Optimization**: STAR format, metrics extraction
3. **Template Recommendations**: Match users with ideal templates
4. **Content Scoring**: Quality feedback and suggestions

### AI Architecture
- Provider: HuggingFace (primary)
- Models: Llama 3.1, Phi-3.5, Mistral
- Target: <5 second response time
- Caching: 24-hour for identical requests

## Implementation Guide

### 1. Define the AI Feature

```typescript
// types/ai.ts
interface NewAIFeature {
  input: {
    content: string;
    context?: {
      industry?: string;
      targetAudience?: string;
      tone?: 'professional' | 'friendly' | 'creative';
    };
  };
  output: {
    enhanced: string;
    suggestions?: string[];
    confidence: number;
    metadata?: Record<string, any>;
  };
}
```

### 2. Create Prompt Engineering

```typescript
// lib/ai/prompts/new-feature-prompt.ts
export function buildNewFeaturePrompt(
  input: NewAIFeature['input']
): string {
  return `
You are a professional content optimizer. 

Task: ${describeTask}

Input: "${input.content}"

Context:
- Industry: ${input.context?.industry || 'General'}
- Target Audience: ${input.context?.targetAudience || 'Professional'}
- Tone: ${input.context?.tone || 'professional'}

Requirements:
- Maximum ${MAX_WORDS} words
- Maintain authenticity
- Include specific metrics where possible
- Professional language
- SEO-friendly

Output the enhanced version only.
`;
}
```

### 3. Implement AI Service Method

```typescript
// lib/ai/huggingface-service.ts
async enhanceNewFeature(
  input: NewAIFeature['input']
): Promise<NewAIFeature['output']> {
  try {
    // Generate cache key
    const cacheKey = this.generateCacheKey('new-feature', input.content, input.context);
    
    // Check cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }
    
    // Select best model for task
    const model = this.modelManager.getRecommendedModel('new-feature');
    
    // Build prompt
    const prompt = buildNewFeaturePrompt(input);
    
    // Call AI
    const response = await this.callModel(model, prompt);
    
    // Process response
    const enhanced = this.extractEnhancedContent(response.content);
    
    // Score quality
    const score = await this.contentScorer.scoreContent(enhanced, 'new-feature');
    
    // Build result
    const result: NewAIFeature['output'] = {
      enhanced,
      suggestions: this.generateSuggestions(input.content, enhanced),
      confidence: this.calculateConfidence(score.overall, response),
      metadata: {
        model: model,
        processingTime: response.metadata.responseTime,
        wordCount: enhanced.split(/\s+/).length,
      }
    };
    
    // Cache result
    await cache.set(cacheKey, JSON.stringify(result), 86400); // 24 hours
    
    return result;
    
  } catch (error) {
    logger.error('New feature enhancement failed', error);
    throw this.handleError(error, 'new feature enhancement');
  }
}
```

### 4. Create UI Component

```typescript
// components/ai/NewFeatureEnhancer.tsx
export function NewFeatureEnhancer({ 
  content, 
  onEnhanced 
}: {
  content: string;
  onEnhanced: (enhanced: string) => void;
}) {
  const { t } = useLanguage();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useAIStore(s => s.selectedModels.newFeature);
  
  const enhance = async () => {
    setIsEnhancing(true);
    
    try {
      const result = await aiClient.enhanceNewFeature({
        content,
        context: {
          industry: user.industry,
          tone: 'professional'
        }
      });
      
      // Generate multiple variants
      setVariants([result.enhanced]);
      
      // Auto-select if high confidence
      if (result.confidence > 0.8) {
        onEnhanced(result.enhanced);
      }
      
      toast.success(t.ai.enhancementComplete);
    } catch (error) {
      toast.error(t.ai.enhancementFailed);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{t.ai.enhancement}</Label>
        <ModelSelector 
          feature="newFeature"
          selected={selectedModel}
          onChange={setSelectedModel}
        />
      </div>
      
      <Button
        onClick={enhance}
        disabled={!content || isEnhancing}
        variant="secondary"
        size="sm"
      >
        {isEnhancing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t.ai.enhancing}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            {t.ai.enhanceWithAI}
          </>
        )}
      </Button>
      
      {variants.length > 0 && (
        <VariantSelector
          variants={variants}
          onSelect={onEnhanced}
          original={content}
        />
      )}
    </div>
  );
}
```

### 5. Add Loading States and Error Handling

```typescript
// Enhanced error handling
const enhance = async () => {
  try {
    // ... enhancement logic
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      toast.error(t.ai.quotaExceeded);
    } else if (error instanceof ModelUnavailableError) {
      toast.error(t.ai.modelUnavailable);
      // Try fallback model
      await enhanceWithFallback();
    } else {
      toast.error(t.ai.genericError);
    }
  }
};
```

### 6. Implement Caching Strategy

```typescript
// lib/ai/caching.ts
export class AICache {
  private static readonly TTL = 24 * 60 * 60; // 24 hours
  
  static async get(key: string): Promise<any | null> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      // Fall back to in-memory cache
      return memoryCache.get(key);
    }
    return null;
  }
  
  static async set(key: string, value: any): Promise<void> {
    const serialized = JSON.stringify(value);
    
    try {
      await redis.setex(key, this.TTL, serialized);
    } catch (error) {
      // Fall back to in-memory cache
      memoryCache.set(key, value, this.TTL);
    }
  }
}
```

### 7. Add Analytics Tracking

```typescript
// Track AI usage
const trackAIUsage = async (feature: string, result: any) => {
  await analytics.track('ai_enhancement_used', {
    feature,
    model: result.metadata.model,
    processingTime: result.metadata.responseTime,
    confidence: result.confidence,
    accepted: false, // Updated when user accepts
    wordCountBefore: input.split(/\s+/).length,
    wordCountAfter: result.enhanced.split(/\s+/).length,
  });
};
```

## Testing AI Features

### Unit Tests
```typescript
// __tests__/ai/new-feature-enhancement.test.ts
describe('NewFeature AI Enhancement', () => {
  it('enhances content successfully', async () => {
    const input = 'Basic content';
    const result = await aiService.enhanceNewFeature({ content: input });
    
    expect(result.enhanced).toBeTruthy();
    expect(result.enhanced.length).toBeGreaterThan(input.length);
    expect(result.confidence).toBeGreaterThan(0.5);
  });
  
  it('returns cached result for identical input', async () => {
    const input = { content: 'Test content' };
    
    const result1 = await aiService.enhanceNewFeature(input);
    const result2 = await aiService.enhanceNewFeature(input);
    
    expect(result1).toEqual(result2);
  });
  
  it('handles AI service errors gracefully', async () => {
    // Mock service failure
    jest.spyOn(aiService, 'callModel').mockRejectedValue(new Error('API Error'));
    
    await expect(aiService.enhanceNewFeature({ content: 'Test' }))
      .rejects.toThrow(AIServiceError);
  });
});
```

### Integration Tests
```typescript
describe('AI Enhancement Integration', () => {
  it('enhances bio end-to-end', async () => {
    render(<BioSection />);
    
    const input = screen.getByLabelText('Bio');
    await userEvent.type(input, 'Software developer');
    
    const enhanceButton = screen.getByText('Enhance with AI');
    await userEvent.click(enhanceButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Seasoned software developer/)).toBeInTheDocument();
    });
  });
});
```

## Common AI Enhancement Patterns

### 1. Multiple Variants
```typescript
// Generate 3 variants for user choice
const generateVariants = async (input: string): Promise<string[]> => {
  const variants = await Promise.all([
    enhance(input, { tone: 'professional' }),
    enhance(input, { tone: 'friendly' }),
    enhance(input, { tone: 'creative' })
  ]);
  return variants.map(v => v.enhanced);
};
```

### 2. Progressive Enhancement
```typescript
// Start with quick enhancement, then improve
const progressiveEnhance = async (content: string) => {
  // Quick enhancement with small model
  const quick = await enhance(content, { model: 'phi-3.5' });
  onQuickResult(quick);
  
  // Detailed enhancement with larger model
  const detailed = await enhance(content, { model: 'llama-3.1-70b' });
  onDetailedResult(detailed);
};
```

### 3. Context-Aware Enhancement
```typescript
// Use user profile for better results
const enhanceWithContext = async (content: string) => {
  const context = {
    industry: userProfile.industry,
    experience: userProfile.experienceLevel,
    targetAudience: userProfile.targetAudience,
    previousWork: userProfile.projectTypes,
  };
  
  return enhance(content, { context });
};
```

### 4. Feedback Loop
```typescript
// Learn from user preferences
const trackUserChoice = async (
  options: string[], 
  selected: number, 
  edited: string
) => {
  await analytics.track('ai_variant_selected', {
    optionCount: options.length,
    selectedIndex: selected,
    wasEdited: edited !== options[selected],
    editDistance: calculateEditDistance(options[selected], edited),
  });
};
```

## Performance Optimization

### 1. Implement Request Queuing
```typescript
class AIRequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) await request();
      await this.delay(100); // Rate limiting
    }
    this.processing = false;
  }
}
```

### 2. Smart Caching
```typescript
// Cache with user context
const getCacheKey = (content: string, userId: string) => {
  const userContext = getUserContext(userId);
  return generateHash({ content, ...userContext });
};
```

## Monitoring AI Performance

```typescript
// lib/ai/monitoring.ts
export class AIMonitor {
  static async trackPerformance(
    feature: string,
    startTime: number,
    result: any
  ) {
    const metrics = {
      feature,
      duration: Date.now() - startTime,
      model: result.metadata.model,
      tokenCount: result.metadata.tokens,
      cacheHit: result.metadata.cached || false,
      error: result.error || null,
    };
    
    await prometheus.observe('ai_request_duration', metrics.duration, {
      feature,
      model: metrics.model,
    });
    
    if (metrics.duration > 5000) {
      logger.warn('Slow AI response', metrics);
    }
  }
}
```

## Best Practices

1. **Always provide fallbacks**: Never depend solely on AI
2. **Set user expectations**: Show loading states and time estimates
3. **Validate AI output**: Ensure quality and appropriateness
4. **Respect rate limits**: Implement proper queuing
5. **Cache aggressively**: Reduce API calls and improve speed
6. **Monitor quality**: Track user acceptance rates
7. **A/B test prompts**: Continuously improve results
8. **Handle errors gracefully**: Provide helpful error messages

## Success Metrics

Track these metrics for AI features:
- User acceptance rate (>70% target)
- Average processing time (<5s target)
- Error rate (<1% target)
- Cache hit rate (>40% target)
- User satisfaction scores
- Edit rate after enhancement
- Feature usage frequency