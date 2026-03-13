import { hexToRgb, rgbToLab, labToLch } from "./utils.js";

export class Shade {
    readonly hex: string;
    constructor(hex: string) {
        this.hex = hex;
    }

    get rgb() {
        return hexToRgb(this.hex);
    }

    get lab() {
        return rgbToLab(this.rgb);
    }

    get lch() {
        return labToLch(this.lab);
    }

    get lightness() {
        const [L, a, b] = this.lab;
        const C = Math.sqrt(a * a + b * b);
        const hRad = Math.atan2(b, a);
        const hDeg = (hRad * 180 / Math.PI + 360) % 360;

        const k1 = 0.1644;
        const k2 = 0.0603;
        const k3 = 0.1307;
        const k4 = 0.0060;
        const fBYh = k1 * Math.abs(Math.sin(((hDeg - 90) / 2) * (Math.PI / 180))) + k2;

        let fRh = 0;
        if (hDeg <= 90 || hDeg >= 270) {
            fRh = k3 * Math.abs(Math.cos(hDeg * (Math.PI / 180))) + k4;
        }

        return L + (fBYh + fRh) * C;
    }

    get chroma() {
        return this.lch[1];
    }

    get hue() {
        return this.lch[2];
    }

    get luminance() {
        const [r, g, b] = this.rgb;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    get wcag() {
        return (Math.max(this.luminance, 1) + 0.05) / (Math.min(this.luminance, 1) + 0.05);
    }

    get apca() {
        const clamp = (y: number) => (y > 0.0005 ? y : y + Math.pow(0.0005 - y, 0.8));
        const txt = clamp(this.luminance);
        const bg = clamp(1);

        let lc = (Math.pow(txt, 0.56) - Math.pow(bg, 0.56)) * 100;
        if (Math.abs(lc) < 0.1) return 0;

        lc = lc > 0 ? (lc < 1 ? 0 : lc - 0.25) : (lc > -1 ? 0 : lc + 0.25);
        return Math.round(lc);
    }
}
