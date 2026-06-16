# MS Entidades Core

Microservicio REST construido con NestJS, Prisma y PostgreSQL para administrar las entidades principales del ecosistema CliniCore:

- Usuarios (con autenticación bcrypt y subida de foto de perfil)
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
- `bcrypt` (hash de contraseñas)
- `multer` + `diskStorage` (subida de fotos)

## Variables de entorno

```env
PORT=3001
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=ms_entidades
DATABASE_URL=postgresql://user:pass@db:5432/ms_entidades
```

## Ejecución con Docker

```bash
docker compose up --build
```

Servicios disponibles:

- API: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

Al iniciar el contenedor se ejecutan automáticamente:

1. Migraciones de Prisma
2. Seed con datos iniciales
3. Arranque del servidor NestJS

```bash
# Detener contenedor
docker compose stop

# Detener y borrar volúmenes
docker compose down -v

# Reconstruir
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
    dto/
    usuarios.controller.ts
    usuarios.service.ts
    usuarios.module.ts
prisma/
  migrations/
  schema.prisma
  seed.js
uploads/
  usuarios/        # Fotos de perfil almacenadas en el servidor
postman/
  MS_Entidades_Core.postman_collection.json
```

### Persistencia de fotos

Las fotos de perfil se almacenan en `uploads/usuarios/` dentro del contenedor. En Docker se usa un volumen nombrado `ms_entidades_uploads` para que los archivos sobrevivan reinicios:

```yaml
volumes:
  - ms_entidades_uploads:/app/uploads
```

Ruta de acceso desde el frontend: `http://localhost:3001/api/v1/usuarios/foto/<nombre_archivo>`  
A través del Gateway: `http://localhost:3002/api/v1/usuarios/foto/<nombre_archivo>`

## Datos iniciales (seed)

| Entidad | Cantidad |
| --- | --- |
| Permisos | 10 |
| Roles | 3 (Admin id=1, Veterinario id=2, Recepcionista id=3) |
| Sucursales | 2 |
| Clientes | 3 |
| Pacientes | 3 |
| Usuarios | 3 (contraseñas hasheadas con bcrypt) |

## URL Base

```text
http://localhost:3001/api/v1
```

## Tabla de endpoints

Todas las rutas usan el prefijo `/api/v1`.

### Usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/usuarios` | Lista todos los usuarios activos |
| GET | `/usuarios/:id` | Obtiene un usuario por id |
| POST | `/usuarios` | Crea un usuario (contrasena se hashea con bcrypt) |
| PUT | `/usuarios/:id` | Reemplaza un usuario completo |
| PATCH | `/usuarios/:id` | Actualiza campos del usuario |
| DELETE | `/usuarios/:id` | Borrado lógico (estado → INACTIVO) |
| POST | `/usuarios/login` | Valida credenciales con bcrypt y devuelve usuario |
| POST | `/usuarios/:id/foto` | Sube foto de perfil (multipart/form-data, máx. 3 MB) |
| GET | `/usuarios/foto/:filename` | Sirve el archivo de foto almacenado |

### Clientes

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/clientes` | Lista todos los clientes activos |
| GET | `/clientes/:id` | Obtiene un cliente por id |
| POST | `/clientes` | Crea un cliente |
| PUT | `/clientes/:id` | Reemplaza un cliente |
| PATCH | `/clientes/:id` | Actualiza un cliente |
| DELETE | `/clientes/:id` | Borrado lógico |

### Pacientes

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/pacientes` | Lista todos los pacientes activos |
| GET | `/pacientes/:id` | Obtiene un paciente por id |
| POST | `/pacientes` | Crea un paciente |
| PUT | `/pacientes/:id` | Reemplaza un paciente |
| PATCH | `/pacientes/:id` | Actualiza un paciente |
| DELETE | `/pacientes/:id` | Borrado lógico |

