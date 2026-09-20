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
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { SucursalesService } from './sucursales.service';

@ApiTags('Sucursales')
@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Post()
  @ApiOperation({ summary: 'Dar de alta una nueva sede o sucursal de la clínica' })
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalesService.create(createSucursalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la lista general de sucursales habilitadas' })
  findAll() {
    return this.sucursalesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar la ficha de información comercial e infraestructura de una sede' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sucursalesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar parcialmente los parámetros o datos de contacto de una sucursal' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSucursalDto: UpdateSucursalDto) {
    return this.sucursalesService.update(id, updateSucursalDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Sobreescribir por completo la información global de una sucursal' })
  replace(@Param('id', ParseIntPipe) id: number, @Body() updateSucursalDto: UpdateSucursalDto) {
    return this.sucursalesService.update(id, updateSucursalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover del listado activo una sucursal del sistema' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sucursalesService.remove(id);
  }
}