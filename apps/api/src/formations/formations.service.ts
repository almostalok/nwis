import { Injectable } from '@nestjs/common';
import { prisma } from '@nwis/database';

@Injectable()
export class FormationsService {
  async findAll(formationName?: string) {
    const where: any = {};
    if (formationName) {
      where.formationName = { contains: formationName, mode: 'insensitive' };
    }

    return prisma.formationInterval.findMany({
      where,
      include: {
        well: {
          select: {
            id: true,
            wellId: true,
            name: true,
            latitude: true,
            longitude: true,
            status: true,
          },
        },
      },
      orderBy: [{ formationName: 'asc' }, { topDepth: 'asc' }],
    });
  }
}
