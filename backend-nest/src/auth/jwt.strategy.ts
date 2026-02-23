import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

function extractTokenFromCookies(req: Request): string | null {
  const maybeCookies: unknown = (req as Request & { cookies?: unknown })
    .cookies;
  const tokenFromParsedCookies =
    typeof maybeCookies === 'object' && maybeCookies !== null
      ? (maybeCookies as Record<string, unknown>).token
      : undefined;
  if (
    typeof tokenFromParsedCookies === 'string' &&
    tokenFromParsedCookies.trim() !== ''
  ) {
    return tokenFromParsedCookies;
  }

  const rawCookie = req.headers.cookie;
  if (!rawCookie) {
    return null;
  }

  const tokenCookie = rawCookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('token='));

  if (!tokenCookie) {
    return null;
  }

  const [, token] = tokenCookie.split('=');
  return token ? decodeURIComponent(token) : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => extractTokenFromCookies(request),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: unknown) {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('id' in payload) ||
      typeof (payload as { id: unknown }).id !== 'number'
    ) {
      throw new UnauthorizedException();
    }
    const jwtPayload = payload as { id: number };

    const user = await this.prisma.usuario.findUnique({
      where: { id: jwtPayload.id },
      select: { id: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    // Return user object which will be injected into request
    return user;
  }
}
