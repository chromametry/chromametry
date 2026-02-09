window.EXPORT_MODE = true
const TARGET = 'wcag45';
const DATA = window.BENCHMARK_DATA;
DATA.items.sort((a, b) => b.score - a.score)

const CATEGORY_COLORS = [
    '#2563eb', '#db2777', '#16a34a', '#d97706', '#7c3aed',
    '#0891b2', '#dc2626', '#4f46e5', '#059669', '#ca8a04',
    '#be185d', '#4338ca', '#15803d', '#b45309', '#6d28d9',
    '#0369a1', '#be123c', '#0f766e', '#a16207', '#5b21b6',
    '#2dd4bf', '#fb7185', '#a3e635', '#fbbf24', '#c084fc',
    '#22d3ee', '#f472b6', '#4ade80', '#fb923c', '#818cf8'
];

const METRICS = {
    contrastEfficiency: 'Contrast Efficiency',
    lightnessLinearity: 'Lightness Linearity',
    chromaSmoothness: 'Chroma Smoothness',
    hueStability: 'Hue Stability',
    spacingUniformity: 'Spacing Uniformity'
};

const RANKINDDATA = DATA.items.map((item, i) => {
    const chartData = Object.keys(METRICS).map(key => {
        const val = item.metrics[key] || 0;
        return val * 100;
    });
    return {
        name: item.name,
        score: item.score,
        color: CATEGORY_COLORS[i],
        data: chartData
    };
});


const heatDown = (v, stats) => {
    const { min, max, avg } = stats;
    const h = v <= avg
        ? 120 - ((v - min) / (avg - min || 1) * 60)
        : 60 - ((v - avg) / (max - avg || 1) * 60);
    return `hsla(${h}, 100%, 45%, 0.4)`;
};

const heatUp = (v, stats) => {
    const { min, max, avg } = stats;
    const h = v <= avg
        ? ((v - min) / (avg - min || 1) * 60)
        : 60 + ((v - avg) / (max - avg || 1) * 60);
    return `hsla(${h}, 100%, 45%, 0.4)`;
};

const description = () => {
    let h = `
    <div class="header-description">
        <div>
This benchmark evaluates <b>sequential color ramps</b> under WCAG ${TARGET.replace('wcag', '')}:1.
Design systems such as Bootstrap,Google Material Ui, Fluent UI, and Apple Human Interface Guidelines are excluded,
as they do not provide preset color ramps, but instead define
discrete semantic or token-based color sets.
</div>
        </div>
    </div>
    `;
    return h
}

const metricGlossary = () => {
    return `
    <div class="metric-glossary">
        <div class="glossary-grid">
            <div class="glossary-item">
                <div class="glossary-title">Contrast Efficiency</div>
                <div class="glossary-text">
                    Evaluates the palette's density efficiency relative to accessibility.
                    The <b>K-span</b> is the minimum index distance required to guarantee
                    any two steps within the same ramp meet the WCAG 4.5:1 ratio.</b>
                </div>
            </div>

            <div class="glossary-item">
                <div class="glossary-title">Lightness Linearity</div>
                <div class="glossary-text">
                    Evaluates the linearity of the L* axis. High scores prevent sudden
                    luminance jumps, maintaining a predictable visual hierarchy.
                </div>
            </div>

            <div class="glossary-item">
                <div class="glossary-title">Chroma Smoothness</div>
                <div class="glossary-text">
                    Analyzes the C* curve using spline integration. It detects dirty or
                    over-saturated mid-tones, ensuring natural colorfulness transitions.
                </div>
            </div>

            <div class="glossary-item">
                <div class="glossary-title">Hue Stability</div>
                <div class="glossary-text">
                    Checks hue angle stability across lightness levels, preventing
                    perceptual hue shifts in dark or bright tones.
                </div>
            </div>

            <div class="glossary-item">
                <div class="glossary-title">Spacing Uniformity</div>
                <div class="glossary-text">
                    Measures consistency of Delta-E distances between adjacent steps,
                    ensuring perceptually even spacing.
                </div>
            </div>
        </div>
    </div>
    `;
};


const ranking = () => {
    return `
    <div class="ranking-container">
        <div class="chart-column">
            <canvas id="summaryParallelChart"></canvas>
        </div>
        <div class="rank-column">
            <div class="rank-header">RANKING BY QUALITY INDEX</div>
            <div id="custom-legend-list" class="rank-list"></div>
        </div>
    </div>
    `;
};

