import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail({}, { message: 'El formato del usuario (email) no es válido.' })
  @IsNotEmpty()
  email!: string; // El '!' elimina el error ts(2564)

  @IsString()
  @IsNotEmpty({ message: 'La contraseña anterior es obligatoria.' })
  contrasenaAnterior!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, {
    message: 'La nueva contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.'
  })
  contrasenaNueva!: string;
}