import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - PRISMA by MADFAM',
  description: 'Get in touch with the PRISMA team for support and inquiries.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Contact Us
        </h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">General Inquiries</h3>
                <p className="text-gray-600 dark:text-gray-300">hello@madfam.io</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Support</h3>
                <p className="text-gray-600 dark:text-gray-300">support@madfam.io</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Business</h3>
                <p className="text-gray-600 dark:text-gray-300">business@madfam.io</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Office
            </h2>
            <div className="text-gray-600 dark:text-gray-300">
              <p>MADFAM</p>
              <p>Mexico City, Mexico</p>
              <p>Building the future of professional portfolios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}