const summaryTable = () => {

    const stats = DATA.statistics;
    let h = `
    <div class="summary-wrapper">
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Color Palette</th>
                    <th>Ramp Count</th>
                    <th>Steps</th>
                    <th>Span</th>
                    <th>Contrast Efficiency</th>
                    <th>Lightness Linearity</th>
                    <th>Chroma Smoothness</th>
                    <th>Hue Stability</th>
                    <th>Spacing Uniformity</th>
                    <th>SCORE</th>
                </tr>
            </thead>
            <tbody>
    `;

    DATA.items.forEach(org => {
        h += `
            <tr class="palette-row">
                <td><strong>${org.name}</strong></td>
                <td class="val">${org.scales.length}</td>
                <td class="val">${org.steps}</td>
                <td class="val">${org.contrasts.wcag45.span}</td>

                <td class="val heat" style="--heat:${heatUp(org.metrics.contrastEfficiency, stats.contrastEfficiency)}">
                    ${org.metrics.contrastEfficiency.toFixed(3)}
                </td>

                <td class="val heat" style="--heat:${heatUp(org.metrics.lightnessLinearity, stats.lightnessLinearity)}">
                    ${org.metrics.lightnessLinearity.toFixed(4)}
                </td>

                <td class="val heat" style="--heat:${heatUp(org.metrics.chromaSmoothness, stats.chromaSmoothness)}">
                    ${org.metrics.chromaSmoothness.toFixed(4)}
                </td>

                <td class="val heat" style="--heat:${heatUp(org.metrics.hueStability, stats.hueStability)}">
                    ${org.metrics.hueStability.toFixed(4)}
                </td>

                <td class="val heat" style="--heat:${heatUp(org.metrics.spacingUniformity, stats.spacingUniformity)}">
                    ${Number(org.metrics.spacingUniformity).toFixed(4)}
                </td>

                <td class="val heat" style="--heat:${heatUp(org.score, stats.score)}">
                    <strong>${org.score.toFixed(2)}</strong>
                </td>
            </tr>
            
        `;
    });
    h += `
    </tbody>
        </table>
    </div>
    `
    return h;
};

const backgroundGrid = (item) => {
    const scales = item.scales
    if (!Array.isArray(scales)) return '';

    const cols = scales[0].colors.length;


    let h = `
        <div class="table-section">
          <div class="table-caption">Contrast Map: Background Index ± ${item.contrasts.wcag45.span} steps (WCAG 4.5:1). "X" indicates invalid background </div>
            <div class="color-grid" style="--cols:${cols}">
    `;

    //h += `<div class="color-grid-header">Steps</div>`;
    scales[0].colors.forEach((_, i) => {
        h += `<div class="color-grid-header">${i}</div>`;
    });

    scales.forEach(s => {
       // h += `<div class="color-grid-scale">${s.name}</div>`;

        const steps = s.colors.length;

        s.colors.forEach((hex, i) => {
            const aa = s.contrasts.wcag45.span;
            const right = Math.min(steps - 1, i + aa);
            const left = Math.max(0, i - aa);
            const shift = (right - i) > (i - left) ? right : left;
            const span = Math.max(right - i, i - left);

            h += `
                <div class="color-cell"
                     style="background:${hex};color:${s.colors[shift]}">
                    ${span >= aa ? shift : 'X'}
                </div>
            `;
        });
    });

    h += `</div></div>`;
    return h;
};
const metricTable = (scales) => {
    const statistics = DATA.statistics
    if (!Array.isArray(scales)) return '';

    let h = `
        <div class="table-section">
            <div class="table-caption">Quality Metrics</div>
            <div class="metric-grid">
                <div class="grid-header">Base Color</div>
                <div class="grid-header">Span (3.0)</div>
                <div class="grid-header">Span (4.5)</div>
                <div class="grid-header">Span (7.0)</div>
                <div class="grid-header">Contrast Efficiency</div>
                <div class="grid-header">Lightness Linearity</div>
                <div class="grid-header">Chroma Smoothness</div>
                <div class="grid-header">Hue Stability</div>
                <div class="grid-header">Spacing Uniformity</div>
    `;

    scales.forEach(s => {
        h += `
            <div class="grid-cell">
                <div style="background:${s.baseColor};
                            width:40px;height:20px;border-radius:2px"></div>
            </div>

            <div class="grid-cell">${s.contrasts.wcag30?.span ?? '-'}</div>
            <div class="grid-cell"><strong>${s.contrasts.wcag45?.span ?? '-'}</strong></div>
            <div class="grid-cell">${s.contrasts.wcag70?.span ?? '-'}</div>

            <div class="grid-cell heat"
                 style="--heat:${heatUp(s.metrics.contrastEfficiency, statistics.contrastEfficiency)}">
                ${s.metrics.contrastEfficiency.toFixed(4)}
            </div>

            <div class="grid-cell heat"
                 style="--heat:${heatUp(s.metrics.lightnessLinearity, statistics.lightnessLinearity)}">
                ${s.metrics.lightnessLinearity.toFixed(4)}
            </div>

            <div class="grid-cell heat"
                 style="--heat:${heatUp(s.metrics.chromaSmoothness, statistics.chromaSmoothness)}">
                ${s.metrics.chromaSmoothness.toFixed(4)}
            </div>

            <div class="grid-cell heat"
                 style="--heat:${heatUp(s.metrics.hueStability, statistics.hueStability)}">
                ${s.metrics.hueStability.toFixed(4)}
            </div>

            <div class="grid-cell heat"
                 style="--heat:${heatUp(s.metrics.spacingUniformity, statistics.spacingUniformity)}">
                ${Number(s.metrics.spacingUniformity).toFixed(4)}
            </div>
        `;
    });

    h += `</div></div>`;
    return h;
};

