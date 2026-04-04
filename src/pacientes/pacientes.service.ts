import { Injectable, NotFoundException } from '@nestjs/common';
import { ESTADO_ACTIVO, ESTADO_INACTIVO } from '../common/constants/entity-status.constants';
import { PrismaService } from '../prisma/prisma.service';
import { toDateOrUndefined } from '../common/utils/date.utils';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPacienteDto: CreatePacienteDto) {
    await this.ensureClienteExists(createPacienteDto.clienteId);
    await this.ensureSucursalExists(createPacienteDto.sedeId);

    return this.prisma.paciente.create({
      data: {
        ...createPacienteDto,
        fechaNacimiento: toDateOrUndefined(createPacienteDto.fechaNacimiento),
        fechaIngreso: new Date(createPacienteDto.fechaIngreso),
        estado: ESTADO_ACTIVO
      },
      include: {
        cliente: true,
        sede: true
      }
    });
  }

  findAll() {
    return this.prisma.paciente.findMany({
      where: {
        estado: ESTADO_ACTIVO
      },
      include: {
        cliente: true,
        sede: true
      },
      orderBy: {
        id: 'asc'
      }
    });
  }

  async findOne(id: number) {
    return this.getPacienteOrFail(id);
  }

  async update(id: number, updatePacienteDto: UpdatePacienteDto) {
    await this.getPacienteOrFail(id);

    if (updatePacienteDto.clienteId !== undefined) {
      await this.ensureClienteExists(updatePacienteDto.clienteId);
    }

    if (updatePacienteDto.sedeId !== undefined) {
      await this.ensureSucursalExists(updatePacienteDto.sedeId);
    }

    return this.prisma.paciente.update({
      where: { id },
      data: {
        ...updatePacienteDto,
        fechaNacimiento:
          updatePacienteDto.fechaNacimiento !== undefined
            ? toDateOrUndefined(updatePacienteDto.fechaNacimiento)
            : undefined,
        fechaIngreso:
          updatePacienteDto.fechaIngreso !== undefined
            ? new Date(updatePacienteDto.fechaIngreso)
            : undefined
      },
      include: {
        cliente: true,
        sede: true
      }
    });
  }

  async remove(id: number) {
    await this.getPacienteOrFail(id);

    return this.prisma.paciente.update({
      where: { id },
      data: {
        estado: ESTADO_INACTIVO
      },
      include: {
        cliente: true,
        sede: true
      }
    });
  }

  private async getPacienteOrFail(id: number) {
    const paciente = await this.prisma.paciente.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      },
      include: {
        cliente: true,
        sede: true
      }
    });

    if (!paciente) {
      throw new NotFoundException(`No se encontro el paciente con id ${id}.`);
    }

    return paciente;
  }

  private async ensureClienteExists(id: number) {
    const cliente = await this.prisma.cliente.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO
      }
    });

    if (!cliente) {
      throw new NotFoundException(`No se encontro el cliente con id ${id}.`);
    }
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
}
