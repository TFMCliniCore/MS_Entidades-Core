import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @MaxLength(200)
  nombre!: string;

  @IsString()
  @MaxLength(20)
  edad!: string;

  @IsString()
  @MaxLength(8)
  sexo!: string;

  @IsString()
  @MaxLength(20)
  especie!: string;

  @IsString()
  @MaxLength(50)
  raza!: string;

  @IsString()
  @MaxLength(20)
  peso!: string;

  @IsBoolean()
  castrado!: boolean;

  @IsString()
  @IsOptional()
  foto?: string;

  @IsString()
  @IsOptional() // Opcional porque tiene un default en Prisma
  estado?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsDateString()
  fechaIngreso!: string;

  @IsInt()
  clienteId!: number;

  @IsInt()
  sedeId!: number;

  @IsOptional()
  @IsInt()
  historiaClinicaId?: number;

  @IsString()
  @MaxLength(500)
  alimentoPrincipal!: string;
}
