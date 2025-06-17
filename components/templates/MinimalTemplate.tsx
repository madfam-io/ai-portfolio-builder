'use client';

import React from 'react';
import { Portfolio } from '@/types/portfolio';

interface MinimalTemplateProps {
  portfolio: Portfolio;
}

export function MinimalTemplate({ portfolio }: MinimalTemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-light mb-4">{portfolio.name}</h1>
        <h2 className="text-xl text-gray-600 mb-8">{portfolio.title}</h2>
        <p className="text-base mb-8">{portfolio.bio}</p>
        <p className="text-center text-gray-400 mt-16">
          Minimal template coming soon...
        </p>
      </div>
    </div>
  );
}
