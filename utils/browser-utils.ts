/**
 * Browser Detection Utilities
 * Detects browser type and device characteristics for cross-browser compatibility
 */

export const isSafari = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isFirefox = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return navigator.userAgent.toLowerCase().includes('firefox');
};

export const isChrome = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /Chrome/.test(navigator.userAgent) && !/Edge|Edg/.test(navigator.userAgent);
};

export const isEdge = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /Edge|Edg/.test(navigator.userAgent);
};

export const isOpera = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /OPR|Opera/.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const isAndroid = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
};

export const isMobile = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTablet = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|Android/i.test(navigator.userAgent) && !isMobile();
};

export const isDesktop = (): boolean => {
    return !isMobile() && !isTablet();
};

/**
 * Get browser-specific CSS classes to apply to body/html
 * Usage: <body className={getBrowserClasses()}>
 */
export const getBrowserClasses = (): string => {
    const classes: string[] = [];

    if (isSafari()) classes.push('safari');
    if (isFirefox()) classes.push('firefox');
    if (isChrome()) classes.push('chrome');
    if (isEdge()) classes.push('edge');
    if (isOpera()) classes.push('opera');
    if (isIOS()) classes.push('ios');
    if (isAndroid()) classes.push('android');
    if (isMobile()) classes.push('mobile');
    if (isTablet()) classes.push('tablet');
    if (isDesktop()) classes.push('desktop');

    return classes.join(' ');
};

/**
 * Get device type for conditional rendering
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const getDeviceType = (): DeviceType => {
    if (isMobile()) return 'mobile';
    if (isTablet()) return 'tablet';
    return 'desktop';
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get viewport dimensions
 */
export const getViewport = () => {
    if (typeof window === 'undefined') {
        return { width: 0, height: 0 };
    }
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
};

/**
 * Check if viewport is in landscape mode
 */
export const isLandscape = (): boolean => {
    const { width, height } = getViewport();
    return width > height;
};

/**
 * Check if viewport is in portrait mode
 */
export const isPortrait = (): boolean => {
    return !isLandscape();
};
