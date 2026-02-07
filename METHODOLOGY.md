# Web-Accessible Color Palette Metrics

**Huu Khanh Nguyen**  
ORCID: https://orcid.org/0009-0006-5975-7894

## Abstract

This document presents a metric framework for evaluating sequential color palettes in application interfaces. The framework quantifies five principal dimensions: contrast span efficiency, lightness linearity, chroma smoothness, hue stability, and spacing uniformity. CIELAB is chosen for its widespread adoption, interpretability, and compatibility with WCAG contrast definitions, despite known non-uniformities at extreme chroma.

>An open-source reference implementation and benchmarks are available at
[https://github.com/chromametry/chromametry](https://github.com/chromametry/chromametry)

## 1. Introduction

Designing color systems for digital interfaces requires a rigorous balance between perceptual uniformity and accessibility standards. However, the absence of a unified quantitative evaluation framework currently leads to the following key limitations:

* **High subjectivity:** Color palette quality assessment remains perceptual, lacking objective measurement indicators for comparing different systems.
* **Automation barriers:** The absence of standard metrics renders the generation of color scales ($M \times N$) a manual process. Mathematical interpolation methods struggle to achieve effectiveness without metrics to validate optimality.
* **Discrete contrast testing:** Identifying color pairs that meet WCAG standards consumes resources due to manual inspection of each color sample during design and deployment.
* **Poor maintainability and scalability:** Color systems lacking quantitative foundations create difficulties when extending color ranges or making synchronized changes while preserving brand perceptual characteristics.

This metric framework aims to transform the color design process from heuristic-based to metrics-based, providing a mathematical reference framework for systematic palette evaluation and optimization.

## 2. Definitions and Standards

### 2.1 Color Palette Structure

A palette $P$ comprises $n$ monochromatic families:

$$P = \{ S_1, S_2, \dots, S_n \}$$

Each color family $S_j$ is defined as a **monochromatic (single-hue ramp)** consisting of $N$ lightness steps, generated from **a single base color**.

Specifically,

$$
S_j = \{ c_{j,0}, c_{j,1}, \dots, c_{j,N-1} \}, \qquad
L^{*}_{j,0} < L^{*}_{j,1} < \dots < L^{*}_{j,N-1}
$$

where there exists **exactly one base color** $C_{\text{base},j} \in S_j$ satisfying

$$
C_{\text{base},j}
= \arg\max_{c_{j,i} \in S_j} C^*(c_{j,i})
$$

that is, the color with **maximum chroma** in the range, considered representative of the entire family's hue.

By definition, the range $S_j$ is assumed to result from a color interpolation method with **fixed hue**, where only lightness (and dependent chroma) varies with step index. This assumption enables consistent determination of reference quantities $L_{\text{base}}$, $h_{\text{base}}$, and $C_{\text{base}}$, serving as inputs for all metrics and interpolation methods presented in subsequent sections.

### 2.2 WCAG Contrast Ratio

According to WCAG 2.1 [6], contrast ratio is defined based on relative luminance $Y \in [0,1]$:

$$CR(c_1, c_2) = \frac{Y_1 + 0.05}{Y_2 + 0.05}, \quad Y_1 \ge Y_2$$

where relative luminance is calculated as:

$$Y = 0.2126 \cdot R_{\text{linear}} + 0.7152 \cdot G_{\text{linear}} + 0.0722 \cdot B_{\text{linear}}$$

Standard accessibility Contrast Ratio thresholds:
- WCAG 3.0:1 for UI components, large text
- WCAG 4.5:1 for body text (AA standard)
- WCAG 7.0:1 for enhanced readability (AAA)

This document scope explicitly identifies the 4.5:1 accessibility threshold as the primary benchmark for comparative evaluation, as it represents the most critical standard.

### 2.3 Contrast Span

**Contrast span** $K$ of a hue family is the minimum index distance such that every color pair separated by $K$ indices always guarantees WCAG 4.5:1:

$$K = \min \{ k \in \mathbb{N} : CR(c_i, c_{i+k}) \ge 4.5, \; \forall i \in [0, N-k-1] \}$$

For multi-family palettes:

$$K_{\text{palette}} = \max_{j=1}^{n} K_j$$

This metric enables predictable accessibility: designers need only select colors separated by $k$ steps to ensure readable contrast without runtime calculations.

|    # | indices   | 0      | 1      | 2      | 3      | 4      | 5      | 6      | 7      | 8      | 9      | 10      | 11      |
| ---: | --------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------- | ------- |
|    1 | span 0–6  | **[0** | **1**  | **2**  | **3**  | **4**  | **5**  | **6]** | 7      | 8      | 9      | 10      | 11      |
|    2 | span 1–7  | 0      | **[1** | **2**  | **3**  | **4**  | **5**  | **6**  | **7]** | 8      | 9      | 10      | 11      |
|    3 | span 2–8  | 0      | 1      | **[2** | **3**  | **4**  | **5**  | **6**  | **7**  | **8]** | 9      | 10      | 11      |
|    4 | span 3–9  | 0      | 1      | 2      | **[3** | **4**  | **5**  | **6**  | **7**  | **8**  | **9]** | 10      | 11      |
|    5 | span 4–10 | 0      | 1      | 2      | 3      | **[4** | **5**  | **6**  | **7**  | **8**  | **9**  | **10]** | 11      |
|    6 | span 5–11 | 0      | 1      | 2      | 3      | 4      | **[5** | **6**  | **7**  | **8**  | **9**  | **10**  | **11]** |

*Table 1. Illustration Using Steps = 12 with span K = 6*

Interpretation:
- For span 0-6, if the background uses color at index 0, then text color requires index ≥6 to always ensure WCAG 4.5:1
- Smaller contrast span provides more design flexibility.

## 3. Evaluation Metrics

### 3.1 Contrast Span Efficiency ($\eta$)

Contrast Span Efficiency evaluates the degree of *lightness space economy* of a palette in meeting accessibility requirements. A palette is considered efficient when it ensures required contrast ratios with minimum steps, thereby maximizing the density of usable color pairs within the same perceptual range.

According to WCAG 2.x, contrast between two colors is determined based on *relative luminance* $Y \in [0,1]$. Considering the boundary case when comparing with black ($Y_{\min}=0$), the minimum luminance threshold to satisfy a 4.5:1 contrast ratio is given by

$$
\frac{Y_{\text{target}} + 0.05}{0.05} = 4.5
$$

Solving this equation yields

$$
Y_{\text{target}} = 0.175
$$

To represent this threshold in the perceptual domain, $Y_{\text{target}}$ is mapped to the CIELAB space. In the ideal case of a pure gray ramp ($a^* = 0,\; b^* = 0$), the relationship between luminance and lightness is determined by

$$
L^*(Y) = 116\,Y^{1/3} - 16
$$

Thus

$$
L^*(0.175) \approx 48.9
$$

Since the CIELAB lightness axis has domain $[0,100]$, this result indicates that even an ideal achromatic ramp requires coverage of approximately $48.9\%$ of the entire $L^*$ range to achieve WCAG 4.5:1 contrast ratio against black. This value therefore establishes the **minimum lightness bound** to satisfy accessibility requirements under ideal conditions.

Normalized to the $L^*$ axis, this threshold corresponds to the ratio

$$
\lambda = \frac{L^*_{\text{target}}}{100} \approx 0.489
$$

To ensure fairness for palettes with odd step counts $N$ — typically containing a neutral center anchor — the ideal density is determined on the symmetric half-interval:

$$
R_h = \left\lfloor \frac{N - 1}{2} \right\rfloor
$$

Since palette steps are indexed discretely, the ideal distance ($K_{\text{ideal}}$) is the ceiling function. This ensures that the minimum index stride always sufficiently covers threshold $\lambda$ over the total $N-1$ intervals of the palette.

$$
K_{\text{ideal}} = \lceil \lambda \cdot (N-1) \rceil
$$

and **Ideal Density** is converted to the full palette:

$$
D_{\text{ideal}} = \frac{K_{\text{ideal}}}{N}
$$

Let $D = K/N$ be the actual contrast density, where $K$ is the measured contrast span. Contrast Span Efficiency $\eta$ is defined by a linear penalty function when density exceeds the ideal threshold:

$$
\eta =
\begin{cases}
1, & D \le D_{\text{ideal}} \\
0, & D \ge 1.0 \\
1 - \dfrac{D - D_{\text{ideal}}}{1.0 - D_{\text{ideal}}}, & \text{otherwise}
\end{cases}
$$

The table below presents theoretical values of $K_{\text{ideal}}$ and $D_{\text{ideal}}$ corresponding to step count $N$, used to determine the upper bound for calculating Contrast Efficiency. ($\eta$ = 1)

| Steps ($N$) | Formula                         | **$K_{\text{ideal}}$** | **$D_{\text{ideal}}$** |
| :---------- | :------------------------------ | :--------------------: | :--------------------: |
| 10          | $\lceil 0.489 \times 9 \rceil$  |         **5**          |         0.500          |
| 11          | $\lceil 0.489 \times 10 \rceil$ |         **5**          |         0.455          |
| 12          | $\lceil 0.489 \times 11 \rceil$ |         **6**          |         0.500          |
| 13          | $\lceil 0.489 \times 12 \rceil$ |         **6**          |         0.462          |
| 14          | $\lceil 0.489 \times 13 \rceil$ |         **7**          |         0.500          |
| 15          | $\lceil 0.489 \times 14 \rceil$ |         **7**          |         0.467          |
| 16          | $\lceil 0.489 \times 15 \rceil$ |         **8**          |         0.500          |
| 17          | $\lceil 0.489 \times 16 \rceil$ |         **8**          |         0.471          |
| 18          | $\lceil 0.489 \times 17 \rceil$ |         **9**          |         0.500          |

*Table 2. Reference Values for $K_{\text{ideal}}$ and $D_{\text{ideal}}$*

### 3.2 Lightness Linearity ($\mathcal{L}$)

The **Lightness Linearity** metric evaluates the degree to which *perceptual* lightness progression in a palette follows a linear trend with step index [3]. Unlike pure $L^*$, perceptual lightness is affected by the **Helmholtz–Kohlrausch effect**, where high-chroma colors are perceived as lighter than achromatic colors with the same $L^*$.

#### 3.2.1 Equivalent Achromatic Lightness

To compensate for this effect, we use **Equivalent Achromatic Lightness (EAL)** according to High et al. [7]:

$$
L_{\mathrm{EAL}} = L^* + \bigl(f_{BY}(h) + f_R(h)\bigr)\, C^*
$$

where chroma and hue in CIELAB space are determined by

$$
C^* = \sqrt{a^{*2} + b^{*2}}, \qquad
h = \operatorname{atan2}(b^*, a^*)
$$

The hue-dependent correction functions are given by

$$
f_{BY}(h) = 0.1644 \left| \sin\!\left(\frac{h - 90^\circ}{2}\right) \right| + 0.0603
$$

$$
f_R(h) =
\begin{cases}
0.1307 \, |\cos(h)| + 0.0060, & h \in [0^\circ, 90^\circ] \cup [270^\circ, 360^\circ],\\
0, & \text{otherwise}.
\end{cases}
$$

These components model the enhanced perceptual lightness in blue–yellow and red–magenta hue regions, consistent with experimental results on the Helmholtz–Kohlrausch effect on display devices.

#### 3.2.2 Linear Regression by Step Index

For a hue family of $N$ colors ordered by monotonically increasing lightness, let $L_{\mathrm{EAL},i}$ be the EAL at step $i$. A linear model is fitted using **ordinary least squares**:

$$
\hat{L}_{\mathrm{EAL}}(i) = \alpha i + \beta,
\qquad i = 0, \dots, N-1.
$$

Root mean square error is calculated by

$$
RMSE =
\sqrt{
\frac{1}{N}
\sum_{i=0}^{N-1}
\bigl(L_{\mathrm{EAL},i} - \hat{L}_{\mathrm{EAL}}(i)\bigr)^2
}.
$$

#### 3.2.3 Normalization by Fitted Range

To normalize error independently of absolute lightness magnitude, error is normalized by the **fitted line range**:

$$
L_{\min}^{\text{fit}} = \hat{L}_{\mathrm{EAL}}(0), \qquad
L_{\max}^{\text{fit}} = \hat{L}_{\mathrm{EAL}}(N-1).
$$

At each step $i$, the maximum deviation within this range is

$$
\epsilon_i^{\max}
=
\max\!\left(
\left|\hat{L}_{\mathrm{EAL}}(i) - L_{\min}^{\text{fit}}\right|,
\left|L_{\max}^{\text{fit}} - \hat{L}_{\mathrm{EAL}}(i)\right|
\right).
$$

From this, the maximum normalized error is determined as

$$
RMSE_{\max} =
\sqrt{
\frac{1}{N}
\sum_{i=0}^{N-1}
\bigl(\epsilon_i^{\max}\bigr)^2
}.
$$

This normalization approach constrains the metric to the envelope of the linear model, ensuring score stability independent of the palette's absolute position on the $L^*$ axis.

#### 3.2.4 Metric Definition

The **Lightness Linearity** metric is defined by

$$
\mathcal{L} =
\max\!\left(
0,\;
1 - \frac{RMSE}{RMSE_{\max}}
\right).
$$

The value $\mathcal{L} \in [0,1]$ approaches 1 when perceptual lightness progression closely follows a linear trend; strong local fluctuations or non-linearity will decrease the score.

In degenerate cases where the fitted line magnitude is negligible (palette nearly flat in lightness), the metric is conventionally set to $\mathcal{L} = 1$.

#### 3.2.5 Interpretation

This metric evaluates **consistency of perceptual lightness progression** rather than purely geometric $L^*$. Using EAL allows $\mathcal{L}$ to more accurately reflect users' visual perception, especially for high-chroma palettes where the Helmholtz–Kohlrausch effect plays a significant role.

### 3.3 Chroma Smoothness ($\mathcal{S}_C$)

#### 3.3.1 Theoretical Background: Zeileis et al. (2009) Power Function Model [4]

The model proposed by Zeileis et al. uses power functions to control the rate of chroma and lightness variation, aiming to optimize perceptual contrast:

$$
\begin{cases} 
H_i = H_2 - i \cdot (H_1 - H_2) \\
C_i = C_{\max} - i^{p_1} \cdot (C_{\max} - C_{\min}) \\
L_i = L_{\max} - i^{p_2} \cdot (L_{\max} - L_{\min})
\end{cases}
$$

Where:
- $i \in [0, 1]$ represents the relative position of color in the scale.
- $H_1, H_2$ are hue values at the two ends of the scale.
- $C_{\max}, C_{\min}$ and $L_{\max}, L_{\min}$ are the maximum and minimum values of chroma and luminance respectively.
- $p_1, p_2$ are power parameters determining the curvature of the variation trajectory.

#### 3.3.2 Analysis of Derivative Discontinuity (Kink Artifacts)

Although the piecewise single-power model ensures monotonicity, applying it to create sequential palettes with peak chroma in the middle often leads to discontinuity artifacts at the junction point ($i_{\text{peak}}$). The first derivative of chroma with respect to position $i$ is determined by:

$$
\frac{dC}{di} = -p_1 \cdot i^{p_1-1} \cdot (C_{\max} - C_{\min})
$$

Since parameters $p_1$ and $\Delta C$ are typically asymmetric between the two segments (dark-to-peak and peak-to-light), the derivative value at the junction is non-uniform:

$$
\lim_{i \to i_{\text{peak}}^-} \frac{dC}{di} \neq \lim_{i \to i_{\text{peak}}^+} \frac{dC}{di}
$$

This lack of $C^1$ continuity creates a "sharp peak" on the chroma plot, causing visual noise (Mach Bands) as the visual system amplifies first-derivative variations in light stimulus [8]. This provides the basis for this study's proposal to use **Monotonic Cubic Spline** [2], which allows forcing the derivative at the peak to zero ($\frac{dC}{di} = 0$), thereby creating a smoother and more natural trajectory.

#### 3.3.3 Chroma in CIELAB Space

Chroma is determined from CIELAB coordinates by:

$$
C^*_{ab} = \sqrt{a^{*2} + b^{*2}}
$$

However, the $C^*_{ab}$ scale is not perceptually linear and has non-uniform sensitivity across the color range. To stabilize the metric and increase comparability between palettes, a normalization based on reference chroma in sRGB space is applied.

#### 3.3.4 Reference Chroma Standard ($C^*_{\mathrm{ref}}$)

The reference value $C^*_{\mathrm{ref}}$ is determined based on the geometric extremum of the sRGB gamut solid in CIELAB space. The $L^*a^*b^*$ coordinates are determined through the transformation matrix from sRGB to XYZ. Since sRGB space is defined under white point D65, chromatic adaptation from D65 to D50 is performed using Bradford transform before conversion to CIELAB, complying with specifications in standard **IEC 61966-2-1** [10].

Since the chroma function $C^* = \sqrt{a^{*2} + b^{*2}}$ is a convex function, its maximum value over sRGB space must lie at the vertices of the sRGB convex polyhedron. Calculation at color vertices confirms that the Blue Primary establishes the furthest chroma boundary:

| Vertex (sRGB) | sRGB $(R,G,B)$ | CIELAB $(L^*, a^*, b^*)$ | $C^*$               |
| :------------ | :------------- | :----------------------- | :------------------ |
| Red           | $(1,0,0)$      | $(53.2, 80.1, 67.2)$     | $\approx 104.6$     |
| Green         | $(0,1,0)$      | $(87.7, -86.2, 83.2)$    | $\approx 119.8$     |
| **Blue**      | $(0,0,1)$      | $(32.3, 79.2, -107.8)$   | **$\approx 133.8$** |
| Magenta       | $(1,0,1)$      | $(60.3, 98.2, -60.8)$    | $\approx 115.5$     |

*Table 3. The reference value $C^*_{\mathrm{ref}}$ is determined based on the geometric extremum of the sRGB gamut solid in CIELAB space.* 

Therefore, the reference value is established as $C^*_{\mathrm{ref}} \approx 133.8$. Actual chroma is normalized to **perceptual chroma** scale ($C_{\mathrm{p}}$) by linear scaling:

$$
C_{\mathrm{p}} = C^*_{ab} \cdot \frac{C^*_{\mathrm{ref}}}{100} \approx C^*_{ab} \cdot 1.338
$$

The normalization coefficient $1.338$ is applied to bring chroma values to a scale of $100$ corresponding to the physical limit of sRGB. This conversion helps synchronize the variation magnitude of chroma with other quantities (such as $L^*$), ensuring the Smoothness metric focuses on evaluating the shape of the color scale without being distorted by absolute chroma intensity.

#### 3.3.5 Ideal Chroma Trajectory

An ideal smooth palette is assumed to have chroma increasing monotonically from the ramp start, reaching a single peak, then decreasing monotonically toward the ramp end. The ideal trajectory $C_{\mathrm{ideal}}(i)$ is constructed using **monotone cubic spline** passing through three anchor points [2]:

- $(0, C_{\mathrm{p},0})$ — starting chroma.
- $(i_{\mathrm{peak}}, C_{\mathrm{p},\max})$ with $C_{\mathrm{p},\max} = \max_i C_{\mathrm{p},i}$.
- $(N-1, C_{\mathrm{p},N-1})$ — ending chroma.

We propose using Monotonic Cubic Spline instead of ordinary polynomial interpolation to ensure the color scale passes precisely through the maximum chroma point ($C_{\mathrm{p},\max}$) and eliminates spurious oscillations (Runge's phenomenon) [9]. This constraint forces chroma segments to vary monotonically without perceptual undulation.

#### 3.3.6 Smoothness Metric Definition

Root mean square error (RMSE) between actual chroma and ideal trajectory:

$$
RMSE = \sqrt{\frac{1}{N}\sum_{i=0}^{N-1} \left(C_{\mathrm{p},i} - C_{\mathrm{ideal}}(i)\right)^2}
$$

For normalization, determine the maximum possible error at each step based on palette amplitude:

$$
\epsilon_{\max,i} = \max\left\{ C_{\mathrm{ideal}}(i) - C_{\mathrm{p},\min}, C_{\mathrm{p},\max} - C_{\mathrm{ideal}}(i) \right\}
$$

where $C_{\mathrm{p},\min} = \min_i C_{\mathrm{p},i}$ and $C_{\mathrm{p},\max} = \max_i C_{\mathrm{p},i}$. Then:

$$
RMSE_{\max} = \sqrt{\frac{1}{N}\sum_{i=0}^{N-1} \epsilon_{\max,i}^2}
$$

The **Chroma Smoothness** metric is defined as:

$$
\mathcal{S}_C = \max\left(0,\, 1 - \frac{RMSE}{RMSE_{\max}} \right)
$$

#### 3.3.7 Interpretation

- $\mathcal{S}_C \approx 1$: Smooth chroma progression, closely following ideal trajectory (minimum bending energy).
- $\mathcal{S}_C \to 0$: Strong chroma oscillations with local discontinuities or anomalies.

This metric is independent of lightness and hue, focusing solely on the morphological quality of chroma distribution in the palette.

### 3.4 Hue Stability ($\mathcal{H}$)

The **Hue Stability** metric evaluates the consistency of hue in a monochromatic color scale as lightness varies. A palette is considered stable if hue fluctuates minimally around a reference color rather than drifting toward other hues.

#### 3.4.1 Hue Representation and Periodicity Handling

Hue in CIELAB space is determined by

$$
h_i = \operatorname{atan2}(b^*_i, a^*_i)
$$

Since hue is a periodic angular quantity, the hue sequence is **unwrapped** to remove discontinuities at $360^\circ$ and ensure continuity:

$$
h^{\mathrm{unwrap}}_i =
h^{\mathrm{unwrap}}_{i-1} + \Delta h_i,
\qquad
\Delta h_i \in (-180^\circ, 180^\circ]
$$

This unwrapping ensures that hue deviations reflect actual perceptual shifts, not artifacts from angular periodicity.

#### 3.4.2 Reference Color and Hue Deviation

The reference hue $h_{\mathrm{base}}$ is chosen as the hue of **the color with maximum chroma** in the palette, as this typically represents the dominant hue identity.

The angular distance between each step and the reference color is determined by

$$
d_i =
\min\!\left(
|h_i - h_{\mathrm{base}}|,
\; 360^\circ - |h_i - h_{\mathrm{base}}|
\right)
$$

The quantity $d_i \in [0, 180^\circ]$ represents perceptual hue deviation at step $i$.

#### 3.4.3 Normalization by Worst-Case Linear Drift

For normalization, a **worst-case** scenario is assumed: hue drifts linearly from the reference color to its complement ($180^\circ$) along the palette.

The maximum deviation at step $i$ in this case is

$$
d^{\max}_i = 180^\circ \cdot \frac{i}{N - 1}
$$

This value serves as the **theoretical upper bound** for hue drift at each position.

#### 3.4.4 Hue Stability Metric Definition

Root mean square error of hue deviation:

$$
RMSE =
\sqrt{
\frac{1}{N}
\sum_{i=0}^{N-1} d_i^2
}
$$

Corresponding error for worst case:

$$
RMSE_{\max} =
\sqrt{
\frac{1}{N}
\sum_{i=0}^{N-1} (d^{\max}_i)^2
}
$$

The **Hue Stability** metric is defined as

$$
\mathcal{H} =
\max\!\left(
0,\;
1 - \frac{RMSE}{RMSE_{\max}}
\right)
$$

#### 3.4.5 Interpretation

- $\mathcal{H} \approx 1$: Hue maintained stable around reference color throughout palette.
- $\mathcal{H} \to 0$: Strong hue drift, approaching worst-case linear scenario.

This metric is independent of lightness and chroma, measuring only **geometric stability of hue** in perceptual color space.

### 3.5 Spacing Uniformity ($\mathcal{U}$)

Perceptual spacing between color steps is measured using **CIEDE2000** [5]. For a color scale of $N$ steps $\{c_0, c_1, \dots, c_{N-1}\}$, perceptual differences are quantified:

$$
\delta_i = \Delta E_{00}(c_{i-1}, c_i), \quad i = 1, \dots, N-1
$$

An ideally spaced color scale will have approximately equal $\delta_i$ values. Uniformity is quantified using the **Coefficient of Variation**:

$$
CV = \frac{\sigma(\{\delta_i\})}{\mu(\{\delta_i\})}
$$

where $\delta_i = \Delta E_{00}(c_{i-1}, c_i)$ is the perceptual difference between two consecutive color steps, and $\mu(\cdot)$ and $\sigma(\cdot)$ are the mean and standard deviation of the set $\{\delta_i\}$, respectively.

CV is a dimensionless measure suitable for evaluating relative dispersion of perceptual distances, but it is unbounded above and inversely related to quality. Therefore, to map CV to a bounded quality score with intuitive directionality, the **Spacing Uniformity** metric is defined as:

$$
\mathcal{U} = \frac{1}{1 + CV}
$$

This definition ensures $\mathcal{U} \in (0,1]$, with $\mathcal{U} = 1$ when perceptual steps are perfectly uniform ($CV = 0$), and $\mathcal{U}$ decreasing monotonically as dispersion increases.

According to this definition:
- $\mathcal{U} \to 1$ when perceptual steps are nearly equal ($CV \to 0$),
- $\mathcal{U}$ decreases when spacing between steps becomes non-uniform.

A palette with perfectly uniform perceptual distribution satisfies $CV = 0$ and thus $\mathcal{U} = 1$.

## 4. Composite Quality Score

To synthesize metrics into a single score without masking weak dimensions with strong ones, the **geometric mean** is used instead of arithmetic mean:

$$
\text{SCORE} = 100 \cdot \left(\prod_{k=1}^{5} (M_k + \varepsilon)\right)^{1/5}
$$

where:
- $M_k \in \{\eta, \mathcal{L}, \mathcal{S}_C, \mathcal{H}, \mathcal{U}\}$ are component metrics,
- $\varepsilon = 10^{-6}$ is a small constant ensuring numerical stability when a metric approaches 0.

This synthesis approach has the following properties:
- **Strongly penalizes unbalanced palettes**: even one poor metric significantly lowers the total score.
- **Encourages uniform quality** across all perceptual and accessibility dimensions.
- Ensures SCORE lies in range $[0, 100]$ for easy comparison between different palette systems.

Therefore, SCORE reflects overall palette completeness, not based solely on a few outstanding individual characteristics.

## 5. Experimental Evaluation

This section presents measurement results on 11 popular design systems to benchmark the technical specifications of the metric framework.

> An interactive online report summarizing all benchmark results is provided at
[Online Benchmark](https://chromametry.github.io/chromametry/benchmarks/monochromatic).




### 5.1 Analysis Results

Data in Table 4 shows differentiation in quality indicators among surveyed design systems.
| Design System          | Ramp Count | Steps | Span (K) | Contrast Efficiency | Lightness Linearity | Chroma Smoothness | **Hue Stability** | Spacing Uniformity | **SCORE** |
| ---------------------- | :--------: | :---: | :------: | :-----------------: | :-----------------: | :---------------: | :---------------: | :----------------: | :-------: |
| IBM Carbon             |     12     |   12  |     6    |        0.906        |        0.9315       |       0.8641      |     **0.9303**    |       0.7939       | **88.36** |
| Adobe Spectrum         |     10     |   18  |     9    |        0.929        |        0.9346       |       0.8712      |     **0.9171**    |       0.7752       | **88.33** |
| U.S. Web Design System |     25     |   12  |     6    |        0.906        |        0.9363       |       0.8047      |     **0.9424**    |       0.8006       | **87.58** |
| Salesforce Lightning 2 |     13     |   14  |     7    |        0.916        |        0.9206       |       0.8391      |     **0.9375**    |       0.7118       | **86.06** |
| GitHub Primer Brand    |     13     |   12  |     6    |        0.906        |        0.9255       |       0.8375      |     **0.9457**    |       0.6852       | **85.43** |
| Atlassian              |      9     |   14  |     8    |        0.785        |        0.8972       |       0.9140      |     **0.9499**    |       0.7139       | **84.72** |
| Tailwind CSS           |     18     |   13  |     8    |        0.774        |        0.8727       |       0.8492      |     **0.9181**    |       0.6772       | **81.37** |
| Ant Design             |     12     |   12  |     9    |        0.698        |        0.8603       |       0.8605      |     **0.9132**    |       0.6559       | **79.08** |
| Material UI            |     19     |   12  |    11    |        0.554        |        0.7969       |       0.7726      |     **0.9309**    |       0.5503       | **70.56** |
| Radix UI               |     16     |   13  |    10    |        0.533        |        0.7998       |       0.7452      |     **0.9468**    |       0.5196       | **68.98** |
| Shopify Polaris        |     12     |   17  |    15    |        0.349        |        0.7304       |       0.6420      |     **0.9196**    |       0.4666       | **58.78** |


*Table 4. Benchmark Results of Popular Design Systems*

> **Note:** Design systems like Bootstrap, Google Material 3, Apple Human Interface or Fluent UI are excluded as they define discrete semantic tokens rather than algorithmic sequential ramps.
### Example A Typical Report

![IBM Carbon Color Palette](benchmarks/monochromatic/assets/ibm-carbon-color-palette.png)
*Figure 1. IBM Carbon Color Palette*

![IBM Carbon Palette Metrics](benchmarks/monochromatic/assets/ibm-carbon-palette-metrics.png)
*Figure 2. IBM Carbon Palette Metrics.*


![IBM Carbon Palette Charts](benchmarks/monochromatic/assets/ibm-carbon-palette-charts.png)
*Figure 3. IBM Carbon Palette Charts.*

The **contrast span** value $K$ is taken directly from measured *Span*; experimental density is determined by

$$
D = \frac{K}{N}
$$

where $N$ is the number of palette steps.

| Color Palette              | Steps ($N$) | Span ($K$) | Density ($D$) | **Efficiency ($\eta$)** |
| :------------------------- | :---------: | :--------: | :-----------: | :---------------------: |
| **IBM Carbon**             |     12      |     6      |     0.500     |        **0.906**        |
| **Adobe Spectrum**         |     18      |     9      |     0.500     |        **0.929**        |
| **U.S. Web Design System** |     12      |     6      |     0.500     |        **0.906**        |
| **Salesforce Lightning 2** |     14      |     7      |     0.500     |        **0.916**        |
| **GitHub Primer Brand**    |     12      |     6      |     0.500     |        **0.906**        |
| **Atlassian**              |     14      |     8      |     0.571     |        **0.785**        |
| **Tailwind CSS**           |     13      |     8      |     0.615     |        **0.774**        |
| **Ant Design**             |     12      |     9      |     0.750     |        **0.698**        |
| **Material UI**            |     12      |     11     |     0.917     |        **0.554**        |
| **Radix UI**               |     13      |     10     |     0.769     |        **0.533**        |
| **Shopify Polaris**        |     17      |     15     |     0.882     |        **0.349**        |

*Table 5. Experimental Values of $K$, $D$, and $\eta$*

This table shows that design systems achieving high efficiency all have low density, while palettes with excessively wide span lead to wasted lightness space and are strongly penalized by metric $\eta$.

Thus, contrast span $K$ is observed consistently across popular industry palettes, though previously not systematically identified or exploited. With these results, users can easily select color pairs for background and text with distance $K$ without requiring runtime verification.

### 5.2 Discussion

#### 5.2.1 High Score Group (Score > 85)

IBM Carbon, Adobe Spectrum, and USWDS maintain consistently high indicators across all aspects.
* **Observation:** These systems achieve **Contrast Efficiency** ($\eta > 0.9$) and **Lightness Linearity** ($\mathcal{L} > 0.93$).
* **Analysis:** Data shows lightness step distribution with high linearity. Span distance $K$ maintains optimal ratio to total steps $N$, ensuring high density of color pairs meeting WCAG 4.5:1 standard.

#### 5.2.2 Medium Score Group (75 - 85)

Tailwind CSS and Ant Design show disparities among component indicators.
* **Observation:** These systems maintain good **Chroma Smoothness** ($\mathcal{S}_C > 0.84$) scores but have lower **Contrast Efficiency** (0.6 - 0.7).
* **Analysis:** Span distance $K$ occupies large proportion relative to total steps $N$ (e.g., Ant Design requires 9/12 steps), reducing the number of color pairs usable simultaneously on the interface.

#### 5.2.3 Low Score Group (< 75)

Material UI (v4) and Shopify Polaris record the lowest scores in the experimental dataset.
* **Observation:** **Spacing Uniformity** ($\mathcal{U} < 0.6$) and **Lightness Linearity** indicators are both below average.
* **Analysis:** Measurement results show non-uniformity between perceptual steps and lack of linearity in lightness progression within color scale structure.

### 5.3 Experimental Conclusions

Benchmark data confirms the metric framework's ability to classify color palettes based on their physical and mathematical characteristics. Differentiation in stability and uniformity indicators provides a quantitative foundation for evaluating quality of existing color systems. Using even number of steps and optimizing Contrast Span = (N-1)/2 provides optimal usability where every color can serve as background and a corresponding text color always exists ensuring WCAG 4.5:1.

## 6. Conclusion

This framework provides quantitative evaluation of color palette quality across perceptual and accessibility dimensions, using CIELAB as a unified color space. The five metrics are both independent and complementary, capturing different aspects of palette design: accessibility efficiency, lightness progression, saturation trajectory, hue consistency, and step uniformity. The composite score enables objective comparison and supports automated optimization workflows for digital interface design.

## References

1. CIE. (1976). *Colorimetry: Official recommendations of the International Commission on Illumination*. Publication CIE No. 15 (E-1.3.1).

2. Fritsch, F. N., & Carlson, R. E. (1980). Monotone piecewise cubic interpolation. *SIAM Journal on Numerical Analysis*, 17(2), 238–246.

3. High, R., Green, P., & Nussbaum, P. (2023). The Helmholtz-Kohlrausch effect on display-based light colors and simulated substrate colors. *Color Research & Application*, 48(3), 341–354.

4. Zeileis, A., Hornik, K., & Murrell, P. (2009). Escaping RGBland: Selecting colors for statistical graphics. *Computational Statistics & Data Analysis*, 53(9), 3259–3270. https://doi.org/10.1016/j.csda.2008.11.033

5. Luo, M. R., Cui, G., & Rigg, B. (2001). The development of the CIE 2000 colour-difference formula: CIEDE2000. *Color Research & Application*, 26(5), 340–350.

6. W3C. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. https://www.w3.org/TR/WCAG21/

7. Safdar, M., Cui, G., Kim, Y. J., & Luo, M. R. (2017). Perceptually uniform color space for image signals including high dynamic range and wide gamut. *Optics Express*, 25(13), 15131–15151. https://doi.org/10.1364/OE.25.015131

8. Mach, E. (1865). Über die Wirkung der räumlichen Verteilung des Lichtreizes auf die Netzhaut. *Sitzungsberichte der Kaiserlichen Akademie der Wissenschaften, Wien*, 52, 303–322.

9. Epperson, J. F. (1987). On the Runge example. *The American Mathematical Monthly*, 94(4), 329–341.

10. IEC. (1999). *Multimedia systems and equipment - Colour measurement and management - Part 2-1: Colour management - Default RGB colour space - sRGB*. IEC 61966-2-1:1999.
