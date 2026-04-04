import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ESTADO_ACTIVO, ESTADO_INACTIVO } from '../common/constants/entity-status.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

type RolConPermisosJson = {
  id: number;
  nombre: string;
  descripcion: string;
  permisoIds: unknown;
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRolDto: CreateRolDto) {
    const permisoIds = createRolDto.permisoIds ?? [];
    await this.ensurePermisosExist(permisoIds);

    const rol = await this.prisma.rol.create({
      data: {
        nombre: createRolDto.nombre,
        descripcion: createRolDto.descripcion,
        permisoIds,
        estado: ESTADO_ACTIVO
      }
    });

    return this.attachPermisos(rol);
  }

  async findAll() {
    const roles = await this.prisma.rol.findMany({
      where: {
        estado: ESTADO_ACTIVO
      },
      orderBy: {
        id: 'asc'
      }
    });

    return Promise.all(
      roles.map((rol: RolConPermisosJson) => this.attachPermisos(rol))
    );
  }

  async findOne(id: number) {
    const rol = await this.getRolOrFail(id);
    return this.attachPermisos(rol);
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    await this.getRolOrFail(id);

    if (updateRolDto.permisoIds !== undefined) {
      await this.ensurePermisosExist(updateRolDto.permisoIds);
    }

    const rol = await this.prisma.rol.update({
      where: { id },
      data: {
        nombre: updateRolDto.nombre,
        descripcion: updateRolDto.descripcion,
        permisoIds: updateRolDto.permisoIds
      }
    });

    return this.attachPermisos(rol);
  }

  async remove(id: number) {
    await this.getRolOrFail(id);
    const usuariosAsociados = await this.prisma.usuario.count({
      where: {
        rolId: id,
        estado: ESTADO_ACTIVO
      }
    });

    if (usuariosAsociados > 0) {
      throw new ConflictException(
        `No se puede eliminar el rol ${id} porque tiene usuarios asociados.`
      );
    }

    return this.prisma.rol.update({
      where: { id },
      data: {
        estado: ESTADO_INACTIVO
      }
    });
  }

  private async getRolOrFail(id: number) {
    const rol = await this.prisma.rol.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      }
    });

    if (!rol) {
      throw new NotFoundException(`No se encontro el rol con id ${id}.`);
    }

    return rol;
  }

  private async ensurePermisosExist(ids: number[]) {
    if (ids.length === 0) {
      return;
    }

    const permisos = await this.prisma.permiso.findMany({
      where: {
        estado: ESTADO_ACTIVO,
        id: {
          in: ids
        }
      },
      select: {
        id: true
      }
    });

    if (permisos.length !== ids.length) {
      throw new NotFoundException('Uno o varios permisos enviados no existen.');
    }
  }

  private async attachPermisos(rol: RolConPermisosJson) {
    const permisoIds = Array.isArray(rol.permisoIds)
      ? rol.permisoIds.filter((value: unknown): value is number => typeof value === 'number')
      : [];

    const permisos =
      permisoIds.length > 0
        ? await this.prisma.permiso.findMany({
            where: {
              estado: ESTADO_ACTIVO,
              id: {
                in: permisoIds
              }
            },
            orderBy: {
              id: 'asc'
            }
          })
        : [];

    return {
      ...rol,
      permisoIds,
      permisos
    };
  }
}
