import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DomainSettingsContent } from './components/DomainSettingsContent';

export const metadata: Metadata = {
  title: 'Custom Domain Settings | PRISMA',
  description: 'Connect your custom domain to your portfolio',
};

export default function DomainSettingsPage() {
  return (
    <ProtectedRoute>
      <DomainSettingsContent />
    </ProtectedRoute>
  );
}
