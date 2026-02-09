import { getColorShade, ColorShade } from "./shade.js"
import { unwrapHue, rgbToLab, hexToRgb, calcDeltaE2000, findMaxChromaHex, labToRgb, lrgbToSrgb, lchToLab } from "./color.js"
import { createMonotone, rootMeanSquare, calcScore } from "./math.js"
import { getMonochromaticContrasts, ContrastName, Contrast, getPaletteContrasts } from "./contrast.js"

export type MonochromaticAnalysis = {
    name: string;
    colors: string[];
    baseIndex: number;
    baseColor: string;
    shades: ColorShade[];
    metrics: MonochromaticMetrics;
    contrasts: Record<ContrastName, Contrast>;
    score: number;
}

export type MonochromaticMetrics = {
    lightnessLinearity: number
    chromaSmoothness: number
    spacingUniformity: number
    hueStability: number
    contrastEfficiency: number
}

/** Analyze a single monochromatic color scale. */
export const analyzeMonochromatic = (colors: string[], name?: string, stepNames?: Array<number | string>): MonochromaticAnalysis => {
    name ||= "brand";
    stepNames ||= [...Array(colors.length).keys()];

    let lstart = rgbToLab(hexToRgb(colors[0]))[0];
    let lend = rgbToLab(hexToRgb(colors[colors.length - 1]))[0];

    if (lstart > lend) colors.reverse();

    const shades: ColorShade[] = colors.map((hex) => getColorShade(hex));

    for (let i = 1; i < shades.length; i++) {
        let de00 = calcDeltaE2000(shades[i - 1].lab, shades[i].lab);
        shades[i].cumDeltaE00 = shades[i - 1].cumDeltaE00 + de00;
    }

    let baseColor = findMaxChromaHex(colors.slice(2, -2)) || colors[Math.floor(colors.length / 2)];
    const baseIndex = colors.findIndex(h => h.toLowerCase() === baseColor?.toLowerCase());

    const hues = unwrapHue(shades.map(m => m.hue).slice(1, -1));
    for (let i = 1; i < shades.length - 1; i++) {
        shades[i].hue = hues[i - 1];
    }

    const hueStability = calcHueStability(shades.map(m => m.hue).slice(1, -1), shades[baseIndex].hue);
    const contrasts = getMonochromaticContrasts(shades);

    const metrics: MonochromaticMetrics = {
        lightnessLinearity: calcLightnessLinearity(shades.map(m => m.lightness)),
        chromaSmoothness: calcChromaSmoothness(shades.map(m => m.chroma)),
        spacingUniformity: calcSpacingUniformity(shades.map(m => m.cumDeltaE00)),
        contrastEfficiency: calcContrastEfficiency(contrasts.wcag45.span, stepNames.length),
        hueStability,
    };

    return {
        name,
        colors,
        baseIndex,
        baseColor,
        shades,
        contrasts,
        metrics,
        score: calcScore(Object.values(metrics))
    };
};

export type MonochromaticPaletteData = {
    name: string,
    stepNames: Array<number | string>,
    colors: Record<string, string[]>;
}

/** Analyze a full palette containing multiple monochromatic scales. */
export const analyzeMonochromaticPalette = (paletteData: MonochromaticPaletteData) => {
    let { stepNames, name, colors } = paletteData;
    const firstScale = Object.values(colors)[0];

    let lstart = rgbToLab(hexToRgb(firstScale[0]))[0];
    let lend = rgbToLab(hexToRgb(firstScale[firstScale.length - 1]))[0];
    const direction = lstart > lend ? "darken" : "lighten";

    const scales: MonochromaticAnalysis[] = [];
    const baseColors: Record<string, string> = {};

    for (const colorName in colors) {
        const analysis = analyzeMonochromatic(colors[colorName], colorName, stepNames);
        scales.push(analysis);
        baseColors[colorName] = analysis.baseColor;
    }

    const metrics = {
        contrastEfficiency: rootMeanSquare(scales.map(s => s.metrics.contrastEfficiency)),
        lightnessLinearity: rootMeanSquare(scales.map(s => s.metrics.lightnessLinearity)),
        chromaSmoothness: rootMeanSquare(scales.map(s => s.metrics.chromaSmoothness)),
        hueStability: rootMeanSquare(scales.map(s => s.metrics.hueStability)),
        spacingUniformity: rootMeanSquare(scales.map(s => s.metrics.spacingUniformity))
    };

    return {
        name,
        baseColors,
        stepNames,
        direction,
        steps: stepNames.length,
        colors,
        contrasts: getPaletteContrasts(scales),
        scales,
        metrics,
        score: calcScore(Object.values(metrics))
    };
};

