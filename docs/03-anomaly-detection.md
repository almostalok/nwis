# NWIS Stage 03: Anomaly Detection Engine

## 1. Mathematical Algorithms

NWIS implements deterministic, statistical, and trend anomaly detection rather than opaque black-box models.

### 1. Rolling Z-Score
Measures how many standard deviations a telemetry reading diverges from the rolling window mean:
$$Z = \frac{x - \mu_{window}}{\sigma_{window}}$$

- $Z \ge 2.0$: `WATCH`
- $Z \ge 2.8$: `WARNING`
- $Z \ge 3.5$: `CRITICAL`

### 2. Robust Z-Score (MAD Normalization)
For noisy drilling data prone to extreme sensor spikes, the standard standard deviation can be biased. NWIS computes the Median Absolute Deviation (MAD):
$$\text{MAD} = \text{median}(|x_i - \text{median}(X)|)$$
$$\text{Robust } Z = \frac{0.6745 \cdot (x - \text{median}(X))}{\text{MAD}}$$

### 3. Linear Trend Slope (Ordinary Least Squares)
Computes the rate-of-change over time points $(t_i, y_i)$:
$$\text{Slope} = \frac{n \sum (t_i y_i) - \sum t_i \sum y_i}{n \sum t_i^2 - (\sum t_i)^2}$$
- Detects steep negative slopes in ROP ($\text{slope} < -0.05 \text{ m/hr/sec}$) indicating bit balling or impending pack-off.

### 4. Formation Baseline Normalization
Parameters are compared against the verified formation baseline for the current geological interval (e.g. Formation Gamma: 15 kNm torque baseline, 18 m/hr ROP baseline).
$$\text{Deviation } \% = \frac{x - \text{Baseline}}{\text{Baseline}} \times 100$$

---

## 2. False Positive Prevention (Section 73)
An isolated sensor spike (e.g. torque momentarily rising by 20% while ROP remains normal and drag remains normal) will **NOT** trigger a high-severity alert.
The system requires multi-parameter corroboration (Torque $\uparrow$ + ROP $\downarrow$ + Drag $\uparrow$) before escalating to `WARNING` or `CRITICAL`.
