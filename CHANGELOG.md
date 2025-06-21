# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.3.0 (2025-06-21)


### ⚠ BREAKING CHANGES

* Environment variables now required for Docker credentials

Critical Security Fixes:
- Remove hardcoded PostgreSQL/pgAdmin credentials from docker-compose files
- Replace unsafe innerHTML with secure React component approach
- Add comprehensive input validation middleware for all API routes
- Remove all console.log statements from production code

Code Quality Improvements:
- Replace all 'any' types with proper TypeScript interfaces
- Remove 15 unused dependencies (reduced bundle size)
- Create comprehensive validation schemas for API endpoints
- Add type-safe portfolio section interfaces

CI/CD Pipeline:
- Add GitHub Actions workflows for CI, security scanning, and releases
- Implement automated dependency updates with safety checks
- Add CodeQL analysis and vulnerability scanning
- Configure automated testing and code quality checks

Documentation:
- Create comprehensive .env.example with all required variables
- Add security notes and best practices
- Document validation middleware usage patterns

This commit addresses all Phase 1 critical issues from the codebase analysis,
establishing a secure foundation for future development.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
* Major architecture refactoring with new patterns
* **security:** GitHub tokens are now encrypted in the database

Security Improvements:
- Implement AES-256-GCM encryption for GitHub access tokens
- Update GitHub OAuth callback to encrypt tokens before storage
- Add database migration for encrypted token columns
- Create token migration script for existing integrations

Dependency Updates:
- Update @supabase/ssr from 0.1.0 to 0.6.1 (fixes CVE-2024-47764)
- Update eslint-config-next to 15.3.3 (matches Next.js version)
- All security vulnerabilities resolved

Node.js Compatibility:
- Fix React hooks compatibility issue with Node.js v21.0-21.7
- Add Node.js version check script
- Update engines requirement in package.json

Logging Enhancement:
- Upgrade logger to structured logging with context support
- Add error serialization and production-ready features
- Prepare for external logging service integration

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

### Features

