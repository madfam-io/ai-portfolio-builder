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

import Image from 'next/image';
import { Portfolio } from '@/types/portfolio';

interface DesignerTemplateProps {
  portfolio: Portfolio;
}

export function DesignerTemplate({ portfolio }: DesignerTemplateProps) {
  return (
    <div data-testid="designer-template">
      <div
        data-testid="portfolio-grid"
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6"
      >
        {portfolio.projects.map(project => (
          <div
            key={project.id}
            className="relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden"
          >
            {project.imageUrl ? (
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                {project.title}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
