import { FaPlay, FaCheckCircle, FaUsers, FaStar } from 'react-icons/fa';

export default function Hero() {
  return (
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
          Import from LinkedIn, GitHub, or upload your resume. Our AI transforms
          your experience into a beautiful, professional portfolio that gets you
          hired.
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
  );
}
