/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import { SectionProps } from '../types';

export function CertificationsSection({ portfolio }: SectionProps) {
  return (
    <section id="certifications-section" data-testid="certifications-section">
      <h2 className="text-2xl font-bold mb-4">Certifications</h2>
      <div className="grid gap-4">
        {portfolio.certifications.map(cert => (
          <div
            key={cert.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            {cert.credentialUrl ? (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {cert.name}
              </a>
            ) : (
              <h3 className="text-lg font-semibold">{cert.name}</h3>
            )}
            <p className="text-gray-600 dark:text-gray-400">{cert.issuer}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Issued: {cert.issueDate}
              {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
            </p>
            {cert.credentialId && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Credential ID: {cert.credentialId}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
