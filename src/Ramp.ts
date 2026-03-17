import { Swatch } from "./Swatch.js";
import { calcDeltaE2000, calcScore, createMonotone, hexToRgb, rgbToLab } from "./utils.js";

export type ContrastValue = {
    efficiency: number;
    target: number;
    span: number;
    value: number;
};

export type WcagContrasts = Record<30 | 45 | 70, ContrastValue>;
export type ApcaContrasts = Record<45 | 60 | 75, ContrastValue>;

export class Ramp {
    swatches: Swatch[];
    name: string;

    constructor(colors: string[] = [], name = "brand") {
        this.swatches = colors.map((hex) => new Swatch(hex));
        this.name = name;
    }

    get colors() {
        return this.swatches.map((swatch) => swatch.hex);
    }

    get peakChroma() {
        const colors = this.colors.slice(2, -2);
        let bestHex = "";
        let bestChroma = -Infinity;

        for (const hex of colors) {
            const swatch = new Swatch(hex);
            if (swatch.chroma > bestChroma) {
                bestChroma = swatch.chroma;
                bestHex = hex;
            }
        }
        if (bestChroma < 6) return this.colors[Math.ceil(this.steps / 2)];

        return bestHex;
    }

    get steps() {
        return this.colors.length;
    }

    get direction() {
        if (this.colors.length === 0) return "lighten";

        const firstLab = rgbToLab(hexToRgb(this.colors[0]));
        const lastLab = rgbToLab(hexToRgb(this.colors[this.colors.length - 1]));
        return firstLab[0] > lastLab[0] ? "darken" : "lighten";
    }

    get baseColor() {
        if (this.colors.length === 0) return "";
        return this.peakChroma || this.colors[Math.floor(this.colors.length / 2)];
    }

    get baseIndex() {
        if (this.colors.length === 0) return -1;
        return this.colors.findIndex((hex) => hex.toLowerCase() === this.baseColor.toLowerCase());
    }

    get wcag(): WcagContrasts {
        const swatches = this.swatches;
        const total = swatches.length;
        const maxGap = total - 1;
        const contrasts = {} as WcagContrasts;

        for (const level of [30, 45, 70] as const) {
            const target = level / 10;
            let span = maxGap;
            let value = 0;

            for (let k = 1; k < total; k++) {
                let currentKMin = Infinity;

                for (let i = 0; i < total - k; i++) {
                    const l1 = swatches[i].luminance;
                    const l2 = swatches[i + k].luminance;
                    const result = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                    if (result < currentKMin) currentKMin = result;
                }

                if (currentKMin >= target) {
                    span = k;
                    value = currentKMin;
                    break;
                }

                if (k === maxGap) value = currentKMin;
            }

            contrasts[level] = {
                efficiency: span / maxGap,
                target,
                span,
                value,
            };
        }

        return contrasts;
    }

