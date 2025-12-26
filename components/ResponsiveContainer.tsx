/**
 * ResponsiveContainer Component
 * Provides consistent responsive padding and max-width across all pages
 * Includes safe area insets for iOS notch/home indicator
 */

import React from 'react';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    noPadding?: boolean;
    noSafeArea?: boolean;
}

export default function ResponsiveContainer({
    children,
    className = '',
    maxWidth = 'xl',
    noPadding = false,
    noSafeArea = false,
}: ResponsiveContainerProps) {
    const maxWidthClasses = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-7xl', // Wider for expedition dashboards
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
    };

    const paddingClasses = noPadding
        ? ''
        : 'px-4 sm:px-6 md:px-8';

    const safeAreaClasses = noSafeArea
        ? ''
        : 'pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right';

    return (
        <div
            className={`
        mx-auto
        w-full
        ${maxWidthClasses[maxWidth]}
        ${paddingClasses}
        ${safeAreaClasses}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
        >
            {children}
        </div>
    );
}
