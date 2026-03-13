import { describe, expect, it } from "vitest";
import {
    calcDeltaE2000,
    calcScore,
    createMonotone,
    hexToRgb,
    labToLch,
    rgbToHex,
    rgbToLab,
} from "../src/utils.js";

describe("utils", () => {
    it("converts hex to rgb and back", () => {
        const rgb = hexToRgb("#ffffff");

        expect(rgb).toEqual([1, 1, 1]);
        expect(rgbToHex(rgb)).toBe("#ffffff");
    });

    it("converts rgb to lab and lch", () => {
        const lab = rgbToLab(hexToRgb("#ff0000"));
        const lch = labToLch(lab);

        expect(lab[0]).toBeGreaterThan(0);
        expect(lch[1]).toBeGreaterThan(0);
        expect(lch[2]).toBeGreaterThanOrEqual(0);
        expect(lch[2]).toBeLessThan(360);
    });

    it("returns zero deltaE for identical colors", () => {
        const lab = rgbToLab(hexToRgb("#3b82f6"));
        expect(calcDeltaE2000(lab, lab)).toBeCloseTo(0);
    });

    it("creates a monotone interpolator", () => {
        const spline = createMonotone([[0, 0], [1, 10], [2, 20]]);

        expect(spline(0)).toBe(0);
        expect(spline(2)).toBe(20);
        expect(spline(1.5)).toBeGreaterThan(10);
    });

    it("calculates a bounded score", () => {
        expect(calcScore([1, 1, 1])).toBe(100);
        expect(calcScore([0.5, 0.5, 0.5])).toBeGreaterThan(0);
        expect(calcScore([0.5, 0.5, 0.5])).toBeLessThan(100);
    });
});
