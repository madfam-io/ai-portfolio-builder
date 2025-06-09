import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - PRISMA by MADFAM',
  description: 'Privacy policy and data protection information for PRISMA portfolio builder.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Last updated: January 2025
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Information We Collect
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              build a portfolio, or contact us for support.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the information we collect to provide, maintain, and improve our services, 
              including generating AI-enhanced portfolio content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              If you have questions about this Privacy Policy, please contact us at privacy@madfam.io
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}