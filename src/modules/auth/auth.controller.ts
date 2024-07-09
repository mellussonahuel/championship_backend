import {
  Body,
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { SignInValidationPipe } from './pipes/SignInValidationPipe.pipe';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private readonly eventEmitter: TypedEventEmitter
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  signIn(@Body(new SignInValidationPipe()) signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    const isVerified = await this.authService.verifyEmail(token);

    return {
      status: isVerified,
      message: isVerified
        ? 'Email verified successfully'
        : 'Email verification failed',
    };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response
  ) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (user) {
      this.eventEmitter.emit('user.forgot-password', {
        email: user.email,
        name: user.name,
      });

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Password reset email sent successfully',
      });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Failed to send password reset email',
      });
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response
  ) {
    const result = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );

    if (result) {
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Password reset successfully',
      });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Password reset failed',
      });
    }
  }
}
