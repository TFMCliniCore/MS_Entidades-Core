import { IsString, MaxLength } from 'class-validator';

export class CreatePermisoDto {
  @IsString()
  @MaxLength(30)
  nombre!: string;

  @IsString()
  @MaxLength(300)
  descripcion!: string;
}
