-- DropIndex
DROP INDEX "usuarios_rolId_idx";

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "contrasena" SET DATA TYPE VARCHAR(100);
