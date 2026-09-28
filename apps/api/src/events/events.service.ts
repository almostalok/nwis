import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@nwis/database';
import {
  CreateOperationalEventDto,
  DepthEventsQueryDto,
  NearDepthQueryDto,
  OperationalEvent,
} from '@nwis/types';
import { createOperationalEventSchema } from '@nwis/validation';

@Injectable()
export class EventsService {
  async findAll(query?: DepthEventsQueryDto) {
    const { formation, minDepth, maxDepth, eventType, severity, limit = 50, offset = 0 } = query || {};

    const where: any = {};
    if (eventType) where.eventType = eventType;
    if (severity) where.severity = severity;

    if (minDepth !== undefined || maxDepth !== undefined) {
      where.startDepth = {};
      if (minDepth !== undefined) where.startDepth.gte = Number(minDepth);
      if (maxDepth !== undefined) where.startDepth.lte = Number(maxDepth);
    }

    if (formation) {
      where.formation = {
        formationName: { contains: formation, mode: 'insensitive' },
      };
    }

    return prisma.operationalEvent.findMany({
      where,
      include: {
        well: {
          select: {
            id: true,
            wellId: true,
            name: true,
            field: true,
            latitude: true,
            longitude: true,
            status: true,
          },
        },
        formation: true,
        document: true,
      },
      orderBy: [{ startDepth: 'asc' }, { createdAt: 'desc' }],
      take: Number(limit),
      skip: Number(offset),
    });
  }

  async findNearDepth(query: NearDepthQueryDto) {
    const { targetDepth, toleranceMeters = 50, formation, eventType, excludeWellId } = query;

    const min = Number(targetDepth) - Number(toleranceMeters);
    const max = Number(targetDepth) + Number(toleranceMeters);

    const where: any = {
      startDepth: {
        gte: min,
        lte: max,
      },
    };

    if (eventType) where.eventType = eventType;
    if (excludeWellId) where.wellId = { not: excludeWellId };

    if (formation) {
      where.formation = {
        formationName: { contains: formation, mode: 'insensitive' },
      };
    }

    return prisma.operationalEvent.findMany({
      where,
      include: {
        well: {
          select: {
            id: true,
            wellId: true,
            name: true,
            field: true,
            latitude: true,
            longitude: true,
            status: true,
          },
        },
        formation: true,
        document: true,
      },
      orderBy: { startDepth: 'asc' },
    });
  }

  async findById(id: string) {
    const event = await prisma.operationalEvent.findUnique({
      where: { id },
      include: {
        well: true,
        formation: true,
        document: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Operational event not found: ${id}`);
    }

    return event;
  }

  async create(data: CreateOperationalEventDto): Promise<OperationalEvent> {
    const validation = createOperationalEventSchema.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
    }

    const val = validation.data;

    const created = await prisma.operationalEvent.create({
      data: {
        wellId: val.wellId,
        eventType: val.eventType,
        severity: val.severity,
        startDepth: val.startDepth,
        endDepth: val.endDepth,
        startTime: val.startTime ? new Date(val.startTime) : null,
        endTime: val.endTime ? new Date(val.endTime) : null,
        formationId: val.formationId,
        description: val.description,
        rootCause: val.rootCause,
        mitigation: val.mitigation,
        outcome: val.outcome,
        confidence: val.confidence,
        sourceDocumentId: val.sourceDocumentId,
        sourcePage: val.sourcePage,
        sourceLocation: val.sourceLocation,
        extractionMethod: val.extractionMethod || 'MANUAL',
        extractionConfidence: val.extractionConfidence || 1.0,
        verifiedBy: val.verifiedBy,
        verifiedAt: val.verifiedAt ? new Date(val.verifiedAt) : null,
        qualityStatus: val.qualityStatus,
        qualityScore: val.qualityScore,
      },
    });

    return created as any;
  }
}
