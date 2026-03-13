import { ApcaContrasts, Ramp, WcagContrasts } from "./Ramp.js";
import { rgbToLab, hexToRgb, calcScore, rootMeanSquare } from "./utils.js";

export type PaletteMetrics = {
    contrastEfficiency: number;
    lightnessLinearity: number;
    chromaSmoothness: number;
    hueStability: number;
    spacingUniformity: number;
};

export class Palette {
    ramps: Ramp[];
    name: string;

    constructor(colors: Record<string, string[]> = {}, name = "palette") {
        this.ramps = Object.entries(colors).map(([rampName, rampColors]) => new Ramp(rampColors, rampName));
        this.name = name;
    }

    get colors() {
        return Object.fromEntries(this.ramps.map((ramp) => [ramp.name, ramp.colors]));
    }

    get steps() {
        return this.ramps[0]?.steps || 0;
    }

    get direction() {
        const first = this.ramps[0]?.colors;
        if (!first?.length) return "lighten";

        const firstLab = rgbToLab(hexToRgb(first[0]));
        const lastLab = rgbToLab(hexToRgb(first[first.length - 1]));
        return firstLab[0] > lastLab[0] ? "darken" : "lighten";
    }

    get wcag(): WcagContrasts {
        const contrasts = {} as WcagContrasts;

        for (const level of [30, 45, 70] as const) {
            const scaleContrasts = this.ramps.map((ramp) => ramp.wcag[level]);
            const steps = this.ramps[0]?.steps || 0;
            const span = Math.max(...scaleContrasts.map((contrast) => contrast?.span || 0));
            const sum = scaleContrasts.reduce((acc, contrast) => acc + (contrast?.value || 0), 0);
            const sample = scaleContrasts[0];

            contrasts[level] = {
                target: sample?.target || 0,
                span,
                value: sum / (this.ramps.length || 1),
                efficiency: span / (steps - 1 || 1),
            };
        }

        return contrasts;
    }

    get apca(): ApcaContrasts {
        const contrasts = {} as ApcaContrasts;

        for (const level of [45, 60, 75] as const) {
            const scaleContrasts = this.ramps.map((ramp) => ramp.apca[level]);
            const steps = this.ramps[0]?.steps || 0;
            const span = Math.max(...scaleContrasts.map((contrast) => contrast?.span || 0));
            const sum = scaleContrasts.reduce((acc, contrast) => acc + (contrast?.value || 0), 0);
            const sample = scaleContrasts[0];

            contrasts[level] = {
                target: sample?.target || 0,
                span,
                value: sum / (this.ramps.length || 1),
                efficiency: span / (steps - 1 || 1),
            };
        }

        return contrasts;
    }

    get contrasts() {
        return {
            wcag: this.wcag,
            apca: this.apca,
        };
    }

    get metrics(): PaletteMetrics {
        return {
            contrastEfficiency: rootMeanSquare(this.ramps.map((ramp) => ramp.contrastEfficiency)),
            lightnessLinearity: rootMeanSquare(this.ramps.map((ramp) => ramp.lightnessLinearity)),
            chromaSmoothness: rootMeanSquare(this.ramps.map((ramp) => ramp.chromaSmoothness)),
            hueStability: rootMeanSquare(this.ramps.map((ramp) => ramp.hueStability)),
            spacingUniformity: rootMeanSquare(this.ramps.map((ramp) => ramp.spacingUniformity)),
        };
    }

    get score() {
        return calcScore(Object.values(this.metrics));
    }
}
