import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class CreateRolDto {
  @IsString()
  @MaxLength(30)
  nombre!: string;

  @IsString()
  @MaxLength(300)
  descripcion!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  permisoIds?: number[];
}
