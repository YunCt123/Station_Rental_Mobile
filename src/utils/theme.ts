export const COLORS = {
    // Primary colors - Electric blue for tech feel
    primary: '#2979FF', // Xanh điện - Primary button
    primaryDark: '#1565C0',
    primaryLight: '#64B5F6', 
    
    // Secondary colors - Neon green for header/app bar
    secondary: '#00C853', // Xanh lá neon - App bar/Header, Success (xe sẵn sàng)
    secondaryDark: '#00A344',
    secondaryLight: '#5EFC82',
    
    // Success states (for available vehicles/stations)
    success: '#00C853', // Thân thiện, "Active"
    successLight: '#5EFC82',
    successDark: '#00A344',
    
    // Warning states (for maintenance)
    warning: '#FFB300', // Cảnh báo nhẹ - bảo trì
    warningLight: '#FFCA28',
    warningDark: '#FF8F00',
    
    // Error/Danger states (for unavailable/errors)
    error: '#D32F2F', // Đỏ để cảnh báo lỗi - sự cố
    errorLight: '#E57373',
    errorDark: '#B71C1C',
    
    // Accent color
    accent: '#26C6DA', // Highlight text/icon - cảm giác mượt và sáng
    accentLight: '#4DD0E1',
    accentDark: '#00ACC1',
    
    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    
    // Background colors
    background: '#F5F5F5', // Light mode background
    backgroundSecondary: '#FFFFFF',
    backgroundDark: '#121212', // Dark mode background
    surface: '#FFFFFF',
    
    // Text colors
    text: '#212121',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    
    // Border colors
    border: '#E0E0E0',
    borderLight: '#F5F5F5',
    borderDark: '#BDBDBD',
    
    // Status colors for rental states
    available: '#00C853', // Xe sẵn sàng
    rented: '#2979FF', // Đang được thuê
    maintenance: '#FFB300', // Bảo trì
    unavailable: '#D32F2F', // Sự cố
    
    // Map related colors
    mapPrimary: '#2979FF',
    mapSecondary: '#FFB300',
    stationActive: '#00C853',
    stationInactive: '#D32F2F',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
    // Specific spacing for components
    buttonPadding: 12,
    cardPadding: 16,
    screenPadding: 20,
    listItemPadding: 16,
    headerHeight: 56,
    tabBarHeight: 60,
    bottomSheetPadding: 20,
} as const;

export const RADII = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    button: 8,
    card: 12,
    input: 8,
    modal: 16,
    avatar: 50, 
    pill: 50, // For pill-shaped buttons
} as const;

export const FONTS = {
    // Font sizes
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 32,
    
    // Semantic font sizes
    caption: 12,
    body: 14,
    bodyLarge: 16,
    subtitle: 18,
    title: 20,
    header: 24,
    display: 32,
} as const;

export const FONT_WEIGHTS = {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
} as const;

export const LINE_HEIGHTS = {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
} as const;

// Shadow configurations for different elevations
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
} as const;

// Animation durations
export const ANIMATIONS = {
    fast: 150,
    normal: 250,
    slow: 350,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
} as const;

// Common component sizes
export const SIZES = {
    icon: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 40,
    },
    avatar: {
        xs: 24,
        sm: 32,
        md: 40,
        lg: 48,
        xl: 64,
    },
    button: {
        height: 48,
        minWidth: 80,
    },
    input: {
        height: 48,
    },
} as const;

// Theme object combining all design tokens
export const THEME = {
    colors: COLORS,
    spacing: SPACING,
    radii: RADII,
    fonts: FONTS,
    fontWeights: FONT_WEIGHTS,
    lineHeights: LINE_HEIGHTS,
    shadows: SHADOWS,
    animations: ANIMATIONS,
    breakpoints: BREAKPOINTS,
    sizes: SIZES,
} as const;

// Type definitions for TypeScript
export type Colors = typeof COLORS;
export type Spacing = typeof SPACING;
export type Radii = typeof RADII;
export type Fonts = typeof FONTS;
export type FontWeights = typeof FONT_WEIGHTS;
export type Theme = typeof THEME;