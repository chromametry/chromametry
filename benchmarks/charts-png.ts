import fs from "fs";
import path from "path";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const WIDTH = 900;
const HEIGHT = 450;

const METRICS = [
    { key: "lightness", label: "Lightness (L*)" },
    { key: "chroma", label: "Chroma (C*)" },
    { key: "hue", label: "Hue Angle (h°)" },
    { key: "cumDeltaE00", label: "Cumulative ΔE2000" }
];

const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: WIDTH,
    height: HEIGHT,
    backgroundColour: "white"
});

export async function chartsPNG(item: any, outDir = "paper/figures") {
    const OUT = path.resolve(process.cwd(), outDir);
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    for (const { key, label } of METRICS) {
        const configuration = {
            type: "line",
            data: {
                labels: item.scales[0].shades.map((_, i) => i),
                datasets: item.scales.map(s => ({
                    label: s.name,
                    data: key === "hue"
                        ? s.shades.slice(1, -1).map((m, i) => ({ x: i + 1, y: m[key] }))
                        : s.shades.map((m, i) => ({ x: i, y: m[key] })),
                    borderColor: s.shades[s.baseIndex].hex,
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                }))
            },
            options: {
                responsive: false,
                animation: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: label,
                            color: "#000000",
                            font: {
                                size: 24,
                                family: "'Times New Roman','Nimbus Roman','Liberation Serif',serif",
                            }
                        },
                        ticks: {
                            color: "#2d2d2d",
                            font: {
                                size: 22,
                                family: "'Times New Roman','Nimbus Roman','Liberation Serif',serif",
                            }
                        }
                    },
                    x: {
                        ticks: {
                            color: "#2d2d2d",
                            font: {
                                size: 22,
                                family: "'Times New Roman','Nimbus Roman','Liberation Serif',serif",
                            },
                        }
                    }
                }
            }
        };
        const buffer = await chartJSNodeCanvas.renderToBuffer(configuration as any);

        const file = path.join(OUT, `${item.name.toLowerCase().replace(/\s+/g, '-')}-chart-${key}.png`);
        fs.writeFileSync(file, buffer);
    }
}