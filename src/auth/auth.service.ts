import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  UnauthorizedException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { MailService } from './mail.service'; 
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Tu URL de Next.js
const logoUrl = `${frontendUrl}/images/logo-clinicore.png`;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService, 
    private jwtService: JwtService, // Inyección necesaria para generar tokens
  ) {}

  // --- Lógica de Login ---
  async login(email: string, pass: string) {
  // Validación preventiva
  if (!email) {
    throw new BadRequestException('El email es requerido para iniciar sesión.');
  }

  const user = await this.prisma.usuario.findUnique({
    where: { email } // Aquí email ya no será undefined
  });

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

    // Comparamos la clave plana con el hash de la base de datos
    const isMatch = await bcrypt.compare(pass, user.contrasena);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // El "payload" es lo que viajará dentro del token
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.rolId 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombres: user.nombres,
        email: user.email
      }
    };
  }

  // En src/auth/auth.service.ts
async forgotPassword(email: string) {
  const user = await this.prisma.usuario.findUnique({ where: { email } });
  if (!user) throw new NotFoundException('Usuario no encontrado');

  // Generamos un token único (puedes usar el código aleatorio o un UUID)
  const token = Math.floor(100000 + Math.random() * 900000).toString(); 
  const expires = new Date(Date.now() + 3600000); // 1 hora de validez[cite: 5]

  await this.prisma.usuario.update({
    where: { email },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    },
  });

  // 🔗 CONSTRUCCIÓN DEL LINK MÁGICO
  // En un entorno real, esta URL apuntaría a tu frontend (ej. Blazor)
  const magicLink = `http://localhost:3002/api/v1/auth/reset-password?token=${token}`;

  // En src/auth/auth.service.ts, dentro del método forgotPassword()
  const emailTemplate = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; text-align: center; color: #555; border: 1px solid #eaeaea; border-radius: 4px; overflow: hidden;">
      
      <!-- Decoración superior (Barra azul sólida) -->
      <div style="background-color: #005c97; height: 15px; width: 100%;"></div>

      <div style="padding: 40px 30px; background-color: #ffffff;">
        <!-- Logo Principal (Opcional, arriba del saludo) -->
        <div style="margin-bottom: 20px;">
           <img src="${logoUrl}" alt="CliniCore Logo" width="120" style="display: inline-block;">
        </div>

        <h2 style="font-size: 22px; font-weight: normal; margin-bottom: 15px; color: #333;">
          ¡Hola, ${user.nombres.toUpperCase()}!
        </h2>
        <p style="font-size: 18px; margin-bottom: 25px; color: #555;">¿Ha olvidado o quiere cambiar su clave?</p>

        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px; color: #666; padding: 0 20px;">
          Se solicitó un restablecimiento de contraseña para la cuenta de <b>ClinicaVet</b> vinculada a este correo electrónico.<br>
          Puede cambiar su contraseña siguiendo este enlace que permanecerá válido durante 1 hora:
        </p>

        <div style="margin: 35px 0;">
          <a href="${magicLink}" style="background-color: #0066cc; color: #ffffff; padding: 12px 25px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 4px; display: inline-block;">
            Restaurar contraseña
          </a>
        </div>

        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 6px; margin: 40px 20px 0 20px;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #444;">
            Si no ha solicitado este cambio haga caso omiso a este correo.
          </p>
        </div>
      </div>
      
      <!-- Barra inferior con logos -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #005c97; height: 70px;">
        <tr>
          <td align="left" style="padding-left: 20px;">
            <img src="${logoUrl}" alt="CliniCore Logo" height="40" style="display: block;">
          </td>
          <td align="right" style="padding-right: 20px;">
            <span style="color: #ffffff; font-size: 12px; font-family: sans-serif;">&copy; 2026 CliniCore</span>
          </td>
        </tr>
      </table>
    </div>
  `;

  try {
    await this.mailService.sendMail(email, 'Recuperar Contraseña', emailTemplate); //
  } catch (error: any) {
    console.error("Error SMTP:", error.message);
  }

  return { message: 'Si el usuario existe, se ha enviado un link mágico a su correo.' };
}

  async resetPassword(token: string, newPassword: string) {
    // Buscamos usando los nombres exactos de tu base de datos
    const user = await this.prisma.usuario.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }, 
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: {
        contrasena: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Contraseña actualizada con éxito' };
  }

  async register(userData: any) {
  //console.log('Datos recibidos en el DTO:', userData);

  // 1. Cifrar contraseña (esto ya funciona perfecto)
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // 2. Creamos el usuario mapeando correctamente los nombres de los campos
    const newUser = await this.prisma.usuario.create({
    data: {
      // Unimos nombres y apellidos en un solo string
      nombres: `${userData.nombres} ${userData.apellidos}`, 
      email: userData.email,
      contrasena: hashedPassword,
      celular: userData.telefono,
      cargo: userData.cargo || 'General',
      rolId: userData.rolId,
      sucursalId: userData.sucursalId,
      roles: userData.roles || 'Usuario',
      estado: 'ACTIVO',
    },
  });
  

  // 3. Disparamos el email de bienvenida de forma asíncrona (no bloqueante)
  const welcomeTemplate = `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; text-align: center; color: #333; border: 1px solid #eaeaea; border-radius: 4px; overflow: hidden;">
    
    <!-- Espacio en blanco superior para limpieza -->
    <div style="padding: 40px 20px; background-color: #ffffff;">
      
      <!-- Título en Morado según la referencia -->
      <h2 style="color: #b000cc; font-size: 26px; margin-bottom: 20px; font-weight: bold;">
        Confirmación de cuenta
      </h2>
      
      <p style="font-size: 16px; line-height: 1.5; color: #555; padding: 0 20px;">
        Estimado usuario, hemos recibido una solicitud de creación de cuenta en <b>Era</b>, haz
        click en el siguiente enlace para continuar.
      </p>
      
      <!-- Botón Verde de Confirmación -->
      <div style="margin: 35px 0;">
        <a href="http://localhost:3002/api/v1/auth/login" 
           style="background-color: #8cc63f; color: #ffffff; padding: 15px 50px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; font-size: 16px; text-transform: uppercase;">
          Confirmar
        </a>
      </div>
      
      <!-- Nota de seguridad -->
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        Si tu no enviaste esta solicitud de creación de cuenta<br>
        <span style="color: #999;">Puedes ignorar este mensaje.</span>
      </p>
    </div>
    
    <!-- Footer Gris con Iconos y Datos de Contacto -->
    <div style="background-color: #f4f4f4; padding: 30px 20px; border-top: 1px solid #eee;">
      
      <!-- Simulación de iconos de redes sociales (puedes añadir los enlaces reales) -->
      <div style="margin-bottom: 20px;">
        <span style="margin: 0 5px; font-size: 20px;">🔵</span>
        <span style="margin: 0 5px; font-size: 20px;">🟢</span>
        <span style="margin: 0 5px; font-size: 20px;">🟣</span>
        <span style="margin: 0 5px; font-size: 20px;">⚫</span>
      </div>

      <p style="font-weight: bold; margin: 0 0 10px 0; font-size: 16px; color: #444;">
        ¿Problemas o preguntas?
      </p>
      <p style="margin: 0 0 15px 0; color: #0066cc;">info@erasas.com</p>
      
      <p style="font-size: 12px; color: #888; line-height: 1.4;">
        Erasas • Carrera 104 # 156-51 • Barrio Villa Esperanza Localidad Suba
      </p>
    </div>
  </div>
