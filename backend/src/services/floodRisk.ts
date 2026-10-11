/**
 * Deterministic Flood Risk Scoring Engine
 * 
 * TRANSPARENT MODEL ASSUMPTIONS:
 * - Rainfall weight: 40% (primary driver for short-term flood risk)
 * - River level weight: 35% (direct indicator of imminent flooding)
 * - Soil saturation weight: 15% (reduces absorption capacity)
 * - Historical score weight: 10% (long-term vulnerability baseline)
 * 
 * All inputs are normalized to [0, 100] before weighted summation.
 * Uncertainty is ±15% for synthetic/estimated inputs.
 * 
 * This is a simplified educational model. Real flood risk requires
 * hydrological modeling, DEM data, drainage capacity, and more.
 */

export interface FloodRiskInput {
  districtId: string;
  rainfallMm: number;       // 24h rainfall in mm (0–2000)
  riverLevel: number;       // River level in meters (0–20)
  soilSaturation: number;   // 0–1 (0=dry, 1=fully saturated)
  historicalScore: number;  // 0–100 district historical flood score
}

export interface FloodRiskResult {
  riskScore: number;         // 0–100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  components: {
    rainfallComponent: number;
    riverLevelComponent: number;
    soilComponent: number;
    historicalComponent: number;
  };
  assumptions: {
    rainfallWeight: number;
    riverLevelWeight: number;
    soilWeight: number;
    historicalWeight: number;
    rainfallNormMax: number;
    riverLevelNormMax: number;
    modelVersion: string;
    modelDescription: string;
  };
  uncertainty: number;        // ± percentage
  recommendation: string;
  isSynthetic: boolean;
}

export function calculateFloodRisk(input: FloodRiskInput): FloodRiskResult {
  // Weights (must sum to 1.0)
  const WEIGHTS = {
    rainfall: 0.40,
    riverLevel: 0.35,
    soil: 0.15,
    historical: 0.10,
  };

  // Normalization constants
  const RAINFALL_MAX_MM = 300;   // Extreme 24h rainfall threshold
  const RIVER_LEVEL_MAX = 10;    // Extreme river level threshold (meters)

  // Normalize each component to [0, 100]
  const rainfallNorm = Math.min((input.rainfallMm / RAINFALL_MAX_MM) * 100, 100);
  const riverNorm = Math.min((input.riverLevel / RIVER_LEVEL_MAX) * 100, 100);
  const soilNorm = input.soilSaturation * 100;
  const histNorm = Math.min(input.historicalScore, 100);

  // Weighted sum
  const riskScore = Math.round(
    rainfallNorm * WEIGHTS.rainfall +
    riverNorm * WEIGHTS.riverLevel +
    soilNorm * WEIGHTS.soil +
    histNorm * WEIGHTS.historical
  );

  const clampedScore = Math.max(0, Math.min(100, riskScore));

  // Risk level thresholds
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  let recommendation: string;

  if (clampedScore >= 75) {
    riskLevel = 'CRITICAL';
    recommendation = 'Immediate evacuation recommended for high-risk zones. Deploy all available rescue assets. Activate full emergency response protocol.';
  } else if (clampedScore >= 55) {
    riskLevel = 'HIGH';
    recommendation = 'Pre-position rescue teams and open evacuation shelters. Issue public advisories. Increase monitoring frequency to 2-hour intervals.';
  } else if (clampedScore >= 35) {
    riskLevel = 'MODERATE';
    recommendation = 'Maintain heightened vigilance. Verify shelter readiness. Community awareness campaigns recommended.';
  } else {
    riskLevel = 'LOW';
    recommendation = 'Routine monitoring. Ensure early warning systems are operational. No immediate action required.';
  }

  return {
    riskScore: clampedScore,
    riskLevel,
    recommendation,
    components: {
      rainfallComponent: Math.round(rainfallNorm * WEIGHTS.rainfall),
      riverLevelComponent: Math.round(riverNorm * WEIGHTS.riverLevel),
      soilComponent: Math.round(soilNorm * WEIGHTS.soil),
      historicalComponent: Math.round(histNorm * WEIGHTS.historical),
    },
    assumptions: {
      rainfallWeight: WEIGHTS.rainfall,
      riverLevelWeight: WEIGHTS.riverLevel,
      soilWeight: WEIGHTS.soil,
      historicalWeight: WEIGHTS.historical,
      rainfallNormMax: RAINFALL_MAX_MM,
      riverLevelNormMax: RIVER_LEVEL_MAX,
      modelVersion: '1.0.0-deterministic',
      modelDescription: 'Simplified deterministic weighted-sum model for educational/demonstration use. Not validated for operational emergency management.',
    },
    uncertainty: 15,
    isSynthetic: true,
  };
}
