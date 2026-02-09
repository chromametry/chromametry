// src/color.ts

/** Calculate relative luminance from linear RGB (0-1). */
export const getRelativeLuminance = (rgb: number[]): number => {
    const [r, g, b] = rgb;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const lrgbToSrgb = (rgb: number[]) => {
    const toSRGB = (c: number) => {
        const clamped = Math.max(0, Math.min(1, c));
        const s = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(s * 255)));
    };
    return rgb.map(toSRGB);
}

export const srgbToLrgb = (rgb: number[]) => {
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

/** Find the Hex color with the highest Chroma in a list. */
export const findMaxChromaHex = (scale: string[]) => {
    let bestHex = "";
    let bestC = -Infinity;
    for (const hex of scale) {
        const oklab = rgbToLab(hexToRgb(hex));
        const [, C] = labToLch(oklab);
        if (C > bestC) {
            bestC = C;
            bestHex = hex;
        }
    }
    return bestHex;
};

/** Normalize hue values to prevent large jumps during interpolation. */
export function unwrapHue(hues: number[]): number[] {
    const result = [hues[0]];
    for (let i = 1; i < hues.length; i++) {
        let diff = hues[i] - hues[i - 1];
        if (diff > 180) diff -= 360;
        else if (diff < -180) diff += 360;
        result.push(result[i - 1] + diff);
    }
    return result;
}

/** Simulate Protanopia (red-blindness) on linear RGB. */
export function simulateProtanopia(rgb: number[]): number[] {
    const [r, g, b] = rgb;
    return [
        0.152286 * r + 1.052583 * g - 0.204868 * b,
        0.114503 * r + 0.786281 * g + 0.099216 * b,
        -0.003882 * r - 0.048116 * g + 1.051998 * b
    ];
}

/** Simulate Deuteranopia (green-blindness) on linear RGB. */
export function simulateDeuteranopia(rgb: number[]): number[] {
    const [r, g, b] = rgb;
    return [
        0.367322 * r + 0.860646 * g - 0.227968 * b,
        0.280085 * r + 0.672501 * g + 0.047413 * b,
        -0.011820 * r + 0.042940 * g + 0.968881 * b
    ];
}

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

