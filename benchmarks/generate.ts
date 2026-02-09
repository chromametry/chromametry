import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { chartsPNG } from "./charts-png.js";

import { analyzeMonochromaticPalette, calcStatistics } from "../src/index.js";

const BENCH_BASE = path.resolve("benchmarks");

async function generateMonochromaticPalettes() {
    const INPUT_DIR = path.join(BENCH_BASE, "monochromatic/input");
    const OUTPUT_DIR = path.join(BENCH_BASE, "monochromatic/output");
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

    const items = [];
    const statistics: Record<string, number[]> = {};
    const metrics = ["contrastEfficiency", "lightnessLinearity", "chromaSmoothness", "hueStability", "spacingUniformity"];

    for (const palette of PALETTES) {
        console.log(`▶ Processing: ${palette.name}`);
        const item = analyzeMonochromaticPalette(palette);
        items.push(item);

        // Save individual palette file
        const fileName = `${palette.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        fs.writeFileSync(path.join(PALETTES_DIR, fileName), JSON.stringify(item, null, 2));

        // Collect stats
        item.scales.forEach((s: any) => {
            metrics.forEach(m => {
                statistics[m] ||= [];
                statistics[m].push(s.metrics[m]);
            });
            statistics.score ||= [];
            statistics.score.push(s.score);
        });
    }

    // Finalize statistics
    const finalStats: Record<string, any> = {};
    for (const key in statistics) {
        finalStats[key] = calcStatistics(statistics[key]);
    }

    const database = {
        statistics: finalStats,
        items,
    };

    // Save summary files
    fs.writeFileSync(path.join(OUTPUT_DIR, "data.json"), JSON.stringify(database, null, 2));
    fs.writeFileSync(path.join(OUTPUT_DIR, "data.js"), `window.BENCHMARK_DATA = ${JSON.stringify(database)};`);
    return database
}

export async function generate() {
    try {
        const DATA = await generateMonochromaticPalettes();
        await chartsPNG(DATA.items[0]);
        console.log(`\n✔ Benchmark complete`);
    } catch (error) {
        console.error(error);
    }
}

generate();