import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClientesModule } from './clientes/clientes.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { PermisosModule } from './permisos/permisos.module';
import { RolesModule } from './roles/roles.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module'; // 1. Importa el nuevo módulo

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    ClientesModule,
    PacientesModule,
    RolesModule,
    PermisosModule,
    SucursalesModule,
    AuthModule // 2. Agrégalo a la lista de imports
  ]
})
export class AppModule {}