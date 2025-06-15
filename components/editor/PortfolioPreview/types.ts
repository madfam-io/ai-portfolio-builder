import { Portfolio } from '@/types/portfolio';

export interface PortfolioPreviewProps {
  portfolio: Portfolio;
  mode?: 'desktop' | 'tablet' | 'mobile';
  activeSection?: string;
  onSectionClick?: (section: string) => void;
  isInteractive?: boolean;
}

export interface SectionProps {
  portfolio: Portfolio;
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
  isInteractive?: boolean;
}

export interface PreviewStyles extends React.CSSProperties {
  '--primary-color'?: string;
  '--secondary-color'?: string;
  '--accent-color'?: string;
  fontFamily?: string;
}