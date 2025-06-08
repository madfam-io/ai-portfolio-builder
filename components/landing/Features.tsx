import {
  FaMagic,
  FaLink,
  FaPalette,
  FaGlobe,
  FaChartLine,
  FaMobileAlt,
} from 'react-icons/fa';

export default function Features() {
  return (
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
            Our AI-powered platform handles everything from content creation to
            design, so you can focus on what matters.
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
              Your portfolio looks perfect on every device. Edit on the go with
              our mobile editor.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
