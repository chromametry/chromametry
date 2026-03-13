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
/** Convert linear sRGB to CIELAB (D65) */
declare const rgbToLab: (rgb: number[]) => number[];
/** Convert CIELAB (D65) to linear sRGB */
declare const labToRgb: (lab: number[]) => number[];
/** Convert CIELAB to LCH coordinates. */
declare const labToLch: (lab: number[]) => number[];
/** Calculate color difference using CIEDE2000 formula. */
declare const calcDeltaE2000: (lab1: number[], lab2: number[]) => number;
/** Convert CSS rgb() string to linear RGB. */
declare const cssRgbToRgb: (css: string) => number[];
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

declare class Shade {
    readonly hex: string;
    constructor(hex: string);
    get rgb(): number[];
    get lab(): number[];
    get lch(): number[];
    get lightness(): number;
    get chroma(): number;
    get hue(): number;
    get luminance(): number;
    get wcag(): number;
    get apca(): number;
}

type ContrastValue = {
    efficiency: number;
    target: number;
    span: number;
    value: number;
};
type WcagContrasts = Record<30 | 45 | 70, ContrastValue>;
type ApcaContrasts = Record<45 | 60 | 75, ContrastValue>;
declare class Ramp {
    shades: Shade[];
    name: string;
    constructor(colors?: string[], name?: string);
    get colors(): string[];
    get peakChroma(): string;
    get steps(): number;
    get baseColor(): string;
    get baseIndex(): number;
    get wcag(): WcagContrasts;
    get apca(): ApcaContrasts;
    get contrasts(): {
        wcag: WcagContrasts;
        apca: ApcaContrasts;
    };
    get deltaECurve(): number[];
    get unwrapHues(): number[];
    get lightnessLinearity(): number;
    get chromaSmoothness(): number;
    get spacingUniformity(): number;
    get hueStability(): number;
    get contrastEfficiency(): number;
    get metrics(): {
        lightnessLinearity: number;
        chromaSmoothness: number;
        spacingUniformity: number;
        hueStability: number;
        contrastEfficiency: number;
    };
    get score(): number;
}

type PaletteMetrics = {
    contrastEfficiency: number;
    lightnessLinearity: number;
    chromaSmoothness: number;
    hueStability: number;
    spacingUniformity: number;
};
declare class Palette {
    ramps: Ramp[];
    name: string;
    constructor(colors?: Record<string, string[]>, name?: string);
    get colors(): {
        [k: string]: string[];
    };
    get steps(): number;
    get direction(): "lighten" | "darken";
    get wcag(): WcagContrasts;
    get apca(): ApcaContrasts;
    get contrasts(): {
        wcag: WcagContrasts;
        apca: ApcaContrasts;
    };
    get metrics(): PaletteMetrics;
    get score(): number;
}

export { type ApcaContrasts, type ContrastValue, Palette, type PaletteMetrics, Ramp, Shade, type WcagContrasts, calcDeltaE2000, calcScore, calcStatistics, createMonotone, cssRgbToRgb, fromLightnessEAL, hexToRgb, labToLch, labToRgb, lchToLab, rgbToHex, rgbToLab, rootMeanSquare, toLightnessEAL };
