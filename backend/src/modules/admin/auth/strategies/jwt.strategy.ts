import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from 'src/config/jwt.config';

export interface JwtAdmin {
  id: string;
  name: string;
  email: string;
  type: string;
  staff_code?: string;
  role: {
    id: number;
    name: string;
  };
  // Flat string array (e.g. ["PRODUCT_LIST", ...]) — keeps the cookie under 4 KB.
  permissions: string[];
  modules: string[];
}

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['accessToken'];
  }
  return null;
};

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(configService: ConfigService) {
    const jwt = configService.get<JwtConfig>('jwt');
    if (!jwt) {
      throw new Error('JWT configuration not found');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwt.accessTokenSecret,
    });
  }

  validate(payload: JwtAdmin): JwtAdmin {
    return payload;
  }
}
