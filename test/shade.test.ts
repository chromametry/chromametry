import { describe, expect, it } from "vitest";
import { Shade } from "../src/Shade.js";

describe("Shade", () => {
    it("exposes the main derived color properties", () => {
        const shade = new Shade("#ffffff");

        expect(shade.hex).toBe("#ffffff");
        expect(shade.rgb).toEqual([1, 1, 1]);
        expect(shade.chroma).toBe(0);
        expect(shade.wcag).toBe(1);
        expect(shade.apca).toBe(0);
    });

    it("keeps hue and lightness available for chromatic colors", () => {
        const shade = new Shade("#ff0000");

        expect(shade.lightness).toBeGreaterThan(0);
        expect(shade.chroma).toBeGreaterThan(0);
        expect(shade.hue).toBeGreaterThanOrEqual(0);
        expect(shade.hue).toBeLessThan(360);
    });
});
