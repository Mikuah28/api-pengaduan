/*
  Warnings:

  - You are about to drop the column `role` on the `tb_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tb_users" DROP COLUMN "role",
ADD COLUMN     "foto_profil" TEXT,
ADD COLUMN     "role_id" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "tb_roles" (
    "id" SERIAL NOT NULL,
    "nama_role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_notifikasi" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_laporan" INTEGER,
    "id_komentar" INTEGER,
    "isi_notifikasi" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_log_aktifitas" (
    "id" SERIAL NOT NULL,
    "activity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_log_aktifitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_roles_nama_role_key" ON "tb_roles"("nama_role");

-- AddForeignKey
ALTER TABLE "tb_users" ADD CONSTRAINT "tb_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "tb_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_notifikasi" ADD CONSTRAINT "tb_notifikasi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "tb_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_notifikasi" ADD CONSTRAINT "tb_notifikasi_id_laporan_fkey" FOREIGN KEY ("id_laporan") REFERENCES "tb_laporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_notifikasi" ADD CONSTRAINT "tb_notifikasi_id_komentar_fkey" FOREIGN KEY ("id_komentar") REFERENCES "tb_komentar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
