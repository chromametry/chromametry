import { MonochromaticPaletteData } from "../../../src/index.js";
import { red, volcano, gold, yellow, lime, green, cyan, blue, geekblue, purple, magenta, grey } from '@ant-design/colors';

let colors: Record<string, string[]> = { red, volcano, gold, yellow, lime, green, cyan, blue, geekblue, purple, magenta, grey }

for (let name in colors) {
    colors[name].unshift("#ffffff")
    colors[name].push("#000000")
    colors[name] = colors[name].map(c => c.toLocaleLowerCase())
}
const stepNames = Object.keys(Object.values(colors)[0])
const ant: MonochromaticPaletteData = {
    name: "Ant Design",
    stepNames,
    colors
};

export default ant;