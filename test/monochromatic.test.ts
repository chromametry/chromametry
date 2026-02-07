import { describe, it, expect } from 'vitest';
import * as mono from '../src/monochromatic.js';

describe('Monochromatic Analysis', () => {
    const grayScale = ['#ffffff', '#808080', '#000000'];

    it('should calculate metrics for a simple scale', () => {
        const analysis = mono.analyzeMonochromatic(grayScale);
        expect(analysis.score).toBeGreaterThan(0);
        expect(analysis.shades.length).toBe(3);
    });

    it('should measure perfect lightness linearity for linear steps', () => {
        const linearValues = [100, 50, 0];
        const score = mono.calcLightnessLinearity(linearValues);
        expect(score).toBeCloseTo(1);
    });

    it('should measure spacing uniformity', () => {
        const cumulativeDE = [0, 10, 20, 30];
        const score = mono.calcSpacingUniformity(cumulativeDE);
        expect(score).toBeCloseTo(1); // Perfect spacing
    });

    it('should analyze a full palette', () => {
        const palette = {
            name: 'test',
            stepNames: [100, 500, 900],
            colors: {
                gray: grayScale,
                blue: ['#dbeafe', '#3b82f6', '#1e3a8a']
            }
        };
        const result = mono.analyzeMonochromaticPalette(palette);
        expect(result.scales.length).toBe(2);
        expect(result.score).toBeDefined();
    });
});