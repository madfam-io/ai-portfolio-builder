'use client';

import React from 'react';
import { Portfolio } from '@/types/portfolio';

interface ModernTemplateProps {
  portfolio: Portfolio;
}

export function ModernTemplate({ portfolio }: ModernTemplateProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">{portfolio.name}</h1>
        <h2 className="text-2xl text-gray-300 mb-8">{portfolio.title}</h2>
        <p className="text-lg mb-8">{portfolio.bio}</p>
        <p className="text-center text-gray-500 mt-16">
          Modern template coming soon...
        </p>
      </div>
    </div>
  );
}
