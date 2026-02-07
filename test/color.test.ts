import { describe, it, expect } from 'vitest';
import * as colorUtils from '../src/color.js';

describe('Color Utilities', () => {
    it('should convert Hex to RGB and back', () => {
        const hex = '#ff5733';
        const rgb = colorUtils.hexToRgb(hex);
        const backToHex = colorUtils.rgbToHex(rgb);
        expect(backToHex).toBe(hex);
    });

    it('should calculate correct relative luminance', () => {
        const white = [1, 1, 1];
        const black = [0, 0, 0];
        expect(colorUtils.getRelativeLuminance(white)).toBeCloseTo(1, 5);
        expect(colorUtils.getRelativeLuminance(black)).toBe(0);
    });

    it('should maintain consistency in EAL lightness round-trip', () => {
        const lab = [50, 20, 30];
        const eal = colorUtils.toLightnessEAL(lab);
        const backToL = colorUtils.fromLightnessEAL(eal, lab);
        expect(backToL).toBeCloseTo(50, 4);
    });

    it('should convert Lab to LCH and back', () => {
        const lab = [60, 40, 50];
        const lch = colorUtils.labToLch(lab);
        const backToLab = colorUtils.lchToLab(lch);

        expect(backToLab[0]).toBeCloseTo(lab[0]);
        expect(backToLab[1]).toBeCloseTo(lab[1]);
        expect(backToLab[2]).toBeCloseTo(lab[2]);
    });

    it('should calculate zero difference for the same color', () => {
        const lab = [50, 10, 10];
        expect(colorUtils.calcDeltaE2000(lab, lab)).toBe(0);
    });

    it('should parse CSS rgb strings correctly', () => {
        const css = 'rgb(255, 255, 255)';
        const linearRgb = colorUtils.cssRgbToRgb(css);
        expect(linearRgb).toEqual([1, 1, 1]);
    });

    it('should unwrap hue values correctly', () => {
        const hues = [350, 10];
        const unwrapped = colorUtils.unwrapHue(hues);
        expect(unwrapped).toEqual([350, 370]);
    });
});