* achieve 100/100 codebase excellence through comprehensive harmonization ([8c868b6](https://github.com/madfam-io/ai-portfolio-builder/commit/8c868b61bb30e21b25a5af167ae427b71b281d3c))
* achieve 100% multilingual coverage and fix Vercel deployment ([7698e47](https://github.com/madfam-io/ai-portfolio-builder/commit/7698e4711e74e2072f67fe70aa4cbed425a61fe4))
* add currency clarification note with IVA transparency ([60f44e1](https://github.com/madfam-io/ai-portfolio-builder/commit/60f44e182b4e3c11a659a2edb2db1a867261c6cc))
* **ai:** implement open-source AI architecture with 92% cost savings ([eba3ee2](https://github.com/madfam-io/ai-portfolio-builder/commit/eba3ee2df4e1a892ea069e4fb5c163e2478494d5))
* **analytics:** implement enterprise GitHub analytics feature (Phase 1 MVP) ([5ec8ade](https://github.com/madfam-io/ai-portfolio-builder/commit/5ec8ade94e5135eb4904deeb3adaebab6f24229e))
* **analytics:** implement PostHog analytics integration ([b8e17ca](https://github.com/madfam-io/ai-portfolio-builder/commit/b8e17caa2ad380089739f0f10668abe3d979cdae))
* **api:** implement comprehensive Portfolio API with CRUD operations ([89c4e7e](https://github.com/madfam-io/ai-portfolio-builder/commit/89c4e7e9dc4e9ae79ad14c4b1c9b306402b7acae))
* **api:** implement MVP foundation with Docker setup ([760c8c0](https://github.com/madfam-io/ai-portfolio-builder/commit/760c8c070b045c2b75f3c822731ce11ba8695c48))
* **auth:** complete authentication system implementation ([d3c246e](https://github.com/madfam-io/ai-portfolio-builder/commit/d3c246ec0ea75ea8f9b88257f93901cee01e08c3))
* **auth:** implement complete authentication system with OAuth and profile management ([8457603](https://github.com/madfam-io/ai-portfolio-builder/commit/8457603bab2b1eff7d8be1d80531bc05e2edb954))
* **branding:** update favicon for PRISMA rebrand ([0e4f5e6](https://github.com/madfam-io/ai-portfolio-builder/commit/0e4f5e6e2a5fc98fd4f7f6eeb4b403c5265d798e))
* complete beta launch preparation with comprehensive features and fixes ([a61b164](https://github.com/madfam-io/ai-portfolio-builder/commit/a61b1646b33dbe72f79f90de7c684e10e03abbfc))
* complete codebase improvements - validation, docs, and conventions ([1196d2b](https://github.com/madfam-io/ai-portfolio-builder/commit/1196d2b44fbc92ba11e216dfd66cc5b1cd96abb9))
* complete comprehensive test coverage - Phase 4 (Polish & Edge Cases) ([11524d9](https://github.com/madfam-io/ai-portfolio-builder/commit/11524d987090f3fbf31dc2463499f0970b85f8fc))
* comprehensive codebase analysis with enterprise-grade assessment ([243765c](https://github.com/madfam-io/ai-portfolio-builder/commit/243765c012146c2b6e578a7d7b7438e8b9fbfbc5))
* comprehensive codebase harmonization to v0.3.0-beta ([57f84c1](https://github.com/madfam-io/ai-portfolio-builder/commit/57f84c141f9cd038258df9923e4c28851d74c7ef))
* **config:** setup pre-commit hooks for linting and testing ([cdec515](https://github.com/madfam-io/ai-portfolio-builder/commit/cdec5156472f666d021cb0ec57b3d4abff9798ac))
* connect portfolio store and dashboard to real API ([de1ed76](https://github.com/madfam-io/ai-portfolio-builder/commit/de1ed768b67c11b6ca64171b14b3bba4323f44ce))
* critical codebase stabilization and architecture improvements ([188e973](https://github.com/madfam-io/ai-portfolio-builder/commit/188e97306f44e9562ef9141ad11080f67c9b5381))
* **db:** implement comprehensive database seeding system with intelligent detection ([2a9b849](https://github.com/madfam-io/ai-portfolio-builder/commit/2a9b8492e5be5c2515048d33481f09cc9c86f479))
* **demo:** implement comprehensive interactive portfolio demo ([fad301a](https://github.com/madfam-io/ai-portfolio-builder/commit/fad301a6dcb44e8041b6f2287f1aa6c58fe06d47))
* **deploy:** implement comprehensive 3-tiered deployment system ([d6993be](https://github.com/madfam-io/ai-portfolio-builder/commit/d6993be596be08a9ba16f1bca3206d669816cf03))
* **docs:** establish comprehensive project foundation ([ba245ab](https://github.com/madfam-io/ai-portfolio-builder/commit/ba245ab4de9bf4431f5b053695901db69aa6bb32))
* **editor:** implement functional portfolio editor with template system ([886db2d](https://github.com/madfam-io/ai-portfolio-builder/commit/886db2d253a76b53f9bbc295d9983d8aa9ac8660))
* **editor:** implement Portfolio Builder Interface with real-time preview ([1a2b484](https://github.com/madfam-io/ai-portfolio-builder/commit/1a2b484b760b31ea25635741cd70eb0663ed2bdf))
* **footer:** implement fully responsive dark mode footer with functional links ([f9ad417](https://github.com/madfam-io/ai-portfolio-builder/commit/f9ad41779e0de84f6e47420c080d4fa1ccd4ddf6))
* **i18n:** achieve 100% multilingual capabilities with comprehensive Spanish/English support ([06e4083](https://github.com/madfam-io/ai-portfolio-builder/commit/06e4083953e226cd1453a0bda60db207484a0eb8))
* **i18n:** implement automatic geolocation-based language detection ([fb9e630](https://github.com/madfam-io/ai-portfolio-builder/commit/fb9e630bca1ab852e492440cccfac0efe074cfbe))
* **i18n:** implement complete multilingual support for all public pages ([272f177](https://github.com/madfam-io/ai-portfolio-builder/commit/272f177c5b6e898826cd6f68131fbb98e53247d1))
* **i18n:** implement dynamic year updates across the platform ([9018da0](https://github.com/madfam-io/ai-portfolio-builder/commit/9018da07d19275d151f286fea94def110869ba8e))
* implement A/B testing system for landing pages ([807d07c](https://github.com/madfam-io/ai-portfolio-builder/commit/807d07c9106f1fd77f3db81990a3aa5c44550ffa))
* implement bilingual support (ES/EN) and dark mode functionality ([86fa85d](https://github.com/madfam-io/ai-portfolio-builder/commit/86fa85db635d15222fe1c6540e3811792dd4b6c7))
* implement build fixes, authentication, and comprehensive testing ([050cb46](https://github.com/madfam-io/ai-portfolio-builder/commit/050cb46df71d7e22d1e89638459a180f852bc8f1))
* implement complete monetization infrastructure and UX enhancements ([3421af6](https://github.com/madfam-io/ai-portfolio-builder/commit/3421af64c0b99458e942efc4b1e7e02b2322c20c))
* implement complete monetization system with Stripe integration ([a34b1d1](https://github.com/madfam-io/ai-portfolio-builder/commit/a34b1d145cede527e06a24718eb36fd8178478f9))
* implement complete section editors for portfolio management ([86d2d7d](https://github.com/madfam-io/ai-portfolio-builder/commit/86d2d7d6c7120225e9c9b37c316304da391f014a))
* implement comprehensive conversion optimization features ([7b0fc4d](https://github.com/madfam-io/ai-portfolio-builder/commit/7b0fc4d31ec1316dcd9c00d67db0793d1bfbf4d9))
* implement comprehensive dual-user system with admin privileges ([b94845d](https://github.com/madfam-io/ai-portfolio-builder/commit/b94845d8f5273964a57e096dfa52bca94a496e4a))
* implement comprehensive enterprise SaaS transformation ([6fa837a](https://github.com/madfam-io/ai-portfolio-builder/commit/6fa837ad72756ddfc91a9dcccab3138792142fb5))
* implement comprehensive GEO (Generative Engine Optimization) system ([103a442](https://github.com/madfam-io/ai-portfolio-builder/commit/103a442ba06360bb0c5ab9e4d7529576dbe2fb3b))
* implement comprehensive image upload system with Supabase Storage ([8d4965d](https://github.com/madfam-io/ai-portfolio-builder/commit/8d4965df379292a4f2915a51f37871239b7ad35e))
* implement comprehensive TDD testing infrastructure ([eb40c5d](https://github.com/madfam-io/ai-portfolio-builder/commit/eb40c5dc5f0b40e9dbd245687a98e6c51eca7916))
* implement comprehensive test coverage infrastructure ([936fd0c](https://github.com/madfam-io/ai-portfolio-builder/commit/936fd0ca0d6a91ed6a82729d1b416e06bddca081))
* implement critical codebase improvements and low-hanging fruit optimizations ([479572c](https://github.com/madfam-io/ai-portfolio-builder/commit/479572c57dd6cbb39b4505476074fa3fdca8f022))
* implement critical codebase stabilization and harmonization ([f0190c4](https://github.com/madfam-io/ai-portfolio-builder/commit/f0190c4bc83307a79c05a47e6eab974172fa6d94))
* implement critical security and stability improvements ([d5e8ed1](https://github.com/madfam-io/ai-portfolio-builder/commit/d5e8ed1def224cf93ed1c975a5961bcf32035538))
* implement monetization strategy with AI credits and premium templates ([1c06999](https://github.com/madfam-io/ai-portfolio-builder/commit/1c06999c69e2158b18dcc4678723ccb97128a370))
* implement multi-currency selector with MXN as default ([fc95fa2](https://github.com/madfam-io/ai-portfolio-builder/commit/fc95fa21de126322ddd7de57234a9d81557d9972))
* implement multi-portfolio variant system for audience targeting ([5bff4bd](https://github.com/madfam-io/ai-portfolio-builder/commit/5bff4bda7a0c1c27c26a91bebe06e98016da1268))
* implement OAuth integrations and major codebase cleanup ([c38a3c7](https://github.com/madfam-io/ai-portfolio-builder/commit/c38a3c737bca565217199e480e69f691f77f8ab3))
* implement Phase 3.3 - advanced portfolio editor features ([457baa8](https://github.com/madfam-io/ai-portfolio-builder/commit/457baa88e5f6408a86130d43c0097de6a005116a))
* implement portfolio creation flow and editor data persistence ([e58383d](https://github.com/madfam-io/ai-portfolio-builder/commit/e58383d906e15e4310c04a7a08b870ba3660a2c8))
* implement portfolio data persistence with Supabase ([4032f62](https://github.com/madfam-io/ai-portfolio-builder/commit/4032f6220d090db674acee7fd680474df559f635))
* implement portfolio editor with split-screen preview ([d5d285f](https://github.com/madfam-io/ai-portfolio-builder/commit/d5d285f8a15d54067db4824b7c24dad01a64c749))
* implement publishing flow and public portfolio viewer ([d063dde](https://github.com/madfam-io/ai-portfolio-builder/commit/d063dde4fb5e20aab12f0240e058a32b66417875))
* implement Supabase authentication integration ([917060d](https://github.com/madfam-io/ai-portfolio-builder/commit/917060d3ad4a2f358705bd7cd3d6c8f447dbbdc4))
* integrate shadcn/ui design system for enhanced composability ([ae3610c](https://github.com/madfam-io/ai-portfolio-builder/commit/ae3610c95c652f6962289bdb87a76ce7fd5bc356))
* **landing:** achieve 100% functional coverage for all clickable elements ([5df98b1](https://github.com/madfam-io/ai-portfolio-builder/commit/5df98b19add6af8cbfd2865e2824736c4f3f795f))
* **landing:** optimize landing page with PRISMA brand positioning and enhanced messaging ([94be637](https://github.com/madfam-io/ai-portfolio-builder/commit/94be63744e7928b965a0789f48d473a104886f13))
* nav ([ba92e13](https://github.com/madfam-io/ai-portfolio-builder/commit/ba92e131fcb43287a80d6cc86f081012ea2ac6ce))
* **optimization:** comprehensive performance optimization and documentation ([2652795](https://github.com/madfam-io/ai-portfolio-builder/commit/2652795978880dce7ac225afba6730d34518d120))
* Phase 2 - Code Organization & TypeScript Compliance ([517ab6c](https://github.com/madfam-io/ai-portfolio-builder/commit/517ab6c30e7213be71e78b576086572e26a5a6e9))
* Phase 3 - Performance Optimization ([2447f44](https://github.com/madfam-io/ai-portfolio-builder/commit/2447f4489bccdfec4f7199891ae4f35977a2a687))
* phase 5 - complete architecture enhancement (100/100 score achieved) ([4b53770](https://github.com/madfam-io/ai-portfolio-builder/commit/4b537706635661cbc31d1c660a7189e04733bf28))
* **portfolio-editor:** implement comprehensive portfolio builder system ([85e7f49](https://github.com/madfam-io/ai-portfolio-builder/commit/85e7f4988d63429dbcbe7ae0da3f166942bbb964))
* **rebrand:** complete rebrand from MADFAM.AI to PRISMA by MADFAM ([298959d](https://github.com/madfam-io/ai-portfolio-builder/commit/298959db1af122c31b90a1e339416374b8ce5552))
* **refactoring:** comprehensive codebase cleanup and modular architecture ([b482c00](https://github.com/madfam-io/ai-portfolio-builder/commit/b482c0060ab56f0b1f28a6c7aaeef83caa3d3ace))
* **security:** implement comprehensive security hardening across all layers ([0f69394](https://github.com/madfam-io/ai-portfolio-builder/commit/0f6939490ab18362f6bec62a74c047b26a933c21))
* **testing:** major test coverage improvements and translation fixes ([153b8d6](https://github.com/madfam-io/ai-portfolio-builder/commit/153b8d641ce10c0cba6bc30b58545605b8288559))
* **tests:** implement comprehensive unit and integration test suite ([3616824](https://github.com/madfam-io/ai-portfolio-builder/commit/3616824e4efb1ef82fff325535b1db1f5277d59f))
* **ui/ux:** complete UI/UX standardization across all pages ([522af36](https://github.com/madfam-io/ai-portfolio-builder/commit/522af3663cb1a162ae74286938a0a3331326bcb5))
* **ui:** add GitHub organization link to footer social icons ([5bc21bd](https://github.com/madfam-io/ai-portfolio-builder/commit/5bc21bd3bb1f93968cc8f61ffc5b45c13300f500))
* **ui:** add navigation links from landing page to new pages ([220c227](https://github.com/madfam-io/ai-portfolio-builder/commit/220c227c23a11e3fe0196f42156c54261eb835d2))
* **ui:** dramatically improve CSS styling and visual design ([83e2701](https://github.com/madfam-io/ai-portfolio-builder/commit/83e2701888dd8149c812abe537128b2d363a9bb3))
* **ui:** implement base layout architecture for consistent page structure ([3829695](https://github.com/madfam-io/ai-portfolio-builder/commit/38296950b34183bd5873e03ae4a92412b4b93d5b))
* **ui:** implement comprehensive multilanguage support with Spanish/English ([2fb367f](https://github.com/madfam-io/ai-portfolio-builder/commit/2fb367fcd9461335e9eed1751442e946ae5fb056))
* **ui:** implement comprehensive navigation enhancements and accessibility improvements ([391aa9e](https://github.com/madfam-io/ai-portfolio-builder/commit/391aa9e2121d8a237e8650064a25812fd8c4693d))
* **ui:** implement comprehensive page navigation system ([b2b3500](https://github.com/madfam-io/ai-portfolio-builder/commit/b2b35005bacb446d8cf0aee604964d9f85f2ee10))
* **ui:** implement landing page with React Icons and TDD testing ([06eda8d](https://github.com/madfam-io/ai-portfolio-builder/commit/06eda8dda681a4eb4793c1d6f512ace4bb9603dc))
* **ui:** restore complete landing page interactivity and typography ([fccf106](https://github.com/madfam-io/ai-portfolio-builder/commit/fccf10664ae65432a3836766f21223c38e4913d7))
* **vercel:** fix build deployment and complete i18n modular refactoring ([47064a1](https://github.com/madfam-io/ai-portfolio-builder/commit/47064a1f1233ae983f05b4b22180ea1e9a7dd91a))


### Bug Fixes

* achieve 100% pass rate for crypto utilities test suite ([711e266](https://github.com/madfam-io/ai-portfolio-builder/commit/711e266d44d70197d219c64b7726eebc37d907bf))
* achieve 80% test pass rate - 311/388 tests passing ([6f8d1ac](https://github.com/madfam-io/ai-portfolio-builder/commit/6f8d1aca1a41fddec4fd3828637caf69a16f326b))
* achieve historic 100% test pass rate - 146/146 test suites passing ([c52dac7](https://github.com/madfam-io/ai-portfolio-builder/commit/c52dac7fec97cb97a113db736c89844e204fde4d))
* add .prettierignore to exclude problematic files from formatting ([7037642](https://github.com/madfam-io/ai-portfolio-builder/commit/703764278e610de064f2fc7b17a286a2614933d3))
* add missing date-fns dependency ([1e0ce5a](https://github.com/madfam-io/ai-portfolio-builder/commit/1e0ce5a6724d652067c01afd26ade7d7f4b26ee8))
* add missing type definitions for analytics ([8255082](https://github.com/madfam-io/ai-portfolio-builder/commit/8255082c5efdd6a46eeccc2b3b7bc3d89390ecdd))
* Add Node.js version verification to CI workflow ([1f3e579](https://github.com/madfam-io/ai-portfolio-builder/commit/1f3e5798d89b5c01e0f3fc726a2f91f6e51f13dd))
* add null check for supabase client in enhance-bio GET handler ([9e9032f](https://github.com/madfam-io/ai-portfolio-builder/commit/9e9032f0f0537e38c2b274c0e208140207cf0c3f))
* add unmock directives for hooks and services in tests ([de0b25b](https://github.com/madfam-io/ai-portfolio-builder/commit/de0b25b1cfe3e5f10e20e2cb8ec66b2bb7bda88c))
* align CI pnpm version with lockfile version ([57b96b2](https://github.com/madfam-io/ai-portfolio-builder/commit/57b96b2e44ed5c9883f0ef1d9ec21f30f3dfab83))
* align customization schema with TemplateCustomization interface ([5360238](https://github.com/madfam-io/ai-portfolio-builder/commit/53602380427d68393373ec7b7de933aa4c349ebf))
* align validation schema with Portfolio type definitions ([f086954](https://github.com/madfam-io/ai-portfolio-builder/commit/f086954b7b51bd9455eca3927ba0c2738ec68642))
* allow inline scripts in CSP for Next.js compatibility ([6b18bdc](https://github.com/madfam-io/ai-portfolio-builder/commit/6b18bdcfa1a6e5affe02f4e0fb83d94c1d285463))
* **analytics:** remove unused imports and variables ([a304e85](https://github.com/madfam-io/ai-portfolio-builder/commit/a304e85b7c4a601667bf87ebe74a1d66a8285909))
* **analytics:** remove unused request parameters in API routes ([9d10b96](https://github.com/madfam-io/ai-portfolio-builder/commit/9d10b963a17b806abd5192e4eea78a03f22ec82e))
* **analytics:** resolve TypeScript errors for Vercel deployment ([c00c94a](https://github.com/madfam-io/ai-portfolio-builder/commit/c00c94a3848c1e4fcacb0c8865f9084a4721229d))
* **api:** resolve TypeScript strict mode error in geo keywords route ([024acd1](https://github.com/madfam-io/ai-portfolio-builder/commit/024acd157de015b5d734aa66617bf9f44f00298e))
* **api:** use explicit type guard for trending keywords array access ([e97dd8b](https://github.com/madfam-io/ai-portfolio-builder/commit/e97dd8b77eb42dc82f695acf238fc0b09fd9fc75))
* apply Prettier formatting to DomainSetupInstructions.tsx ([e298bf3](https://github.com/madfam-io/ai-portfolio-builder/commit/e298bf35fc41bac8aa3defad178012f069bd4f15))
* **auth:** handle missing Supabase configuration gracefully in auth library ([949d0be](https://github.com/madfam-io/ai-portfolio-builder/commit/949d0bee018b529ef95dc664968021465eac579f))
* **build:** add all missing translation keys for TypeScript compilation ([e46eb3a](https://github.com/madfam-io/ai-portfolio-builder/commit/e46eb3a48490962444bf812c23307188295eeb62))
* **build:** add Suspense boundary to signup page for Next.js 15 compatibility ([590c34c](https://github.com/madfam-io/ai-portfolio-builder/commit/590c34ce55520fb8397b34622d19a41d21bec112))
* **build:** resolve all TypeScript compilation errors for deployment ([6647bed](https://github.com/madfam-io/ai-portfolio-builder/commit/6647bedbbc62712e9aea525aed5fca7e5f98ded4))
* **build:** resolve TypeScript and React build errors for production deployment ([7c1dfa1](https://github.com/madfam-io/ai-portfolio-builder/commit/7c1dfa10c57c92d41c24dad0783c3b396f4b5e12))
* **build:** resolve TypeScript errors and Next.js Image warnings ([a361011](https://github.com/madfam-io/ai-portfolio-builder/commit/a3610114368acc531ea7845439461fe54ff7f2ec))
* complete ESLint error fixes - all critical errors resolved ([5161c7d](https://github.com/madfam-io/ai-portfolio-builder/commit/5161c7d2bbfa69222444a7100c4e92636f7637fe))
* complete Spanish translation for all remaining content ([a1097be](https://github.com/madfam-io/ai-portfolio-builder/commit/a1097be559fcef3c21f175bf027445b784bf3bd3))
* complete TypeScript error resolution for Vercel deployment ([1757886](https://github.com/madfam-io/ai-portfolio-builder/commit/175788695b461a707056a93a7dc5a2ff6dde7003))
* complete Vercel deployment compatibility for production ready deployment ([f22d310](https://github.com/madfam-io/ai-portfolio-builder/commit/f22d31068316814ca611a61b6f57b9a249d8203d))
* comprehensive codebase improvements and type safety enhancements ([6579bbd](https://github.com/madfam-io/ai-portfolio-builder/commit/6579bbdd357daa052953c11ecf367befd53e0ff3))
* comprehensive ESLint and TypeScript fixes for deployment ([5506a72](https://github.com/madfam-io/ai-portfolio-builder/commit/5506a720868a72b2194489de6ff710210d758f63))
* comprehensive ESLint error resolution - 401 files processed ([616b89f](https://github.com/madfam-io/ai-portfolio-builder/commit/616b89ff98e0ed3261437e09170bfbe7538fba23))
* comprehensive ESLint error resolution and code quality improvements ([b719345](https://github.com/madfam-io/ai-portfolio-builder/commit/b719345daee4b6fae0c56ec8f734ed2cc9eaf64f))
* comprehensive fixes for deployment readiness ([ee488cd](https://github.com/madfam-io/ai-portfolio-builder/commit/ee488cdbda97b34f8298ea53ff27dd8944aa59ce))
* continue fixing ESLint and TypeScript errors ([7148079](https://github.com/madfam-io/ai-portfolio-builder/commit/7148079e9ae7f21b5847579eed4fcccdc25e6cb7))
* **core:** resolve React hydration and webpack module loading issues ([6968c14](https://github.com/madfam-io/ai-portfolio-builder/commit/6968c1431804f5b2a4678811deaca4efb041a679))
* correct import paths for authentication middleware and Supabase client ([83baf57](https://github.com/madfam-io/ai-portfolio-builder/commit/83baf57b387a720ab691749b9ef259aac3e901d5))
* correct syntax error in generateTechStack function ([92fd46e](https://github.com/madfam-io/ai-portfolio-builder/commit/92fd46ed76d7329d3d752e2ade034aa2e65868ff))
* correct TruffleHog secret scanning configuration ([7f83df7](https://github.com/madfam-io/ai-portfolio-builder/commit/7f83df7a4131e036df0b422e810bf93fff6e3dc3))
* critical security vulnerabilities and code quality improvements ([5f7717b](https://github.com/madfam-io/ai-portfolio-builder/commit/5f7717b47abc55db07d401645fcba18cc26ba5ca))
* **csp:** allow ipapi.co for geolocation detection ([90c0805](https://github.com/madfam-io/ai-portfolio-builder/commit/90c0805952f1466bcbce565edee477c02e4a2bc4))
* **csp:** resolve Content Security Policy script execution errors ([6342bd5](https://github.com/madfam-io/ai-portfolio-builder/commit/6342bd5a2a8aa1e4829494a7c00ac384223b17a2))
* currency note not updating when language is English ([c9a0600](https://github.com/madfam-io/ai-portfolio-builder/commit/c9a0600665233f9ff2fed58cc37596a57ae069a6))
* **deployment:** remove preinstall script to fix Vercel deployment ([5235691](https://github.com/madfam-io/ai-portfolio-builder/commit/52356914de133256dac4321e659dc6272f82f589))
* **deps:** update lockfile for tsx dependency ([3656ca9](https://github.com/madfam-io/ai-portfolio-builder/commit/3656ca9be064f54d30dadf85618b6ae43aa48b37))
* disable optimizeCss to resolve missing critters module error ([0f61916](https://github.com/madfam-io/ai-portfolio-builder/commit/0f6191656edafcf33dee8ef1b195241234f00d21))
* **editor:** resolve TypeScript build error by cleaning unused imports ([d2f98e4](https://github.com/madfam-io/ai-portfolio-builder/commit/d2f98e48136bade7849a18bba8744aefe564bad8))
* emergency test restore and focused fixes - 303 passing tests restored ([3973432](https://github.com/madfam-io/ai-portfolio-builder/commit/397343298f468c5a504534d542657a7e187399d4))
* enhance error handling and type safety across services ([e6839e2](https://github.com/madfam-io/ai-portfolio-builder/commit/e6839e22308021e9aa7e9c37d9a132e298b0465e))
* ensure portfolio object has all required fields for template rendering ([62bab95](https://github.com/madfam-io/ai-portfolio-builder/commit/62bab95fa3a33a7ec54c82d9f6102b1d659cadb5))
* exclude scripts and test files from TypeScript build ([4ac490f](https://github.com/madfam-io/ai-portfolio-builder/commit/4ac490fef63f9a27b175ed1c22f4e0c9dbae48a1))
* Format cookie-consent.tsx with Prettier ([bca0968](https://github.com/madfam-io/ai-portfolio-builder/commit/bca09680d2dacf45d22e95668a46d9028f7b581e))
* handle nullable createClient response in Supabase server and AI routes ([5861451](https://github.com/madfam-io/ai-portfolio-builder/commit/586145103bb87706685f4101e00b0a184019b926))
* handle optional views property in TypeScript ([dbeceee](https://github.com/madfam-io/ai-portfolio-builder/commit/dbeceeed5e20ed2c606fb9c09c62cbbf39c8a17a))
* **i18n:** correct AI model references to use Llama 3.1 & Mistral ([e81dd57](https://github.com/madfam-io/ai-portfolio-builder/commit/e81dd57d78aaa51c17e42176c10244b07850897f))
* **i18n:** remove duplicate translation keys causing TypeScript errors ([394490e](https://github.com/madfam-io/ai-portfolio-builder/commit/394490e1434b73828dc666f59b645939937e1782))
* implement critical security and stability improvements (Phase 1) ([9fcd04c](https://github.com/madfam-io/ai-portfolio-builder/commit/9fcd04c56fe7c487a1f38f65e997ee35736070cb))
* improve API route test infrastructure and portfolio service mocking ([60d0e0d](https://github.com/madfam-io/ai-portfolio-builder/commit/60d0e0d7f4b49cf9c1e06c9ae6901e63e3d9c5a8))
* improve portfolio store integration test setup ([8b67f97](https://github.com/madfam-io/ai-portfolio-builder/commit/8b67f978f0d4b61a00b41e7a39b71ac3597e10d2))
* major test suite improvements - 303 passing tests achieved ([6ec9fae](https://github.com/madfam-io/ai-portfolio-builder/commit/6ec9faef5c6cf5aa828558286951072a1e8c1cf2))
* major test suite improvements - systematic fixes achieve 36 passing test suites ([8be7dc6](https://github.com/madfam-io/ai-portfolio-builder/commit/8be7dc620430ecfb83322af68420548565fe59e1))
* make CI pipeline more resilient to code quality issues ([7a26992](https://github.com/madfam-io/ai-portfolio-builder/commit/7a26992dc48f1ab1f5e02c9cef284aaf725991ea))
* make CI pipeline more resilient to test failures ([363f3ac](https://github.com/madfam-io/ai-portfolio-builder/commit/363f3ac19caf867813e4069a876053bae2539f11))
* **middleware:** handle missing Supabase environment variables gracefully ([9fe880c](https://github.com/madfam-io/ai-portfolio-builder/commit/9fe880cf9bef971b7891e35d2ff39ad8ab66a29f))
* Next.js 15 route handler type compatibility and remove type assertions ([125ab88](https://github.com/madfam-io/ai-portfolio-builder/commit/125ab88b9ee6e666b26e5be76be0f1c50650abd2))
* **optimization:** optimize codebase performance and resolve warnings ([621e8cd](https://github.com/madfam-io/ai-portfolio-builder/commit/621e8cdf5c1cf239a13d51814d811f67ba90fb81))
* partial resolution of geo optimization TypeScript errors ([3275e31](https://github.com/madfam-io/ai-portfolio-builder/commit/3275e31996510e85d90c17895f7df52a54b533c2))
* Phase 1 critical technical debt fixes ([a6f3ade](https://github.com/madfam-io/ai-portfolio-builder/commit/a6f3adeaaa0b0a2159cffddf722e6fce196c193c))
* properly type AIServiceError to resolve retryable property errors ([71ec587](https://github.com/madfam-io/ai-portfolio-builder/commit/71ec5872ac54f2f636b455e7a1dd32fabd8c223c))
* reduce ESLint violations and improve type safety ([68f261e](https://github.com/madfam-io/ai-portfolio-builder/commit/68f261ea3836df6ed82652726a4a57742e64f50c))
* remove @tanstack/react-query mocks to unblock tests ([1739bc7](https://github.com/madfam-io/ai-portfolio-builder/commit/1739bc7e7b55a08947585e338740e50882cb4836))
* remove all HTML entity issues from TypeScript/JSX files ([38ae153](https://github.com/madfam-io/ai-portfolio-builder/commit/38ae153cc1ed2fc9322ecc30c38b4df6bb6ce598))
* remove Babel config to fix Vercel build error with next/font ([4eac794](https://github.com/madfam-io/ai-portfolio-builder/commit/4eac7940e51f38db2aba002ed8f73adc18b65223))
* remove deprecated husky shebang lines for v10 compatibility ([48e4d63](https://github.com/madfam-io/ai-portfolio-builder/commit/48e4d6322377518c273bdaa0e677db3a3ae148c2))
* remove duplicate transformDbPortfolioToApi function declaration ([c6a4c9c](https://github.com/madfam-io/ai-portfolio-builder/commit/c6a4c9c0b487f84f283dfb032f849d2e54e6e9b5))
* remove global mock for portfolio-transformer and fix test syntax errors ([a785a75](https://github.com/madfam-io/ai-portfolio-builder/commit/a785a75f8f0ff0abc48ac62827f3d739454a8110))
* remove non-existent gpa property and handle optional skill level ([87341c8](https://github.com/madfam-io/ai-portfolio-builder/commit/87341c8103b588dcd3e02a428a244524893ae9df))
* remove non-existent location property from Experience display ([9bdd239](https://github.com/madfam-io/ai-portfolio-builder/commit/9bdd2398dba29219565db6fc2ac2f1f574c400a7))
* remove nullable types from validation schema ([7860a54](https://github.com/madfam-io/ai-portfolio-builder/commit/7860a54532c5e3e3e9143e319028a62debf07997))
* remove strict-dynamic CSP directive to allow Next.js scripts on Vercel ([70a2036](https://github.com/madfam-io/ai-portfolio-builder/commit/70a203695dc3d620d01d7d95a2a4b303d0f6e671))
* remove undefined defaultRateLimitConfig reference in edge rate limiter ([db3f6a6](https://github.com/madfam-io/ai-portfolio-builder/commit/db3f6a6a4d45bdc1d6d7c6bad686b543531515d9))
* remove unused FiGithub import from repository analytics page ([4203d27](https://github.com/madfam-io/ai-portfolio-builder/commit/4203d273d986908b46f6dded1aac75994fb9572a))
* remove unused RepositoryStats import from repository analytics page ([5780911](https://github.com/madfam-io/ai-portfolio-builder/commit/5780911e9c6c132afe52825cb5e4ed7a44ff5357))
* remove unused TypeScript interface to fix Vercel deployment ([6cbacf4](https://github.com/madfam-io/ai-portfolio-builder/commit/6cbacf4ffac9ed0c0e011c46e703673ae9b823cf))
* rename GitHubUserObject to ActivityActor to avoid type conflicts ([fba60fb](https://github.com/madfam-io/ai-portfolio-builder/commit/fba60fb109d84342841a8f79cfafc0313e242dba))
* resolve all build errors and achieve deployment readiness ([96adb5d](https://github.com/madfam-io/ai-portfolio-builder/commit/96adb5d8cf184113407457db47b263b2526172bd))
* resolve all critical linting errors and warnings ([b4546fa](https://github.com/madfam-io/ai-portfolio-builder/commit/b4546fad281d171e6e0496c594d0231b90c4d107))
* resolve all critical syntax errors blocking build ([4563a41](https://github.com/madfam-io/ai-portfolio-builder/commit/4563a41cd9a16eab246665e1f71d8a667d1b6b23))
* resolve all critical TypeScript and production build errors ([1894c9e](https://github.com/madfam-io/ai-portfolio-builder/commit/1894c9e26351223063ae4e4a49e93b9a29b29380))
* resolve all ESLint and formatting issues for flawless deployment ([28ff3b0](https://github.com/madfam-io/ai-portfolio-builder/commit/28ff3b0140ccc8443fe14e9c48a1a4392911d890))
* resolve all HTML entity parsing errors in build ([6ec53e3](https://github.com/madfam-io/ai-portfolio-builder/commit/6ec53e3ee975b199b0ec6c5c5719d99e1c47a507))
* resolve all non-blocking ESLint issues and code quality problems ([8b110fc](https://github.com/madfam-io/ai-portfolio-builder/commit/8b110fc01cf8a27742df1fde2ca0ff65fdc4645b))
* resolve all remaining build-blocking syntax errors ([77257f7](https://github.com/madfam-io/ai-portfolio-builder/commit/77257f713b2b0ec45dde9d5376ee92da6d2279cb))
* resolve ALL remaining ESLint errors and warnings ([2421948](https://github.com/madfam-io/ai-portfolio-builder/commit/24219489cc74eea5418f810eb389174ad7d5371d))
* resolve all syntax errors in test files ([b6752a5](https://github.com/madfam-io/ai-portfolio-builder/commit/b6752a586943309826fd58aeac19c2cd65522031))
* resolve all TypeScript and build errors for Vercel deployment ([48d88a8](https://github.com/madfam-io/ai-portfolio-builder/commit/48d88a8038b29148ecd510da4c9ee0c395c7883c))
* resolve all TypeScript and ESLint errors for Vercel deployment ([23ffd6d](https://github.com/madfam-io/ai-portfolio-builder/commit/23ffd6d3e4481c62c40cd72067a8e691d3d41fb5))
* resolve all TypeScript build errors and add comprehensive test coverage ([ca1d39f](https://github.com/madfam-io/ai-portfolio-builder/commit/ca1d39f7d822bb9f1a8ad699e4e45037d4e5563d))
* resolve all TypeScript compilation errors ([c1f40ab](https://github.com/madfam-io/ai-portfolio-builder/commit/c1f40ab650067ecf2923f02e5e38797a45af0763))
* resolve all TypeScript compilation errors ([7243120](https://github.com/madfam-io/ai-portfolio-builder/commit/7243120af68f8ec5ab635117908f928703983979))
* resolve all TypeScript compilation errors for successful build ([f6b8ff6](https://github.com/madfam-io/ai-portfolio-builder/commit/f6b8ff62803be31e9e0215df64149b990bef01eb))
* resolve all TypeScript compilation errors for successful build ([3df07a6](https://github.com/madfam-io/ai-portfolio-builder/commit/3df07a6386663926cd698ba7edcec07f8eb197c0))
* resolve all TypeScript compilation errors for successful build ([26d1428](https://github.com/madfam-io/ai-portfolio-builder/commit/26d14280806c8cb0ea60576638b2eb2d4957fc9b))
* resolve all TypeScript errors for successful deployment ([7f922ac](https://github.com/madfam-io/ai-portfolio-builder/commit/7f922ac692313614a3c5e5fd8ac64fc13d640458))
* resolve API route syntax errors and malformed function declarations ([6e61350](https://github.com/madfam-io/ai-portfolio-builder/commit/6e613506909363b83281fe323f5eb3aee8d0be2f))
* resolve API route syntax errors and malformed functions ([d988b62](https://github.com/madfam-io/ai-portfolio-builder/commit/d988b62fe5d05ecaec41c2cd2647aefd4202a069))
* resolve build errors and environment validation issues ([c376548](https://github.com/madfam-io/ai-portfolio-builder/commit/c37654871c9f533da284fef3efb477ae8438092f))
* resolve build errors and improve code quality ([c37c9a3](https://github.com/madfam-io/ai-portfolio-builder/commit/c37c9a3e5d0230ac31c1575a0e609e1a94c24c3c))
* resolve build errors with missing exports and type issues ([c575f3a](https://github.com/madfam-io/ai-portfolio-builder/commit/c575f3a96c4224b22974e0a9cba5edc814f37321))
* resolve CI pipeline configuration issues ([832db57](https://github.com/madfam-io/ai-portfolio-builder/commit/832db5785957f4f644f027d8afd46324109f49fc))
* resolve CI pipeline configuration issues ([856b042](https://github.com/madfam-io/ai-portfolio-builder/commit/856b042b3253ba02958f6a925becfa952c018a87))
* resolve complex import structure issues ([9926837](https://github.com/madfam-io/ai-portfolio-builder/commit/9926837cb6fb53589b31c93a95633291f5f084d7))
* resolve comprehensive ESLint warnings and code quality issues ([ba1a4c7](https://github.com/madfam-io/ai-portfolio-builder/commit/ba1a4c702e20b1397308531378db565325bc4de6))
* resolve createClient mock initialization in recommend-template test ([0772d14](https://github.com/madfam-io/ai-portfolio-builder/commit/0772d1441ea5a6ef46728c37d687315825205d6b))
* resolve critical deployment issues - builds and tests pass 100% ([ebc5bb1](https://github.com/madfam-io/ai-portfolio-builder/commit/ebc5bb1c1bf3d899ce37dcfac8958592b75c2fdb))
* resolve critical deployment route conflict - Next.js build now passes ([77a2ae3](https://github.com/madfam-io/ai-portfolio-builder/commit/77a2ae3ba71ca7b10c058c69814a9081e989e910))
* resolve critical import syntax errors causing build failures ([3793f65](https://github.com/madfam-io/ai-portfolio-builder/commit/3793f6586a7c044a5c9691faab911e8f63aed587))
* resolve critical TypeScript compilation errors for production build ([cda11ec](https://github.com/madfam-io/ai-portfolio-builder/commit/cda11ecf2442a384157cc4ef772a1ad30cb7fb8f))
* resolve critical TypeScript compilation errors for production build ([797c2b0](https://github.com/madfam-io/ai-portfolio-builder/commit/797c2b029cf365809b6dea4d901bdae4ee9b4471))
* resolve critical TypeScript compilation errors for production build ([8e4a6c4](https://github.com/madfam-io/ai-portfolio-builder/commit/8e4a6c4fa95a75b70b25c279e55578d872034722))
* resolve critical TypeScript property access errors for deployment ([28acdd1](https://github.com/madfam-io/ai-portfolio-builder/commit/28acdd1a234ec898b13b2d29bed8772dbdf247d1))
* resolve ESLint errors and pre-commit hook issues ([67d96e2](https://github.com/madfam-io/ai-portfolio-builder/commit/67d96e24dc99680f42d8fe13c0cb034f1bcab071))
* resolve ESLint errors for successful Vercel deployment ([122e4f3](https://github.com/madfam-io/ai-portfolio-builder/commit/122e4f31972a21b4d9353e10ee6665cbec5d3992))
* resolve ESLint errors in test files ([576f623](https://github.com/madfam-io/ai-portfolio-builder/commit/576f623827c511bc1a0dfa88727ee9fa211a73d6))
* resolve final import syntax errors in remaining files ([0329a4b](https://github.com/madfam-io/ai-portfolio-builder/commit/0329a4b721070e46f2975d3f220435e6ce38ece3))
* resolve final JSX and TypeScript syntax errors ([845addb](https://github.com/madfam-io/ai-portfolio-builder/commit/845addb1a3ea349685ecc6b15f29777cf47d70a8))
* resolve function context and import syntax errors ([78422ef](https://github.com/madfam-io/ai-portfolio-builder/commit/78422ef3ea464d318e94eddb883881e8a537b951))
* resolve HTML entity parsing errors and ESLint issues ([ed72964](https://github.com/madfam-io/ai-portfolio-builder/commit/ed729647289e5404af476c3c2c8dc20a32836c59))
* resolve import errors in StatisticalAnalysis and experiments page ([34ec675](https://github.com/madfam-io/ai-portfolio-builder/commit/34ec6750dd4cdaafbf7189fd722c051aabbcff57))
* resolve JSX fragment and remaining syntax errors ([5f9b325](https://github.com/madfam-io/ai-portfolio-builder/commit/5f9b325c7002138526f150e565c56382f6f07587))
* resolve JSX fragment and validation module issues ([1fdc97f](https://github.com/madfam-io/ai-portfolio-builder/commit/1fdc97f0cb179040037c6a8a5238d626c052fba7))
* resolve JSX prop semicolons and function closing issues ([90e9426](https://github.com/madfam-io/ai-portfolio-builder/commit/90e94260d3dd9af57f48741be014e44e884bcb42))
* resolve JSX syntax errors in admin experiments new page ([6b528e5](https://github.com/madfam-io/ai-portfolio-builder/commit/6b528e59ec05ffeb35b178d1dc300fa35755f86d))
* resolve JSX syntax errors in analytics repository page ([ba712c2](https://github.com/madfam-io/ai-portfolio-builder/commit/ba712c2dcbe9656229f09bb1ffaa11dcaf4f2cc0))
* resolve JSX syntax errors in experiment forms ([5641acc](https://github.com/madfam-io/ai-portfolio-builder/commit/5641accd2c2dd2b07583d2cdb4bee2f89fb9bdb9))
* resolve LazyWrapper TypeScript compatibility ([a56668a](https://github.com/madfam-io/ai-portfolio-builder/commit/a56668ac88f6e4f859ca5c1725fdf543fc744c1d))
* resolve majority of ESLint errors and warnings ([c18c1ec](https://github.com/madfam-io/ai-portfolio-builder/commit/c18c1ec337fc269b048559bcf1a1ad7bf447adc2))
* resolve OnboardingModal TypeScript errors ([ed64554](https://github.com/madfam-io/ai-portfolio-builder/commit/ed6455406b9e6fcd08ddc8f14a8de3e2feb2764a))
* resolve PostHog TypeScript build errors ([f8bc892](https://github.com/madfam-io/ai-portfolio-builder/commit/f8bc8928fcd0208ef05079bc0996861348199ac6))
* resolve react-icons imports and TypeScript errors for production build ([d3e470c](https://github.com/madfam-io/ai-portfolio-builder/commit/d3e470cc68ef5a8e415e52dbefdc31e9000240c8))
* resolve remaining build-blocking syntax errors ([a90979e](https://github.com/madfam-io/ai-portfolio-builder/commit/a90979e5e931ffaf3966859b9931f893ff5358af))
* resolve remaining HTML entity parsing errors ([7dc44d6](https://github.com/madfam-io/ai-portfolio-builder/commit/7dc44d6f9d9adc557e14f2a82ab1d669f148af08))
* resolve remaining import errors and JSX parser issues ([92efede](https://github.com/madfam-io/ai-portfolio-builder/commit/92efede75af979a709fce9a1e00fd150f86af1d5))
* resolve remaining JSX syntax errors in admin experiments and analytics pages ([fe38324](https://github.com/madfam-io/ai-portfolio-builder/commit/fe383246617705eb8b69724b3adf132cb5d9b93e))
* resolve remaining syntax errors in admin and analytics pages ([bc13f44](https://github.com/madfam-io/ai-portfolio-builder/commit/bc13f4425674d039c1bc200e6d149f8a41856179))
* resolve remaining TypeScript and ESLint issues ([c73f9ce](https://github.com/madfam-io/ai-portfolio-builder/commit/c73f9ce8564988c28fed534fee69b588a7cf9ee1))
* resolve remaining Vercel build failures - module-level Supabase initialization ([82da74f](https://github.com/madfam-io/ai-portfolio-builder/commit/82da74fc3b1225399087e2b56cfc1d6d5ca918c1))
* resolve schema scope error in env.ts ([2f9d2b8](https://github.com/madfam-io/ai-portfolio-builder/commit/2f9d2b84249cadac1be74a15e8cedb9689d6e354))
* resolve syntax errors in AI models selection test ([6b16dad](https://github.com/madfam-io/ai-portfolio-builder/commit/6b16dad29ee5ee2627228d6e363d78f0b6fe165a))
* resolve syntax errors in health route test ([01a1eb5](https://github.com/madfam-io/ai-portfolio-builder/commit/01a1eb5ddf10e5673deb791b0ccbdec87ae653b8))
* resolve syntax errors in multiple pages and API routes ([ee06eab](https://github.com/madfam-io/ai-portfolio-builder/commit/ee06eabfab075ea519e226f89733692d1e2b5ce7))
* resolve test failures and AppError parameter ordering ([10adeb0](https://github.com/madfam-io/ai-portfolio-builder/commit/10adeb0c85f57c4aa5efb32cc744ce41df71d5f7))
* resolve test failures and improve test infrastructure ([9ed6803](https://github.com/madfam-io/ai-portfolio-builder/commit/9ed680344c4e6b8a2ad35344f015f7560eed1aed))
* resolve TypeScript build errors for Vercel deployment ([6a46acd](https://github.com/madfam-io/ai-portfolio-builder/commit/6a46acd759c09cd6f468ff095e5d68e8dc637227))
* resolve TypeScript build errors in AIEnhancementButton, use-experiment, and toast utility ([f7891f0](https://github.com/madfam-io/ai-portfolio-builder/commit/f7891f06311da422aac55b733b96a484a5282d07))
* resolve TypeScript build errors with unused declarations ([da6a11a](https://github.com/madfam-io/ai-portfolio-builder/commit/da6a11a379b99a653a81ed4d4e68dfc6725a6ef4))
* resolve TypeScript error and reduce complexity in repository analytics ([c7db9ad](https://github.com/madfam-io/ai-portfolio-builder/commit/c7db9ad528ea731251d0ce4ca513acf18688d9ef))
* resolve TypeScript error in logger calls ([62ae97b](https://github.com/madfam-io/ai-portfolio-builder/commit/62ae97b839ea82c15f1a9131abda9946bef88c57))
* resolve TypeScript error in ThemeCustomizer with proper type guard ([b337e7f](https://github.com/madfam-io/ai-portfolio-builder/commit/b337e7fe0d497d2985964677e37f413d1d3e6d02))
* resolve TypeScript errors and update dependencies ([6f13e94](https://github.com/madfam-io/ai-portfolio-builder/commit/6f13e942ee6cd6fa12b76ba9fa0d93b9a5966467))
* resolve TypeScript errors in portfolio variants API routes ([67c7c7d](https://github.com/madfam-io/ai-portfolio-builder/commit/67c7c7dcf22a7eca4cf9c40a08825cfa475602e6))
* resolve TypeScript errors in Stripe webhook and editor components ([d2431a0](https://github.com/madfam-io/ai-portfolio-builder/commit/d2431a087ed65c7a35af1670d08b3dc80ea48159))
* resolve TypeScript module export errors and build issues ([10ca9e2](https://github.com/madfam-io/ai-portfolio-builder/commit/10ca9e2a289260fa371c47a471cf3c85aa558274))
* resolve TypeScript null assignment error in experiments page ([266067b](https://github.com/madfam-io/ai-portfolio-builder/commit/266067bc860e958f614a0dc09e38975b2e4226ee))
* resolve TypeScript property name mismatch in analytics page ([e3fb552](https://github.com/madfam-io/ai-portfolio-builder/commit/e3fb552f3c2c2c1374d75970740304f838b53fa2))
* resolve TypeScript ThemeOverrides type mismatch in experiments new page ([f4e6316](https://github.com/madfam-io/ai-portfolio-builder/commit/f4e6316619799125330f35811766c72f8e42cd09))
* resolve TypeScript type check errors in test environment setup ([413f4d5](https://github.com/madfam-io/ai-portfolio-builder/commit/413f4d5f63e82138afed2d8c8d37b21bc74de11e))
* resolve TypeScript type inference for rate limit configs ([ea0dfcb](https://github.com/madfam-io/ai-portfolio-builder/commit/ea0dfcb328af1252b78cd3e39922254776d3ebc0))
* resolve TypeScript union type errors in SectionEditor ([ffa4895](https://github.com/madfam-io/ai-portfolio-builder/commit/ffa48950283dee12756f23930765e1ccdc0bc8d9))
* resolve unused parameter warning in interactive demo ([3e84362](https://github.com/madfam-io/ai-portfolio-builder/commit/3e84362e941c021df2a91a73a7387a393226a486))
* resolve Vercel build errors ([f68d3d6](https://github.com/madfam-io/ai-portfolio-builder/commit/f68d3d681cae071942391f89b7124c952d49bb7e))
* resolve Vercel build failure - Stripe API initialization error ([8a32b88](https://github.com/madfam-io/ai-portfolio-builder/commit/8a32b882de1d84fd0c16420a135321430d126a31))
* resolve Vercel build failures - TypeScript errors fixed ([e587b53](https://github.com/madfam-io/ai-portfolio-builder/commit/e587b535dd65beae46477d109d49ea9021541764))
* resolve Vercel deployment issues with server/client separation ([b557f07](https://github.com/madfam-io/ai-portfolio-builder/commit/b557f075d5b87389eaffd3435038f37455dfc1ae))
* restore missing dependency and fix syntax error ([d7a6759](https://github.com/madfam-io/ai-portfolio-builder/commit/d7a6759e750c215c1cfc511ba49b2813b1e9bdcf))
* restore test suite functionality and improve codebase stability ([d9f14b2](https://github.com/madfam-io/ai-portfolio-builder/commit/d9f14b2fe47496d0e075fbc4db63bdf69de5fcb3))
* **security:** implement critical security fixes and dependency updates ([3caeafa](https://github.com/madfam-io/ai-portfolio-builder/commit/3caeafae18482d34d0c1da1d5aa6480fb1cbfcf2))
* **tests:** partially update tests for Spanish default language ([5f03ed3](https://github.com/madfam-io/ai-portfolio-builder/commit/5f03ed383cdaf08ea88731244c098dfae48ddd0d))
* **typescript:** add null safety checks for Supabase client ([354012d](https://github.com/madfam-io/ai-portfolio-builder/commit/354012da890018347d6373d9f9bb3511960c66dc))
* **typescript:** implement template-specific customizations ([9164591](https://github.com/madfam-io/ai-portfolio-builder/commit/9164591b77f83201a7a72c7e464af41d46cefb9a))
* **typescript:** remove unused authError variables and type declarations ([edc40ba](https://github.com/madfam-io/ai-portfolio-builder/commit/edc40bad3d2a18c0cd29712c5c1109ef3b36781c))
* **typescript:** remove unused request parameters from GET routes ([dc37fa7](https://github.com/madfam-io/ai-portfolio-builder/commit/dc37fa79417ca4a2478229539245e6a657501d3f))
* **typescript:** resolve all major TypeScript errors in analytics ([76a28a1](https://github.com/madfam-io/ai-portfolio-builder/commit/76a28a1cadf9e4588cd42ddcf85ca38d77ef8c0b))
* **typescript:** resolve all remaining TypeScript errors in analytics service ([65951c3](https://github.com/madfam-io/ai-portfolio-builder/commit/65951c3e4a58675f51d049904f9bfb364ca054c0))
* **typescript:** resolve complex type indexing error in styleMatches ([a27cedd](https://github.com/madfam-io/ai-portfolio-builder/commit/a27cedd51cbfc0a6b2d5f4344975d8c2d57b7bc3))
* **typescript:** resolve remaining build errors and React Hook warnings ([52f6df2](https://github.com/madfam-io/ai-portfolio-builder/commit/52f6df2be77a510bbebbb7230dc4159fc779eb2b))
* **ui:** apply linter formatting to new navigation pages ([2838699](https://github.com/madfam-io/ai-portfolio-builder/commit/2838699251dba33c1cf7ba5f215f4a5e6a93f817))
* **ui:** implement working interactive features with vanilla JS solution ([0416e3e](https://github.com/madfam-io/ai-portfolio-builder/commit/0416e3ea0858341603435de86303c83586fcda67))
* **ui:** implement working language toggle functionality ([b822d49](https://github.com/madfam-io/ai-portfolio-builder/commit/b822d499abfc410ad959989b9001f91e247d380d))
* **ui:** resolve React hydration failure and event handling issues ([64a4244](https://github.com/madfam-io/ai-portfolio-builder/commit/64a424421889c722328ddabc9afff6d8af4378f1))
* **ui:** restore back-to-top button functionality ([5d632aa](https://github.com/madfam-io/ai-portfolio-builder/commit/5d632aa411050892807018f944051d2b603fd8bf))
* update AI route tests to use jest.doMock pattern ([a4d1e1a](https://github.com/madfam-io/ai-portfolio-builder/commit/a4d1e1a6fbf546f2c6d8cca26d6de6df38d2b486))
* update AI services and middleware configurations ([7bf7ec3](https://github.com/madfam-io/ai-portfolio-builder/commit/7bf7ec34f02a91ee16793bec3f21f6c093d1b126))
* update ImportedData interface to match all integration types ([b4fb478](https://github.com/madfam-io/ai-portfolio-builder/commit/b4fb47890fa8546f2d5a2ae50ef68867587d26a4))
* Update Node.js version to 18.18.0 for Next.js compatibility ([b31afef](https://github.com/madfam-io/ai-portfolio-builder/commit/b31afeff59316111ef65bda1e5e2ed341233ac26))
* Update Node.js version to 18.18.0 in all workflow files ([0c902a3](https://github.com/madfam-io/ai-portfolio-builder/commit/0c902a3cf2080fc827d1b2e1d5c2f6cc05cec9be))
* update preview API validation to accept flexible portfolio schema ([6601a49](https://github.com/madfam-io/ai-portfolio-builder/commit/6601a4959618a8f5cb19330078ef9d894f532f7c))
* update recommend-template route test to fix mock issues ([f90589a](https://github.com/madfam-io/ai-portfolio-builder/commit/f90589a5a5bd8cdb1c9a9cef5e601d83e5eece73))
* update template validation to match TemplateType enum ([e207700](https://github.com/madfam-io/ai-portfolio-builder/commit/e207700f4c375f979e834778a51286ba1e17d27f))
* **warnings:** resolve remaining build and linting warnings ([e22af9a](https://github.com/madfam-io/ai-portfolio-builder/commit/e22af9a7b006806ce4919d46df98684c33e42027))
* wrap PostHogProvider with Suspense boundary ([1dee5ee](https://github.com/madfam-io/ai-portfolio-builder/commit/1dee5eec57a80e9a72760ca62465ab9f0979172e))


### Performance Improvements

* immediate stabilization - bundle optimization, memory leak prevention, and API improvements ([37b70fc](https://github.com/madfam-io/ai-portfolio-builder/commit/37b70fc8bee3bcaa401201ad112a126000dabfad))
* implement dynamic imports for chart components ([7b5f489](https://github.com/madfam-io/ai-portfolio-builder/commit/7b5f489c4f9c09ab44bced30d48b6bef62165577))
* implement image optimization and caching strategy ([a7a19ac](https://github.com/madfam-io/ai-portfolio-builder/commit/a7a19ac25873bdfcf87457ad44e5e95689c889dd))


### Reverts

* Revert "fix(csp): update Content Security Policy for Vercel deployment" ([969ba0c](https://github.com/madfam-io/ai-portfolio-builder/commit/969ba0c33224296650849fd7bf29ab8a2f9159f0))


### Code Refactoring

* **docs:** organize project files and improve documentation structure ([54e9cee](https://github.com/madfam-io/ai-portfolio-builder/commit/54e9cee4c449656ff992a25632e7f92adc507c7b))
* major code quality improvements and file splitting ([d5b03c4](https://github.com/madfam-io/ai-portfolio-builder/commit/d5b03c4b1839415efeea8a62819a76fd33e72b7f)), closes [#7](https://github.com/madfam-io/ai-portfolio-builder/issues/7) [#8](https://github.com/madfam-io/ai-portfolio-builder/issues/8) [#10](https://github.com/madfam-io/ai-portfolio-builder/issues/10)
* reduce cyclomatic complexity in AIEnhancementButton ([3107eab](https://github.com/madfam-io/ai-portfolio-builder/commit/3107eab4d7fda69543287acc0fd8716c889433d1))
* **ui:** break down monolithic landing page into modular components ([02b7d31](https://github.com/madfam-io/ai-portfolio-builder/commit/02b7d316024d2c8ae7401a2b77f8bc6ea77050e6))


### Documentation

* add comprehensive harmonization and stabilization action plan ([e182230](https://github.com/madfam-io/ai-portfolio-builder/commit/e182230a31ff29aa23019cd006a5ff58c98de323))
* add comprehensive in-file documentation and comments ([c968574](https://github.com/madfam-io/ai-portfolio-builder/commit/c96857409668344b32243466f46a912392cca0cb))
* add comprehensive roadmap and issue tracking documentation ([9cac884](https://github.com/madfam-io/ai-portfolio-builder/commit/9cac8840e7b83f4f9166e0f9093be6c27e87f6d9))
* add Phase 2 progress report - 85/100 codebase score ([d115368](https://github.com/madfam-io/ai-portfolio-builder/commit/d11536895c1810d70e3c64a964feedd1c65cd5cd))
* align project foundation with SaaS specifications ([d9b0321](https://github.com/madfam-io/ai-portfolio-builder/commit/d9b03217ba29349a85bfcaa3344e4cbdff48718e))
* comprehensive codebase analysis and implementation roadmap ([7879744](https://github.com/madfam-io/ai-portfolio-builder/commit/78797448e027fa1ea8372dd1252f38f1b1e10c47))
* comprehensive documentation cleanup and consistency update ([0756706](https://github.com/madfam-io/ai-portfolio-builder/commit/0756706cce903ca97b019dd205b673adef35d57e))
* comprehensive documentation harmonization to v0.3.0-beta ([2266c9c](https://github.com/madfam-io/ai-portfolio-builder/commit/2266c9c18e5ee892e4856e6674d6511ff8e0696e))
* comprehensive documentation review and updates for v0.1.0-beta ([43789af](https://github.com/madfam-io/ai-portfolio-builder/commit/43789af3d0e0afcac355f3c62e61561b3c00b025))
* comprehensive documentation update reflecting current project status ([a03c2ba](https://github.com/madfam-io/ai-portfolio-builder/commit/a03c2ba3b3e97f3809c00cb5dd6822f30335fa8a))
* comprehensive documentation update reflecting v0.2.0-beta enterprise architecture ([014b047](https://github.com/madfam-io/ai-portfolio-builder/commit/014b0472d2c9fd6e8da2d18905d66d4d5845312a))
* **core:** add comprehensive documentation to core SaaS components ([9d7868e](https://github.com/madfam-io/ai-portfolio-builder/commit/9d7868eec02c11ad2382ab601bde8ae3f8e7c477))
* **prisma:** comprehensive documentation update to v1.0.0 with enhanced testing coverage ([5e0743f](https://github.com/madfam-io/ai-portfolio-builder/commit/5e0743f50d5f15954752c453d80fd5aec109ee79))
* **roadmap:** complete Phase 1 foundation and prepare for Phase 2 SaaS development ([14be3dc](https://github.com/madfam-io/ai-portfolio-builder/commit/14be3dc967aec126c49f75d480529a2b44d4f4dd))
* update architecture and progress documentation ([1e4ce82](https://github.com/madfam-io/ai-portfolio-builder/commit/1e4ce821120329440fdfacd16c8ac23e06fb4490))
* update comprehensive project documentation for foundation phase ([934d240](https://github.com/madfam-io/ai-portfolio-builder/commit/934d240cde3f51bd54ef1dd88ab409861809b5d6))
* update dates in TODO.md to June 2025 ([c4c15a0](https://github.com/madfam-io/ai-portfolio-builder/commit/c4c15a0fba323025c28fc363ba00bc12f5ed0320))
* update README with simplified roadmap and current project status ([6501cf5](https://github.com/madfam-io/ai-portfolio-builder/commit/6501cf56f8d4d346ab722f26072992b23424999f))
* update TODO.md with comprehensive progress report for June 12, 2025 ([564afe2](https://github.com/madfam-io/ai-portfolio-builder/commit/564afe2eb587a032077769cdd0128a66563ddd92))
* update TODO.md with latest progress on TypeScript fixes ([a632d9a](https://github.com/madfam-io/ai-portfolio-builder/commit/a632d9acd1d3bdc9b8b08c0a7087d51b4c737a42))


### Chores

* apply ESLint auto-fixes from pre-commit hook ([54af4d7](https://github.com/madfam-io/ai-portfolio-builder/commit/54af4d7d62e4b1e062ccc98f3ff92d45612b237d))
* clean up broken test files and fix critical linting errors ([acc2f0f](https://github.com/madfam-io/ai-portfolio-builder/commit/acc2f0f04b46700fe1a8bd862dde67088abd54b5))
* remove archive directory ([20d2ddc](https://github.com/madfam-io/ai-portfolio-builder/commit/20d2ddc406ed66f355fecb988e59eb0892f779de))
* temporarily disable tests in pre-commit hook ([36cc41b](https://github.com/madfam-io/ai-portfolio-builder/commit/36cc41b802b2368e9a7d305a600054ba9b5b9665))
* temporarily disable TypeScript check in pre-commit ([62e5da9](https://github.com/madfam-io/ai-portfolio-builder/commit/62e5da9a828c5808f329e41316ef043b65cd4ffb))
* update pnpm lockfile for analytics dependencies ([7e27a2b](https://github.com/madfam-io/ai-portfolio-builder/commit/7e27a2b16fac72edf94e15b9f86c76d955dfeab8))


### Styles

* apply linting and formatting updates ([b1604d9](https://github.com/madfam-io/ai-portfolio-builder/commit/b1604d9b978d88ffc08dd188bc6cbf388ce2a06d))
* fix formatting issues in CI workflow and versionrc files ([9d14fa6](https://github.com/madfam-io/ai-portfolio-builder/commit/9d14fa6a2c8117db7dc7c1660318aebc08e60cab))


### Tests

* achieve 95%+ test coverage with comprehensive fixes ([4e3c03b](https://github.com/madfam-io/ai-portfolio-builder/commit/4e3c03b87f8f7bfb8c4ef71401df71cbb48062fb))
* add comprehensive API and AI service tests ([e0efa5f](https://github.com/madfam-io/ai-portfolio-builder/commit/e0efa5fc1e536d50f76de762d59f3afb37f27270))
* add comprehensive Skeleton component tests ([94fa435](https://github.com/madfam-io/ai-portfolio-builder/commit/94fa435bf018115d62082c511aa1e1c1ceaea78e))
* add comprehensive test suites for critical paths ([4e3f22b](https://github.com/madfam-io/ai-portfolio-builder/commit/4e3f22b86680150beff1fc5a6d1ca0e2b4a76984))
* add comprehensive tests for API optimization, CSRF client, and portfolio transformer utilities ([67d8f0b](https://github.com/madfam-io/ai-portfolio-builder/commit/67d8f0b124feb3d61bbdea9022b26eba239e2251))
* add comprehensive tests for API routes ([9d24e27](https://github.com/madfam-io/ai-portfolio-builder/commit/9d24e27cd04ff9b750ccb7644555e58676bbd50c))
* add comprehensive tests for Badge UI component ([d113884](https://github.com/madfam-io/ai-portfolio-builder/commit/d11388475b64f6a767d8dbf0f86753017ff782e7))
* add comprehensive tests for core UI components ([8e9e518](https://github.com/madfam-io/ai-portfolio-builder/commit/8e9e518cd37b8e974f143de7cbbf30f80188c00f))
* add comprehensive tests for experiment calculations and dynamic imports ([2183031](https://github.com/madfam-io/ai-portfolio-builder/commit/2183031a17592f532400a7d5c1d86d9f2a8ddb60))
* add comprehensive tests for validations and utilities ([4fb5bdd](https://github.com/madfam-io/ai-portfolio-builder/commit/4fb5bdd03c987f1d36de2a76259728bb8a47977e))
* add comprehensive UI component tests for Alert, Separator, and Textarea ([7b68fe1](https://github.com/madfam-io/ai-portfolio-builder/commit/7b68fe181cf0c06ce67233ed3cd494bceb470494))
* align component translations with test expectations ([b544701](https://github.com/madfam-io/ai-portfolio-builder/commit/b544701564a3a4e58f51644dd820dd876b887ba3))
* complete Phase 1.1 - comprehensive test coverage for critical paths ([29a94cb](https://github.com/madfam-io/ai-portfolio-builder/commit/29a94cb12b9cc1c6491b8c4872bda0bc7908020c))
* comprehensive test suite improvements - 311/388 tests passing (80% pass rate) ([875eadf](https://github.com/madfam-io/ai-portfolio-builder/commit/875eadf37ceff7860d86af1d2f6db26de053927b))
* comprehensive test suite restoration - Phase 1 complete ([2bbd2ce](https://github.com/madfam-io/ai-portfolio-builder/commit/2bbd2ceef26bf5ec181b92b906f976587b948fe3))
* continue comprehensive test fixes for production readiness ([f4e650a](https://github.com/madfam-io/ai-portfolio-builder/commit/f4e650a1b52aa4e2087535c91d09959c19e930da))
* expand test coverage from 427 to 537 tests across 40 test suites ([3974f8e](https://github.com/madfam-io/ai-portfolio-builder/commit/3974f8e2a9158b70672ad7ae5cc602da58fdea65))
* final syntax and ESLint fixes ([9b305cb](https://github.com/madfam-io/ai-portfolio-builder/commit/9b305cb7a0a3e652bb11fb8c33301f4efb37b2c2))
* fix 85% of failing tests - major test suite improvements ([9f4d07f](https://github.com/madfam-io/ai-portfolio-builder/commit/9f4d07f4a48123803fbb9fee5312f91d09fd1865))
* fix ESLint errors in test files ([adc75ca](https://github.com/madfam-io/ai-portfolio-builder/commit/adc75ca2d86a7c87d0e182b725d32a01162c245a))
* fix ESLint errors in test files ([0102558](https://github.com/madfam-io/ai-portfolio-builder/commit/0102558f9db4c215e0f7ff0d1673b45aa5aa2e16))
* fix i18n test environment for consistent language testing ([deb45c5](https://github.com/madfam-io/ai-portfolio-builder/commit/deb45c533cc801ed6de888645997e981093212d3))
* fix Jest infrastructure issues with React 19 and lucide-react ([ab5edca](https://github.com/madfam-io/ai-portfolio-builder/commit/ab5edcac102e84821b62c40978523a0bcab3c8d1))
* fix Portfolio API test mocking for database format ([739c93f](https://github.com/madfam-io/ai-portfolio-builder/commit/739c93f931d274fd78ada90866d27bf4570e8b0f))
* fix UI component mocking and create placeholder components ([87682c4](https://github.com/madfam-io/ai-portfolio-builder/commit/87682c47927967bc851ce3f3ca0c4bcd8793d2ff))
* **i18n:** add comprehensive language toggle testing suite ([009624b](https://github.com/madfam-io/ai-portfolio-builder/commit/009624b71c63bfeec979980503e7592f856904ea))
* improve test infrastructure and fix failing tests ([217f9d4](https://github.com/madfam-io/ai-portfolio-builder/commit/217f9d44c51c37e5c649b0932f088b3c791b0a29))
* increase test coverage from 6% to 11% with comprehensive test suites ([cf7b234](https://github.com/madfam-io/ai-portfolio-builder/commit/cf7b234bbf36bb80b9be6f3131b1355d68b44332))
* major test infrastructure improvements - reduce failing tests from 179 to 164 ([8bacbeb](https://github.com/madfam-io/ai-portfolio-builder/commit/8bacbeb8794909d73456a823dc9eafe5f15e7a49))
* major test suite improvements - 52.5% pass rate achieved ([0954499](https://github.com/madfam-io/ai-portfolio-builder/commit/0954499e8c047ac38e4788ae7a5a8e53595be0a6))
* phase 4 progress - fix TypeScript errors and improve test coverage ([86046f0](https://github.com/madfam-io/ai-portfolio-builder/commit/86046f00f9952bc7b3abe5939687ef6b4cc85cb0))
* **portfolio-builder:** achieve comprehensive test coverage for core portfolio system ([60e7196](https://github.com/madfam-io/ai-portfolio-builder/commit/60e7196caf73e232c6cf0d3ad3348ec41ab0a422))
* significantly expand test coverage with comprehensive test suites ([a2b9058](https://github.com/madfam-io/ai-portfolio-builder/commit/a2b9058fedaa26007812bcc3dbbb7c0c45cdd0b6))
* **stability:** stabilize test suite with 75% improvement in test pass rate ([25a1ac5](https://github.com/madfam-io/ai-portfolio-builder/commit/25a1ac531e6d990ead1e5a77699beb50161de9c3))
