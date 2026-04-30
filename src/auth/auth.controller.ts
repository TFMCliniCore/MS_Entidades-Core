import { Controller, Post, Body, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto'; // Importa el DTO

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; pass: string }) {
    return this.authService.login(loginDto.email, loginDto.pass);
  }

  @Post('forgot-password') // Esto define la segunda parte: /forgot-password
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password') // /auth/reset-password
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Post('register')
async register(@Body() userData: any) {
  return this.authService.register(userData);
}
@Patch('change-password')
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(
      body.email,
      body.contrasenaAnterior,
      body.contrasenaNueva
    );
    }
}