### Roles

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/roles` | Lista todos los roles |
| GET | `/roles/:id` | Obtiene un rol por id |
| POST | `/roles` | Crea un rol |
| PUT | `/roles/:id` | Reemplaza un rol |
| PATCH | `/roles/:id` | Actualiza un rol |
| DELETE | `/roles/:id` | Borrado lógico |

### Permisos

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/permisos` | Lista todos los permisos |
| GET | `/permisos/:id` | Obtiene un permiso por id |
| POST | `/permisos` | Crea un permiso |
| PUT | `/permisos/:id` | Reemplaza un permiso |
| PATCH | `/permisos/:id` | Actualiza un permiso |
| DELETE | `/permisos/:id` | Borrado lógico |

### Sucursales

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/sucursales` | Lista todas las sucursales |
| GET | `/sucursales/:id` | Obtiene una sucursal por id |
| POST | `/sucursales` | Crea una sucursal |
| PUT | `/sucursales/:id` | Reemplaza una sucursal |
| PATCH | `/sucursales/:id` | Actualiza una sucursal |
| DELETE | `/sucursales/:id` | Borrado lógico |

## Reglas de negocio

- Las eliminaciones de clientes, sucursales y roles se bloquean cuando existen relaciones activas.
- GET, PUT y PATCH solo operan sobre registros en estado `ACTIVO`.
- DELETE realiza borrado lógico (campo `estado` → `INACTIVO`), no elimina el registro físicamente.
- Las contraseñas se almacenan como hash bcrypt (10 rondas). El campo `contrasena` es `VarChar(100)`.
- La foto de perfil actualiza el campo `foto` del usuario con la ruta relativa `/api/v1/usuarios/foto/<archivo>`.

## Ejemplos de payload

### Login

```json
POST /usuarios/login

{
  "email": "admin@clinicavet.test",
  "contrasena": "MiContrasena123"
}
```

Respuesta exitosa (el API Gateway llama este endpoint internamente):

```json
{
  "id": 1,
  "nombres": "Administrador Principal",
  "email": "admin@clinicavet.test",
  "celular": "3001234567",
  "cargo": "Administrador",
  "foto": "/api/v1/usuarios/foto/usuario_1_abc123.jpg",
  "rolId": 1,
  "sucursalId": 1,
  "rol": { "id": 1, "nombre": "Admin", "descripcion": "..." },
  "sucursal": { "id": 1, "nombre": "Sede Central" }
}
```

### Crear usuario

```json
POST /usuarios

{
  "nombres": "Juliana Torres",
  "email": "juliana.torres@clinicavet.test",
  "celular": "3005557788",
  "cargo": "Veterinaria",
  "contrasena": "ClaveTemporal2026",
  "sucursalId": 1,
  "rolId": 2
}
```

> La contraseña se hashea automáticamente con bcrypt antes de guardarse.

### Actualizar usuario (campos editables desde el perfil)

```json
PATCH /usuarios/1

{
  "nombres": "Juliana Torres Mejía",
  "celular": "3005557799",
  "rolId": 2,
  "cargo": "Veterinario",
  "contrasena": "NuevaClave2026"
}
```

> Si `contrasena` se omite o es vacío, la contraseña no cambia.

### Subir foto de perfil

```
POST /usuarios/1/foto
Content-Type: multipart/form-data

Campo: foto  →  archivo imagen (JPG / PNG / WebP, máx. 3 MB)
```

Respuesta:

```json
{
  "id": 1,
  "nombres": "Juliana Torres",
  "foto": "/api/v1/usuarios/foto/usuario_1_1748970000000.jpg",
  ...
}
```

### Crear paciente

```json
POST /pacientes

{
  "nombre": "Toby",
  "edad": "2 años",
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
POST /roles

{
  "nombre": "Auditor",
  "descripcion": "Consulta información operativa sin editar datos.",
  "permisoIds": [1, 3, 5, 9]
}
```
