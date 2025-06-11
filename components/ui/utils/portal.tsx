import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

/**
 * Renders children into a DOM node outside of the parent component's DOM hierarchy
 * @example
 * <Portal>
 *   <Modal />
 * </Portal>
 */
export function Portal({ children, containerId = 'portal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    let portalContainer = document.getElementById(containerId);
    
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = containerId;
      document.body.appendChild(portalContainer);
    }
    
    setContainer(portalContainer);

    return () => {
      // Only remove if we created it and it's empty
      if (portalContainer && portalContainer.childNodes.length === 0) {
        portalContainer.remove();
      }
    };
  }, [containerId]);

  if (!mounted || !container) return null;

  return createPortal(children, container);
}