    get apca(): ApcaContrasts {
        const swatches = this.swatches;
        const total = swatches.length;
        const maxGap = total - 1;
        const contrasts = {} as ApcaContrasts;

        const apcaContrast = (yText: number, yBg: number) => {
            const Bc = 0.022, Bl = 1.414;
            const txt = yText < Bc ? yText + Math.pow(Bc - yText, Bl) : yText;
            const bg = yBg < Bc ? yBg + Math.pow(Bc - yBg, Bl) : yBg;

            let lc = bg >= txt
                ? (Math.pow(bg, 0.56) - Math.pow(txt, 0.57)) * 114
                : (Math.pow(bg, 0.65) - Math.pow(txt, 0.62)) * 114;

            if (Math.abs(lc) < 10) return 0;
            lc = lc > 0 ? lc - 2.7 : lc + 2.7;
            return Math.round(lc);
        };

        for (const level of [45, 60, 75] as const) {
            const target = level;
            let span = maxGap;
            let value = 0;

            for (let k = 1; k < total; k++) {
                let currentKMin = Infinity;

                for (let i = 0; i < total - k; i++) {
                    const bg = swatches[i].luminance > swatches[i + k].luminance ? swatches[i].luminance : swatches[i + k].luminance;
                    const text = swatches[i].luminance > swatches[i + k].luminance ? swatches[i + k].luminance : swatches[i].luminance;
                    const result = Math.abs(apcaContrast(text, bg));
                    if (result < currentKMin) currentKMin = result;
                }

                if (currentKMin >= target) {
                    span = k;
                    value = currentKMin;
                    break;
                }

                if (k === maxGap) value = currentKMin;
            }

            contrasts[level] = {
                efficiency: span / maxGap,
                target,
                span,
                value,
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

    get deltaECurve() {
        const values = [0];

        for (let i = 1; i < this.swatches.length; i++) {
            const de00 = calcDeltaE2000(this.swatches[i - 1].lab, this.swatches[i].lab);
            values.push(values[i - 1] + de00);
        }

        return values;
    }

    get unwrapHues() {
        const hues = this.swatches.map((swatch) => swatch.hue).slice(1, -1);
        if (hues.length === 0) return [];

        const result = [hues[0]];
        for (let i = 1; i < hues.length; i++) {
            let diff = hues[i] - hues[i - 1];
            if (diff > 180) diff -= 360;
            else if (diff < -180) diff += 360;
            result.push(result[i - 1] + diff);
        }
        return result;
    }

    get lightnessLinearity() {
        const values = this.swatches.map((swatch) => swatch.lightness);
        const n = values.length;
        if (n < 2) return 1;

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumXX += i * i;
        }

        const denominator = n * sumXX - sumX * sumX;
        if (Math.abs(denominator) < 1e-10) return 1;

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;
        const fitRange = Math.abs(slope * (n - 1));
        if (fitRange < 1e-3) return 1;

        let sumSqError = 0;
        let sumSqMaxError = 0;
        for (let i = 0; i < n; i++) {
            const target = slope * i + intercept;
            const error = values[i] - target;
            sumSqError += error * error;

            const maxDiff = Math.max(
                target - Math.min(intercept, slope * (n - 1) + intercept),
                Math.max(intercept, slope * (n - 1) + intercept) - target
            );
            sumSqMaxError += maxDiff * maxDiff;
        }

        return Math.max(0, Math.min(1, 1 - (Math.sqrt(sumSqError / n) / Math.sqrt(sumSqMaxError / n))));
    }

    get chromaSmoothness() {
        const values = this.swatches.map((swatch) => swatch.chroma);
        const n = values.length;
        if (n < 3) return 1;

        const cRef = 133.8;
        const cMaxInput = Math.max(...values);
        if (cMaxInput <= 1e-2) return 1;

        const normalized = values.map((value) => (value / cMaxInput) * cRef);
        const cMin = Math.min(...normalized);
        const cMax = Math.max(...normalized);
        const peakIndex = normalized.findIndex((value) => value === cMax);
        const spline = createMonotone([[0, normalized[0]], [peakIndex, cMax], [n - 1, normalized[n - 1]]]);

        let sumSqErr = 0;
        let sumSqMaxErr = 0;
        for (let i = 0; i < n; i++) {
            const target = spline(i);
            const err = normalized[i] - target;
            sumSqErr += err * err;
            sumSqMaxErr += Math.pow(Math.max(target - cMin, cMax - target), 2);
        }

        return Math.max(0, Math.min(1, 1 - (Math.sqrt(sumSqErr / n) / Math.sqrt(sumSqMaxErr / n))));
    }

    get spacingUniformity() {
        const values = this.deltaECurve;
        const n = values.length;
        if (n < 2) return 1;

        const deltas: number[] = [];
        for (let i = 1; i < n; i++) {
            const d = values[i] - values[i - 1];
            if (d < 0) return 0;
            deltas.push(d);
        }

        const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
        if (mean <= 1e-6) return 0;

        let sumSq = 0;
        for (const d of deltas) sumSq += Math.pow(d - mean, 2);

        const cv = Math.sqrt(sumSq / deltas.length) / mean;
        return Math.max(0, Math.min(1, 1 / (1 + cv)));
    }

    get hueStability() {
        const values = this.unwrapHues;
        const n = values.length;
        if (n < 2) return 1;

        const ref = values[this.baseIndex - 1] ?? this.swatches[this.baseIndex]?.hue ?? 0;

        let sumSqError = 0;
        let sumSqMaxError = 0;
        for (let i = 0; i < n; i++) {
            let d = Math.abs(values[i] - ref) % 360;
            if (d > 180) d = 360 - d;
            sumSqError += d * d;
            const maxD = (i / (n - 1)) * 180;
            sumSqMaxError += maxD * maxD;
        }

        return Math.max(0, Math.min(1, 1 - (Math.sqrt(sumSqError / n) / (Math.sqrt(sumSqMaxError / n) || 1))));
    }

    get contrastEfficiency() {
        const span = this.wcag[45].span;
        const steps = this.steps;
        if (steps <= 1) return 1;

        const lambda = 0.5;
        const density = span / steps;
        const targetDensity = lambda * ((steps - 1) / steps);

        if (density <= targetDensity) return 1;
        if (density >= 1.0) return 0;

        return (1 - density) / (1 - targetDensity);
    }

    get metrics() {
        return {
            lightnessLinearity: this.lightnessLinearity,
            chromaSmoothness: this.chromaSmoothness,
            spacingUniformity: this.spacingUniformity,
            hueStability: this.hueStability,
            contrastEfficiency: this.contrastEfficiency,
        };
    }

    get score() {
        return calcScore(Object.values(this.metrics));
    }
}
