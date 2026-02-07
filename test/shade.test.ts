import { describe, it, expect } from 'vitest';
import { getColorShade } from '../src/shade.js'; // Giữ nguyên đường dẫn của bạn

describe('Color Shade Initialization', () => {
    it('should calculate correct metrics for white', () => {
        const shade = getColorShade('#ffffff');
        expect(shade.rgb).toEqual([1, 1, 1]);
        expect(shade.luminance).toBeCloseTo(1);
        expect(shade.wcag).toBe(1);
    });

    it('should extract LCH components correctly', () => {
        const shade = getColorShade('#ff0000');
        // Check if chroma and hue are assigned from the correct LCH indices
        expect(shade.chroma).toBe(shade.lch[1]);
        expect(shade.hue).toBe(shade.lch[2]);
    });

    it('should initialize cumulative values to zero', () => {
        const shade = getColorShade('#123456');
        expect(shade.cumDeltaE00).toBe(0);
        expect(shade.cumProtDeltaE00).toBe(0);
        expect(shade.cumDeutDeltaE00).toBe(0);
    });
});