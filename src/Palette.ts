import { Ramp, type ApcaContrasts, type WcagContrasts } from "./Ramp.js";
import { calcScore, rootMeanSquare } from "./utils.js";

export type PaletteColors = Record<string, string[]>;

export class Palette {
    ramps: Ramp[];
    name: string;

    constructor(colors: PaletteColors = {}, name = "Collection 1") {
        this.ramps = Object.entries(colors).map(([rampName, rampColors]) => new Ramp(rampColors, rampName));
        this.name = name;
    }

    get colors(): PaletteColors {
        return Object.fromEntries(this.ramps.map((ramp) => [ramp.name, ramp.colors]));
    }

    get steps() {
        return this.ramps[0]?.steps || 0;
    }

    get wcag(): WcagContrasts {
        const contrasts = {} as WcagContrasts;
        const steps = this.steps;

        for (const level of [30, 45, 70] as const) {
            const rampContrasts = this.ramps.map((ramp) => ramp.wcag[level]);
            const span = Math.max(0, ...rampContrasts.map((contrast) => contrast?.span || 0));
            const sum = rampContrasts.reduce((acc, contrast) => acc + (contrast?.value || 0), 0);

            contrasts[level] = {
                target: level / 10,
                span,
                value: sum / (this.ramps.length || 1),
                efficiency: steps > 1 ? span / (steps - 1) : 0,
            };
        }

        return contrasts;
    }

    get apca(): ApcaContrasts {
        const contrasts = {} as ApcaContrasts;
        const steps = this.steps;

        for (const level of [45, 60, 75] as const) {
            const rampContrasts = this.ramps.map((ramp) => ramp.apca[level]);
            const span = Math.max(0, ...rampContrasts.map((contrast) => contrast?.span || 0));
            const sum = rampContrasts.reduce((acc, contrast) => acc + (contrast?.value || 0), 0);

            contrasts[level] = {
                target: level,
                span,
                value: sum / (this.ramps.length || 1),
                efficiency: steps > 1 ? span / (steps - 1) : 0,
            };
        }

        return contrasts;
    }

    get contrastEfficiency() {
        return rootMeanSquare(this.ramps.map((ramp) => ramp.contrastEfficiency));
    }

    get lightnessLinearity() {
        return rootMeanSquare(this.ramps.map((ramp) => ramp.lightnessLinearity));
    }

    get chromaSmoothness() {
        return rootMeanSquare(this.ramps.map((ramp) => ramp.chromaSmoothness));
    }

    get hueStability() {
        return rootMeanSquare(this.ramps.map((ramp) => ramp.hueStability));
    }

    get spacingUniformity() {
        return rootMeanSquare(this.ramps.map((ramp) => ramp.spacingUniformity));
    }

    get score() {
        return calcScore([
            this.contrastEfficiency,
            this.lightnessLinearity,
            this.chromaSmoothness,
            this.hueStability,
            this.spacingUniformity,
        ]);
    }
}
