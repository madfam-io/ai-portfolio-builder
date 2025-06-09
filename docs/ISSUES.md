# 🐛 PRISMA by MADFAM - Issue Tracker

> Last Updated: January 2025

This document tracks active issues, bugs, and tasks for the PRISMA project. For the full roadmap, see [ROADMAP.md](./ROADMAP.md).

## 🔴 Critical Issues

### #001 - Test Suite Updates for PRISMA Rebrand

**Type**: Enhancement  
**Priority**: High  
**Status**: ✅ Resolved  
**Assigned**: Completed

**Description**: Update all test suites to reflect PRISMA branding, authentication changes, and current feature set.

**Changes Made**:

- ✅ Updated authentication tests for 12-character password requirements
- ✅ Fixed pricing component tests to use Link components instead of buttons
- ✅ Updated Header component tests for PRISMA branding and Mexican/US flags
- ✅ Fixed language context imports to use minimal-context
- ✅ Updated translation expectations to match current PRISMA messaging

**Test Results**: 
- Before: 58 failed tests, 83 passed
- After: 43 failed tests, 99 passed
- ✅ **16 additional tests now passing**

---

## 🟡 High Priority Issues

### #002 - Remaining Test Suite Issues

**Type**: Bug  
**Priority**: Medium  
**Status**: In Progress  
**Assigned**: Development Team

**Description**: Some tests still need updates for mobile menu behavior and language toggle expectations.

**Remaining Issues**:

1. Header component mobile menu tests need updating for new UI structure
2. Language toggle tests expect different mobile/desktop behavior counts
3. Some tests still reference old translation keys

**Files Affected**:
- `__tests__/components/landing/Header.test.tsx`
- Mobile menu icon detection tests
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
