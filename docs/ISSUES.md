# 🐛 MADFAM AI Portfolio Builder - Issue Tracker

> Last Updated: January 2025

This document tracks active issues, bugs, and tasks. For the full roadmap, see [ROADMAP.md](./ROADMAP.md).

## 🔴 Critical Issues

### #001 - Test Suite Failing Due to LanguageProvider

**Type**: Bug  
**Priority**: High  
**Status**: Open  
**Assigned**: Unassigned

**Description**: Unit tests are failing because components are not wrapped with LanguageProvider in test environment.

**Error Message**:

```
useLanguage must be used within a LanguageProvider
```

**Files Affected**:

- `__tests__/app/page.test.tsx`
- `__tests__/utils/test-utils.tsx`

**Proposed Solution**:

- Update test-utils.tsx to wrap components with LanguageProvider
- Ensure all component tests use the custom render function

---

## 🟡 High Priority Issues

### #002 - Hydration Mismatch with Language Toggle

**Type**: Bug  
**Priority**: High  
**Status**: In Progress  
**Assigned**: Unassigned

**Description**: Occasional hydration errors when switching languages, particularly on first load.

**Steps to Reproduce**:

1. Load page in Spanish
2. Quickly toggle to English before full hydration
3. Check console for hydration warnings

**Files Affected**:

- `lib/i18n/simple-context.tsx`
- `lib/i18n/simple-context-v2.tsx`
- Various test components in `/app/*-test/`

**Current Investigation**:

- Created multiple test pages to isolate the issue
- Testing different implementation approaches

---

### #003 - Mobile Menu Language Toggle Styling

**Type**: Enhancement  
**Priority**: Medium  
**Status**: Open  
**Assigned**: Unassigned

**Description**: Language toggle button in mobile menu needs proper styling to match desktop version.

**Acceptance Criteria**:

- [ ] Consistent button styling across desktop and mobile
- [ ] Proper spacing and alignment
- [ ] Smooth transitions
- [ ] Accessibility compliance

**Files to Update**:

- `components/landing/Header.tsx`

---

## 🟢 Medium Priority Issues

### #004 - Hardcoded Strings Need Translation

**Type**: Technical Debt  
**Priority**: Medium  
**Status**: Open  
**Assigned**: Unassigned

**Description**: Some UI strings are still hardcoded and need to be moved to translation files.

**Locations**:

- Error messages
- Form validation messages
- Toast notifications
- Meta tags and SEO content

**Action Items**:

- [ ] Audit all components for hardcoded strings
- [ ] Add missing translation keys
- [ ] Update components to use translations

---

### #005 - Bundle Size Optimization

**Type**: Performance  
**Priority**: Medium  
**Status**: Open  
**Assigned**: Unassigned

**Description**: Current JavaScript bundle size could be reduced for better performance.

**Current Metrics**:

- Main bundle: ~200KB (gzipped)
- Target: < 150KB

**Optimization Opportunities**:

- [ ] Implement code splitting for routes
- [ ] Lazy load heavy components
- [ ] Tree-shake unused imports
- [ ] Optimize image imports

---

## 🔵 Low Priority Issues

### #006 - Add Loading Skeletons

**Type**: Enhancement  
**Priority**: Low  
**Status**: Open  
**Assigned**: Unassigned

**Description**: Add skeleton screens for better perceived performance during loading states.

**Components Needing Skeletons**:

- Portfolio grid
- Template previews
- User dashboard cards

---

### #007 - Keyboard Navigation Enhancement

**Type**: Accessibility  
**Priority**: Low  
**Status**: Open  
**Assigned**: Unassigned

**Description**: Improve keyboard navigation throughout the application.

**Requirements**:

- [ ] Proper tab order
- [ ] Skip links
- [ ] Focus indicators
- [ ] Keyboard shortcuts for common actions

---

## 📋 Task List

### Immediate Tasks (This Week)

- [ ] Fix test suite LanguageProvider issue (#001)
- [ ] Complete authentication integration
- [ ] Set up database migrations
- [ ] Create user profile schema

### Next Sprint Tasks

- [ ] Implement OAuth providers
- [ ] Create dashboard layout
- [ ] Build profile import UI
- [ ] Integrate AI services

### Documentation Tasks

- [ ] Update API documentation
- [ ] Create component storybook
- [ ] Write deployment guide
- [ ] Add troubleshooting guide

---

## 🏷️ Labels Guide

**Bug**: Something isn't working  
**Enhancement**: New feature or request  
**Documentation**: Improvements or additions to documentation  
**Good First Issue**: Good for newcomers  
**Help Wanted**: Extra attention is needed  
**Critical**: Show stopper, needs immediate attention  
**Performance**: Performance-related issues  
**Security**: Security-related issues  
**Tech Debt**: Code that needs refactoring  
**UI/UX**: User interface or experience issues

---

## 📝 Issue Template

```markdown
### Issue Title

**Type**: Bug/Enhancement/Task  
**Priority**: Critical/High/Medium/Low  
**Status**: Open/In Progress/Closed  
**Assigned**: Username or Unassigned

**Description**:
Clear description of the issue

**Steps to Reproduce** (for bugs):

1. Step one
2. Step two
3. Step three

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Screenshots/Logs**:
If applicable

**Environment**:

- Browser:
- OS:
- Version:

**Proposed Solution**:
If you have ideas on how to fix it
```

---

## 🔄 Issue Workflow

1. **Open**: Issue identified and documented
2. **In Progress**: Someone is actively working on it
3. **Review**: Solution implemented, needs review
4. **Testing**: Under testing
5. **Closed**: Issue resolved and verified

---

## 📞 Reporting New Issues

To report a new issue:

1. Check if it already exists in this document
2. Use the issue template above
3. Submit via GitHub Issues or update this document
4. Tag with appropriate labels

For urgent issues, contact the team directly via Slack or email.
