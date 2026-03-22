import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { chartsPNG } from "./charts-png.js";

import { Palette } from "../src/index.js";

const BENCH_BASE = path.resolve("benchmark");

async function generatePalettes() {
    const INPUT_DIR = path.join(BENCH_BASE, "input");
    const OUTPUT_DIR = path.join(BENCH_BASE, "output");

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const files = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith(".ts"));

    const PALETTES = await Promise.all(
        files.map(async (file) => {
            const fileUrl = pathToFileURL(path.join(INPUT_DIR, file)).href;
            const module = await import(fileUrl);
            return module.default ?? module;
        })
    );

    const palettes = PALETTES.map((pal) => {
        const palette = new Palette(pal.colors, pal.name);

        const data = {
            steps: palette.steps,
            name: palette.name,
            metrics: {
                contrastEfficiency: palette.contrastEfficiency,
                lightnessLinearity: palette.lightnessLinearity,
                chromaSmoothness: palette.chromaSmoothness,
                hueStability: palette.hueStability,
                spacingUniformity: palette.spacingUniformity,
            },
            score: palette.score,
            wcag: palette.wcag,
            ramps: palette.ramps.map((ramp) => ({
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

        console.log(`Generated ${pal.name}...`);
        return data;
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, "data.js"), `window.BENCHMARK_DATA = ${JSON.stringify(palettes)};`);

    const distDir = path.resolve("dist");
    if (fs.existsSync(distDir)) {
        const raw = palettes.map((d: any) => ({
            name: d.name,
            colors: Object.fromEntries(d.ramps.map((r: any) => [r.name, r.colors])),
        }));
        fs.writeFileSync(path.join(distDir, "palettes.js"), `export default ${JSON.stringify(raw)};`);
    }
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
