CREATE TABLE "sucursales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "direccion" VARCHAR(300) NOT NULL,
    "telefono" VARCHAR(15) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "redes" VARCHAR(500),
    "logo" VARCHAR(500),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(300) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(300) NOT NULL,
    "permisoIds" JSONB NOT NULL DEFAULT '[]',
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombres" VARCHAR(200) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "celular" VARCHAR(15) NOT NULL,
    "telefonoAlterno" VARCHAR(30),
    "direccion" VARCHAR(300) NOT NULL,
    "ciudad" VARCHAR(50) NOT NULL,
    "documento" VARCHAR(20) NOT NULL,
    "cumpleanos" DATE,
    "observaciones" VARCHAR(1000),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombres" VARCHAR(200) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "celular" VARCHAR(15) NOT NULL,
    "cargo" VARCHAR(200) NOT NULL,
    "roles" VARCHAR(200) NOT NULL,
    "contrasena" VARCHAR(50) NOT NULL,
    "foto" VARCHAR(500),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    "sucursalId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pacientes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "edad" VARCHAR(20) NOT NULL,
    "sexo" VARCHAR(8) NOT NULL,
    "especie" VARCHAR(20) NOT NULL,
    "raza" VARCHAR(50) NOT NULL,
    "peso" VARCHAR(20) NOT NULL,
    "castrado" BOOLEAN NOT NULL DEFAULT false,
    "foto" VARCHAR(500),
    "fechaNacimiento" DATE,
    "fechaIngreso" DATE NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    "clienteId" INTEGER NOT NULL,
    "sedeId" INTEGER NOT NULL,
    "historiaClinicaId" INTEGER,
    "alimentoPrincipal" VARCHAR(500) NOT NULL,
    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sucursales_nombre_key" ON "sucursales"("nombre");
CREATE UNIQUE INDEX "sucursales_email_key" ON "sucursales"("email");
CREATE UNIQUE INDEX "permisos_nombre_key" ON "permisos"("nombre");
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");
CREATE UNIQUE INDEX "clientes_documento_key" ON "clientes"("documento");
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE INDEX "usuarios_rolId_idx" ON "usuarios"("rolId");

ALTER TABLE "usuarios"
ADD CONSTRAINT "usuarios_sucursalId_fkey"
FOREIGN KEY ("sucursalId") REFERENCES "sucursales"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "usuarios"
ADD CONSTRAINT "usuarios_rolId_fkey"
FOREIGN KEY ("rolId") REFERENCES "roles"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pacientes"
ADD CONSTRAINT "pacientes_clienteId_fkey"
FOREIGN KEY ("clienteId") REFERENCES "clientes"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pacientes"
ADD CONSTRAINT "pacientes_sedeId_fkey"
FOREIGN KEY ("sedeId") REFERENCES "sucursales"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
