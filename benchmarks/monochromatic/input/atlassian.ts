// @ts-ignore
import rawTokens from '@atlaskit/tokens/dist/esm/artifacts/palettes-raw/palette.js';
import { MonochromaticPaletteData } from "../../../src/index.js";

interface AtlassianToken {
    value: string;
    path: string[];
    attributes: {
        group: string;
        category: string;
    };
}

const tokens = rawTokens.default as AtlassianToken[];
const rawColors: Record<string, Record<number, string>> = {};

tokens.forEach(token => {
    // Lọc bỏ opacity và các mode không cần thiết
    if (token.attributes?.group === "palette" &&
        token.attributes.category !== "opacity" &&
        !token.attributes.category.includes("mode")) {

        const category = token.attributes.category;

        if (!rawColors[category]) {
            rawColors[category] = {
                0: "#FFFFFF",
                1100: "#000000"
            };
        }

        const levelMatch = token.path[2].match(/\d+/);
        if (levelMatch) {
            const level = parseInt(levelMatch[0]);
            rawColors[category][level] = token.value;
        }
    }
});

const colors: Record<string, string[]> = {};
const sample = Object.values(rawColors)[0];
const stepNames = Object.keys(sample).sort((a, b) => Number(a) - Number(b));

for (const name in rawColors) {
    colors[name] = stepNames.map(step => rawColors[name][Number(step)]);
}

const atlassian: MonochromaticPaletteData = {
    name: "Atlassian",
    stepNames,
    colors,
};

export default atlassian;