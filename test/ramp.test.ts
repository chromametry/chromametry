import { describe, expect, it } from "vitest";
import { Ramp } from "../src/Ramp.js";

describe("Ramp", () => {
    const colors = ["#ffffff", "#bfbfbf", "#808080", "#404040", "#000000"];

    it("builds a ramp from ordered colors", () => {
        const ramp = new Ramp(colors, "gray");

        expect(ramp.name).toBe("gray");
        expect(ramp.colors).toEqual(colors);
        expect(ramp.shades).toHaveLength(colors.length);
        expect(ramp.steps).toBe(colors.length);
        expect(ramp.baseIndex).toBe(2);
    });

    it("exposes the main contrast and metric outputs", () => {
        const ramp = new Ramp(colors);

        expect(ramp.wcag[45].target).toBe(4.5);
        expect(ramp.wcag[45].span).toBeGreaterThan(0);
        expect(ramp.deltaECurve).toHaveLength(colors.length);
        expect(ramp.spacingUniformity).toBeGreaterThanOrEqual(0);
        expect(ramp.spacingUniformity).toBeLessThanOrEqual(1);
        expect(ramp.contrastEfficiency).toBeGreaterThanOrEqual(0);
        expect(ramp.contrastEfficiency).toBeLessThanOrEqual(1);
        expect(ramp.score).toBeGreaterThan(0);
    });
});
