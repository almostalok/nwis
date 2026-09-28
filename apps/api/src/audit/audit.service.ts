import { Injectable } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { AuditAction, CreateAuditLogDto } from '@nwis/types';

@Injectable()
export class AuditService {
  async log(dto: CreateAuditLogDto) {
    return prisma.auditLog.create({
      data: {
        userId: dto.userId || null,
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId || null,
        metadata: dto.metadata || {},
        ipAddress: dto.ipAddress || null,
        userAgent: dto.userAgent || null,
      },
    });
  }

  async findAll(limit: number = 50) {
    return prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
    });
  }
}
