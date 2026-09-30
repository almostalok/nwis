import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@nwis/database';
import { CryptoUtils } from '@nwis/utils';
import { AuthTokenPayload, LoginResponse, UserRecord, AuditAction } from '@nwis/types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(email: string, passwordPlain: string): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await CryptoUtils.verifyPassword(passwordPlain, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Auto-upgrade legacy SHA-256 hash to bcrypt on successful login
    if (!user.passwordHash.startsWith('$2a$') && !user.passwordHash.startsWith('$2b$')) {
      const newBcryptHash = await CryptoUtils.hashPassword(passwordPlain);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newBcryptHash },
      });
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is inactive');
    }

    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.LOGIN,
        entityType: 'USER',
        entityId: user.id,
        metadata: { role: user.role, email: user.email },
      },
    });

    const userRecord: UserRecord = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      department: user.department,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { token, user: userRecord };
  }

  async getProfile(userId: string): Promise<UserRecord> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      department: user.department,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async listUsers(): Promise<UserRecord[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      department: user.department,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
