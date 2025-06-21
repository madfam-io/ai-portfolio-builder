# Prompt Template: Adding Portfolio Features

## Context
You're adding a new feature to the PRISMA portfolio builder that enhances how users showcase their professional work.

## Pre-Implementation Checklist

1. **Understand User Value**
   - How does this feature help users showcase their work better?
   - What problem does it solve for portfolio creation?
   - How does it fit within the 30-minute creation goal?

2. **Check Existing Patterns**
   - Review similar features in `components/portfolio/` and `components/editor/`
   - Check store patterns in `lib/store/portfolio-store.ts`
   - Review API patterns in `app/api/v1/portfolios/`

3. **Consider AI Enhancement**
   - Can AI improve this feature?
   - Review `lib/ai/` for integration patterns
   - Check AI feature patterns in editor components

## Implementation Steps

### 1. Define Types and Interfaces
```typescript
// types/portfolio.ts
interface NewFeature {
  id: string;
  // Define the data structure
}

// Update Portfolio interface if needed
interface Portfolio {
  // ... existing fields
  newFeature?: NewFeature;
}
```

### 2. Update Store
```typescript
// lib/store/portfolio-store.ts
interface PortfolioState {
  // Add new state
  newFeatureData: NewFeature | null;
  
  // Add actions
  updateNewFeature: (data: Partial<NewFeature>) => void;
  resetNewFeature: () => void;
}
```

### 3. Create UI Components
```typescript
// components/editor/sections/NewFeatureSection.tsx
export function NewFeatureSection() {
  const { t } = useLanguage();
  const { newFeatureData, updateNewFeature } = usePortfolioStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.newFeature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Feature UI */}
      </CardContent>
    </Card>
  );
}
```

### 4. Add to Editor
```typescript
// components/editor/EditorSidebar.tsx
// Add new section to PORTFOLIO_SECTIONS array
const PORTFOLIO_SECTIONS = [
  // ... existing sections
  { id: 'newFeature', label: t.sections.newFeature, icon: IconName }
];
```

### 5. Template Integration
```typescript
// components/templates/[TemplateName].tsx
// Add rendering logic for the new feature
{portfolio.newFeature && (
  <NewFeatureDisplay data={portfolio.newFeature} />
)}
```

### 6. API Endpoints (if needed)
```typescript
// app/api/v1/portfolios/[id]/new-feature/route.ts
export async function POST(request: NextRequest) {
  // Validation
  const schema = z.object({
    // Define schema
  });
  
  // Implementation
}
```

### 7. Add Tests
```typescript
// __tests__/components/editor/NewFeatureSection.test.tsx
describe('NewFeatureSection', () => {
  it('renders feature correctly', () => {
    // Test implementation
  });
  
  it('handles user input', () => {
    // Test interaction
  });
});
```

### 8. Update Documentation
- Add to feature list in README if significant
- Update API docs if new endpoints added
- Add to user guide if user-facing

## Performance Considerations

- **Lazy Load**: Use dynamic imports for heavy components
- **Optimize Images**: Use next/image for any visual assets
- **Cache Data**: Implement caching for expensive operations
- **Mobile First**: Ensure responsive design

## AI Enhancement Opportunities

Consider these AI integrations:
- Content generation for the feature
- Smart suggestions based on user data
- Optimization of user input
- Template recommendations

## Example: Adding a Testimonials Section

```typescript
// 1. Types
interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating?: number;
  avatar?: string;
}

// 2. Store update
testimonials: Testimonial[];
addTestimonial: (testimonial: Testimonial) => void;
updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;
deleteTestimonial: (id: string) => void;

// 3. Component
export function TestimonialsSection() {
  const { testimonials, addTestimonial } = usePortfolioStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.testimonials.title}</CardTitle>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t.testimonials.add}
        </Button>
      </CardHeader>
      <CardContent>
        {testimonials.map(testimonial => (
          <TestimonialCard key={testimonial.id} {...testimonial} />
        ))}
      </CardContent>
    </Card>
  );
}

// 4. AI Enhancement
const enhanceTestimonial = async (rawTestimonial: string) => {
  const enhanced = await aiClient.enhanceTestimonial(rawTestimonial);
  return enhanced;
};
```

## Common Patterns

### Form Handling
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: existingData,
});

const onSubmit = form.handleSubmit(async (data) => {
  try {
    await saveData(data);
    toast.success(t.saved);
  } catch (error) {
    toast.error(t.error);
  }
});
```

### Real-time Preview
```typescript
// Update store immediately for preview
const handleChange = (field: string, value: any) => {
  updateFeature({ [field]: value });
  // Preview updates automatically via store subscription
};
```

### Mobile Optimization
```typescript
<div className="space-y-4 md:space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Responsive grid layout */}
  </div>
</div>
```

## Success Criteria

- [ ] Feature helps users showcase work better
- [ ] Integrates seamlessly with existing UI
- [ ] Works on all device sizes
- [ ] Includes proper error handling
- [ ] Has comprehensive tests
- [ ] Follows established patterns
- [ ] Supports both languages
- [ ] Maintains <30-minute portfolio creation goal