import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { chartsPNG } from "./charts-png.js";

import { Ramp, calcScore, rootMeanSquare, type WcagContrasts } from "../src/index.js";

const BENCH_BASE = path.resolve("benchmark");

function getPaletteMetrics(ramps: Ramp[]) {
    return {
        contrastEfficiency: rootMeanSquare(ramps.map((ramp) => ramp.contrastEfficiency)),
        lightnessLinearity: rootMeanSquare(ramps.map((ramp) => ramp.lightnessLinearity)),
        chromaSmoothness: rootMeanSquare(ramps.map((ramp) => ramp.chromaSmoothness)),
        hueStability: rootMeanSquare(ramps.map((ramp) => ramp.hueStability)),
        spacingUniformity: rootMeanSquare(ramps.map((ramp) => ramp.spacingUniformity)),
    };
}

function getPaletteWcag(ramps: Ramp[]): WcagContrasts {
    const contrasts = {} as WcagContrasts;

    for (const level of [30, 45, 70] as const) {
        const rampContrasts = ramps.map((ramp) => ramp.wcag[level]);
        const steps = ramps[0]?.steps || 0;
        const span = Math.max(0, ...rampContrasts.map((contrast) => contrast?.span || 0));
        const sum = rampContrasts.reduce((acc, contrast) => acc + (contrast?.value || 0), 0);
        const sample = rampContrasts[0];

        contrasts[level] = {
            target: sample?.target || 0,
            span,
            value: sum / (ramps.length || 1),
            efficiency: span / (steps - 1 || 1),
        };
    }

    return contrasts;
}

async function generatePalettes() {
    const INPUT_DIR = path.join(BENCH_BASE, "input");
    const OUTPUT_DIR = path.join(BENCH_BASE, "output");
    const PALETTES_DIR = path.join(OUTPUT_DIR, "palettes");

    if (fs.existsSync(PALETTES_DIR)) {
        fs.rmSync(PALETTES_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(PALETTES_DIR, { recursive: true });

    const files = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith(".ts"));

    const PALETTES = await Promise.all(
        files.map(async (file) => {
            const fileUrl = pathToFileURL(path.join(INPUT_DIR, file)).href;
            const module = await import(fileUrl);
            return module.default ?? module;
        })
    );

    const palettes = PALETTES.map((pal) => {
        const ramps = Object.entries(pal.colors).map(([rampName, rampColors]) => new Ramp(rampColors, rampName));
        const name = pal.name ?? "palette";
        const steps = ramps[0]?.steps || 0;
        const metrics = getPaletteMetrics(ramps);

        const data = {
            steps,
            name,
            metrics,
            score: calcScore(Object.values(metrics)),
            wcag: getPaletteWcag(ramps),
            ramps: ramps.map((ramp) => ({
                name: ramp.name,
                baseIndex: ramp.baseIndex,
                colors: ramp.colors,
                metrics: ramp.metrics,
                score: ramp.score,
                wcag: ramp.wcag,
                chart: {
                    lightness: ramp.swatches.map((swatch) => swatch.lightness),
                    chroma: ramp.swatches.map((swatch) => swatch.chroma),
                    hue: ramp.swatches.map((swatch) => swatch.hue).slice(1, -1),
                    cumDeltaE00: ramp.deltaECurve,
                },
            })),
        };

        const fileName = `${name.toLowerCase().replace(/\s+/g, "-")}.json`;
        fs.writeFileSync(path.join(PALETTES_DIR, fileName), JSON.stringify(data, null, 2));
        console.log(`Generated ${pal.name}...`);
        return data;
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, "data.json"), JSON.stringify(palettes, null, 2));
    fs.writeFileSync(path.join(OUTPUT_DIR, "data.js"), `window.BENCHMARK_DATA = ${JSON.stringify(palettes)};`);
    return palettes;
}

export async function generate() {
    try {
        const data = await generatePalettes();
        await chartsPNG(data[0]);
        console.log("\nBenchmark complete");
    } catch (error) {
        console.error(error);
    }
}

generate();
