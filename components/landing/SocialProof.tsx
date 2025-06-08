import {
  FaGoogle,
  FaMicrosoft,
  FaApple,
  FaAmazon,
  FaFacebookF,
} from 'react-icons/fa';

export default function SocialProof() {
  return (
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
  );
}
