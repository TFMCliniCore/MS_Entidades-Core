import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(200)
  nombres!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MaxLength(15)
  celular!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefonoAlterno?: string;

  @IsString()
  @MaxLength(300)
  direccion!: string;

  @IsString()
  @MaxLength(50)
  ciudad!: string;

  @IsString()
  @MaxLength(20)
  documento!: string;

  @IsOptional()
  @IsDateString()
  cumpleanos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;
}
