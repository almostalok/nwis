import { EventType } from '@nwis/types';

interface SynonymMatch {
  canonical: EventType;
  keywords: string[];
}

export class EventNormalizer {
  private static readonly RULES: SynonymMatch[] = [
    {
      canonical: EventType.STUCK_PIPE,
      keywords: [
        'stuck pipe',
        'pipe stuck',
        'differential sticking',
        'mechanically stuck',
        'stuck string',
        'string stuck',
        'drillstring stuck',
        'unable to pull up',
        'unable to rotate',
        'key seating stuck',
      ],
    },
    {
      canonical: EventType.LOST_CIRCULATION,
      keywords: [
        'lost circulation',
        'mud loss',
        'loss of returns',
        'seepage loss',
        'partial returns',
        'total losses',
        'mud losses',
        'pit volume drop',
        'fluid loss to formation',
        'thief zone',
      ],
    },
    {
      canonical: EventType.KICK,
      keywords: [
        'kick',
        'gas kick',
        'well kick',
        'fluid influx',
        'gas influx',
        'water influx',
        'pit gain',
        'flow check positive',
        'shut in well',
        'swabbing kick',
      ],
    },
    {
      canonical: EventType.FISHING,
      keywords: [
        'fishing',
        'fish in hole',
        'twisted off',
        'twist off',
        'parted string',
        'parted drill string',
        'parted drillpipe',
        'dropped drill string',
        'lost bit cone',
        'overshot run',
        'jarring operation',
      ],
    },
    {
      canonical: EventType.NPT,
      keywords: [
        'npt',
        'non productive time',
        'rig repair',
        'rig breakdown',
        'waiting on weather',
        'wow',
        'waiting on cement',
        'woc',
        'standby',
        'generator down',
      ],
    },
    {
      canonical: EventType.TORQUE_SPIKE,
      keywords: [
        'torque spike',
        'high torque',
        'erratic torque',
        'overtorque',
        'torque erratic',
        'rotary torque surge',
        'torque fluctuation',
      ],
    },
    {
      canonical: EventType.PRESSURE_ANOMALY,
      keywords: [
        'pressure anomaly',
        'standpipe pressure drop',
        'standpipe pressure spike',
        'pressure surge',
        'washout in drillstring',
        'nozzle plugged',
        'abnormal pore pressure',
      ],
    },
    {
      canonical: EventType.FORMATION_INSTABILITY,
      keywords: [
        'formation instability',
        'hole collapse',
        'tight hole',
        'sloughing shale',
        'caving',
        'hole pack-off',
        'pack off',
        'bridging',
        'wellbore instability',
      ],
    },
    {
      canonical: EventType.CASING_EVENT,
      keywords: [
        'casing event',
        'casing collapse',
        'casing burst',
        'casing leak',
        'casing stuck off bottom',
        'parted casing',
        'casing wear',
        'shoe track failure',
      ],
    },
    {
      canonical: EventType.CEMENTING_EVENT,
      keywords: [
        'cementing event',
        'cement channeling',
        'flash set',
        'premature setting',
        'low top of cement',
        'toc low',
        'cement contamination',
        'no cement returns',
      ],
    },
    {
      canonical: EventType.EQUIPMENT_FAILURE,
      keywords: [
        'equipment failure',
        'mud pump failure',
        'top drive failure',
        'mwd failure',
        'lwd failure',
        'rotary table failure',
        'bop malfunction',
        'swivel leak',
      ],
    },
  ];

  /**
   * Normalizes raw event text or code into a canonical EventType and confidence score.
   */
  static normalize(rawInput: string): { eventType: EventType; confidence: number; matchedKeyword?: string } {
    if (!rawInput || typeof rawInput !== 'string') {
      return { eventType: EventType.OTHER, confidence: 0.1 };
    }

    const cleanInput = rawInput.trim().toUpperCase();

    // Check direct enum exact match
    if (Object.values(EventType).includes(cleanInput as EventType)) {
      return { eventType: cleanInput as EventType, confidence: 1.0, matchedKeyword: cleanInput };
    }

    const lowerInput = rawInput.toLowerCase();

    for (const rule of this.RULES) {
      for (const keyword of rule.keywords) {
        if (lowerInput.includes(keyword)) {
          return {
            eventType: rule.canonical,
            confidence: 0.95,
            matchedKeyword: keyword,
          };
        }
      }
    }

    return { eventType: EventType.OTHER, confidence: 0.5 };
  }
}
