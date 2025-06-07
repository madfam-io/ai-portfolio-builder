# GitHub Pages Demo Setup

This document explains how to deploy the static HTML demo to GitHub Pages while maintaining compatibility with the full Next.js application.

## 🎯 Purpose

The `index.html` file serves as a **static demo/landing page** that can be deployed to GitHub Pages for:
- Early user validation and feedback
- Investor/stakeholder demos
- SEO and marketing purposes
- Lead generation (waitlist signup)

## 🚀 GitHub Pages Deployment

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### 2. Access Your Demo

Your demo will be available at:
```
https://yourusername.github.io/ai-portfolio-builder/
```

### 3. Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file with your domain
2. Configure DNS records
3. Enable HTTPS in Pages settings

## 🔀 Coexistence Strategy

The static demo coexists with the Next.js app through:

### File Structure
```
├── index.html                 # Static demo (GitHub Pages)
├── app/                       # Next.js application
├── components/               
├── lib/                       
└── public/                    # Next.js static assets
```

### Environment Detection
```javascript
// In index.html
const isDevelopment = window.location.hostname === 'localhost';
const isProduction = window.location.hostname.includes('madfam.io');
const isDemo = window.location.hostname.includes('github.io');

if (isDemo) {
    console.log('Running static demo version');
}
```

### URL Structure
- **Demo**: `https://yourusername.github.io/ai-portfolio-builder/`
- **Staging**: `https://staging.madfam.io/`
- **Production**: `https://app.madfam.io/`

## ⚙️ Configuration

### .gitignore Updates
The static demo files are **NOT** ignored, ensuring they deploy to GitHub Pages:
```gitignore
# These files ARE tracked for GitHub Pages
# index.html ❌ (not ignored)
# CNAME ❌ (not ignored)

# Next.js files are ignored for GitHub Pages but tracked for Vercel
.next/
out/
```

### Next.js Compatibility

When building the Next.js app, avoid conflicts:

1. **Static Generation**: Use `next export` if needed
2. **Public Path**: Configure `basePath` if using subdirectories
3. **Asset Loading**: Ensure paths work in both environments

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use basePath if deploying to subdirectory
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Ensure compatibility
  trailingSlash: true,
  images: {
    unoptimized: true // For static export compatibility
  }
}

module.exports = nextConfig
```

## 🎨 Styling Approach

The demo uses **CDN-based Tailwind CSS** for GitHub Pages compatibility:

```html
<!-- index.html uses CDN (no build step) -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Next.js app uses installed Tailwind -->
<!-- Configured through tailwind.config.js -->
```

## 📊 Analytics & Tracking

For the static demo, use simple client-side analytics:

```javascript
// Demo analytics (in index.html)
function trackEvent(eventName, properties) {
    if (window.gtag) {
        gtag('event', eventName, properties);
    }
    
    console.log('Demo event:', eventName, properties);
}
```

## 🔄 Workflow Integration

### Development Process
1. **Static Demo**: Edit `index.html` directly
2. **Next.js App**: Work in `app/` directory
3. **Deploy**: 
   - GitHub Pages auto-deploys `index.html`
   - Vercel auto-deploys Next.js app

### CI/CD Considerations
```yaml
# .github/workflows/demo.yml
name: Demo Validation

on:
  push:
    paths:
      - 'index.html'
      - 'GITHUB_PAGES_SETUP.md'

jobs:
  validate-demo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate HTML
        run: |
          # Add HTML validation
          npx html-validate index.html
```

## 🚨 Important Notes

### What Works on GitHub Pages
- ✅ Static HTML/CSS/JS
- ✅ Client-side form handling
- ✅ CDN resources (Tailwind, Font Awesome)
- ✅ Simple contact forms (using Formspree, etc.)

### What Doesn't Work
- ❌ Server-side processing
- ❌ Database connections
- ❌ API routes
- ❌ Authentication
- ❌ Dynamic routing

### Migration Path
When ready to transition users from demo to full app:

```javascript
// In index.html
function redirectToApp() {
    const fullAppUrl = 'https://app.madfam.io';
    window.location.href = fullAppUrl + '?source=demo';
}
```

## 🎯 Success Metrics

Track demo performance:
- Page views and engagement
- Waitlist signups
- Click-through to full app
- Bounce rate and time on page

## 🔧 Troubleshooting

### Common Issues

1. **CSS Not Loading**
   - Ensure CDN links are correct
   - Check for mixed content (HTTP/HTTPS)

2. **JavaScript Errors**
   - Validate syntax
   - Check browser console

3. **Domain Issues**
   - Verify CNAME configuration
   - Check DNS propagation

### Quick Fixes
```bash
# Test locally
python -m http.server 8000
# Visit http://localhost:8000

# Validate HTML
npx html-validate index.html

# Check accessibility
npm install -g pa11y
pa11y index.html
```

This setup allows you to showcase MADFAM AI Portfolio Builder immediately while building the full application in parallel.