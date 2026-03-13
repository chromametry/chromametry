import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { chartsPNG } from "./charts-png.js";

import { Palette } from "../src/index.js";

const BENCH_BASE = path.resolve("benchmark");

async function generatePalettes() {
    const INPUT_DIR = path.join(BENCH_BASE, "input");
    const OUTPUT_DIR = path.join(BENCH_BASE, "output");
    const PALETTES_DIR = path.join(OUTPUT_DIR, "palettes");

    // Clear and ensure PALETTES_DIR exists
    if (fs.existsSync(PALETTES_DIR)) {
        fs.rmSync(PALETTES_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(PALETTES_DIR, { recursive: true });

    const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.ts'));

    const PALETTES = await Promise.all(
        files.map(async (file) => {
            const fileUrl = pathToFileURL(path.join(INPUT_DIR, file)).href;
            const module = await import(fileUrl);
            return module.default ?? module;
        })
    );

    let palettes = PALETTES.map(pal => {
        
        const palette = new Palette(pal.colors, pal.name);
        let data = {
            steps: palette.steps,
            name: palette.name,
            metrics: palette.metrics,
            score: palette.score,
            wcag: palette.wcag,
            ramps: palette.ramps.map(ramp => ({
                name: ramp.name,
                baseIndex: ramp.baseIndex,
                colors: ramp.colors,
                metrics: ramp.metrics,
                score: ramp.score,
                wcag: ramp.wcag,
                chart: {
                    lightness: ramp.shades.map(shade => shade.lightness),
                    chroma: ramp.shades.map(shade => shade.chroma),
                    hue: ramp.shades.map(shade => shade.hue).slice(1, -1),
                    cumDeltaE00: ramp.deltaECurve,
                }
            })),
        };
        const fileName = `${palette.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        fs.writeFileSync(path.join(PALETTES_DIR, fileName), JSON.stringify(data, null, 2));
        console.log(`Generated ${pal.name}...`)
        return data;
    })

    // Save summary files
    fs.writeFileSync(path.join(OUTPUT_DIR, "data.json"), JSON.stringify(palettes, null, 2));
    fs.writeFileSync(path.join(OUTPUT_DIR, "data.js"), `window.BENCHMARK_DATA = ${JSON.stringify(palettes)};`);
    return palettes
}

export async function generate() {
    try {
        const DATA = await generatePalettes();
        await chartsPNG(DATA[0]);
        console.log(`\n✔ Benchmark complete`);
    } catch (error) {
        console.error(error);
    }
}

generate();
