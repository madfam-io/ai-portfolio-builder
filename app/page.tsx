import {
  FaRocket,
  FaDollarSign,
  FaMoon,
  FaBars,
  FaPlay,
  FaCheckCircle,
  FaUsers,
  FaStar,
  FaGoogle,
  FaMicrosoft,
  FaApple,
  FaAmazon,
  FaFacebookF,
  FaMagic,
  FaLink,
  FaPalette,
  FaGlobe,
  FaChartLine,
  FaMobileAlt,
  FaCheck,
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
} from 'react-icons/fa';
import InteractiveScript from '@/components/InteractiveScript';
// Temporarily disabled due to React import errors
// import InteractiveHeader from '@/components/shared/InteractiveHeader';
// import DynamicPricing from '@/components/shared/DynamicPricing';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Static Header - will be replaced with interactive version */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50 transition-colors duration-300">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaRocket className="text-2xl text-purple-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                MADFAM<span className="text-purple-600">.</span>AI
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                data-translate="features"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                data-translate="howItWorks"
              >
                How it Works
              </a>
              <a
                href="#templates"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                data-translate="templates"
              >
                Templates
              </a>
              <a
                href="#pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                data-translate="pricing"
              >
                Pricing
              </a>

              <button
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1"
                data-currency-toggle
              >
                <FaDollarSign className="text-sm" />
                <span className="text-sm font-medium" data-currency-display>
                  USD
                </span>
              </button>

              <button
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1"
                data-lang-toggle
              >
                <span className="flag-icon" data-lang-flag>
                  🇺🇸
                </span>
                <span className="text-sm font-medium" data-lang-display>
                  EN
                </span>
              </button>

              <button
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition"
                data-dark-mode-toggle
              >
                <span data-dark-mode-icon>
                  <FaMoon />
                </span>
              </button>

              <button
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                data-cta-button
                data-translate="getStarted"
              >
                Get Started
              </button>
            </div>

            <div className="md:hidden">
              <button
                className="text-gray-600 dark:text-gray-300 p-2"
                data-mobile-menu-toggle
              >
                <span data-mobile-menu-icon>
                  <FaBars className="text-xl" />
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className="md:hidden mt-4 pb-4 border-t dark:border-gray-700"
            style={{ display: 'none' }}
            data-mobile-menu
          >
            <div className="flex flex-col space-y-4 pt-4">
              <a
                href="#features"
                className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                data-translate="features"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                data-translate="howItWorks"
              >
                How it Works
              </a>
              <a
                href="#templates"
                className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                data-translate="templates"
              >
                Templates
              </a>
              <a
                href="#pricing"
                className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                data-translate="pricing"
              >
                Pricing
              </a>
              <button
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                data-cta-button
                data-translate="getStarted"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <FaStar className="mr-2" />
            <span>Powered by GPT-4 & Claude AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            <span data-translate="heroTitle">Turn Your CV Into a</span>{' '}
            <br className="hidden sm:block" />
            <span
              className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              data-translate="heroTitle2"
            >
              Stunning Portfolio
            </span>
            <br className="hidden sm:block" />
            <span data-translate="heroTitle3">in 30 Minutes</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto px-4"
            data-translate="heroDesc"
          >
            Import from LinkedIn, GitHub, or upload your resume. Our AI
            transforms your experience into a beautiful, professional portfolio
            that gets you hired.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
            <button
              className="bg-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-purple-700 transition transform hover:-translate-y-1 hover:shadow-lg"
              data-demo-button
            >
              <FaPlay className="inline mr-2" />
              <span data-translate="watchDemo">Watch Demo</span>
            </button>
            <button
              className="border-2 border-purple-600 text-purple-600 dark:hover:bg-purple-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-purple-50 transition"
              data-cta-button
            >
              <span data-translate="startFreeTrial">Start Free Trial</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-sm sm:text-base">
                No credit card required
              </span>
            </div>
            <div className="flex items-center">
              <FaUsers className="text-blue-500 mr-2" />
              <span className="text-sm sm:text-base">
                Join 10,000+ professionals
              </span>
            </div>
            <div className="flex items-center">
              <FaStar className="text-yellow-500 mr-2" />
              <span className="text-sm sm:text-base">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Trusted by professionals from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-60">
            <FaGoogle className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
            <FaMicrosoft className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
            <FaApple className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
            <FaAmazon className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
            <FaFacebookF className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span>Everything You Need to</span>{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Stand Out
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-powered platform handles everything from content creation
              to design, so you can focus on what matters.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <FaMagic className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                AI Content Enhancement
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI rewrites your experience into compelling narratives that
                highlight your value and achievements.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <FaLink className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                One-Click Import
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect LinkedIn, GitHub, or upload your CV. We automatically
                extract and organize everything.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <FaPalette className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Professional Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Industry-specific designs that adapt to your content. No design
                skills needed.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-6">
                <FaGlobe className="text-2xl text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Custom Domain
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get a professional URL like yourname.com or use our free
                subdomain.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-6">
                <FaChartLine className="text-2xl text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track visitors, see which projects get attention, and optimize
                your portfolio.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-6">
                <FaMobileAlt className="text-2xl text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Mobile Optimized
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your portfolio looks perfect on every device. Edit on the go
                with our mobile editor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-6 bg-gray-100 dark:bg-gray-800 transition-colors duration-300"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span>From Zero to Portfolio in</span>{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No technical skills required. Our AI handles everything.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Import Your Data
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect LinkedIn, GitHub, or upload your CV. Takes less than 2
                minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                AI Enhancement
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI rewrites your content, suggests improvements, and picks
                the perfect template.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Publish & Share
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Review, customize if needed, and publish. Your portfolio is live
                instantly.
              </p>
            </div>
          </div>

          {/* Mock Browser Preview */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="border-3 border-gray-300 rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-gray-200 p-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 text-center">
                  <span className="text-sm text-gray-600">
                    https://johndoe.madfam.io
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-8 transition-colors duration-300">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    John Doe
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Full Stack Developer & UI Designer
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-600 h-32 rounded-lg"></div>
                  <div className="bg-gray-100 dark:bg-gray-600 h-32 rounded-lg"></div>
                  <div className="bg-gray-100 dark:bg-gray-600 h-32 rounded-lg"></div>
                  <div className="bg-gray-100 dark:bg-gray-600 h-32 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span>Beautiful Templates for</span>{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Every Professional
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              AI selects the perfect template based on your industry and content
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="group cursor-pointer">
              <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
                <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                  <span className="text-white font-semibold">
                    Use This Template
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Minimal Developer
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Clean, code-focused design
              </p>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
                <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                  <span className="text-white font-semibold">
                    Use This Template
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Creative Designer
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Visual, portfolio-centric layout
              </p>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
                <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                  <span className="text-white font-semibold">
                    Use This Template
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Business Professional
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Corporate, achievement-focused
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Static Pricing - will be replaced with dynamic version */}
      <section
        id="pricing"
        className="py-20 px-6 bg-gray-100 dark:bg-gray-800 transition-colors duration-300"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span>Simple Pricing,</span>{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Free
              </h3>
              <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                <span data-price="0">$0</span>
                <span className="text-lg text-gray-600 dark:text-gray-300">
                  /month
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>1 portfolio</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>Basic templates</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>MADFAM subdomain</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>3 AI rewrites/month</span>
                </li>
              </ul>
              <button className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition">
                Start Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-purple-600 text-white p-8 rounded-xl shadow-lg transform scale-105">
              <div className="bg-yellow-400 text-purple-900 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">
                <span data-price="19">$19</span>
                <span className="text-lg opacity-80">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <FaCheck className="mr-3" />
                  <span>3 portfolios</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="mr-3" />
                  <span>All templates</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="mr-3" />
                  <span>Custom domain</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="mr-3" />
                  <span>Unlimited AI rewrites</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="mr-3" />
                  <span>Analytics & SEO tools</span>
                </li>
              </ul>
              <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
                Start Pro Trial
              </button>
            </div>

            {/* Business Plan */}
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Business
              </h3>
              <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                <span data-price="49">$49</span>
                <span className="text-lg text-gray-600 dark:text-gray-300">
                  /month
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>Unlimited portfolios</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>White-label option</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>API access</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Build Your Portfolio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who have transformed their careers
          </p>
          <button
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition transform hover:-translate-y-1 hover:shadow-lg"
            data-cta-button
          >
            Get Started Free
          </button>
          <p className="mt-4 opacity-80">
            No credit card required • Setup in 30 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaRocket className="text-2xl text-purple-400" />
                <span className="text-xl font-bold text-white">MADFAM.AI</span>
              </div>
              <p className="text-sm">
                AI-powered portfolio builder for modern professionals
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#templates" className="hover:text-white transition">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">
              © 2025 MADFAM. All rights reserved.
            </p>
            <div className="flex justify-center md:justify-end space-x-6">
              <a href="#" className="hover:text-white transition">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="hover:text-white transition">
                <FaLinkedinIn className="text-xl" />
              </a>
              <a href="#" className="hover:text-white transition">
                <FaGithub className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <InteractiveScript />
    </div>
  );
}
