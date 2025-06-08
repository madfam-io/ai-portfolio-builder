export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">
              MADFAM<span className="text-purple-600">.</span>AI
            </span>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Get Started
            </button>
          </div>
        </nav>
      </header>

      <section className="pt-24 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span>Turn Your CV Into a</span> <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stunning Portfolio
            </span>
            <br />
            <span>in 30 Minutes</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            Import from LinkedIn, GitHub, or upload your resume. Our AI
            transforms your experience into a beautiful, professional portfolio
            that gets you hired.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
            <button className="bg-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-purple-700 transition transform hover:-translate-y-1 hover:shadow-lg">
              Watch Demo
            </button>
            <button className="border-2 border-purple-600 text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-purple-50 transition">
              Start Free Trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
