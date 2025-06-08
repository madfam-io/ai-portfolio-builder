export default function CTA() {
  return (
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
  );
}
