/** Calculate relative luminance from linear RGB (0-1). */
const lrgbToSrgb = (rgb: number[]) => {
    const toSRGB = (c: number) => {
        const clamped = Math.max(0, Math.min(1, c));
        const s = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(s * 255)));
    };
    return rgb.map(toSRGB);
}

const srgbToLrgb = (rgb: number[]) => {
    const toLRGB = (c: number) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);
    return rgb.map(toLRGB);
}

/** Convert linear RGB to sRGB Hex string. */
export const rgbToHex = (rgb: number[]): string => {

    let [r, g, b] = lrgbToSrgb(rgb) as any[]
    r = r.toString(16).padStart(2, "0");
    g = g.toString(16).padStart(2, "0");
    b = b.toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
};

/** Convert sRGB Hex string to linear RGB. */
export const hexToRgb = (hex: string): number[] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    return srgbToLrgb([r, g, b])
};

/** Converts linear RGB to Oklab color space. */
/** Specification: Björn Ottosson (2020). */
export const rgbToOklab = (rgb: number[]): number[] => {
    const l = 0.4122214708 * rgb[0] + 0.5363325363 * rgb[1] + 0.0514459929 * rgb[2];
    const m = 0.2119034982 * rgb[0] + 0.6806995451 * rgb[1] + 0.1073969566 * rgb[2];
    const s = 0.0883024619 * rgb[0] + 0.2817188376 * rgb[1] + 0.6299787005 * rgb[2];
    const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
    return [
        0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
    ];
};

/** Converts Oklab color space to linear RGB. */
/** Specification: Björn Ottosson (2020). */
export const oklabToRgb = (lab: number[]): number[] => {
    const [L, a, b] = lab;
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    ];
};

/** Calculate Equivalent Achromatic Lightness (L_EAL) using High et al. (2023). */
export const toLightnessEAL = (lab: number[]): number => {
    const [L, a, b] = lab;
    const C = Math.sqrt(a * a + b * b);
    const hRad = Math.atan2(b, a);
    const hDeg = (hRad * 180 / Math.PI + 360) % 360;

    const k1 = 0.1644, k2 = 0.0603, k3 = 0.1307, k4 = 0.0060;
    const fBYh = k1 * Math.abs(Math.sin(((hDeg - 90) / 2) * (Math.PI / 180))) + k2;

    let fRh = 0;
    if (hDeg <= 90 || hDeg >= 270) {
        fRh = k3 * Math.abs(Math.cos(hDeg * (Math.PI / 180))) + k4;
    }
    return L + (fBYh + fRh) * C;
};

/** Reverse L_EAL to get CIELAB Lightness (L). */
export const fromLightnessEAL = (brightness: number, lab: number[]): number => {
    const [, a, b] = lab;
    const C = Math.sqrt(a * a + b * b);
    const hRad = Math.atan2(b, a);
    const hDeg = (hRad * 180 / Math.PI + 360) % 360;

    const k1 = 0.1644, k2 = 0.0603, k3 = 0.1307, k4 = 0.0060;
    const fBYh = k1 * Math.abs(Math.sin(((hDeg - 90) / 2) * (Math.PI / 180))) + k2;

    let fRh = 0;
    if (hDeg <= 90 || hDeg >= 270) {
        fRh = k3 * Math.abs(Math.cos(hDeg * (Math.PI / 180))) + k4;
    }
    return Math.max(0, brightness - (fBYh + fRh) * C);
};


/** Convert LCH to CIELAB coordinates. */
export const lchToLab = (lch: number[]): number[] => {
    const [L, C, h] = lch;
    const hRad = (h * Math.PI) / 180;
    return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
};

/** Convert linear sRGB to CIELAB (D65) */
export const rgbToLab = (rgb: number[]): number[] => {
    const [r, g, b] = rgb;

    // sRGB → XYZ (D65)
    const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
    const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
    const z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;

    // D65 reference white
    const Xn = 0.95047;
    const Yn = 1.00000;
    const Zn = 1.08883;

    const f = (t: number) =>
        t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);

    const fx = f(x / Xn);
    const fy = f(y / Yn);
    const fz = f(z / Zn);

    return [
        116 * fy - 16,
        500 * (fx - fy),
        200 * (fy - fz),
    ];
};

