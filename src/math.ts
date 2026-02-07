// src/math.ts

/**
 * Create a Monotone Cubic Hermite Interpolator.
 * Ensures monotonicity is preserved between points.
 * Fritsch, F. N., & Carlson, R. E. (1980). Monotone piecewise cubic interpolation. *SIAM Journal on Numerical Analysis*, 17(2), 238–246.
 */
export const createMonotone = (points: number[][]) => {
    if (points.length < 1) return (_t: number) => 0;

    const sorted = [...points].sort((a, b) => a[0] - b[0]);
    const uniquePoints: number[][] = [];

    for (let i = 0; i < sorted.length; i++) {
        if (i === 0 || sorted[i][0] !== sorted[i - 1][0]) {
            uniquePoints.push(sorted[i]);
        }
    }

    const n = uniquePoints.length;
    if (n === 1) return (_t: number) => uniquePoints[0][1];

    const x = uniquePoints.map(p => p[0]);
    const y = uniquePoints.map(p => p[1]);
    const h: number[] = [];
    const secants: number[] = [];

    for (let i = 0; i < n - 1; i++) {
        h[i] = x[i + 1] - x[i];
        secants[i] = (y[i + 1] - y[i]) / h[i];
    }

    const m: number[] = new Array(n);
    m[0] = secants[0];
    m[n - 1] = secants[n - 2];

    for (let i = 1; i < n - 1; i++) {
        const d0 = secants[i - 1];
        const d1 = secants[i];
        if (d0 * d1 <= 0) {
            m[i] = 0;
        } else {
            const alpha = (1 + h[i] / (h[i - 1] + h[i])) / 3;
            m[i] = (d0 * d1) / ((1 - alpha) * d0 + alpha * d1);
        }
    }

    return (t: number): number => {
        if (t <= x[0]) return y[0];
        if (t >= x[n - 1]) return y[n - 1];

        let low = 0;
        let high = n - 2;
        let i = 0;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (t >= x[mid] && t <= x[mid + 1]) {
                i = mid;
                break;
            }
            if (t < x[mid]) high = mid - 1;
            else low = mid + 1;
        }

        const dx = h[i];
        const s = (t - x[i]) / dx;
        const s2 = s * s;
        const s3 = s2 * s;
        const m0 = m[i] * dx;
        const m1 = m[i + 1] * dx;

        return (2 * s3 - 3 * s2 + 1) * y[i] +
            (s3 - 2 * s2 + s) * m0 +
            (-2 * s3 + 3 * s2) * y[i + 1] +
            (s3 - s2) * m1;
    };
};

/** Calculate Root Mean Square (RMS) of an array. */
export function rootMeanSquare(values: number[]): number {
    const n = values.length;
    if (n === 0) return 0;

    let sumSq = 0;
    for (let i = 0; i < n; i++) {
        sumSq += values[i] * values[i];
    }
    return Math.sqrt(sumSq / n);
}

/** Calculate min, max, and average of an array. */
export const calcStatistics = (array: number[]) => {
    const n = array.length;
    if (n === 0) return { min: 0, max: 0, avg: 0 };

    let min = array[0];
    let max = array[0];
    let sum = 0;

    for (let i = 0; i < n; i++) {
        const v = array[i];
        if (v < min) min = v;
        if (v > max) max = v;
        sum += v;
    }

    return { min, max, avg: sum / n };
};

/** Calculate geometric mean score (0-100) from metrics. */
export const calcScore = (metrics: number[]): number => {
    const n = metrics.length;
    if (n === 0) return 0;

    const eps = 1e-6;
    const product = metrics.reduce((acc, score) => acc * (score + eps), 1);
    const globalScore = Math.pow(product, 1 / n);
    const result = Math.max(0, Math.min(1, globalScore));
    return parseFloat((result * 100).toFixed(2));
};