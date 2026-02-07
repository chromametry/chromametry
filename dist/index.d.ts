/** Calculate relative luminance from linear RGB (0-1). */
declare const getRelativeLuminance: (rgb: number[]) => number;
declare const lrgbToSrgb: (rgb: number[]) => number[];
declare const srgbToLrgb: (rgb: number[]) => number[];
/** Convert linear RGB to sRGB Hex string. */
declare const rgbToHex: (rgb: number[]) => string;
/** Convert sRGB Hex string to linear RGB. */
declare const hexToRgb: (hex: string) => number[];
/** Calculate Equivalent Achromatic Lightness (L_EAL) using High et al. (2023). */
declare const toLightnessEAL: (lab: number[]) => number;
/** Reverse L_EAL to get CIELAB Lightness (L). */
declare const fromLightnessEAL: (brightness: number, lab: number[]) => number;
/** Convert LCH to CIELAB coordinates. */
declare const lchToLab: (lch: number[]) => number[];
/** Convert linear RGB to CIELAB (D50). */
declare const rgbToLab: (rgb: number[]) => number[];
/** Convert CIELAB to LCH coordinates. */
declare const labToLch: (lab: number[]) => number[];
/** Convert CIELAB (D50) to linear RGB. */
declare const labToRgb: (lab: number[]) => number[];
/** Calculate color difference using CIEDE2000 formula. */
declare const calcDeltaE2000: (lab1: number[], lab2: number[]) => number;
/** Find the Hex color with the highest Chroma in a list. */
declare const findMaxChromaHex: (scale: string[]) => string;
/** Normalize hue values to prevent large jumps during interpolation. */
declare function unwrapHue(hues: number[]): number[];
/** Simulate Protanopia (red-blindness) on linear RGB. */
declare function simulateProtanopia(rgb: number[]): number[];
/** Simulate Deuteranopia (green-blindness) on linear RGB. */
declare function simulateDeuteranopia(rgb: number[]): number[];
/** Convert CSS rgb() string to linear RGB. */
declare const cssRgbToRgb: (css: string) => number[];

type ColorShade = {
    hex: string;
    rgb: number[];
    lab: number[];
    lch: number[];
    parameter: number;
    lightness: number;
    chroma: number;
    hue: number;
    luminance: number;
    wcag: number;
    apca: number;
    cumDeltaE00: number;
    cumProtDeltaE00: number;
    cumDeutDeltaE00: number;
};

type ContrastName = 'wcag20' | 'wcag30' | 'wcag45' | 'wcag70' | 'apca45' | 'apca60' | 'apca75' | 'apca90';
type Contrast = {
    system: string;
    target: number;
    span: number;
    value: number;
    efficiency: number;
    name: ContrastName;
};
/** Calculate WCAG 2.x contrast ratio. */
declare const getWcagContrast: (l1: number, l2: number) => number;
/** Calculate APCA Lc (Lightness Contrast) value. */
declare const getApcaContrast: (yText: number, yBg: number) => number;
/** Analyze contrast metrics for a single Monochromatic scale. */
declare const getMonochromaticContrasts: (metrics: ColorShade[]) => Record<string, Contrast>;
declare const contrastList: ContrastName[];
/** Aggregate contrast metrics across multiple color scales. */
declare const getPaletteContrasts: (colorScales: any[]) => Record<ContrastName, Contrast>;

type MonochromaticAnalysis = {
    name: string;
    colors: string[];
    baseIndex: number;
    baseColor: string;
    shades: ColorShade[];
    metrics: MonochromaticMetrics;
    contrasts: Record<ContrastName, Contrast>;
    score: number;
};
type MonochromaticMetrics = {
    lightnessLinearity: number;
    chromaSmoothness: number;
    spacingUniformity: number;
    hueStability: number;
    contrastEfficiency: number;
};
/** Analyze a single monochromatic color scale. */
declare const analyzeMonochromatic: (colors: string[], name?: string, stepNames?: Array<number | string>) => MonochromaticAnalysis;
type MonochromaticPaletteData = {
    name: string;
    stepNames: Array<number | string>;
    colors: Record<string, string[]>;
};
/** Analyze a full palette containing multiple monochromatic scales. */
declare const analyzeMonochromaticPalette: (paletteData: MonochromaticPaletteData) => {
    name: string;
    baseColors: Record<string, string>;
    stepNames: (string | number)[];
    direction: string;
    steps: number;
    colors: Record<string, string[]>;
    contrasts: Record<ContrastName, Contrast>;
    scales: MonochromaticAnalysis[];
    metrics: {
        contrastEfficiency: number;
        lightnessLinearity: number;
        chromaSmoothness: number;
        hueStability: number;
        spacingUniformity: number;
    };
    score: number;
};
/** Measure how close lightness values follow a linear trend. */
declare function calcLightnessLinearity(values: number[]): number;
/** Measure hue deviation from a reference color. */
declare function calcHueStability(values: number[], ref: number): number;
/** Measure the smoothness of chroma transitions using a spline peak. */
declare const calcChromaSmoothness: (C: number[]) => number;
/** Measure visual spacing uniformity using DeltaE2000. */
declare const calcSpacingUniformity: (cumulativeDeltaE00: number[]) => number;
/**
 * Evaluate Contrast Span Efficiency (η) using Continuous Linear Scaling.
 * This scientific approach removes quantization bias (no ceil/floor),
 * ensuring fairness across both odd and even step counts.
 */
declare const calcContrastEfficiency: (span: number, steps: number) => number;

/**
 * Create a Monotone Cubic Hermite Interpolator.
 * Ensures monotonicity is preserved between points.
 * Fritsch, F. N., & Carlson, R. E. (1980). Monotone piecewise cubic interpolation. *SIAM Journal on Numerical Analysis*, 17(2), 238–246.
 */
declare const createMonotone: (points: number[][]) => (_t: number) => number;
/** Calculate Root Mean Square (RMS) of an array. */
declare function rootMeanSquare(values: number[]): number;
/** Calculate min, max, and average of an array. */
declare const calcStatistics: (array: number[]) => {
    min: number;
    max: number;
    avg: number;
};
/** Calculate geometric mean score (0-100) from metrics. */
declare const calcScore: (metrics: number[]) => number;

export { type Contrast, type ContrastName, type MonochromaticAnalysis, type MonochromaticMetrics, type MonochromaticPaletteData, analyzeMonochromatic, analyzeMonochromaticPalette, calcChromaSmoothness, calcContrastEfficiency, calcDeltaE2000, calcHueStability, calcLightnessLinearity, calcScore, calcSpacingUniformity, calcStatistics, contrastList, createMonotone, cssRgbToRgb, findMaxChromaHex, fromLightnessEAL, getApcaContrast, getMonochromaticContrasts, getPaletteContrasts, getRelativeLuminance, getWcagContrast, hexToRgb, labToLch, labToRgb, lchToLab, lrgbToSrgb, rgbToHex, rgbToLab, rootMeanSquare, simulateDeuteranopia, simulateProtanopia, srgbToLrgb, toLightnessEAL, unwrapHue };
