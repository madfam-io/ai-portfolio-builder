/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import {
  getCurrentYear,
  getPromotionalDeadline,
  getLastUpdatedDate,
  getLastUpdatedDateSpanish,
} from '@/lib/utils/date';

/**
 * Helper functions for dynamic date generation in translations
 */

/**
 * Get dynamic translation values that include dates
 */
export function getDynamicTranslations() {
  const currentYear = getCurrentYear();
  const promoDeadline = getPromotionalDeadline(); // No parameters needed

  return {
    es: {
      footerCopyright: `© ${currentYear} PRISMA by MADFAM. Todos los derechos reservados.`,
      pricingOfferExpires: `La oferta expira el ${promoDeadline}`,
      termsLastUpdated: `Última actualización: ${getLastUpdatedDateSpanish()}`,
    },
    en: {
      footerCopyright: `© ${currentYear} PRISMA by MADFAM. All rights reserved.`,
      pricingOfferExpires: `Offer expires ${promoDeadline}`,
      termsLastUpdated: `Last updated: ${getLastUpdatedDate()}`,
    },
  };
}
