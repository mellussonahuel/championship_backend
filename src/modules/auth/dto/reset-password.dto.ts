import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '../../../decorators/match.decorator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  readonly newPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @Match('newPassword', { message: 'Passwords do not match' })
  readonly newPasswordConfirm: string;
}
