// src/contrast.ts

import { ColorShade } from "./shade.js";

export type ContrastName = 'wcag20' | 'wcag30' | 'wcag45' | 'wcag70' | 'apca45' | 'apca60' | 'apca75' | 'apca90'

export type Contrast = {
    system: string;
    target: number;
    span: number;
    value: number;
    efficiency: number;
    name: ContrastName;
};

/** Calculate WCAG 2.x contrast ratio. */
export const getWcagContrast = (l1: number, l2: number): number => {
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

/** Calculate APCA Lc (Lightness Contrast) value. */
export const getApcaContrast = (yText: number, yBg: number): number => {
    const clamp = (y: number) => (y > 0.0005 ? y : y + Math.pow(0.0005 - y, 0.8));
    const txt = clamp(yText);
    const bg = clamp(yBg);

    let lc = (Math.pow(txt, 0.56) - Math.pow(bg, 0.56)) * 100;

    if (Math.abs(lc) < 0.1) return 0;
    lc = lc > 0 ? (lc < 1 ? 0 : lc - 0.25) : (lc > -1 ? 0 : lc + 0.25);
    return Math.round(lc);
};

/** Parse contrast system and target from ContrastName. */
function parseContrast(input: ContrastName) {
    const m = input.match(/^(wcag|apca)(\d+)$/);
    if (!m) throw new Error(`Invalid contrast: ${input}`);
    const target = m[1] === "wcag" ? Number(m[2]) / 10 : Number(m[2]);
    return { system: m[1], target };
}

/** Analyze contrast metrics for a single Monochromatic scale. */
export const getMonochromaticContrasts = (metrics: ColorShade[]) => {
    const contrasts: Record<string, Contrast> = {};
    const total = metrics.length;
    const maxGap = total - 1;

    contrastList.forEach(name => {
        const { system, target } = parseContrast(name);
        let span = maxGap;
        let value = 0;

        for (let k = 1; k < total; k++) {
            let currentKMin = Infinity;

            for (let i = 0; i < total - k; i++) {
                const res = system === 'wcag'
                    ? getWcagContrast(metrics[i].luminance, metrics[i + k].luminance)
                    : Math.max(
                        Math.abs(getApcaContrast(metrics[i + k].luminance, metrics[i].luminance)),
                        Math.abs(getApcaContrast(metrics[i].luminance, metrics[i + k].luminance))
                    );
                if (res < currentKMin) currentKMin = res;
            }

            if (currentKMin >= target) {
                span = k;
                value = currentKMin;
                break;
            }
            if (k === maxGap) value = currentKMin;
        }

        contrasts[name] = { system, efficiency: span / maxGap, target, span, value, name };
    });
    return contrasts;
};

export const contrastList: ContrastName[] = [
    'wcag30', 'wcag45', 'wcag70', 'apca45', 'apca60', 'apca75',
];

/** Aggregate contrast metrics across multiple color scales. */
export const getPaletteContrasts = (colorScales: any[]) => {
    const contrasts = {} as Record<ContrastName, Contrast>;

    contrastList.forEach(name => {
        const { target, system } = parseContrast(name);
        const scaleContrasts = colorScales.map(s => s.contrasts[name]);
        const steps = colorScales[0]?.shades.length || 0;
        const span = Math.max(...scaleContrasts.map(m => m?.span || 0));
        const sum = scaleContrasts.reduce((acc, m) => acc + (m?.value || 0), 0);

        contrasts[name] = {
            system,
            target,
            span,
            value: sum / (colorScales.length || 1),
            name,
            efficiency: span / (steps - 1 || 1)
        };
    });
    return contrasts;
};