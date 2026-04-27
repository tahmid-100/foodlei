// src/modules/auth/auth.controller.ts
import {
  Controller, Post, Body, Get,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'নতুন account তৈরি করো' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login করো' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)       // ← এই route protected!
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'আমার profile দেখো' })
  getMe(@CurrentUser() user: User) {
    const { password, ...result } = user as any;
    return result;
  }


@Post('logout')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: 'Logout করো' })
logout(@CurrentUser() user: User) {
  return this.authService.logout(user.id);
}

@Post('refresh')
@UseGuards(JwtRefreshGuard)
@HttpCode(HttpStatus.OK)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: 'নতুন Access Token নাও' })
refresh(@CurrentUser() user: any) {
  return this.authService.refreshTokens(user.sub, user.refreshToken);
}
  
}