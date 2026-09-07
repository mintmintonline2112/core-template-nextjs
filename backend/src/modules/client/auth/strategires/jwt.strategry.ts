import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { JwtConfig } from 'src/config/jwt.config';

export interface JwtUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: 'USER';
  status: AccountStatus;
}

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['user_access_token'];
  }
  return null;
};

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
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

  validate(payload: JwtUser): JwtUser {
    return payload;
  }
}
