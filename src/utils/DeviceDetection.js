/**
 * DeviceDetection - Detect device type and capabilities
 * Helps optimize UX for mobile vs desktop
 */

export class DeviceInfo {
    constructor() {
        this.userAgent = navigator.userAgent || '';
        this.platform = navigator.platform || '';
        this._detectDevice();
        this._detectFeatures();
    }

    /**
     * Detect device type
     */
    _detectDevice() {
        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.userAgent);

        // Tablet detection
        this.isTablet = /(iPad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(this.userAgent);

        // Desktop detection
        this.isDesktop = !this.isMobile && !this.isTablet;

        // Specific devices
        this.isiPhone = /iPhone/i.test(this.userAgent);
        this.isiPad = /iPad/i.test(this.userAgent);
        this.isAndroid = /Android/i.test(this.userAgent);
        this.isWindows = /Win/i.test(this.platform);
        this.isMac = /Mac/i.test(this.platform);
        this.isLinux = /Linux/i.test(this.platform);

        // Touch support
        this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Screen size
        this.screenWidth = window.screen.width;
        this.screenHeight = window.screen.height;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        // Pixel ratio
        this.pixelRatio = window.devicePixelRatio || 1;
    }

    /**
     * Detect browser features
     */
    _detectFeatures() {
        // Storage
        this.hasLocalStorage = this._testLocalStorage();
        this.hasSessionStorage = this._testSessionStorage();

        // Audio
        this.hasWebAudio = !!(window.AudioContext || window.webkitAudioContext);

        // Graphics
        this.hasWebGL = this._testWebGL();
        this.hasCanvas = !!document.createElement('canvas').getContext;

        // Input
        this.hasGamepad = !!navigator.getGamepads;
        this.hasPointerLock = 'pointerLockElement' in document ||
                              'mozPointerLockElement' in document ||
                              'webkitPointerLockElement' in document;

        // Network
        this.isOnline = navigator.onLine;
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        // Orientation
        this.orientation = this._getOrientation();

        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            this.orientation = this._getOrientation();
        });

        window.addEventListener('resize', () => {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
            this.orientation = this._getOrientation();
        });
    }

    /**
     * Test localStorage
     */
    _testLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test sessionStorage
     */
    _testSessionStorage() {
        try {
            const test = '__test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test WebGL support
     */
    _testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Get current orientation
     */
    _getOrientation() {
        if (window.innerWidth > window.innerHeight) {
            return 'landscape';
        } else {
            return 'portrait';
        }
    }

    /**
     * Check if running in standalone mode (PWA)
     */
    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    /**
     * Get connection type
     */
    getConnectionType() {
        if (!this.connection) return 'unknown';
        return this.connection.effectiveType || this.connection.type || 'unknown';
    }

    /**
     * Check if connection is slow
     */
    isSlowConnection() {
        const type = this.getConnectionType();
        return type === 'slow-2g' || type === '2g';
    }

    /**
     * Get recommended graphics quality
     */
    getRecommendedQuality() {
        // Low quality for slow connections or low-end devices
        if (this.isSlowConnection() || this.pixelRatio < 1.5) {
            return 'low';
        }

        // Medium for mobile
        if (this.isMobile) {
            return 'medium';
        }

        // High for desktop with good specs
        if (this.hasWebGL && this.pixelRatio >= 2) {
            return 'high';
        }

        return 'medium';
    }

    /**
     * Get device summary
     */
    getSummary() {
        return {
            type: this.isMobile ? 'mobile' : this.isTablet ? 'tablet' : 'desktop',
            platform: this.platform,
            screen: {
                width: this.screenWidth,
                height: this.screenHeight,
                pixelRatio: this.pixelRatio,
                orientation: this.orientation
            },
            features: {
                touch: this.hasTouch,
                webGL: this.hasWebGL,
                webAudio: this.hasWebAudio,
                localStorage: this.hasLocalStorage,
                gamepad: this.hasGamepad
            },
            connection: {
                online: this.isOnline,
                type: this.getConnectionType(),
                slow: this.isSlowConnection()
            },
            recommendedQuality: this.getRecommendedQuality()
        };
    }
}

// Singleton instance
export const deviceInfo = new DeviceInfo();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.deviceInfo = deviceInfo;
}
