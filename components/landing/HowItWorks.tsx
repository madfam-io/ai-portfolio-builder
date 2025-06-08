export default function HowItWorks() {
  return (
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
              Our AI rewrites your content, suggests improvements, and picks the
              perfect template.
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
  );
}
