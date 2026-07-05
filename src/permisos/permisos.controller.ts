import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación de Swagger
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { PermisosService } from './permisos.service';

@ApiTags('Permisos del Sistema')
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Post()
  @ApiOperation({ summary: 'Declarar un nuevo permiso atómico en el sistema' })
  create(@Body() createPermisoDto: CreatePermisoDto) {
    return this.permisosService.create(createPermisoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar la totalidad de permisos de seguridad configurados' })
  findAll() {
    return this.permisosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Visualizar un permiso específico mediante su ID único' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permisosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar la descripción o el identificador de un permiso' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePermisoDto: UpdatePermisoDto) {
    return this.permisosService.update(id, updatePermisoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar el payload completo de un permiso' })
  replace(@Param('id', ParseIntPipe) id: number, @Body() updatePermisoDto: UpdatePermisoDto) {
    return this.permisosService.update(id, updatePermisoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover un permiso del ecosistema de seguridad' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permisosService.remove(id);
  }
}