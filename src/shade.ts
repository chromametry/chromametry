// src/shade.ts

import { toLightnessEAL, hexToRgb, rgbToLab, getRelativeLuminance, labToLch} from "./color.js"
import { getWcagContrast, getApcaContrast} from "./contrast.js"

export type ColorShade = {
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
    cumDeutDeltaE00: number
}

// Constructs a comprehensive color metric object for a single step
export const getColorShade = (hex: string): ColorShade => {
    const rgb = hexToRgb(hex);
    const lab = rgbToLab(rgb);
    const luminance = getRelativeLuminance(rgb);
    const brightness = toLightnessEAL(lab);
    const lch = labToLch(lab);

    return {
        hex,
        rgb,
        lab,
        lch,
        lightness: brightness,
        chroma: lch[1],
        hue: lch[2],
        luminance,
        parameter: 0,
        cumDeltaE00: 0,
        cumProtDeltaE00: 0,
        cumDeutDeltaE00: 0,
        wcag: getWcagContrast(luminance, 1),
        apca: getApcaContrast(luminance, 1),
    };
};

