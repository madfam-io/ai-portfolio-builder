# 📚 PRISMA Documentation Hub

Welcome to the complete documentation for **PRISMA by MADFAM** - the AI-powered portfolio builder that transforms CVs into stunning websites in under 30 minutes.

**Current Version**: v0.1.1-beta | **Status**: Production-Ready Foundation

## 🚀 Quick Start

### For New Developers

```bash
# Clone and start development environment
git clone https://github.com/aldoruizluna/ai-portfolio-builder.git
cd ai-portfolio-builder
./scripts/docker-dev.sh

# Access at http://localhost:3000
```

### For Users

- **Demo**: [prisma.madfam.io/demo](https://prisma.madfam.io/demo)
- **Production**: [prisma.madfam.io](https://prisma.madfam.io)

## 📖 Documentation Structure

### Core Documentation

| Document                                   | Purpose                                   | Audience                | Status |
| ------------------------------------------ | ----------------------------------------- | ----------------------- | ------ |
| [**DEVELOPMENT.md**](./DEVELOPMENT.md)     | Complete development guide                | Developers              | ✅     |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md)   | Technical architecture & design decisions | Tech Leads, Architects  | ✅     |
| [**AI_FEATURES.md**](./AI_FEATURES.md)     | AI integration & capabilities             | Developers, Product     | ✅     |
| [**API_REFERENCE.md**](./API_REFERENCE.md) | Complete API documentation                | Developers, Integrators | ✅     |
| [**DEPLOYMENT.md**](./DEPLOYMENT.md)       | Production deployment guide               | DevOps, Deployment      | ✅     |
| [**SECURITY.md**](./SECURITY.md)           | Security practices & guidelines           | Security, Compliance    | ✅     |

### Getting Started Guides

- **New Developer Setup**: See [DEVELOPMENT.md#setup](./DEVELOPMENT.md#setup)
- **Contributing**: See [DEVELOPMENT.md#contributing](./DEVELOPMENT.md#contributing)
- **Testing**: See [DEVELOPMENT.md#testing](./DEVELOPMENT.md#testing)
- **Git Workflow**: See [DEVELOPMENT.md#git-workflow](./DEVELOPMENT.md#git-workflow)

## 🏗️ Project Overview

### What is PRISMA?

PRISMA is a SaaS platform that combines AI-powered content enhancement with professional portfolio templates to help users create stunning portfolio websites quickly.

### Key Features

- **🤖 AI Content Enhancement**: Multi-model AI integration for bio and project optimization
- **🌍 100% Multilingual**: Spanish/English support with intelligent geolocation detection
- **📊 GitHub Analytics**: Enterprise-grade repository analytics and insights
- **🎨 Professional Templates**: Industry-specific portfolio designs
- **👤 Dual-User System**: Customer accounts and comprehensive admin hierarchy
- **🔐 Enterprise Security**: Complete authentication, authorization, and audit capabilities

### Current Status (v0.1.1-beta)

✅ **Production-Ready Foundation**

- Complete multilingual platform (Spanish/English)
- AI content enhancement system operational
- GitHub Analytics integration complete
- Dual-user admin system implemented
- Comprehensive test coverage (95%+ pass rate)
- Production security measures in place

🚧 **Next Sprint: Authentication & Editor**

- Supabase authentication integration
- Portfolio editor interface
- User dashboard completion

## 🔧 Technical Stack

### Frontend

- **Next.js 15** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **React 18** with modern hooks
- **Framer Motion** for animations

### Backend

- **Next.js API Routes** for server logic
- **Supabase** for database and auth
- **PostgreSQL** with Row Level Security
- **Redis** for caching (Docker dev)

### AI & Integrations

- **HuggingFace** unified AI integration
- **GitHub OAuth** for analytics
- **Multiple AI models** (Llama, Phi, Mistral)

### Development

- **Docker** development environment
- **Jest + Playwright** testing
- **ESLint + Prettier** code quality
- **Conventional Commits** workflow

## 🎯 Project Phases

### ✅ Phase 1 Complete: Foundation (v0.1.0-beta)

- PRISMA branding and identity
- Multilingual support with geolocation
- AI content enhancement
- GitHub Analytics
- Admin system with RBAC
- Comprehensive testing

### 🚧 Phase 2 Current: Core SaaS (v0.2.0-beta)

- Authentication system integration
- Portfolio builder interface
- User dashboard and management
- Template customization system

### 🔮 Phase 3 Planned: Advanced Features (v0.3.0-beta)

- LinkedIn/CV import
- Publishing pipeline
- Custom domains
- Payment integration
- Team collaboration

## 📊 Key Metrics

### Technical Performance

- **Page Load**: < 3 seconds
- **API Response**: < 500ms (p95)
- **Test Coverage**: 95%+ pass rate
- **Bundle Size**: < 200KB (gzipped)
- **Lighthouse Score**: 90+

### Business Metrics

- **Portfolio Generation**: < 30 minutes
- **AI Enhancement**: < 5 seconds per request
- **Cost Efficiency**: ~$0.0003 per AI request
- **Uptime Target**: 99.9%

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](./DEVELOPMENT.md#contributing) for:

- [Code standards and conventions](./DEVELOPMENT.md#code-standards)
- [Git workflow and branching](./DEVELOPMENT.md#git-workflow)
- [Testing requirements](./DEVELOPMENT.md#testing)
- [Pull request process](./DEVELOPMENT.md#pull-requests)

### Quick Contribution Checklist

- [ ] Fork and clone the repository
- [ ] Create feature branch from `main`
- [ ] Follow our [coding standards](./DEVELOPMENT.md#code-standards)
- [ ] Add tests for new features
- [ ] Ensure all tests pass
- [ ] Submit pull request with description

## 🆘 Support & Resources

### Development Support

- **Setup Issues**: [DEVELOPMENT.md#troubleshooting](./DEVELOPMENT.md#troubleshooting)
- **Docker Problems**: [DEVELOPMENT.md#docker](./DEVELOPMENT.md#docker)
- **Testing Help**: [DEVELOPMENT.md#testing](./DEVELOPMENT.md#testing)

### Architecture Questions

- **System Design**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Database Schema**: [ARCHITECTURE.md#database](./ARCHITECTURE.md#database)
- **AI Integration**: [AI_FEATURES.md](./AI_FEATURES.md)

### Production Support

- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Security**: [SECURITY.md](./SECURITY.md)
- **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/aldoruizluna/ai-portfolio-builder/issues)
- **Discussions**: [Join community discussions](https://github.com/aldoruizluna/ai-portfolio-builder/discussions)

## 🔄 Documentation Maintenance

This documentation is actively maintained and updated with each release.

### Version History

- **v0.1.1-beta**: Modular architecture, improved DX, 400+ translation keys
- **v0.1.0-beta**: Foundation complete with AI and admin systems
- **v0.0.1-alpha**: Initial PRISMA rebrand and multilingual support

### Last Updated

- **Documentation**: December 2024
- **Technical Architecture**: November 2024
- **API Reference**: December 2024

---

<div align="center">

**PRISMA by MADFAM** - Transform your CV into a stunning portfolio in under 30 minutes

[Main Project](../README.md) | [AI Context](../CLAUDE.md) | [GitHub](https://github.com/aldoruizluna/ai-portfolio-builder)

</div>
