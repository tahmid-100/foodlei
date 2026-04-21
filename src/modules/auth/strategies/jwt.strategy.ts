// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      // Request এর Authorization header থেকে Bearer token নাও
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
     secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  // Token valid হলে এই method call হয়
  // Return value টা request.user এ বসে যায়
  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });

    if (!user) throw new UnauthorizedException('User no longer exists');
    return user; // → req.user = user
  }
}