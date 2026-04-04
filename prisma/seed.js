const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ESTADO_ACTIVO = 'ACTIVO';

async function seedPermisos() {
  const permisosBase = [
    { nombre: 'usuarios.read', descripcion: 'Consultar usuarios del sistema.', estado: ESTADO_ACTIVO },
    { nombre: 'usuarios.write', descripcion: 'Crear y editar usuarios.', estado: ESTADO_ACTIVO },
    { nombre: 'clientes.read', descripcion: 'Consultar clientes registrados.', estado: ESTADO_ACTIVO },
    { nombre: 'clientes.write', descripcion: 'Crear y editar clientes.', estado: ESTADO_ACTIVO },
    { nombre: 'pacientes.read', descripcion: 'Consultar pacientes registrados.', estado: ESTADO_ACTIVO },
    { nombre: 'pacientes.write', descripcion: 'Crear y editar pacientes.', estado: ESTADO_ACTIVO },
    { nombre: 'roles.read', descripcion: 'Consultar roles y permisos.', estado: ESTADO_ACTIVO },
    { nombre: 'roles.write', descripcion: 'Administrar roles del sistema.', estado: ESTADO_ACTIVO },
    { nombre: 'sucursales.read', descripcion: 'Consultar sucursales.', estado: ESTADO_ACTIVO },
    { nombre: 'sucursales.write', descripcion: 'Crear y editar sucursales.', estado: ESTADO_ACTIVO }
  ];

  for (const permiso of permisosBase) {
    await prisma.permiso.upsert({
      where: { nombre: permiso.nombre },
      update: permiso,
      create: permiso
    });
  }

  return prisma.permiso.findMany({
    where: {
      estado: ESTADO_ACTIVO
    },
    orderBy: { id: 'asc' }
  });
}

async function seedRoles(permisos) {
  const mapaPermisos = new Map(permisos.map((permiso) => [permiso.nombre, permiso.id]));
  const rolesBase = [
    {
      nombre: 'Administrador',
      descripcion: 'Acceso completo a la plataforma.',
      permisoIds: permisos.map((permiso) => permiso.id),
      estado: ESTADO_ACTIVO
    },
    {
      nombre: 'Veterinario',
      descripcion: 'Gestiona clientes y pacientes clinicos.',
      permisoIds: [
        mapaPermisos.get('clientes.read'),
        mapaPermisos.get('clientes.write'),
        mapaPermisos.get('pacientes.read'),
        mapaPermisos.get('pacientes.write')
      ].filter(Boolean),
      estado: ESTADO_ACTIVO
    },
    {
      nombre: 'Recepcion',
      descripcion: 'Administra agenda, clientes y consulta informacion general.',
      permisoIds: [
        mapaPermisos.get('clientes.read'),
        mapaPermisos.get('clientes.write'),
        mapaPermisos.get('pacientes.read'),
        mapaPermisos.get('sucursales.read')
      ].filter(Boolean),
      estado: ESTADO_ACTIVO
    }
  ];

  for (const rol of rolesBase) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {
        descripcion: rol.descripcion,
        permisoIds: rol.permisoIds,
        estado: rol.estado
      },
      create: rol
    });
  }

  return prisma.rol.findMany({
    where: {
      estado: ESTADO_ACTIVO
    },
    orderBy: { id: 'asc' }
  });
}

async function seedSucursales() {
  const sucursalesBase = [
    {
      nombre: 'Sede Norte',
      direccion: 'Calle 123 #45-67',
      telefono: '3005551001',
      email: 'norte@clinicavet.test',
      redes: 'https://instagram.com/clinicavet.norte',
      logo: 'https://picsum.photos/seed/sede-norte/600/400',
      estado: ESTADO_ACTIVO
    },
    {
      nombre: 'Sede Centro',
      direccion: 'Carrera 10 #20-30',
      telefono: '3005551002',
      email: 'centro@clinicavet.test',
      redes: 'https://facebook.com/clinicavet.centro',
      logo: 'https://picsum.photos/seed/sede-centro/600/400',
      estado: ESTADO_ACTIVO
    }
  ];

  for (const sucursal of sucursalesBase) {
    await prisma.sucursal.upsert({
      where: { nombre: sucursal.nombre },
      update: sucursal,
      create: sucursal
    });
  }

  return prisma.sucursal.findMany({
    where: {
      estado: ESTADO_ACTIVO
    },
    orderBy: { id: 'asc' }
  });
}

async function seedClientes() {
  const clientesBase = [
    {
      nombres: 'Camila Rodriguez',
      email: 'camila.rodriguez@test.com',
      celular: '3001112233',
      telefonoAlterno: '6015550101',
      direccion: 'Cra 45 #12-89',
      ciudad: 'Bogota',
      documento: 'CC10203040',
      cumpleanos: new Date('1992-05-14'),
      observaciones: 'Prefiere contacto por WhatsApp en horario de la tarde.',
      estado: ESTADO_ACTIVO
    },
    {
      nombres: 'Javier Ramirez',
      email: 'javier.ramirez@test.com',
      celular: '3004445566',
      telefonoAlterno: '6045550202',
      direccion: 'Av. 80 #50-20',
      ciudad: 'Medellin',
      documento: 'CC50607080',
      cumpleanos: new Date('1988-11-03'),
      observaciones: 'Solicita recordatorios con un dia de anticipacion.',
      estado: ESTADO_ACTIVO
    },
    {
      nombres: 'Laura Martinez',
      email: 'laura.martinez@test.com',
      celular: '3007778899',
      telefonoAlterno: '6025550303',
      direccion: 'Calle 9 #18-44',
      ciudad: 'Cali',
      documento: 'CC90102030',
      cumpleanos: new Date('1995-02-21'),
      observaciones: 'Paciente con historial de alergias alimentarias.',
      estado: ESTADO_ACTIVO
    }
  ];

  for (const cliente of clientesBase) {
    await prisma.cliente.upsert({
      where: { documento: cliente.documento },
      update: cliente,
      create: cliente
    });
  }

  return prisma.cliente.findMany({
    where: {
      estado: ESTADO_ACTIVO
    },
    orderBy: { id: 'asc' }
  });
}

