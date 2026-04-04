# MS Entidades Core

Microservicio REST construido con NestJS, Prisma y PostgreSQL para administrar:

- Usuarios
- Clientes
- Pacientes
- Roles
- Permisos
- Sucursales


## Stack

- NestJS
- Prisma ORM
- PostgreSQL 16
- Docker / Docker Compose
- TypeScript


## Variables de entorno


```env
PORT
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB=ms_entidades
DATABASE_URL=
```

## Ejecución con Docker

```bash
docker compose up --build
```

Servicios disponibles:

- API: `http://<URL_SERVIDOR>:<PUERTO>`
- PostgreSQL: `<URL_SERVIDOR>:<PUERTO>`

Ejemplo para desarrollo:

- API: `http://localhost:3001`
- PostgreSQL: `http://localhost:5432`

Al iniciar el contenedor de la API se ejecutan:

1. Migraciones de Prisma
2. Seed con iniciales
3. Arranque del servidor NestJS

Parar contenedor:

```bash
docker compose stop
```

Detener contenedor y borrar imágenes:

```bash
docker compose down -v
```
Construir contenedor
```bash
docker compose up --build
```

## Ejecución local

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

## Estructura principal

```text
src/
  clientes/
  pacientes/
  permisos/
  prisma/
  roles/
  sucursales/
  usuarios/
prisma/
  migrations/
  schema.prisma
  seed.js
postman/
  MS_Entidades_Core.postman_collection.json
```

Colección en json para usar endpoints:

```text
postman/
  MS_Entidades_Core.postman_collection.json
```

## Datos Iniciales precargados

El seed crea registros iniciales para:

- 10 permisos
- 3 roles
- 2 sucursales
- 3 clientes
- 3 pacientes
- 3 usuarios

## URL Base

```text
http://<URL_SERVIDOR>:<puerto>/api/v1
```



La variable `baseUrl` ya viene configurada como (para pruebas en desarrollo):

```text
http://localhost:3001/api/v1
```

## Tabla de endpoints

Todas las rutas usan el prefijo base `/api/v1`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/v1/usuarios` | Lista todos los usuarios |
| GET | `/api/v1/usuarios/:id` | Obtiene un usuario por id |
| POST | `/api/v1/usuarios` | Crea un usuario |
| PUT | `/api/v1/usuarios/:id` | Reemplaza un usuario |
| PATCH | `/api/v1/usuarios/:id` | Actualiza un usuario |
| DELETE | `/api/v1/usuarios/:id` | Inactiva un usuario |
| GET | `/api/v1/clientes` | Lista todos los clientes |
| GET | `/api/v1/clientes/:id` | Obtiene un cliente por id |
| POST | `/api/v1/clientes` | Crea un cliente |
| PUT | `/api/v1/clientes/:id` | Reemplaza un cliente |
| PATCH | `/api/v1/clientes/:id` | Actualiza un cliente |
| DELETE | `/api/v1/clientes/:id` | Inactiva un cliente |
| GET | `/api/v1/pacientes` | Lista todos los pacientes |
| GET | `/api/v1/pacientes/:id` | Obtiene un paciente por id |
| POST | `/api/v1/pacientes` | Crea un paciente |
| PUT | `/api/v1/pacientes/:id` | Reemplaza un paciente |
| PATCH | `/api/v1/pacientes/:id` | Actualiza un paciente |
| DELETE | `/api/v1/pacientes/:id` | Inactiva un paciente |
| GET | `/api/v1/roles` | Lista todos los roles |
| GET | `/api/v1/roles/:id` | Obtiene un rol por id |
| POST | `/api/v1/roles` | Crea un rol |
| PUT | `/api/v1/roles/:id` | Reemplaza un rol |
| PATCH | `/api/v1/roles/:id` | Actualiza un rol |
| DELETE | `/api/v1/roles/:id` | Inactiva un rol |
| GET | `/api/v1/permisos` | Lista todos los permisos |
| GET | `/api/v1/permisos/:id` | Obtiene un permiso por id |
| POST | `/api/v1/permisos` | Crea un permiso |
| PUT | `/api/v1/permisos/:id` | Reemplaza un permiso |
| PATCH | `/api/v1/permisos/:id` | Actualiza un permiso |
| DELETE | `/api/v1/permisos/:id` | Inactiva un permiso |
| GET | `/api/v1/sucursales` | Lista todas las sucursales |
| GET | `/api/v1/sucursales/:id` | Obtiene una sucursal por id |
| POST | `/api/v1/sucursales` | Crea una sucursal |
| PUT | `/api/v1/sucursales/:id` | Reemplaza una sucursal |
| PATCH | `/api/v1/sucursales/:id` | Actualiza una sucursal |
| DELETE | `/api/v1/sucursales/:id` | Inactiva una sucursal |

Las eliminaciones de clientes, sucursales y roles se bloquean cuando existen relaciones activas.
Las operaciones GET, PUT y PATCH solo trabajan con registros en estado `ACTIVO`.
El metodo DELETE realiza un borrado lógico, (no elimina fisicamente: cambia el campo `estado` a `INACTIVO`).

## Ejemplos de payload

### Crear usuario

```json
{
  "nombres": "Juliana Torres",
  "email": "juliana.torres@clinicavet.test",
  "celular": "3005557788",
  "cargo": "Veterinaria",
  "roles": "Veterinario",
  "contrasena": "ClaveTemporal2026",
  "foto": "https://picsum.photos/seed/juliana/400/400",
  "sucursalId": 1,
  "rolId": 2
}
```

### Crear paciente

```json
{
  "nombre": "Toby",
  "edad": "2 anos",
  "sexo": "Macho",
  "especie": "Canino",
  "raza": "Labrador",
  "peso": "14 kg",
  "castrado": true,
  "foto": "https://picsum.photos/seed/toby/600/400",
  "fechaNacimiento": "2024-01-15",
  "fechaIngreso": "2026-04-03",
  "clienteId": 1,
  "sedeId": 1,
  "historiaClinicaId": 2001,
  "alimentoPrincipal": "Concentrado de mantenimiento"
}
```

### Crear rol

```json
{
  "nombre": "Auditor",
  "descripcion": "Consulta informacion operativa sin editar datos.",
  "permisoIds": [1, 3, 5, 9]
}
```

## Notas 

- No se implementó autenticación (todavía).
- Las contraseñas se almacenan como texto plano para esta fase inicial del proyecto. 
