import { Metadata } from 'next';
import { MarketplaceContent } from './components/MarketplaceContent';

export const metadata: Metadata = {
  title: 'Premium Templates Marketplace | PRISMA',
  description:
    'Browse and purchase premium portfolio templates designed by professionals. Stand out with unique, industry-specific designs.',
};

export default function MarketplacePage() {
  return <MarketplaceContent />;
}
