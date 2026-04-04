import { Injectable, NotFoundException } from '@nestjs/common';
import { ESTADO_ACTIVO, ESTADO_INACTIVO } from '../common/constants/entity-status.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';

type RolConPermisosJson = {
  id: number;
  permisoIds: unknown;
};

@Injectable()
export class PermisosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPermisoDto: CreatePermisoDto) {
    return this.prisma.permiso.create({
      data: {
        ...createPermisoDto,
        estado: ESTADO_ACTIVO
      }
    });
  }

  findAll() {
    return this.prisma.permiso.findMany({
      where: {
        estado: ESTADO_ACTIVO
      },
      orderBy: {
        id: 'asc'
      }
    });
  }

  async findOne(id: number) {
    return this.getPermisoOrFail(id);
  }

  async update(id: number, updatePermisoDto: UpdatePermisoDto) {
    await this.getPermisoOrFail(id);

    return this.prisma.permiso.update({
      where: { id },
      data: updatePermisoDto
    });
  }

  async remove(id: number) {
    await this.getPermisoOrFail(id);

    const roles = await this.prisma.rol.findMany();
    const operaciones = [];

    for (const rol of roles as RolConPermisosJson[]) {
      const permisoIds = Array.isArray(rol.permisoIds)
        ? rol.permisoIds.filter((value: unknown): value is number => typeof value === 'number')
        : [];

      if (!permisoIds.includes(id)) {
        continue;
      }

      operaciones.push(
        this.prisma.rol.update({
          where: { id: rol.id },
          data: {
            permisoIds: permisoIds.filter((permisoId: number) => permisoId !== id)
          }
        })
      );
    }

    if (operaciones.length > 0) {
      await this.prisma.$transaction(operaciones);
    }

    return this.prisma.permiso.update({
      where: { id },
      data: {
        estado: ESTADO_INACTIVO
      }
    });
  }

  private async getPermisoOrFail(id: number) {
    const permiso = await this.prisma.permiso.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      }
    });

    if (!permiso) {
      throw new NotFoundException(`No se encontro el permiso con id ${id}.`);
    }

    return permiso;
  }
}
