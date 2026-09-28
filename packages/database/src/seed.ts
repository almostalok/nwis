import { PrismaClient } from '@prisma/client';
import { SYNTHETIC_WELLS } from './seed-data';
import { CryptoUtils } from '@nwis/utils';
import { AuditAction, DataSourceType, UserRole, QualityStatus } from '@nwis/types';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting NWIS Database Deterministic Seeding ---');

  // 1. Seed or Upsert Data Sources
  const syntheticSource = await prisma.dataSource.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'OIL-COMPATIBLE-SYNTHETIC-DATASET',
      type: DataSourceType.SYNTHETIC,
      version: '1.0.0',
      active: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'OIL-COMPATIBLE-SYNTHETIC-DATASET',
      type: DataSourceType.SYNTHETIC,
      description: 'OIL-compatible synthetic dataset for development and precedent retrieval benchmarking',
      version: '1.0.0',
      connectionType: 'STATIC_FILE',
      active: true,
      metadata: { generatedFor: 'NWIS-Stage-01', totalWells: 20 },
    },
  });

  await prisma.dataSource.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {
      name: 'OIL-WITSML-ENDPOINT-PLACEHOLDER',
      type: DataSourceType.WITSML,
      version: '1.4.1.1',
      active: false,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'OIL-WITSML-ENDPOINT-PLACEHOLDER',
      type: DataSourceType.WITSML,
      description: 'Placeholder adapter config for future OIL eRTMAC WITSML connection',
      version: '1.4.1.1',
      connectionType: 'SOAP_WITSML',
      active: false,
      metadata: { endpointUrl: 'https://ertmac.oilindia.in/witsml/services/WMLS' },
    },
  });

  // 2. Seed Demo RBAC Users (Password: "password123")
  const defaultPasswordHash = CryptoUtils.sha256('password123');

  const demoUsers = [
    { email: 'admin@nwis.oil.in', name: 'Alok (System Administrator)', role: UserRole.ADMIN, department: 'Digital Transformation & IT' },
    { email: 'engineer@nwis.oil.in', name: 'S. K. Saikia (Senior Drilling Engineer)', role: UserRole.DRILLING_ENGINEER, department: 'Drilling Services' },
    { email: 'geologist@nwis.oil.in', name: 'Dr. P. Borah (Chief Geologist)', role: UserRole.GEOLOGIST, department: 'Geology & Geophysics' },
    { email: 'manager@nwis.oil.in', name: 'R. K. Hazarika (Asset Manager)', role: UserRole.MANAGER, department: 'Field Operations Management' },
    { email: 'data@nwis.oil.in', name: 'A. Sharma (Data Platform Engineer)', role: UserRole.DATA_ENGINEER, department: 'Data Intelligence' },
    { email: 'viewer@nwis.oil.in', name: 'Operations Viewer', role: UserRole.VIEWER, department: 'Central Control' },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        department: u.department,
        passwordHash: defaultPasswordHash,
        active: true,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        department: u.department,
        passwordHash: defaultPasswordHash,
        active: true,
      },
    });
  }
  console.log(`✓ Seeded ${demoUsers.length} RBAC demo users.`);

  // 3. Seed Wells & Related Drilling Entities
  let wellCount = 0;
  let formationCount = 0;
  let eventCount = 0;
  let sampleCount = 0;
  let docCount = 0;

  for (const wellData of SYNTHETIC_WELLS) {
    const well = await prisma.well.upsert({
      where: { wellId: wellData.wellId },
      update: {
        name: wellData.name,
        field: wellData.field,
        operator: wellData.operator,
        wellType: wellData.wellType,
        status: wellData.status,
        spudDate: new Date(wellData.spudDate),
        completionDate: wellData.completionDate ? new Date(wellData.completionDate) : null,
        totalDepth: wellData.totalDepth,
        latitude: wellData.latitude,
        longitude: wellData.longitude,
        qualityStatus: QualityStatus.VALID,
        qualityScore: 1.0,
        sourceId: syntheticSource.id,
      },
      create: {
        wellId: wellData.wellId,
        name: wellData.name,
        field: wellData.field,
        operator: wellData.operator,
        wellType: wellData.wellType,
        status: wellData.status,
        spudDate: new Date(wellData.spudDate),
        completionDate: wellData.completionDate ? new Date(wellData.completionDate) : null,
        totalDepth: wellData.totalDepth,
        latitude: wellData.latitude,
        longitude: wellData.longitude,
        qualityStatus: QualityStatus.VALID,
        qualityScore: 1.0,
        sourceId: syntheticSource.id,
      },
    });
    wellCount++;

    // Formations
    const createdFormations: Record<string, string> = {};
    for (const f of wellData.formations) {
      const existing = await prisma.formationInterval.findFirst({
        where: { wellId: well.id, formationName: f.formationName },
      });
      if (!existing) {
        const created = await prisma.formationInterval.create({
          data: {
            wellId: well.id,
            formationName: f.formationName,
            topDepth: f.topDepth,
            bottomDepth: f.bottomDepth,
            topTVD: f.topTVD,
            bottomTVD: f.bottomTVD,
            lithology: f.lithology,
            reservoir: f.reservoir,
            confidence: f.confidence,
            sourceId: syntheticSource.id,
            qualityStatus: QualityStatus.VALID,
          },
        });
        createdFormations[f.formationName] = created.id;
        formationCount++;
      } else {
        createdFormations[f.formationName] = existing.id;
      }
    }

    // Trajectory Points
    if (wellData.trajectories && wellData.trajectories.length > 0) {
      await prisma.wellTrajectoryPoint.deleteMany({ where: { wellId: well.id } });
      for (const t of wellData.trajectories) {
        await prisma.wellTrajectoryPoint.create({
          data: {
            wellId: well.id,
            measuredDepth: t.measuredDepth,
            trueVerticalDepth: t.trueVerticalDepth,
            inclination: t.inclination,
            azimuth: t.azimuth,
            latitude: t.latitude,
            longitude: t.longitude,
            dogLegSeverity: t.dogLegSeverity,
          },
        });
      }
    }

    // Documents
    const documentIdMap: Record<string, string> = {};
    for (const doc of wellData.documents) {
      const existingDoc = await prisma.document.findFirst({
        where: { wellId: well.id, fileName: doc.fileName },
      });
      if (!existingDoc) {
        const createdDoc = await prisma.document.create({
          data: {
            wellId: well.id,
            documentType: doc.documentType,
            title: doc.title,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            storagePath: doc.storagePath,
            documentDate: new Date(doc.documentDate),
            pageCount: doc.pageCount,
            checksum: CryptoUtils.sha256(doc.fileName + doc.title),
            sourceSystem: 'NWIS-SYNTHETIC-STORE',
          },
        });
        documentIdMap[doc.fileName] = createdDoc.id;
        docCount++;
      } else {
        documentIdMap[doc.fileName] = existingDoc.id;
      }
    }

    // Drilling Samples
    if (wellData.drillingSamples && wellData.drillingSamples.length > 0) {
      await prisma.drillingParameterSample.deleteMany({ where: { wellId: well.id } });
      for (const s of wellData.drillingSamples) {
        await prisma.drillingParameterSample.create({
          data: {
            wellId: well.id,
            timestamp: new Date(s.timestamp),
            measuredDepth: s.measuredDepth,
            rop: s.rop,
            wob: s.wob,
            rpm: s.rpm,
            torque: s.torque,
            hookLoad: s.hookLoad,
            standpipePressure: s.standpipePressure,
            flowRate: s.flowRate,
            blockPosition: s.blockPosition,
            blockSpeed: s.blockSpeed,
            additionalTags: s.additionalTags || {},
            qualityStatus: QualityStatus.VALID,
          },
        });
        sampleCount++;
      }
    }

    // Mud Samples
    if (wellData.mudSamples && wellData.mudSamples.length > 0) {
      await prisma.mudSample.deleteMany({ where: { wellId: well.id } });
      for (const m of wellData.mudSamples) {
        await prisma.mudSample.create({
          data: {
            wellId: well.id,
            timestamp: new Date(m.timestamp),
            measuredDepth: m.measuredDepth,
            mudWeight: m.mudWeight,
            plasticViscosity: m.plasticViscosity,
            yieldPoint: m.yieldPoint,
            funnelViscosity: m.funnelViscosity,
            fluidLoss: m.fluidLoss,
            ph: m.ph,
            chlorides: m.chlorides,
            solids: m.solids,
            flowRate: m.flowRate,
            pitVolume: m.pitVolume,
            gasReading: m.gasReading,
            qualityStatus: QualityStatus.VALID,
          },
        });
      }
    }

    // Events
    for (const ev of wellData.events) {
      const existingEv = await prisma.operationalEvent.findFirst({
        where: { wellId: well.id, startDepth: ev.startDepth, eventType: ev.eventType },
      });
      if (!existingEv) {
        const formationId = createdFormations[ev.formationName] || null;
        const sourceDocId = ev.sourceDocumentRef ? documentIdMap[ev.sourceDocumentRef] || null : null;

        await prisma.operationalEvent.create({
          data: {
            wellId: well.id,
            eventType: ev.eventType,
            severity: ev.severity,
            startDepth: ev.startDepth,
            endDepth: ev.endDepth,
            startTime: ev.startTime ? new Date(ev.startTime) : null,
            endTime: ev.endTime ? new Date(ev.endTime) : null,
            formationId: formationId,
            description: ev.description,
            rootCause: ev.rootCause,
            mitigation: ev.mitigation,
            outcome: ev.outcome,
            confidence: ev.confidence,
            sourceDocumentId: sourceDocId,
            sourcePage: ev.sourcePage || 1,
            sourceLocation: 'NWIS-DEMO-FIELD',
            extractionMethod: 'MANUAL_EXPERT_ANNOTATION',
            extractionConfidence: 1.0,
            verifiedBy: 'Senior Drilling Superintendent (OIL Synthetic Operations)',
            verifiedAt: new Date(),
            qualityStatus: QualityStatus.VERIFIED,
            qualityScore: 1.0,
          },
        });
        eventCount++;
      }
    }

    // Casings
    for (const c of wellData.casingSections) {
      const existingCasing = await prisma.casingSection.findFirst({
        where: { wellId: well.id, section: c.section },
      });
      if (!existingCasing) {
        await prisma.casingSection.create({
          data: {
            wellId: well.id,
            section: c.section,
            casingSize: c.casingSize,
            settingDepth: c.settingDepth,
            topDepth: c.topDepth,
            bottomDepth: c.bottomDepth,
            grade: c.grade,
            weight: c.weight,
            cementTop: c.cementTop,
            cementBottom: c.cementBottom,
          },
        });
      }
    }

    // Cementing
    for (const j of wellData.cementingJobs) {
      const existingJob = await prisma.cementingJob.findFirst({
        where: { wellId: well.id, topDepth: j.topDepth, bottomDepth: j.bottomDepth },
      });
      if (!existingJob) {
        await prisma.cementingJob.create({
          data: {
            wellId: well.id,
            jobDate: new Date(j.jobDate),
            topDepth: j.topDepth,
            bottomDepth: j.bottomDepth,
            cementVolume: j.cementVolume,
            cementDensity: j.cementDensity,
            slurryType: j.slurryType,
            displacementVolume: j.displacementVolume,
            jobStatus: j.jobStatus,
            remarks: j.remarks,
          },
        });
      }
    }
  }

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      action: AuditAction.DATA_IMPORT,
      entityType: 'SYNTHETIC_DATASET',
      entityId: syntheticSource.id,
      metadata: {
        wellsSeeded: wellCount,
        formationsSeeded: formationCount,
        eventsSeeded: eventCount,
        samplesSeeded: sampleCount,
        documentsSeeded: docCount,
      },
    },
  });

  console.log(`✓ Successfully seeded:`);
  console.log(`  - ${wellCount} Wells`);
  console.log(`  - ${formationCount} Formation Intervals`);
  console.log(`  - ${eventCount} Historical Precedent Operational Events`);
  console.log(`  - ${sampleCount} Drilling Time-Series Samples`);
  console.log(`  - ${docCount} Sample Document Metadata Records`);
  console.log('--- NWIS Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
