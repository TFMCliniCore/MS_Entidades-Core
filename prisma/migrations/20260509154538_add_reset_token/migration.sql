-- DropIndex
DROP INDEX "usuarios_rolId_idx";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ALTER COLUMN "contrasena" SET DATA TYPE VARCHAR(200);