const parallelChart = () => {
    const parallelCanvas = document.getElementById('summaryParallelChart');

    const chart = new Chart(parallelCanvas, {
        type: 'line',
        data: {
            labels: Object.keys(METRICS).map(m => METRICS[m]),
            datasets: RANKINDDATA.map(item => ({
                label: item.name,
                data: item.data,
                borderColor: item.color,
                backgroundColor: item.color,
                borderWidth: 1,
                pointRadius: 2,
                tension: 0,
                fill: false
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }, // TẮT LEGEND TRONG CANVAS
            scales: {
                y: {
                    beginAtZero: false,
                    max: 100,
                    grid: { color: '#f0f0f0' }, font: { size: 11 }
                },
                x: {
                    grid: { lineWidth: 2, color: '#ececec' }, ticks: {
                        font: { size: 12 }
                    }
                }
            }
        }
    });
    return chart

}

const rankingTable = (chart) => {
    const legendContainer = document.getElementById('custom-legend-list');

    RANKINDDATA.forEach((item, idx) => {
        const el = document.createElement('div');
        el.className = 'rank-item';
        el.style = "display: flex; align-items: center; padding: 10px 15px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: 0.2s;";
        el.innerHTML = `
            <span style="width:35px; font-size:15px; color:#7a7a7a;">#${idx + 1}</span>
            <div style="width:15px; height:15px; border-radius:50%; background:${item.color}; margin-right:10px;"></div>
            <div style="flex:1; font-size:15px; font-weight:500;">${item.name}</div>
            <div style="font-family:monospace; font-weight:bold; color:${item.color}; font-size:15px;">${item.score.toFixed(2)}</div>
        `;

        el.onmouseenter = () => {
            chart.data.datasets.forEach((ds, i) => {
                ds.borderColor = (i === idx) ? item.color : 'rgba(200, 200, 200, 0.1)';
                ds.borderWidth = (i === idx) ? 4 : 1;
            });
            chart.update('none');
            el.style.background = '#f0f7ff';
        };

        el.onmouseleave = () => {
            chart.data.datasets.forEach((ds, i) => {
                ds.borderColor = RANKINDDATA[i].color;
                ds.borderWidth = 1.5;
            });
            chart.update('none');
            el.style.background = 'transparent';
        };

        legendContainer.appendChild(el);
    });
}

const detail = () => {
    const det = document.getElementById('details-container');

    DATA.items.forEach(item => {
        const detailEl = document.createElement('div');
        detailEl.className = 'details';
        detailEl.innerHTML = `<div class="details-head">${item.name}</div><div class="details-body">${backgroundGrid(item)}${metricTable(item.scales)}</div>`;
        det.appendChild(detailEl);

        const chartDiv = detailEl.querySelector('.details-body');
        const yAxisLabels = {
            lightness: "Lightness (L*)",
            chroma: "Chroma (C*)",
            hue: "Hue Angle (h°)",
            cumDeltaE00: "Cumulative ΔE2000",
        };

        ["lightness", "chroma", "hue", "cumDeltaE00"].forEach(e => {
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-wrapper';
            const canvas = document.createElement('canvas');
            wrapper.appendChild(canvas);
            chartDiv.appendChild(wrapper);

            new Chart(canvas, {
                type: "line",
                data: {
                    labels: item.scales[0].shades.map((_, i) => i),
                    datasets: item.scales.map(s => ({
                        label: s.name,
                        data: e == "hue"
                            ? s.shades.slice(1, -1).map((m, i) => ({ x: i + 1, y: m[e] }))
                            : s.shades.map((m, i) => ({ x: i, y: m[e] })),
                        borderColor: s.shades[s.baseIndex].hex,
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0
                    }))
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: yAxisLabels[e] || e, // Sử dụng label từ map hoặc biến thô
                                color: '#666',
                                font: {
                                    size: 13,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                padding: 10,
                                font: { size: 11 }
                            }
                        },
                        x: {
                            ticks: {
                                padding: 10,
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });
        });
    });
}
const init = () => {
    const root = document.getElementById('app-root');
    let h = description()
    h += summaryTable()
    h += metricGlossary()
    h += ranking()
    h += `<div id="details-container"></div>`
    root.innerHTML = h;
    let chart = parallelChart()
    rankingTable(chart)
    detail()
};

document.addEventListener('DOMContentLoaded', init);

function saveCanvas(canvas, filename) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png', 1.0);
    a.download = filename;
    a.click();
}
