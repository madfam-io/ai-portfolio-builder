'use client';

import { Portfolio } from '@/types/portfolio';

interface ConsultantTemplateProps {
  portfolio: Portfolio;
}

export function ConsultantTemplate({ portfolio }: ConsultantTemplateProps) {
  return (
    <div data-testid="consultant-template">
      <div
        data-testid="credentials-section"
        className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <h3 className="font-semibold mb-2">Credentials & Expertise</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Certifications
            </h4>
            {portfolio.certifications.map(cert => (
              <p key={cert.id} className="text-sm">
                {cert.name}
              </p>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Experience
            </h4>
            <p className="text-sm">{portfolio.experience.length} positions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
