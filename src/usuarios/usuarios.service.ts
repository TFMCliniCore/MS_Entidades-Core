import { Injectable, NotFoundException } from "@nestjs/common";
import {
  ESTADO_ACTIVO,
  ESTADO_INACTIVO,
} from "../common/constants/entity-status.constants";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    await this.ensureSucursalExists(createUsuarioDto.sucursalId);
    await this.ensureRolExists(createUsuarioDto.rolId);

    const hashed = await bcrypt.hash(createUsuarioDto.contrasena, 10);

    return this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        contrasena: hashed,
        estado: ESTADO_ACTIVO,
      },
      include: {
        sucursal: true,
        rol: true,
      },
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      where: {
        estado: ESTADO_ACTIVO,
      },
      include: {
        sucursal: true,
        rol: true,
      },
      orderBy: {
        id: "asc",
      },
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

    if (updateUsuarioDto.contrasena) {
      updateUsuarioDto.contrasena = await bcrypt.hash(
        updateUsuarioDto.contrasena,
        10,
      );
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
      include: {
        sucursal: true,
        rol: true,
      },
    });
  }

  async remove(id: number) {
    await this.getUsuarioOrFail(id);

    return this.prisma.usuario.update({
      where: { id },
      data: {
        estado: ESTADO_INACTIVO,
      },
      include: {
        sucursal: true,
        rol: true,
      },
    });
  }

  private async getUsuarioOrFail(id: number) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO,
      },
      include: {
        sucursal: true,
        rol: true,
      },
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
        estado: ESTADO_ACTIVO,
      },
    });

    if (!sucursal) {
      throw new NotFoundException(`No se encontro la sucursal con id ${id}.`);
    }
  }

  private async ensureRolExists(id: number) {
    const rol = await this.prisma.rol.findFirst({
      where: {
        id,
        estado: ESTADO_ACTIVO,
      },
    });

    if (!rol) {
      throw new NotFoundException(`No se encontro el rol con id ${id}.`);
    }
  }

  // -- Login Modificado (Soporta texto plano del seed y hashes de bcrypt)
  async login(email: string, contrasena: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email, estado: ESTADO_ACTIVO },
      include: { sucursal: true, rol: true },
    });

    if (!usuario) {
      throw new NotFoundException("Credenciales incorrectas.");
    }

    // 1. Intentamos comparar directo en texto plano (para usuarios del seed)
    const esTextoPlanoValido = usuario.contrasena === contrasena;
    
    // 2. Si no coincide, intentamos verificarlo como un hash de bcrypt (para usuarios nuevos del sistema)
    let esHashValido = false;
    if (!esTextoPlanoValido) {
      try {
        esHashValido = await bcrypt.compare(contrasena, usuario.contrasena);
      } catch (error) {
        esHashValido = false; // Evita que caiga la app si el string de la BD no es un hash válido
      }
    }

    // Si ambas comprobaciones fallan, lanzamos la excepción
    if (!esTextoPlanoValido && !esHashValido) {
      throw new NotFoundException("Credenciales incorrectas.");
    }

    const { contrasena: _, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  async uploadFoto(id: number, filename: string) {
    await this.getUsuarioOrFail(id);
    const fotoPath = `/api/v1/usuarios/foto/${filename}`;
    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { foto: fotoPath },
      include: { sucursal: true, rol: true },
    });
    const { contrasena: _, ...usuarioSinContrasena } = updated;
    return usuarioSinContrasena;
  }
}