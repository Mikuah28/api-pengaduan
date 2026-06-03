-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'super_admin');

-- CreateTable
CREATE TABLE "tb_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_kategori" (
    "id" SERIAL NOT NULL,
    "nama_kategori" TEXT NOT NULL,

    CONSTRAINT "tb_kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_laporan" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "gambar" TEXT,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "kategori_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'menunggu',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_komentar" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_laporan" INTEGER NOT NULL,
    "isi_komentar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_komentar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_balas_komentar" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_komentar" INTEGER NOT NULL,
    "balas_komentar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_balas_komentar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_users_email_key" ON "tb_users"("email");

-- AddForeignKey
ALTER TABLE "tb_laporan" ADD CONSTRAINT "tb_laporan_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "tb_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_laporan" ADD CONSTRAINT "tb_laporan_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "tb_kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_komentar" ADD CONSTRAINT "tb_komentar_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "tb_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_komentar" ADD CONSTRAINT "tb_komentar_id_laporan_fkey" FOREIGN KEY ("id_laporan") REFERENCES "tb_laporan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_balas_komentar" ADD CONSTRAINT "tb_balas_komentar_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "tb_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_balas_komentar" ADD CONSTRAINT "tb_balas_komentar_id_komentar_fkey" FOREIGN KEY ("id_komentar") REFERENCES "tb_komentar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
