import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ESTADO_ACTIVO, ESTADO_INACTIVO } from '../common/constants/entity-status.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createSucursalDto: CreateSucursalDto) {
    return this.prisma.sucursal.create({
      data: {
        ...createSucursalDto,
        estado: ESTADO_ACTIVO
      },
      include: {
        usuarios: {
          where: {
            estado: ESTADO_ACTIVO
          }
        },
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      }
    });
  }

  findAll() {
    return this.prisma.sucursal.findMany({
      where: {
        estado: ESTADO_ACTIVO
      },
      include: {
        usuarios: {
          where: {
            estado: ESTADO_ACTIVO
          }
        },
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });
  }

  async findOne(id: number) {
    return this.getSucursalOrFail(id);
  }

  async update(id: number, updateSucursalDto: UpdateSucursalDto) {
    await this.getSucursalOrFail(id);

    return this.prisma.sucursal.update({
      where: { id },
      data: updateSucursalDto,
      include: {
        usuarios: {
          where: {
            estado: ESTADO_ACTIVO
          }
        },
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      }
    });
  }

  async remove(id: number) {
    const sucursal = await this.getSucursalOrFail(id);

    if (sucursal.usuarios.length > 0 || sucursal.pacientes.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la sucursal ${id} porque tiene usuarios o pacientes asociados.`
      );
    }

    return this.prisma.sucursal.update({
      where: { id },
      data: {
        estado: ESTADO_INACTIVO
      },
      include: {
        usuarios: {
          where: {
            estado: ESTADO_ACTIVO
          }
        },
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      }
    });
  }

  private async getSucursalOrFail(id: number) {
    const sucursal = await this.prisma.sucursal.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      },
      include: {
        usuarios: {
          where: {
            estado: ESTADO_ACTIVO
          }
        },
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      }
    });

    if (!sucursal) {
      throw new NotFoundException(`No se encontro la sucursal con id ${id}.`);
    }

    return sucursal;
  }
}
