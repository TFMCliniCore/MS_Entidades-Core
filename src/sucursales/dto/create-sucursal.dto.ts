import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSucursalDto {
  @IsString()
  @MaxLength(200)
  nombre!: string;

  @IsString()
  @MaxLength(300)
  direccion!: string;

  @IsString()
  @MaxLength(15)
  telefono!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  redes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;
}
