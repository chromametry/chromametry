import { describe, it, expect } from 'vitest';
import * as contrastUtils from '../src/contrast.js';

describe('Contrast Analytics', () => {
    it('should calculate WCAG and APCA correctly', () => {
        // WCAG: White on Black is 21
        expect(contrastUtils.getWcagContrast(1, 0)).toBeCloseTo(21);

        // APCA: Black text (0) on White bg (1)
        const apcaScore = contrastUtils.getApcaContrast(0, 1); 
        // Based on your clamp logic, 0 vs 1 yields -96
        expect(apcaScore).toBe(-96);
    });

    it('should return 0 for identical colors in APCA', () => {
        expect(contrastUtils.getApcaContrast(0.5, 0.5)).toBe(0);
    });

    it('should calculate monochrome metrics and targets', () => {
        const mockMetrics = [
            { luminance: 1.0 },
            { luminance: 0.1 }
        ] as any;

        const results = contrastUtils.getMonochromaticContrasts(mockMetrics);
        
        expect(results['wcag45'].target).toBe(4.5);
        expect(results['apca60'].target).toBe(60);
    });
});