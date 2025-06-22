import * as react_jsx_runtime from 'react/jsx-runtime';

interface CampaignSelectorProps {
    userId?: string;
    onSelect?: (campaignId: string) => void;
    className?: string;
}
declare function CampaignSelector({ userId, onSelect, className }: CampaignSelectorProps): react_jsx_runtime.JSX.Element;

export { CampaignSelector };
export type { CampaignSelectorProps };
