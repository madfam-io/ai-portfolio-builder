/**
 * Helper functions for dynamic date generation in translations
 */

import {
  getCurrentYear,
  getPromotionalDeadline,
  getLastUpdatedDate,
  getLastUpdatedDateSpanish,
} from '@/lib/utils/date';

/**
 * Get dynamic translation values that include dates
 */
export function getDynamicTranslations() {
  const currentYear = getCurrentYear();
  const promoDeadline = getPromotionalDeadline(6); // 6 months from now

  return {
    es: {
      footerCopyright: `© ${currentYear} PRISMA by MADFAM. Todos los derechos reservados.`,
      pricingOfferExpires: `La oferta expira el ${promoDeadline.es}`,
      termsLastUpdated: `Última actualización: ${getLastUpdatedDateSpanish()}`,
    },
    en: {
      footerCopyright: `© ${currentYear} PRISMA by MADFAM. All rights reserved.`,
      pricingOfferExpires: `Offer expires ${promoDeadline.en}`,
      termsLastUpdated: `Last updated: ${getLastUpdatedDate()}`,
    },
  };
}
