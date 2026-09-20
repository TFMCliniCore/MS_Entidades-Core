import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Put,
  Post,
  Param,
  ParseIntPipe,
  BadRequestException,
  Res,
  UploadedFile,
  UseInterceptors,
  NotFoundException 
} from "@nestjs/common";
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación de Swagger
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { mkdirSync, existsSync } from "fs";
import type { Response } from "express";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { UsuariosService } from "./usuarios.service";

@ApiTags('Usuarios y Autenticación')
@Controller("usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo usuario o credencial de operador en el sistema' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Listar la totalidad de usuarios, operadores y personal administrativo' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: 'Obtener la ficha de perfil de un usuario específico por su ID único' })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: 'Modificar parcialmente datos o cambiar credenciales de un usuario' })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Put(":id")
  @ApiOperation({ summary: 'Reemplazar por completo el perfil e información base de un usuario' })
  replace(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: 'Dar de baja definitiva o inhabilitar a un usuario del ecosistema' })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }

  @Post("login")
  @ApiOperation({ summary: 'Autenticar credenciales de usuario para la obtención de tokens de sesión' })
  login(@Body() body: { email: string; contrasena: string }) {
    return this.usuariosService.login(body.email, body.contrasena);
  }

  @Get("foto/:filename")
  @ApiOperation({ summary: 'Servir o visualizar el recurso binario de la foto de perfil de un usuario' })
  servirFoto(@Param("filename") filename: string, @Res() res: Response) {
    if (filename.includes("..") || filename.includes("/")) {
      throw new BadRequestException("Nombre de archivo inválido.");
    }
    const filePath = join(process.cwd(), "uploads", "usuarios", filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException("Foto no encontrada.");
    }
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.sendFile(filePath);
  }

  @Post(":id/foto")
  @ApiOperation({ summary: 'Subir y asociar una imagen de perfil (jpeg, png, webp) a un usuario' })
  @UseInterceptors(
    FileInterceptor("foto", {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), "uploads", "usuarios");
          mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
      fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  uploadFoto(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file)
      throw new BadRequestException(
        "Imagen inválida. Usa jpeg, png o webp (máx. 3 MB).",
      );
    return this.usuariosService.uploadFoto(id, file.filename);
  }
}