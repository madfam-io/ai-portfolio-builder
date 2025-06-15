'use client';

import { Mail, Phone } from 'lucide-react';
import { SectionProps } from '../types';

export function ContactSection({ portfolio }: SectionProps) {
  return (
    <section className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {portfolio.contact.email && (
          <a
            href={`mailto:${portfolio.contact.email}`}
            aria-label={`Email ${portfolio.name}`}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Mail />
            {portfolio.contact.email}
          </a>
        )}
        {portfolio.contact.phone && (
          <a
            href={`tel:${portfolio.contact.phone}`}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Phone />
            {portfolio.contact.phone}
          </a>
        )}
      </div>
    </section>
  );
}