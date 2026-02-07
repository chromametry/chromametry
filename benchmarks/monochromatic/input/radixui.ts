// https://raw.githubusercontent.com/radix-ui/rawColors/refs/heads/main/src/light.ts
import { MonochromaticPaletteData } from "../../../src/index.js";

export const rawColors: Record<string, Record<number, string>> = {
  gray: {
    1: "#fcfcfc", 2: "#f9f9f9", 3: "#f0f0f0", 4: "#e8e8e8",
    5: "#e0e0e0", 6: "#d9d9d9", 7: "#cecece", 8: "#bbbbbb",
    9: "#8d8d8d", 10: "#838383", 11: "#646464", 12: "#202020",
  },

  mauve: {
    1: "#fdfcfd", 2: "#faf8fb", 3: "#f5f2f7", 4: "#ede9ef",
    5: "#e6e1e8", 6: "#dfdae0", 7: "#d3cdd7", 8: "#c1bac7",
    9: "#8e8896", 10: "#837d8b", 11: "#65636d", 12: "#211f26",
  },

  slate: {
    1: "#fbfcfd", 2: "#f8f9fa", 3: "#f1f3f5", 4: "#eceef0",
    5: "#e6e8eb", 6: "#dfe3e6", 7: "#d7dbdf", 8: "#c1c8cd",
    9: "#889096", 10: "#7e868c", 11: "#687076", 12: "#11181c",
  },

  sage: {
    1: "#fbfdfc", 2: "#f7f9f8", 3: "#eef1f0", 4: "#e6e9e8",
    5: "#dfe2e0", 6: "#d7dad9", 7: "#cbcfcd", 8: "#b8bcba",
    9: "#868e8b", 10: "#7c8481", 11: "#5f6563", 12: "#1a211e",
  },

  olive: {
    1: "#fcfdfc", 2: "#f8faf8", 3: "#f2f4f2", 4: "#ecefec",
    5: "#e6e9e6", 6: "#dfe3df", 7: "#d2d7d2", 8: "#bdc3bd",
    9: "#8b918b", 10: "#808780", 11: "#60655f", 12: "#1d211c",
  },

  sand: {
    1: "#fdfdfc", 2: "#f9f9f8", 3: "#f3f3f2", 4: "#eeeeec",
    5: "#e9e9e6", 6: "#e3e3df", 7: "#d6d6d0", 8: "#c0c0b8",
    9: "#90908c", 10: "#868682", 11: "#696965", 12: "#21201c",
  },

  tomato: {
    1: "#fffcfc", 2: "#fff8f7", 3: "#feebe7", 4: "#ffdcd3",
    5: "#ffcdc2", 6: "#fdbdaf", 7: "#f5a898", 8: "#ec8e7b",
    9: "#e54d2e", 10: "#dd4425", 11: "#d13415", 12: "#5c271f",
  },

  red: {
    1: "#fffcfc", 2: "#fff7f7", 3: "#feebec", 4: "#ffdbdc",
    5: "#ffcdce", 6: "#fdbdbe", 7: "#f4a9aa", 8: "#eb8e90",
    9: "#e5484d", 10: "#dc3d43", 11: "#cd2b31", 12: "#381316",
  },

  ruby: {
    1: "#fffcfd", 2: "#fff7f8", 3: "#feeaed", 4: "#ffdce1",
    5: "#ffced6", 6: "#f8bfc8", 7: "#efacb8", 8: "#e592a3",
    9: "#e54666", 10: "#dc3b5d", 11: "#ca244d", 12: "#3a141e",
  },

  crimson: {
    1: "#fffcfd", 2: "#fff7fb", 3: "#feecf4", 4: "#ffdcec",
    5: "#ffcee4", 6: "#f9bdd9", 7: "#f0a9cd", 8: "#e58fbf",
    9: "#e93d82", 10: "#df3478", 11: "#cb1d63", 12: "#381525",
  },

  pink: {
    1: "#fffcfe", 2: "#fff7fc", 3: "#fee9f5", 4: "#fbdcef",
    5: "#f6cee7", 6: "#efbfdd", 7: "#e7acd0", 8: "#dd90c3",
    9: "#d6409f", 10: "#cf3897", 11: "#c2298a", 12: "#3b0a2a",
  },

  plum: {
    1: "#fefcff", 2: "#fdf7fd", 3: "#fbebfb", 4: "#f7def8",
    5: "#f2d1f3", 6: "#e9c2ec", 7: "#deade3", 8: "#cf91d8",
    9: "#ab4aba", 10: "#a144af", 11: "#953ea3", 12: "#3d0f3f",
  },

  purple: {
    1: "#fefcfe", 2: "#fbf7fe", 3: "#f7edfe", 4: "#f2e2fc",
    5: "#ead5f9", 6: "#e0c4f4", 7: "#d1afec", 8: "#be93e4",
    9: "#8e4ec6", 10: "#8445bc", 11: "#793aaf", 12: "#2b0e44",
  },

  violet: {
    1: "#fdfcfe", 2: "#faf8ff", 3: "#f4f0fe", 4: "#ebe4ff",
    5: "#e1d9ff", 6: "#d4cafe", 7: "#c2b5f5", 8: "#aa99ec",
    9: "#6e56cf", 10: "#644fc1", 11: "#5746af", 12: "#20134b",
  },

  iris: {
    1: "#fdfdff", 2: "#f8f8ff", 3: "#f0f1fe", 4: "#e6e7ff",
    5: "#dadcff", 6: "#cbcdff", 7: "#b8baf8", 8: "#9b9ef0",
    9: "#5b5bd6", 10: "#5151cd", 11: "#4646b7", 12: "#171764",
  },

  indigo: {
    1: "#fdfdfe", 2: "#f8faff", 3: "#f0f4ff", 4: "#e6edfe",
    5: "#d9e2fc", 6: "#c6d4f9", 7: "#aec0f5", 8: "#8da4ef",
    9: "#3e63dd", 10: "#3358d4", 11: "#2a4cb2", 12: "#1f2d5c",
  },
};

for (let name in rawColors) {
  rawColors[name][1] = "#ffffff" // replace
  rawColors[name][13] = "#000000"
}
const stepNames = Object.keys(Object.values(rawColors)[0])
const colors: Record<string, string[]> = {}
for (let name in rawColors) {
  colors[name] = Object.values(rawColors[name]);

}

const radixui:MonochromaticPaletteData = {
  name: "RadixUI",
  stepNames,
  colors
}

export default radixui;