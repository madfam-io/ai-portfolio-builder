# UI/UX Standardization Plan for PRISMA Landing Page & Connected Pages

## 🎯 Objective

Ensure complete UI/UX consistency across all pages accessible from the landing page navigation, optimizing for all measurable dimensions including accessibility, performance, internationalization, and user experience.

## 🔍 Current State Analysis

### Critical Issues Found:

1. **Broken Navigation**: Privacy & Terms pages have no header/footer
2. **Missing Translations**: 5 pages with hardcoded English text
3. **Inconsistent Layouts**: Mixed use of BaseLayout vs direct Header/Footer
4. **Missing Page**: `/portfolio-editor-demo` link goes nowhere
5. **Spacing Inconsistencies**: Different padding/margin patterns across pages

## 📋 Implementation Plan

### Phase 1: Critical Fixes (Immediate)

#### 1.1 Fix Privacy & Terms Pages

- Convert to client components with proper navigation
- Implement BaseLayout wrapper
- Add full translation support
- Ensure dark mode compatibility

#### 1.2 Fix Missing Portfolio Demo Link

- Update Header component to link to `/demo/interactive`
- Or create the missing `/portfolio-editor-demo` page

### Phase 2: Layout Standardization

#### 2.1 Standardize All Pages to BaseLayout

Pages needing update:

- `/blog` - Currently uses Header/Footer directly
- `/careers` - Currently uses Header/Footer directly
- `/contact` - Currently uses Header/Footer directly
- `/gdpr` - Currently uses Header/Footer directly
- `/privacy` - No layout at all
- `/terms` - No layout at all

#### 2.2 Consistent Spacing System

Implement standard spacing tokens:

```tsx
// Standard page padding
const PAGE_PADDING = 'pt-24 pb-16 px-4 sm:px-6 lg:px-8';

// Standard container widths
const CONTAINER_NARROW = 'max-w-4xl'; // Legal pages, forms
const CONTAINER_STANDARD = 'max-w-6xl'; // Most content
const CONTAINER_WIDE = 'max-w-7xl'; // Dashboard, editor

// Standard section spacing
const SECTION_SPACING = 'mb-16';
```

### Phase 3: Complete Internationalization

#### 3.1 Add Missing Translation Keys

New keys needed for:

- Careers page (~15 keys)
- Contact page (~20 keys)
- Privacy page (~25 keys)
- Terms page (~25 keys)
- Blog page (~10 keys)

#### 3.2 Translation Key Structure

```typescript
// Example for careers page
careers: {
  title: 'Join Our Team',
  subtitle: 'Help us build the future of professional portfolios',
  openPositions: 'Open Positions',
  applyNow: 'Apply Now',
  benefits: 'Benefits & Perks',
  // ... etc
}
```

### Phase 4: UI/UX Enhancements

#### 4.1 Consistent Component Patterns

- Standardize button styles and sizes
- Consistent card shadows and borders
- Unified form input styling
- Standard loading states

#### 4.2 Responsive Design Audit

- Ensure all pages work on mobile (320px+)
- Test tablet breakpoints (768px)
- Verify desktop layouts (1024px+)

#### 4.3 Dark Mode Consistency

- Audit all color contrasts
- Ensure readable text in both modes
- Consistent background colors
- Proper transition animations

### Phase 5: Performance Optimization

#### 5.1 Page Load Optimization

- Lazy load heavy components
- Optimize image loading
- Implement proper code splitting
- Add loading skeletons

#### 5.2 SEO & Meta Tags

- Dynamic meta tags for all pages
- Proper OpenGraph data
- Structured data where applicable
- XML sitemap generation

### Phase 6: Accessibility Compliance

#### 6.1 WCAG 2.1 AA Compliance

- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support
- Screen reader optimization

#### 6.2 Focus Management

- Visible focus indicators
- Logical tab order
- Skip links for navigation
- Focus trapping in modals

## 📊 Success Metrics

### Quantitative Metrics:

- **Page Load Time**: < 3s on 3G
- **Lighthouse Score**: > 90 all categories
- **Translation Coverage**: 100%
- **WCAG Compliance**: AA rating

### Qualitative Metrics:

- Consistent visual design across all pages
- Smooth navigation experience
- No broken or confusing UI elements
- Positive user feedback

## 🚀 Implementation Timeline

**Week 1**: Critical fixes (Privacy, Terms, missing link)
**Week 2**: Layout standardization
**Week 3**: Complete internationalization
**Week 4**: UI/UX enhancements and testing

## ✅ Validation Checklist

For each page, verify:

- [ ] Uses BaseLayout component
- [ ] Has complete translations (ES/EN)
- [ ] Dark mode works properly
- [ ] Responsive on all devices
- [ ] Consistent spacing/styling
- [ ] Accessible (keyboard nav, ARIA)
- [ ] Fast loading (< 3s)
- [ ] No console errors
- [ ] Proper meta tags

## 🎨 Design Tokens

### Colors

```css
--primary: purple-600 --primary-hover: purple-700 --text-primary: gray-900 /
  white --text-secondary: gray-600 / gray-300 --background: white / gray-900
  --surface: gray-50 / gray-800;
```

### Typography

```css
--font-heading:
  'Inter', system-ui --font-body: 'Inter',
  system-ui --text-xs: 0.75rem --text-sm: 0.875rem --text-base: 1rem
    --text-lg: 1.125rem --text-xl: 1.25rem --text-2xl: 1.5rem
    --text-3xl: 1.875rem --text-4xl: 2.25rem --text-5xl: 3rem;
```

### Spacing

```css
--space-1: 0.25rem --space-2: 0.5rem --space-3: 0.75rem --space-4: 1rem
  --space-6: 1.5rem --space-8: 2rem --space-12: 3rem --space-16: 4rem
  --space-20: 5rem --space-24: 6rem;
```

This plan ensures every page accessible from the landing page meets the highest standards of consistency, accessibility, and user experience.
