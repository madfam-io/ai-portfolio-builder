'use client';

import React, { useEffect, useState } from 'react';
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from './icons/theme-icons';

interface SafeIconWrapperProps {
  iconType: 'theme' | 'menu';
  className?: string;
}

/**
 * SafeIconWrapper - A secure alternative to using innerHTML for dynamic icon rendering
 *
 * This component renders icons based on data attributes set by the InteractiveScript,
 * avoiding the security risks associated with innerHTML manipulation.
 */
export const SafeIconWrapper: React.FC<SafeIconWrapperProps> = ({
  iconType,
  className,
}) => {
  const [iconState, setIconState] = useState<string>('');

  useEffect(() => {
    // Create a MutationObserver to watch for attribute changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-icon-state'
        ) {
          const target = mutation.target as HTMLElement;
          const newState = target.getAttribute('data-icon-state') || '';
          setIconState(newState);
        }
      });
    });

    // Find the element with the appropriate data attribute
    const selector =
      iconType === 'theme'
        ? '[data-dark-mode-icon]'
        : '[data-mobile-menu-icon]';
    const element = document.querySelector(selector);

    if (element) {
      // Get initial state
      const initialState = element.getAttribute('data-icon-state') || '';
      setIconState(initialState);

      // Start observing for changes
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['data-icon-state'],
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [iconType]);

  // Render the appropriate icon based on state
  if (iconType === 'theme') {
    return iconState === 'sun' ? (
      <SunIcon className={className} />
    ) : (
      <MoonIcon className={className} />
    );
  } else {
    return iconState === 'close' ? (
      <CloseIcon className={className} />
    ) : (
      <MenuIcon className={className} />
    );
  }
};

/**
 * ThemeToggleIcon - Wrapper for theme toggle icon
 */
export const ThemeToggleIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <span data-dark-mode-icon>
    <SafeIconWrapper iconType="theme" className={className} />
  </span>
);

/**
 * MobileMenuIcon - Wrapper for mobile menu icon
 */
export const MobileMenuIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <span data-mobile-menu-icon>
    <SafeIconWrapper iconType="menu" className={className} />
  </span>
);
