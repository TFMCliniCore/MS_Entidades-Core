import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ESTADO_ACTIVO, ESTADO_INACTIVO } from '../common/constants/entity-status.constants';
import { PrismaService } from '../prisma/prisma.service';
import { toDateOrUndefined } from '../common/utils/date.utils';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createClienteDto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: {
        ...createClienteDto,
        cumpleanos: toDateOrUndefined(createClienteDto.cumpleanos),
        estado: ESTADO_ACTIVO
      },
      include: {
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      }
    });
  }

  findAll() {
    return this.prisma.cliente.findMany({
      where: {
        estado: ESTADO_ACTIVO
      },
      include: {
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
    return this.getClienteOrFail(id);
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    await this.getClienteOrFail(id);

    return this.prisma.cliente.update({
      where: { id },
      data: {
        ...updateClienteDto,
        cumpleanos:
          updateClienteDto.cumpleanos !== undefined
            ? toDateOrUndefined(updateClienteDto.cumpleanos)
            : undefined
      },
      include: {
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      }
    });
  }

  async remove(id: number) {
    const cliente = await this.getClienteOrFail(id);

    if (cliente.pacientes.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el cliente ${id} porque tiene pacientes asociados.`
      );
    }

    return this.prisma.cliente.update({
      where: { id },
      data: {
        estado: ESTADO_INACTIVO
      },
      include: {
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      }
    });
  }

  private async getClienteOrFail(id: number) {
    const cliente = await this.prisma.cliente.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      },
      include: {
        pacientes: {
          where: {
            estado: ESTADO_ACTIVO
          }
        }
      }
    });

    if (!cliente) {
      throw new NotFoundException(`No se encontro el cliente con id ${id}.`);
    }

    return cliente;
  }
}
