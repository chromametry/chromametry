import { describe, expect, it } from "vitest";
import { Swatch } from "../src/Swatch.js";

describe("Swatch", () => {
    it("exposes the main derived color properties", () => {
        const swatch = new Swatch("#ffffff");

        expect(swatch.hex).toBe("#ffffff");
        expect(swatch.rgb).toEqual([1, 1, 1]);
        expect(swatch.chroma).toBe(0);
        expect(swatch.wcag).toBe(1);
        expect(swatch.apca).toBe(0);
    });

    it("keeps hue and lightness available for chromatic colors", () => {
        const swatch = new Swatch("#ff0000");

        expect(swatch.lightness).toBeGreaterThan(0);
        expect(swatch.chroma).toBeGreaterThan(0);
        expect(swatch.hue).toBeGreaterThanOrEqual(0);
        expect(swatch.hue).toBeLessThan(360);
    });
});
