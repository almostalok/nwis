import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { WellsService } from '../wells/wells.service';
import { DataQualityService } from '../data-quality/data-quality.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly wellsService: WellsService,
    private readonly dataQualityService: DataQualityService,
  ) {}

  /**
   * Generates a Comprehensive Well Intelligence Dossier for drilling engineers & superintendents
   */
  async generateWellIntelligenceReport(wellIdentifier: string) {
    const well = await this.wellsService.findById(wellIdentifier);
    if (!well) {
      throw new NotFoundException(`Well [${wellIdentifier}] not found`);
    }

    const currentDepth = well.trajectoryPoints && well.trajectoryPoints.length > 0
      ? well.trajectoryPoints[well.trajectoryPoints.length - 1].measuredDepth
      : well.totalDepth;

    // Nearby wells within 15km radius
    const nearby = await this.wellsService.findNearby({
      latitude: well.latitude,
      longitude: well.longitude,
      radiusKm: 15,
      limit: 5,
    });

    const nearbyOffsetWells = nearby.filter((n) => n.id !== well.id);

    // Formations
    const formations = await this.wellsService.findFormations(well.id);

    // Precedent operational events on this well and nearby wells
    const ownEvents = await this.wellsService.findEvents(well.id);
    const nearbyWellIds = nearbyOffsetWells.map((n) => n.id);
    const offsetEvents = await prisma.operationalEvent.findMany({
      where: { wellId: { in: nearbyWellIds } },
      include: { well: { select: { wellId: true, name: true } } },
      take: 8,
      orderBy: { severity: 'desc' },
    });

    // Recent alerts on this well
    const alerts = await prisma.alert.findMany({
      where: { wellId: well.wellId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const reportGeneratedAt = new Date().toISOString();

    const markdown = `# NWIS WELL INTELLIGENCE DOSSIER
**Organization:** Oil India Limited (OIL) &bull; Exploration & Production Directorate  
**Well Identification:** ${well.wellId} (${well.name})  
**Field:** ${well.field} | **Basin:** Assam-Arakan Basin (OIL Concession)  
**Report Generated:** ${reportGeneratedAt}  
**Classification:** RESTRICTED DRILLING ADVISORY (SYNTHETIC DEMONSTRATION DATA)  

---

## 1. WELL EXECUTIVE OVERVIEW
- **Spud Date:** ${well.spudDate ? new Date(well.spudDate).toLocaleDateString() : 'N/A'}
- **Current Status:** ${well.status}
- **Well Type:** ${well.wellType}
- **Current Depth:** ${currentDepth} m (Total Planned Depth: ${well.totalDepth} m)
- **Geographic Coordinates:** ${well.latitude.toFixed(5)}°N, ${well.longitude.toFixed(5)}°E
- **Quality Score:** ${(well.qualityScore * 100).toFixed(1)}% (${well.qualityStatus})

## 2. STRATIGRAPHIC COLUMN & GEOLOGICAL INTERVALLING
${formations.length === 0 ? '_No formation interval records registered._' : formations.map((f: any) => `- **${f.formationName}**: ${f.topDepth}m – ${f.bottomDepth}m (Lithology: ${f.lithology}${f.reservoir ? ' &bull; [RESERVOIR]' : ''})`).join('\n')}

## 3. NEARBY OFFSET WELLS (SPATIAL RADIUS: 15 KM)
${nearbyOffsetWells.length === 0 ? '_No offset wells detected within specified radius._' : nearbyOffsetWells.map((o: any) => `- **${o.wellId} (${o.name})**: Distance: ${o.distanceKm?.toFixed(2) ?? 'N/A'} km | Status: ${o.status} | Total Depth: ${o.totalDepth}m`).join('\n')}

## 4. HISTORICAL OFFSET PRECEDENTS & GEOLOGICAL HAZARDS
${offsetEvents.length === 0 ? '_No severe historical incidents recorded on offset wells within correlation corridor._' : offsetEvents.map((e: any) => `- **[${e.severity}] ${e.eventType}** at well **${e.well?.wellId}** (${e.startDepth}m – ${e.endDepth || e.startDepth}m):
  - *Description:* ${e.description}
  - *Remedial Action Taken:* ${e.actionTaken || 'Normal drilling practice'}
  - *NPT Impact:* ${e.nptHours ? e.nptHours + ' hours NPT' : 'None reported'}`).join('\n')}

## 5. ACTIVE REAL-TIME ALERTS & RISK SUMMARY
- **Total Recorded Alerts:** ${alerts.length}
- **Active Alert Count:** ${alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').length}
${alerts.slice(0, 3).map((a) => `- [${a.severity}] **${a.title}** (${a.status}) — Triggered at ${a.detectedDepth}m`).join('\n')}

---
**Advisory Notice:** NWIS is a paired decision-support advisory system for Oil India Limited drilling personnel. It does NOT command physical rig mechanisms.
`;

    return {
      wellId: well.wellId,
      wellName: well.name,
      field: well.field,
      generatedAt: reportGeneratedAt,
      overview: {
        status: well.status,
        wellType: well.wellType,
        totalDepth: well.totalDepth,
        currentDepth,
        latitude: well.latitude,
        longitude: well.longitude,
        qualityScore: well.qualityScore,
      },
      formations,
      nearbyOffsetWells,
      offsetIncidentsCount: offsetEvents.length,
      offsetEvents,
      recentAlertsCount: alerts.length,
      recentAlerts: alerts,
      markdownReport: markdown,
    };
  }

  /**
   * Generates an Alert Post-Mortem & Investigation Report
   */
  async generateAlertInvestigationReport(alertId: string) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        events: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alert [${alertId}] not found`);
    }

    const well = await prisma.well.findUnique({
      where: { wellId: alert.wellId },
    });

    const reportGeneratedAt = new Date().toISOString();

    const markdown = `# NWIS ALERT INVESTIGATION & POST-MORTEM DOSSIER
**Organization:** Oil India Limited (OIL) &bull; Drilling Operations  
**Alert Identifier:** ${alert.id}  
**Alert Title:** ${alert.title}  
**Severity:** ${alert.severity} | **Status:** ${alert.status}  
**Well Identification:** ${alert.wellId} (${well?.name || 'OIL Well'})  
**Depth at Trigger:** ${alert.detectedDepth} m | **Formation ID:** ${alert.formationId || 'Subsurface formation'}  
**Report Generated:** ${reportGeneratedAt}  

---

## 1. HAZARD DESCRIPTION & SENSOR SIGNATURE
- **Risk Type:** ${alert.riskType}
- **Confidence Score:** ${(alert.confidence * 100).toFixed(1)}%
- **Hazard Summary:** ${alert.description}

## 2. AUDIT CHRONOLOGY & HUMAN-IN-THE-LOOP ACTIONS
${alert.events.length === 0 ? '_No audit state changes logged._' : alert.events.map((evt) => `- **${new Date(evt.timestamp).toLocaleTimeString()}** — Action: \`${evt.action}\` by **${evt.actor}** (State: ${evt.newState}): ${evt.reason || 'Status updated'}`).join('\n')}

---
**Safety Verification:** This report is compiled automatically by NWIS for OIL Drilling Incident Review committees.
`;

    return {
      alertId: alert.id,
      title: alert.title,
      severity: alert.severity,
      status: alert.status,
      wellId: alert.wellId,
      detectedDepth: alert.detectedDepth,
      formationId: alert.formationId,
      confidence: alert.confidence,
      generatedAt: reportGeneratedAt,
      description: alert.description,
      events: alert.events,
      markdownReport: markdown,
    };
  }

  /**
   * Generates Daily Operations & Safety Intelligence Summary
   */
  async generateDailyOperationalReport() {
    const [wells, alerts, qualityReport] = await Promise.all([
      prisma.well.findMany({ select: { id: true, wellId: true, name: true, field: true, status: true, totalDepth: true } }),
      prisma.alert.findMany({ take: 20, orderBy: { createdAt: 'desc' } }),
      this.dataQualityService.getReport(),
    ]);

    const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED');
    const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL');
    const reportGeneratedAt = new Date().toISOString();

    const markdown = `# NWIS DAILY DRILLING OPERATIONS & PRECEDENT INTELLIGENCE REPORT
**Reporting Organization:** Oil India Limited (OIL) &bull; Duliajan Central Command  
**Report Generated:** ${reportGeneratedAt}  
**Environment:** SYNTHETIC DEMONSTRATION & REPLAY MODE  

---

## 1. OPERATIONAL RIG ROSTER SUMMARY
- **Total Wells Tracked:** ${wells.length}
- **Active Drilling Wells:** ${wells.filter((w) => w.status === 'DRILLING').length}
- **Planned / Suspended Wells:** ${wells.filter((w) => w.status !== 'DRILLING').length}

## 2. SAFETY & HAZARD RISK SUMMARY
- **Total Alerts in Period:** ${alerts.length}
- **Critical Severity Alerts:** ${criticalAlerts.length}
- **Unresolved / Active Alerts:** ${activeAlerts.length}
- **Average Data Quality Index:** ${(qualityReport.overallScore * 100).toFixed(1)}%

## 3. HIGHLIGHTED ACTIVE ADVISORIES
${activeAlerts.length === 0 ? '_All alerts currently resolved or acknowledged._' : activeAlerts.slice(0, 5).map((a) => `- **[${a.severity}] ${a.title}** (Well: ${a.wellId} at ${a.detectedDepth}m): ${a.description}`).join('\n')}

---
`;

    return {
      generatedAt: reportGeneratedAt,
      wellsCount: wells.length,
      drillingWellsCount: wells.filter((w) => w.status === 'DRILLING').length,
      totalAlerts: alerts.length,
      criticalAlertsCount: criticalAlerts.length,
      activeAlertsCount: activeAlerts.length,
      dataQualityScore: qualityReport.overallScore,
      markdownReport: markdown,
    };
  }
}
