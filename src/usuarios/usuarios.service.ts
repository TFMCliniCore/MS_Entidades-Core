import { Injectable, NotFoundException } from '@nestjs/common';
import { ESTADO_ACTIVO, ESTADO_INACTIVO } from '../common/constants/entity-status.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    await this.ensureSucursalExists(createUsuarioDto.sucursalId);
    await this.ensureRolExists(createUsuarioDto.rolId);

    return this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        estado: ESTADO_ACTIVO
      },
      include: {
        sucursal: true,
        rol: true
      }
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      where: {
        estado: ESTADO_ACTIVO
      },
      include: {
        sucursal: true,
        rol: true
      },
      orderBy: {
        id: 'asc'
      }
    });
  }

  async findOne(id: number) {
    return this.getUsuarioOrFail(id);
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.getUsuarioOrFail(id);

    if (updateUsuarioDto.sucursalId !== undefined) {
      await this.ensureSucursalExists(updateUsuarioDto.sucursalId);
    }

    if (updateUsuarioDto.rolId !== undefined) {
      await this.ensureRolExists(updateUsuarioDto.rolId);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
      include: {
        sucursal: true,
        rol: true
      }
    });
  }

  async remove(id: number) {
    await this.getUsuarioOrFail(id);

    return this.prisma.usuario.update({
      where: { id },
      data: {
        estado: ESTADO_INACTIVO
      },
      include: {
        sucursal: true,
        rol: true
      }
    });
  }

  private async getUsuarioOrFail(id: number) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      },
      include: {
        sucursal: true,
        rol: true
      }
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontro el usuario con id ${id}.`);
    }

    return usuario;
  }

  private async ensureSucursalExists(id: number) {
    const sucursal = await this.prisma.sucursal.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      }
    });

    if (!sucursal) {
      throw new NotFoundException(`No se encontro la sucursal con id ${id}.`);
    }
  }

  private async ensureRolExists(id: number) {
    const rol = await this.prisma.rol.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      }
    });

    if (!rol) {
      throw new NotFoundException(`No se encontro el rol con id ${id}.`);
    }
  }
}
