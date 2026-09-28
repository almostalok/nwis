import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, spatialRepository } from '@nwis/database';
import {
  CreateWellDto,
  NearbyWellResult,
  NearbyWellsQueryDto,
  Well,
  WellStatus,
  WellType,
} from '@nwis/types';
import { createWellSchema } from '@nwis/validation';

@Injectable()
export class WellsService {
  async findAll(params?: {
    field?: string;
    status?: WellStatus;
    wellType?: WellType;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Well[]> {
    const { field, status, wellType, search, limit = 50, offset = 0 } = params || {};

    const where: any = {};
    if (field) where.field = field;
    if (status) where.status = status;
    if (wellType) where.wellType = wellType;
    if (search) {
      where.OR = [
        { wellId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const wells = await prisma.well.findMany({
      where,
      orderBy: { wellId: 'asc' },
      take: Number(limit),
      skip: Number(offset),
    });

    return wells as any;
  }

  async findById(id: string) {
    const well = await prisma.well.findFirst({
      where: {
        OR: [{ id }, { wellId: id }],
      },
      include: {
        formations: { orderBy: { topDepth: 'asc' } },
        trajectoryPoints: { orderBy: { measuredDepth: 'asc' }, take: 50 },
        events: {
          orderBy: { startDepth: 'asc' },
          include: { formation: true, document: true },
        },
        documents: { orderBy: { createdAt: 'desc' } },
        casingSections: { orderBy: { settingDepth: 'asc' } },
        cementingJobs: { orderBy: { topDepth: 'asc' } },
        _count: {
          select: {
            drillingParameters: true,
            mudSamples: true,
            events: true,
            documents: true,
          },
        },
      },
    });

    if (!well) {
      throw new NotFoundException(`Well not found with identifier: ${id}`);
    }

    return well;
  }

  async create(data: CreateWellDto): Promise<Well> {
    const validationResult = createWellSchema.safeParse(data);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '));
    }

    const validated = validationResult.data;

    const existing = await prisma.well.findUnique({
      where: { wellId: validated.wellId },
    });
    if (existing) {
      throw new BadRequestException(`Well with ID ${validated.wellId} already exists`);
    }

    const created = await prisma.well.create({
      data: {
        wellId: validated.wellId,
        name: validated.name,
        field: validated.field,
        operator: validated.operator,
        wellType: validated.wellType,
        status: validated.status,
        spudDate: validated.spudDate ? new Date(validated.spudDate) : null,
        completionDate: validated.completionDate ? new Date(validated.completionDate) : null,
        totalDepth: validated.totalDepth,
        latitude: validated.latitude,
        longitude: validated.longitude,
        qualityStatus: validated.qualityStatus,
        qualityScore: validated.qualityScore,
        sourceId: validated.sourceId,
      },
    });

    return created as any;
  }

  async findNearby(query: NearbyWellsQueryDto): Promise<NearbyWellResult[]> {
    return spatialRepository.findNearbyWells({
      latitude: Number(query.latitude),
      longitude: Number(query.longitude),
      radiusKm: Number(query.radiusKm),
      formation: query.formation,
      status: query.status,
      wellType: query.wellType,
      limit: query.limit ? Number(query.limit) : 20,
    });
  }

  async findTrajectory(wellIdOrId: string) {
    const well = await this.findById(wellIdOrId);
    return prisma.wellTrajectoryPoint.findMany({
      where: { wellId: well.id },
      orderBy: { measuredDepth: 'asc' },
    });
  }

  async findFormations(wellIdOrId: string) {
    const well = await this.findById(wellIdOrId);
    return prisma.formationInterval.findMany({
      where: { wellId: well.id },
      orderBy: { topDepth: 'asc' },
    });
  }

  async findParameters(wellIdOrId: string, limit = 100) {
    const well = await this.findById(wellIdOrId);
    return prisma.drillingParameterSample.findMany({
      where: { wellId: well.id },
      orderBy: { measuredDepth: 'asc' },
      take: Number(limit),
    });
  }

  async findMud(wellIdOrId: string, limit = 50) {
    const well = await this.findById(wellIdOrId);
    return prisma.mudSample.findMany({
      where: { wellId: well.id },
      orderBy: { measuredDepth: 'asc' },
      take: Number(limit),
    });
  }

  async findEvents(wellIdOrId: string) {
    const well = await this.findById(wellIdOrId);
    return prisma.operationalEvent.findMany({
      where: { wellId: well.id },
      include: { formation: true, document: true },
      orderBy: { startDepth: 'asc' },
    });
  }

  async findDocuments(wellIdOrId: string) {
    const well = await this.findById(wellIdOrId);
    return prisma.document.findMany({
      where: { wellId: well.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
