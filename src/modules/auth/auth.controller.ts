import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dtos/login.dto';
import { RequestWithUser } from './types';
import { AuthGuard } from './guard/auth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('auth')
@ApiBearerAuth('access-token')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @ApiBody({
    type: LoginDTO,
    examples: {
      example1: {
        summary: 'Login',
        value: {
          email: '',
          password: '',
        },
      },
    },
  })
  async login(@Body() loginBody: LoginDTO) {
    return await this.authService.validateUser(loginBody);
  };

  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(@Req() req: RequestWithUser) {
    return await this.authService.logout(req.user);
  }

};