/** Measure how close lightness values follow a linear trend. */
export function calcLightnessLinearity(values: number[]): number {
    const n = values.length;
    if (n < 2) return 1;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
    }

    const denominator = (n * sumXX - sumX * sumX);
    if (Math.abs(denominator) < 1e-10) return 1;

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    const fitRange = Math.abs(slope * (n - 1));
    if (fitRange < 1e-3) return 1;

    let sumSqError = 0, sumSqMaxError = 0;
    for (let i = 0; i < n; i++) {
        const target = slope * i + intercept;
        const error = values[i] - target;
        sumSqError += error * error;
        const maxDiff = Math.max(target - Math.min(intercept, slope * (n - 1) + intercept), Math.max(intercept, slope * (n - 1) + intercept) - target);
        sumSqMaxError += maxDiff * maxDiff;
    }

    return Math.max(0, Math.min(1, 1 - (Math.sqrt(sumSqError / n) / Math.sqrt(sumSqMaxError / n))));
}

/** Measure hue deviation from a reference color. */
export function calcHueStability(values: number[], ref: number): number {
    const n = values.length;
    if (n < 2) return 1;

    let sumSqError = 0, sumSqMaxError = 0;
    for (let i = 0; i < n; i++) {
        let d = Math.abs(values[i] - ref) % 360;
        if (d > 180) d = 360 - d;
        sumSqError += d * d;
        const maxD = (i / (n - 1)) * 180;
        sumSqMaxError += maxD * maxD;
    }

    return Math.max(0, Math.min(1, 1 - (Math.sqrt(sumSqError / n) / (Math.sqrt(sumSqMaxError / n) || 1))));
}

/** Measure the smoothness of chroma transitions using a spline peak. */
export const calcChromaSmoothness = (C: number[]): number => {
    const n = C.length;
    if (n < 3) return 1;
    const C_REF = 133.8;
    const C_MAX = Math.max(...C);
    if (C_MAX <= 1e-2) return 1;
    const normC = C.map(c => (c / C_MAX) * C_REF);
    const cMin = Math.min(...normC),
        cMax = Math.max(...normC);

    const maxIdx = normC.findIndex(c => c === cMax);
    const spline = createMonotone([[0, normC[0]], [maxIdx, cMax], [n - 1, normC[n - 1]]]);

    let sumSqErr = 0, sumSqMaxErr = 0;
    for (let i = 0; i < n; i++) {
        const target = spline(i);
        const err = normC[i] - target;
        sumSqErr += err * err;
        sumSqMaxErr += Math.pow(Math.max(target - cMin, cMax - target), 2);
    }

    return Math.max(0, Math.min(1, 1 - (Math.sqrt(sumSqErr / n) / Math.sqrt(sumSqMaxErr / n))));
};

/** Measure visual spacing uniformity using DeltaE2000. */
export const calcSpacingUniformity = (cumulativeDeltaE00: number[]): number => {

    const n = cumulativeDeltaE00.length;
    if (n < 2) return 1;

    const deltas: number[] = [];
    for (let i = 1; i < n; i++) {
        const d = cumulativeDeltaE00[i] - cumulativeDeltaE00[i - 1];
        if (d < 0) return 0;
        deltas.push(d);
    }

    const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    if (mean <= 1e-6) return 0;

    let sumSq = 0;
    for (const d of deltas) sumSq += Math.pow(d - mean, 2);

    const cv = Math.sqrt(sumSq / deltas.length) / mean;
    return Math.max(0, Math.min(1, 1 / (1 + cv)));
};
/**
 * Evaluate Contrast Span Efficiency (η) using Continuous Linear Scaling.
 * This scientific approach removes quantization bias (no ceil/floor),
 * ensuring fairness across both odd and even step counts.
 */
export const calcContrastEfficiency = (span: number, steps: number): number => {
    // Edge case: A single color or empty palette cannot have a span.
    if (steps <= 1) return 1;

    /**
     * WCAG 4.5:1 threshold mapped to CIELAB L* range (0-100).
     * This represents the physical minimum lightness range required.
     */
    const LAMBDA = 0.5;

    // Actual density of the palette (0 to 1)
    const density = span / steps;

    /**
     * SCIENTIFIC LOGIC: Continuous Target Density
     * We calculate the ideal density as a continuous function of N.
     * targetDensity = LAMBDA * ((N-1) / N)
     * This eliminates the "aliasing" effect of discrete steps.
     */
    const targetDensity = LAMBDA * ((steps - 1) / steps);

    // If actual density is better (lower) than or equal to target, full score.
    if (density <= targetDensity) return 1;

    // If span covers the entire palette (useless for UI contrast), zero score.
    if (density >= 1.0) return 0;

    /**
     * Linear Penalty Calculation:
     * Instead of step-based penalties, we measure the distance on a continuous scale.
     * η = (1 - density) / (1 - targetDensity)
     */
    return (1 - density) / (1 - targetDensity);
};