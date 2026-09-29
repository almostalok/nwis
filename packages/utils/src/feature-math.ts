/**
 * Mathematical & Statistical Feature Engineering Utilities for Real-Time Drilling Telemetry
 */

/**
 * Calculate arithmetic mean of a sequence of numbers
 */
export function calculateRollingMean(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

/**
 * Calculate sample standard deviation
 */
export function calculateRollingStd(values: number[], precomputedMean?: number): number {
  if (!values || values.length <= 1) return 0;
  const mean = precomputedMean !== undefined ? precomputedMean : calculateRollingMean(values);
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculate median of a sequence
 */
export function calculateRollingMedian(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate Median Absolute Deviation (MAD) for robust statistics
 */
export function calculateMedianAbsoluteDeviation(values: number[], precomputedMedian?: number): number {
  if (!values || values.length <= 1) return 0;
  const median = precomputedMedian !== undefined ? precomputedMedian : calculateRollingMedian(values);
  const deviations = values.map((v) => Math.abs(v - median));
  return calculateRollingMedian(deviations);
}

/**
 * Calculate linear slope (trend) using ordinary least squares regression
 * over time points in seconds: slope = dy/dt (units per second)
 */
export function calculateRollingSlope(points: { timestampSec: number; value: number }[]): number {
  if (!points || points.length <= 1) return 0;
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  // Normalize X by initial timestamp to avoid float overflow
  const t0 = points[0].timestampSec;

  for (let i = 0; i < n; i++) {
    const x = points[i].timestampSec - t0;
    const y = points[i].value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-9) return 0;
  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Calculate standard z-score: (value - mean) / std
 */
export function calculateZScore(value: number, mean: number, std: number): number {
  if (std <= 1e-6) return 0;
  return (value - mean) / std;
}

/**
 * Calculate robust z-score using MAD: 0.6745 * (value - median) / MAD
 */
export function calculateRobustZScore(value: number, median: number, mad: number): number {
  if (mad <= 1e-6) return 0;
  return (0.6745 * (value - median)) / mad;
}

/**
 * Calculate percentage rate of change relative to a baseline or previous value:
 * ((current - baseline) / |baseline|) * 100
 */
export function calculatePercentageChange(current: number, baseline: number): number {
  if (Math.abs(baseline) < 1e-6) return 0;
  return ((current - baseline) / Math.abs(baseline)) * 100;
}

/**
 * Calculate rate of change per unit of time (e.g. per minute)
 */
export function calculateRateOfChangePerMinute(current: number, previous: number, deltaSeconds: number): number {
  if (deltaSeconds <= 0) return 0;
  return ((current - previous) / deltaSeconds) * 60;
}
