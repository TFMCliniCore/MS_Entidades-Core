import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'CLAVE_SECRETA_PARA_EL_GATEWAY', // Esta clave debe ser la misma en el Gateway
    });
  }

  async validate(payload: any) {
    // Lo que retornes aquí se inyectará en request.user
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}