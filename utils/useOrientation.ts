/**
 * useOrientation Hook
 * Tracks device orientation changes (portrait/landscape)
 */

import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
    const [orientation, setOrientation] = useState<Orientation>(() => {
        if (typeof window === 'undefined') return 'portrait';
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    });

    useEffect(() => {
        const handleOrientationChange = () => {
            const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
            setOrientation(newOrientation);
        };

        // Listen to both resize and orientationchange events
        window.addEventListener('resize', handleOrientationChange);
        window.addEventListener('orientationchange', handleOrientationChange);

        // Initial check
        handleOrientationChange();

        return () => {
            window.removeEventListener('resize', handleOrientationChange);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, []);

    return orientation;
}

/**
 * useMediaQuery Hook
 * Tracks media query matches for responsive design
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handler);
            return () => mediaQuery.removeListener(handler);
        }
    }, [query]);

    return matches;
}

/**
 * useBreakpoint Hook
 * Returns current breakpoint based on Tailwind config
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export function useBreakpoint(): Breakpoint {
    const isXs = useMediaQuery('(min-width: 360px)');
    const isSm = useMediaQuery('(min-width: 640px)');
    const isMd = useMediaQuery('(min-width: 768px)');
    const isLg = useMediaQuery('(min-width: 1024px)');
    const isXl = useMediaQuery('(min-width: 1280px)');
    const is2xl = useMediaQuery('(min-width: 1536px)');
    const is3xl = useMediaQuery('(min-width: 1920px)');

    if (is3xl) return '3xl';
    if (is2xl) return '2xl';
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    if (isSm) return 'sm';
    if (isXs) return 'xs';
    return 'xs';
}

/**
 * useDeviceType Hook
 * Returns device type based on screen size
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function useDeviceType(): DeviceType {
    const breakpoint = useBreakpoint();

    if (breakpoint === 'xs' || breakpoint === 'sm') return 'mobile';
    if (breakpoint === 'md' || breakpoint === 'lg') return 'tablet';
    return 'desktop';
}
