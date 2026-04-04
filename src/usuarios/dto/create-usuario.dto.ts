import { IsEmail, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @MaxLength(200)
  nombres!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MaxLength(15)
  celular!: string;

  @IsString()
  @MaxLength(200)
  cargo!: string;

  @IsString()
  @MaxLength(200)
  roles!: string;

  @IsString()
  @MaxLength(50)
  contrasena!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  foto?: string;

  @IsInt()
  sucursalId!: number;

  @IsInt()
  rolId!: number;
}
