Infraestructura y Backend: Clientes y Mascotas
Este repositorio contiene la lógica del Microservicio (MS) encargado de la persistencia y gestión de las entidades principales del sistema: Clientes y Mascotas. En esta actualización se ha priorizado la seguridad del código y la eficiencia en el flujo de desarrollo con Docker y Prisma.  

🛠️ Mejoras en la Configuración del Proyecto
1. Optimización del Control de Versiones (.gitignore)
Se ha actualizado el archivo .gitignore para garantizar un repositorio limpio y seguro, incluyendo:


Seguridad de Credenciales: Se bloquea la subida de archivos .env y sus variantes para proteger las cadenas de conexión a la base de datos.  


Persistencia de Prisma: Se ignoran respaldos de esquema (.bak) y archivos de base de datos temporales para evitar conflictos de binarios entre colaboradores.  


Artefactos de NestJS: Se excluye la carpeta dist/ para asegurar que el código compilado no se versione, forzando compilaciones limpias en cada entorno.  


Aislamiento de Docker: Se omiten los archivos de datos locales montados por Docker y archivos de sobrescritura de Compose.  

2. Base de Datos y Modelado (Prisma)
Entidad Clientes: Implementación del modelo para el almacenamiento de datos personales y de contacto.

Entidad Mascotas: Relación de integridad referencial con los clientes, permitiendo un seguimiento clínico organizado.

Migraciones: Estructura de base de datos preparada para ser desplegada en contenedores PostgreSQL.

📂 Estructura del Microservicio
Plaintext
├── prisma/
│   ├── schema.prisma    # Definición de modelos Clientes/Mascotas
│   └── seed.js          # Datos iniciales para pruebas
├── src/
│   ├── clientes/        # Controladores y lógica de negocio
│   └── mascotas/        # Gestión de pacientes veterinarios
└── docker-compose.yml   # Orquestación de la DB local
🚀 Guía de Inicio Rápido
Instalar dependencias:

Bash
npm install
Configurar el entorno:
Crea un archivo .env basado en .env.example y define tu DATABASE_URL.  

Sincronizar base de datos:

Bash
npx prisma generate
npx prisma migrate dev
Ejecutar:

Bash
npm run start:dev

Aviso de Seguridad: Nunca modifiques las reglas de exclusión de archivos .env para evitar la filtración de secretos industriales en el historial de Git.