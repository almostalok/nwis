import { EventSeverity, EventType } from '@nwis/types';
import { EventNormalizer } from './event-normalizer';
import { UnitNormalizer } from './units';

export interface ExtractedDomainEntities {
  wells: string[];
  depths: { value: number; unit: string; raw: string; confidence: number }[];
  formations: { name: string; confidence: number }[];
  events: {
    eventType: EventType;
    severity: EventSeverity;
    depth?: number;
    rawText: string;
    confidence: number;
    precedingIndicators?: string[];
  }[];
  mitigations: {
    problem?: string;
    action: string;
    outcome?: string;
    confidence: number;
  }[];
  lessonsLearned: string[];
}

export class DomainNLPUtils {
  private static readonly FORMATION_LIST = [
    'Alluvial Cover',
    'Dhekiajuli',
    'Girujan Clay',
    'Tipam Sandstone',
    'Barail',
    'Kopili',
    'Jaintia',
    'Formation Alpha',
    'Formation Beta',
    'Formation Gamma',
    'Formation Delta',
    'Formation Epsilon',
  ];

  /**
   * Identifies all well identifiers from text.
   */
  static extractWells(text: string): string[] {
    const regex = /\b(?:OIL-SYN-\d{3}|SYN-\d{3}|Well\s*(?:OIL-SYN-)?\d{3})\b/gi;
    const matches = text.match(regex) || [];
    const normalized = matches.map((m) => {
      const numMatch = m.match(/\d{3}/);
      return numMatch ? `OIL-SYN-${numMatch[0]}` : m.toUpperCase();
    });
    return Array.from(new Set(normalized));
  }

  /**
   * Identifies measured depths and converts them to canonical meters.
   */
  static extractDepths(text: string): { value: number; unit: string; raw: string; confidence: number }[] {
    const results: { value: number; unit: string; raw: string; confidence: number }[] = [];
    const regex = /\b(\d{3,4}(?:\.\d+)?)\s*(meters|metres|m\s*MD|m|ft|feet)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const rawVal = parseFloat(match[1]);
      const rawUnit = match[2].toLowerCase();
      let canonicalMeters = rawVal;
      if (rawUnit.startsWith('f')) {
        canonicalMeters = UnitNormalizer.depthToMeters(rawVal, 'ft');
      }

      results.push({
        value: canonicalMeters,
        unit: 'm',
        raw: match[0],
        confidence: 0.95,
      });
    }

    return results;
  }

  /**
   * Identifies geological formation names mentioned in text.
   */
  static extractFormations(text: string): { name: string; confidence: number }[] {
    const found: { name: string; confidence: number }[] = [];
    for (const f of this.FORMATION_LIST) {
      const pattern = new RegExp(`\\b${f}\\b`, 'i');
      if (pattern.test(text)) {
        found.push({ name: f, confidence: 0.95 });
      }
    }
    return found;
  }

  /**
   * Extracts operational events, their severity, and preceding indicators.
   */
  static extractEvents(text: string): ExtractedDomainEntities['events'] {
    const results: ExtractedDomainEntities['events'] = [];
    const textLower = text.toLowerCase();

    // Context-wide indicators
    const contextIndicators: string[] = [];
    if (textLower.includes('torque') && (textLower.includes('increase') || textLower.includes('spike') || textLower.includes('erratic') || textLower.includes('fluctuat'))) {
      contextIndicators.push('TORQUE_SPIKE');
    }
    if (textLower.includes('rop') && (textLower.includes('drop') || textLower.includes('decrease') || textLower.includes('reduc') || textLower.includes('decay'))) {
      contextIndicators.push('ROP_DECREASE');
    }
    if (textLower.includes('drag') && (textLower.includes('increase') || textLower.includes('high') || textLower.includes('elevated'))) {
      contextIndicators.push('DRAG_INCREASE');
    }
    if (textLower.includes('pit volume') && (textLower.includes('decrease') || textLower.includes('loss') || textLower.includes('drop'))) {
      contextIndicators.push('PIT_VOLUME_DROP');
    }
    if (textLower.includes('flow') && textLower.includes('imbalance')) {
      contextIndicators.push('FLOW_IMBALANCE');
    }

    const sentences = text.split(/(?<=[.!?])\s+|\n+/);

    for (const sentence of sentences) {
      const normResult = EventNormalizer.normalize(sentence);
      if (normResult && normResult.eventType !== EventType.OTHER) {
        // Detect sentence-specific indicators
        const indicators = Array.from(new Set([...contextIndicators]));

        // Detect depth in sentence or fallback to text
        let depths = this.extractDepths(sentence);
        if (depths.length === 0) depths = this.extractDepths(text);
        const depth = depths.length > 0 ? depths[0].value : undefined;

        // Detect severity
        const lower = sentence.toLowerCase();
        let severity = EventSeverity.HIGH;
        if (lower.includes('critical') || lower.includes('severe') || lower.includes('total loss')) {
          severity = EventSeverity.CRITICAL;
        } else if (lower.includes('minor') || lower.includes('slight') || lower.includes('partial')) {
          severity = EventSeverity.MEDIUM;
        }

        results.push({
          eventType: normResult.eventType,
          severity,
          depth,
          rawText: sentence.trim(),
          confidence: normResult.confidence,
          precedingIndicators: indicators.length > 0 ? indicators : undefined,
        });
      }
    }

    return results;
  }

  /**
   * Extracts problem-action-outcome mitigation pairs from text.
   */
  static extractMitigations(text: string): ExtractedDomainEntities['mitigations'] {
    const mitigations: ExtractedDomainEntities['mitigations'] = [];
    const actionPatterns = [
      /(?:action|mitigation|remedial\s*action|procedure)\s*[:=-]\s*([^.\n]+)/i,
      /(?:pumped|spotted|worked|jarred|circulated)\s+([^.\n]+)/i,
      /(?:LCM\s*pill|high-viscosity\s*pill|freeing\s*agent|acid\s*pill)\s+([^.\n]+)/i,
    ];

    for (const pattern of actionPatterns) {
      const match = text.match(pattern);
      if (match) {
        mitigations.push({
          action: match[0].trim(),
          confidence: 0.88,
        });
      }
    }

    return mitigations;
  }

  /**
   * Extracts explicitly stated lessons learned.
   */
  static extractLessonsLearned(text: string): string[] {
    const lessons: string[] = [];
    const regex = /(?:lesson\s*learned|recommendation|operational\s*learning)\s*[:=-]\s*([^.\n]+(?:[.][^.\n]+)?)/gi;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      lessons.push(match[1].trim());
    }

    return lessons;
  }

  /**
   * Performs full-suite entity extraction on a document text or chunk.
   */
  static extractAll(text: string): ExtractedDomainEntities {
    return {
      wells: this.extractWells(text),
      depths: this.extractDepths(text),
      formations: this.extractFormations(text),
      events: this.extractEvents(text),
      mitigations: this.extractMitigations(text),
      lessonsLearned: this.extractLessonsLearned(text),
    };
  }
}
