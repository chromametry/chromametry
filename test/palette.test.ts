import { describe, expect, it } from "vitest";
import { Palette } from "../src/Palette.js";

describe("Palette", () => {
    const colors = {
        gray: ["#ffffff", "#bfbfbf", "#808080", "#404040", "#000000"],
        blue: ["#eff6ff", "#93c5fd", "#3b82f6", "#1d4ed8", "#0f172a"],
    };

    it("builds ramps from a palette map", () => {
        const palette = new Palette(colors, "demo");

        expect(palette.name).toBe("demo");
        expect(palette.ramps).toHaveLength(2);
        expect(palette.colors).toEqual(colors);
        expect(palette.steps).toBe(5);
    });

    it("aggregates palette metrics and contrast outputs", () => {
        const palette = new Palette(colors);

        expect(palette.wcag[45].target).toBe(4.5);
        expect(palette.wcag[45].span).toBeGreaterThan(0);
        expect(palette.score).toBeGreaterThan(0);
    });
});
