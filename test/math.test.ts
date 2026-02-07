import { describe, it, expect } from 'vitest';
import * as mathUtils from '../src/math.js';

describe('Math Utilities', () => {
    it('should calculate RMS correctly', () => {
        // Correct RMS for [3, 4] is sqrt((9+16)/2) = 3.5355...
        expect(mathUtils.rootMeanSquare([3, 4])).toBeCloseTo(3.5355, 4);
    });

    it('should calculate statistics correctly', () => {
        const stats = mathUtils.calcStatistics([10, 20, 30]);
        expect(stats).toEqual({ min: 10, max: 30, avg: 20 });
    });

    it('should calculate global score correctly', () => {
        // Geometric mean of [0.8, 0.8] is 0.8 -> 80
        expect(mathUtils.calcScore([0.8, 0.8])).toBe(80);
    });

    it('should handle monotone interpolation', () => {
        const points = [[0, 0], [1, 1], [2, 0]];
        const interp = mathUtils.createMonotone(points);
        expect(interp(0)).toBe(0);
        expect(interp(1)).toBe(1);
        expect(interp(2)).toBe(0);
    });
});