`;

  try {
    // Usamos el servicio de correo ya configurado
    await this.mailService.sendMail(
      newUser.email,
      '¡Bienvenido a ClinicaVet!',
      welcomeTemplate
    );
  } catch (error: any) { 
    // Al poner : any, TypeScript te permite acceder a .message sin quejarse
    console.error("Error al enviar email de bienvenida:", error.message);
}

  // Retornamos el usuario (sin la contraseña por seguridad)
  const { contrasena, ...result } = newUser;
  return {
    message: 'Usuario registrado exitosamente',
    user: { email: newUser.email, nombres: newUser.nombres } // Evita devolver la contraseña
  }; 
}

async changePassword(email: string, contrasenaAnterior: string, contrasenaNueva: string) {
    // 1. Buscar al usuario
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // 2. Verificar que la contraseña anterior sea la correcta[cite: 5]
    const isMatch = await bcrypt.compare(contrasenaAnterior, user.contrasena);
    if (!isMatch) {
      throw new UnauthorizedException('La contraseña anterior es incorrecta.');
    }

    // 3. Encriptar la nueva contraseña de forma segura[cite: 5]
    const hashedNewPassword = await bcrypt.hash(contrasenaNueva, 10);

    // 4. Actualizar el registro en la base de datos
    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { contrasena: hashedNewPassword },
    });

    return { 
      statusCode: 200,
      message: 'Contraseña actualizada con éxito.' 
    };
  }
}