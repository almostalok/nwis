import { PrismaClient } from '@prisma/client';
import { SpatialRepository } from './spatial';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export const spatialRepository = new SpatialRepository(prisma);

export * from '@prisma/client';
export * from './spatial';
