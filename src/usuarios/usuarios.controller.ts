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
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { mkdirSync, existsSync } from "fs";
import type { Response } from "express";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { UsuariosService } from "./usuarios.service";

@Controller("usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Put(":id")
  replace(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }

  @Post("login")
  login(@Body() body: { email: string; contrasena: string }) {
    return this.usuariosService.login(body.email, body.contrasena);
  }

  // Manejo de fotos de usuario

  @Get("foto/:filename")
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

  // Subir foto
  @Post(":id/foto")
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
