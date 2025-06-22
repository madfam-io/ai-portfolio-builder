import * as react_jsx_runtime from 'react/jsx-runtime';
import { SharePlatform } from '../types/index.js';

interface ShareHubProps {
    userId: string;
    platforms?: SharePlatform[];
    className?: string;
}
declare function ShareHub({ userId, platforms, className }: ShareHubProps): react_jsx_runtime.JSX.Element;

export { ShareHub };
export type { ShareHubProps };