/** Convert CIELAB (D65) to linear sRGB */
export const labToRgb = (lab: number[]): number[] => {
    const [L, a, b] = lab;

    const fy = (L + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;

    const fInv = (t: number) =>
        t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787;

    // D65 reference white
    const Xn = 0.95047;
    const Yn = 1.00000;
    const Zn = 1.08883;

    const x = fInv(fx) * Xn;
    const y = fInv(fy) * Yn;
    const z = fInv(fz) * Zn;

    // XYZ (D65) → sRGB
    return [
        3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
        -0.9692660 * x + 1.8760108 * y + 0.0415560 * z,
        0.0556434 * x - 0.2040259 * y + 1.0572252 * z,
    ];
};

/** Convert CIELAB to LCH coordinates. */
export const labToLch = (lab: number[]): number[] => {
    const [L, a, b] = lab;
    const C = Math.sqrt(a * a + b * b);
    if (C < 0.0001) return [L, 0, 0];

    const hRad = Math.atan2(b, a);
    let hDeg = (hRad * 180 / Math.PI + 360) % 360;
    if (hDeg >= 359.9999) hDeg = 0;

    return [L, C, hDeg];
};
/** Calculate color difference using CIEDE2000 formula. */
export const calcDeltaE2000 = (lab1: number[], lab2: number[]): number => {
    const [L1, a1, b1] = lab1, [L2, a2, b2] = lab2;
    const avgL = (L1 + L2) / 2;
    const C1 = Math.sqrt(a1 * a1 + b1 * b1), C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const avgC = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));
    const a1p = a1 * (1 + G), a2p = a2 * (1 + G);
    const C1p = Math.sqrt(a1p * a1p + b1 * b1), C2p = Math.sqrt(a2p * a2p + b2 * b2);
    const avgCp = (C1p + C2p) / 2;
    const h1p = Math.atan2(b1, a1p) * 180 / Math.PI + (Math.atan2(b1, a1p) < 0 ? 360 : 0);
    const h2p = Math.atan2(b2, a2p) * 180 / Math.PI + (Math.atan2(b2, a2p) < 0 ? 360 : 0);
    let dhp = h2p - h1p;
    if (Math.abs(dhp) > 180) dhp += (h2p <= h1p ? 360 : -360);
    const avgHp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;
    const T = 1 - 0.17 * Math.cos((avgHp - 30) * Math.PI / 180) + 0.24 * Math.cos(2 * avgHp * Math.PI / 180) + 0.32 * Math.cos((3 * avgHp + 6) * Math.PI / 180) - 0.2 * Math.cos((4 * avgHp - 63) * Math.PI / 180);
    const dLp = L2 - L1, dCp = C2p - C1p;
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2 * Math.PI / 180);
    const SL = 1 + (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
    const SC = 1 + 0.045 * avgCp, SH = 1 + 0.015 * avgCp * T;
    const dtheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2));
    const RC = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
    const RT = -RC * Math.sin(2 * dtheta * Math.PI / 180);
    return Math.sqrt(Math.pow(dLp / SL, 2) + Math.pow(dCp / SC, 2) + Math.pow(dHp / SH, 2) + RT * (dCp / SC) * (dHp / SH));
};

/** Convert CSS rgb() string to linear RGB. */
export const cssRgbToRgb = (css: string): number[] => {
    const m = css.match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3) throw new Error("Invalid CSS rgb()");

    const toLinear = (c: number) => {
        const v = c / 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return [toLinear(Number(m[0])), toLinear(Number(m[1])), toLinear(Number(m[2]))];
};



/**
 * Create a Monotone Cubic Hermite Interpolator.
 * Ensures monotonicity is preserved between points.
 * Fritsch, F. N., & Carlson, R. E. (1980). Monotone piecewise cubic interpolation. *SIAM Journal on Numerical Analysis*, 17(2), 238–246.
 */

export const createMonotone = (points: number[][]) => {
    if (points.length < 1) return (_t: number) => 0;

    const sorted = [...points].sort((a, b) => a[0] - b[0]);
    const uniquePoints: number[][] = [];

    for (let i = 0; i < sorted.length; i++) {
        if (i === 0 || sorted[i][0] !== sorted[i - 1][0]) {
            uniquePoints.push(sorted[i]);
        }
    }

    const n = uniquePoints.length;
    if (n === 1) return (_t: number) => uniquePoints[0][1];

    const x = uniquePoints.map(p => p[0]);
    const y = uniquePoints.map(p => p[1]);
    const h: number[] = [];
    const secants: number[] = [];

    for (let i = 0; i < n - 1; i++) {
        h[i] = x[i + 1] - x[i];
        secants[i] = (y[i + 1] - y[i]) / h[i];
    }

    const m: number[] = new Array(n);
    m[0] = secants[0];
    m[n - 1] = secants[n - 2];

    for (let i = 1; i < n - 1; i++) {
        const d0 = secants[i - 1];
        const d1 = secants[i];
        if (d0 * d1 <= 0) {
            m[i] = 0;
        } else {
            const alpha = (1 + h[i] / (h[i - 1] + h[i])) / 3;
            m[i] = (d0 * d1) / ((1 - alpha) * d0 + alpha * d1);
        }
    }

    return (t: number): number => {
        if (t <= x[0]) return y[0];
        if (t >= x[n - 1]) return y[n - 1];

        let low = 0;
        let high = n - 2;
        let i = 0;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (t >= x[mid] && t <= x[mid + 1]) {
                i = mid;
                break;
            }
            if (t < x[mid]) high = mid - 1;
            else low = mid + 1;
        }

        const dx = h[i];
        const s = (t - x[i]) / dx;
        const s2 = s * s;
        const s3 = s2 * s;
        const m0 = m[i] * dx;
        const m1 = m[i + 1] * dx;

        return (2 * s3 - 3 * s2 + 1) * y[i] +
            (s3 - 2 * s2 + s) * m0 +
            (-2 * s3 + 3 * s2) * y[i + 1] +
            (s3 - s2) * m1;
    };
};

/** Calculate Root Mean Square (RMS) of an array. */
export function rootMeanSquare(values: number[]): number {
    const n = values.length;
    if (n === 0) return 0;

    let sumSq = 0;
    for (let i = 0; i < n; i++) {
        sumSq += values[i] * values[i];
    }
    return Math.sqrt(sumSq / n);
}

/** Calculate min, max, and average of an array. */
export const calcStatistics = (array: number[]) => {
    const n = array.length;
    if (n === 0) return { min: 0, max: 0, avg: 0 };

    let min = array[0];
    let max = array[0];
    let sum = 0;

    for (let i = 0; i < n; i++) {
        const v = array[i];
        if (v < min) min = v;
        if (v > max) max = v;
        sum += v;
    }

    return { min, max, avg: sum / n };
};

/** Calculate geometric mean score (0-100) from metrics. */
export const calcScore = (metrics: number[]): number => {
    const n = metrics.length;
    if (n === 0) return 0;

    const eps = 1e-6;
    const product = metrics.reduce((acc, score) => acc * (score + eps), 1);
    const globalScore = Math.pow(product, 1 / n);
    const result = Math.max(0, Math.min(1, globalScore));
    return parseFloat((result * 100).toFixed(2));
};