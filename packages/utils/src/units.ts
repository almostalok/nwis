/**
 * Canonical Unit System for NWIS:
 * - Depth: Meters (m)
 * - Pressure: Bar (bar)
 * - Torque: Kilonewton-meters (kN.m)
 * - Temperature: Celsius (°C)
 * - Mud Weight: Specific Gravity (sg)
 * - Flow Rate: Liters per minute (lpm)
 * - Rate of Penetration (ROP): Meters per hour (m/h)
 * - Weight on Bit (WOB): Kilonewtons (kN)
 */

export class UnitNormalizer {
  // Depth conversion
  static depthToMeters(value: number, unit: 'm' | 'ft' | 'in' = 'm'): number {
    switch (unit.toLowerCase()) {
      case 'ft':
      case 'feet':
        return Number((value * 0.3048).toFixed(2));
      case 'in':
      case 'inches':
        return Number((value * 0.0254).toFixed(3));
      case 'm':
      case 'meters':
      default:
        return Number(value.toFixed(2));
    }
  }

  // Pressure conversion to Bar
  static pressureToBar(value: number, unit: 'bar' | 'psi' | 'kpa' | 'mpa' = 'bar'): number {
    switch (unit.toLowerCase()) {
      case 'psi':
        return Number((value * 0.0689476).toFixed(2));
      case 'kpa':
        return Number((value * 0.01).toFixed(2));
      case 'mpa':
        return Number((value * 10).toFixed(2));
      case 'bar':
      default:
        return Number(value.toFixed(2));
    }
  }

  // Torque conversion to kN.m
  static torqueToKNm(value: number, unit: 'kn.m' | 'ft-lb' | 'n.m' | 'kft-lb' = 'kn.m'): number {
    switch (unit.toLowerCase()) {
      case 'ft-lb':
      case 'ft.lb':
      case 'ftlb':
        return Number((value * 0.001355818).toFixed(3));
      case 'kft-lb':
        return Number((value * 1.355818).toFixed(3));
      case 'n.m':
      case 'nm':
        return Number((value * 0.001).toFixed(3));
      case 'kn.m':
      case 'knm':
      default:
        return Number(value.toFixed(3));
    }
  }

  // Temperature conversion to Celsius
  static temperatureToCelsius(value: number, unit: 'c' | 'f' | 'k' = 'c'): number {
    switch (unit.toLowerCase()) {
      case 'f':
        return Number(((value - 32) * (5 / 9)).toFixed(1));
      case 'k':
        return Number((value - 273.15).toFixed(1));
      case 'c':
      default:
        return Number(value.toFixed(1));
    }
  }

  // Mud Weight to Specific Gravity (sg)
  static mudWeightToSG(value: number, unit: 'sg' | 'ppg' | 'kg/m3' | 'pcf' = 'sg'): number {
    switch (unit.toLowerCase()) {
      case 'ppg': // pounds per gallon
        return Number((value * 0.1198264).toFixed(3));
      case 'kg/m3':
        return Number((value / 1000).toFixed(3));
      case 'pcf': // pounds per cubic foot
        return Number((value * 0.0160185).toFixed(3));
      case 'sg':
      default:
        return Number(value.toFixed(3));
    }
  }

  // Flow rate to Liters per Minute (lpm)
  static flowRateToLPM(value: number, unit: 'lpm' | 'gpm' | 'm3/h' | 'bpm' = 'lpm'): number {
    switch (unit.toLowerCase()) {
      case 'gpm': // gallons per minute (US)
        return Number((value * 3.78541).toFixed(1));
      case 'm3/h':
        return Number((value * 16.6667).toFixed(1));
      case 'bpm': // barrels per minute
        return Number((value * 158.987).toFixed(1));
      case 'lpm':
      default:
        return Number(value.toFixed(1));
    }
  }

  // WOB to Kilonewtons (kN)
  static wobToKN(value: number, unit: 'kn' | 'klbs' | 'tonne' | 'lbf' = 'kn'): number {
    switch (unit.toLowerCase()) {
      case 'klbs':
        return Number((value * 4.44822).toFixed(2));
      case 'tonne':
      case 'ton':
        return Number((value * 9.80665).toFixed(2));
      case 'lbf':
        return Number((value * 0.00444822).toFixed(2));
      case 'kn':
      default:
        return Number(value.toFixed(2));
    }
  }

  // ROP to Meters per Hour (m/h)
  static ropToMetersPerHour(value: number, unit: 'm/h' | 'ft/h' = 'm/h'): number {
    switch (unit.toLowerCase()) {
      case 'ft/h':
      case 'fph':
        return Number((value * 0.3048).toFixed(2));
      case 'm/h':
      default:
        return Number(value.toFixed(2));
    }
  }
}