async function seedPacientes(clientes, sucursales) {
  if (await prisma.paciente.count()) {
    return;
  }

  const clientePorNombre = new Map(clientes.map((cliente) => [cliente.nombres, cliente.id]));
  const sucursalPorNombre = new Map(sucursales.map((sucursal) => [sucursal.nombre, sucursal.id]));

  const pacientesBase = [
    {
      nombre: 'Milo',
      edad: '3 anos',
      sexo: 'Macho',
      especie: 'Canino',
      raza: 'Beagle',
      peso: '12 kg',
      castrado: true,
      foto: 'https://picsum.photos/seed/milo/600/400',
      fechaNacimiento: new Date('2022-01-10'),
      fechaIngreso: new Date('2025-01-12'),
      estado: ESTADO_ACTIVO,
      clienteId: clientePorNombre.get('Camila Rodriguez'),
      sedeId: sucursalPorNombre.get('Sede Norte'),
      historiaClinicaId: 1001,
      alimentoPrincipal: 'Concentrado premium para razas medianas'
    },
    {
      nombre: 'Luna',
      edad: '5 anos',
      sexo: 'Hembra',
      especie: 'Felino',
      raza: 'Siames',
      peso: '4.2 kg',
      castrado: true,
      foto: 'https://picsum.photos/seed/luna/600/400',
      fechaNacimiento: new Date('2020-06-03'),
      fechaIngreso: new Date('2024-08-20'),
      estado: ESTADO_ACTIVO,
      clienteId: clientePorNombre.get('Javier Ramirez'),
      sedeId: sucursalPorNombre.get('Sede Centro'),
      historiaClinicaId: 1002,
      alimentoPrincipal: 'Alimento humedo hipoalergenico'
    },
    {
      nombre: 'Nala',
      edad: '1 ano',
      sexo: 'Hembra',
      especie: 'Canino',
      raza: 'Mestizo',
      peso: '8.4 kg',
      castrado: false,
      foto: 'https://picsum.photos/seed/nala/600/400',
      fechaNacimiento: new Date('2024-04-12'),
      fechaIngreso: new Date('2025-12-02'),
      estado: ESTADO_ACTIVO,
      clienteId: clientePorNombre.get('Laura Martinez'),
      sedeId: sucursalPorNombre.get('Sede Norte'),
      historiaClinicaId: 1003,
      alimentoPrincipal: 'Concentrado puppy razas pequenas'
    }
  ];

  for (const paciente of pacientesBase) {
    await prisma.paciente.create({ data: paciente });
  }
}

async function seedUsuarios(sucursales, roles) {
  const sucursalPorNombre = new Map(sucursales.map((sucursal) => [sucursal.nombre, sucursal.id]));
  const rolPorNombre = new Map(roles.map((rol) => [rol.nombre, rol.id]));
  const usuariosBase = [
    {
      nombres: 'Ana Gomez',
      email: 'ana.gomez@clinicavet.test',
      celular: '3008881100',
      cargo: 'Administradora',
      roles: 'Administrador',
      contrasena: 'AdminVet2026',
      foto: 'https://picsum.photos/seed/ana-gomez/400/400',
      estado: ESTADO_ACTIVO,
      sucursalId: sucursalPorNombre.get('Sede Norte'),
      rolId: rolPorNombre.get('Administrador')
    },
    {
      nombres: 'Santiago Perez',
      email: 'santiago.perez@clinicavet.test',
      celular: '3008882200',
      cargo: 'Veterinario Senior',
      roles: 'Veterinario',
      contrasena: 'VetSenior2026',
      foto: 'https://picsum.photos/seed/santiago-perez/400/400',
      estado: ESTADO_ACTIVO,
      sucursalId: sucursalPorNombre.get('Sede Centro'),
      rolId: rolPorNombre.get('Veterinario')
    },
    {
      nombres: 'Valentina Castro',
      email: 'valentina.castro@clinicavet.test',
      celular: '3008883300',
      cargo: 'Recepcionista',
      roles: 'Recepcion',
      contrasena: 'Recepcion2026',
      foto: 'https://picsum.photos/seed/valentina-castro/400/400',
      estado: ESTADO_ACTIVO,
      sucursalId: sucursalPorNombre.get('Sede Norte'),
      rolId: rolPorNombre.get('Recepcion')
    }
  ];

  for (const usuario of usuariosBase) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: usuario,
      create: usuario
    });
  }
}

async function main() {
  const permisos = await seedPermisos();
  const roles = await seedRoles(permisos);
  const sucursales = await seedSucursales();
  const clientes = await seedClientes();
  await seedPacientes(clientes, sucursales);
  await seedUsuarios(sucursales, roles);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Error ejecutando el seed de Prisma:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
