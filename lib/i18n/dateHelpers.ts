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
function getDynamicTranslations() {
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
