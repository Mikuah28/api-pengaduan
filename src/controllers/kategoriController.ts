// src/controllers/kategoriController.ts
import { useLog } from "@/utils/useLog";
import prisma from "../database";
import { requireAdmin, type UserRole } from "../middleware/authMiddleware";

// GET semua — public
export async function getKategori() {
  const data = await prisma.kategori.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: {
        select: {
          laporan: true
        }
      }
    }
  });

  return {
    message: "success",
    data,
    ok: true
  };
}

export async function getKategoriTrending() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const kategoriWithTodayLaporan = await prisma.kategori.findMany({
    include: {
      _count: {
        select: {
          laporan: {
            where: {
              create_at: {
                gte: startOfToday,
                lte: endOfToday,
              },
            },
          },
        },
      },
    },
  });

  const trendingData = kategoriWithTodayLaporan
    .sort((a, b) => b._count.laporan - a._count.laporan)
    .slice(0, 3);

  return {
    message: "success",
    data: trendingData,
    ok: true,
  };
}

// GET by id — public
export async function getKategoriById(id: number, set: any) {
  const data = await prisma.kategori.findUnique({
    where: { id },
    include: { _count: { select: { laporan: true } } },
  });
  if (!data) {
    set.status = 404;
    return { message: "Kategori tidak ditemukan", ok: false };
  }
  return { message: "success", data, ok: true };
}

// POST, PUT, DELETE — admin & super_admin
export async function createKategori(nama_kategori: string, currentUser: { role: UserRole }, set: any) {
  requireAdmin(currentUser.role, set);
  const data = await prisma.kategori.create({ data: { nama_kategori } });
  set.status = 201;
  await useLog(`${currentUser.role} menambahkan kategori ${nama_kategori}`)
  return { message: "success", data, ok: true };
}

export async function updateKategori(id: number, nama_kategori: string, currentUser: { role: UserRole }, set: any) {
  requireAdmin(currentUser.role, set);
  const existing = await prisma.kategori.findUnique({ where: { id } });
  if (!existing) {
    set.status = 404;
    return { message: "Kategori tidak ditemukan", ok: false };
  }
  const data = await prisma.kategori.update({ where: { id }, data: { nama_kategori } });
  await useLog(`${currentUser.role} update kategori id ${existing.id}`)
  return { message: "success", data, ok: true };
}

export async function deleteKategori(id: number, currentUser: { role: UserRole }, set: any) {
  requireAdmin(currentUser.role, set);
  const existing = await prisma.kategori.findUnique({ where: { id } });
  if (!existing) {
    set.status = 404;
    return { message: "Kategori tidak ditemukan", ok: false };
  }
  await prisma.kategori.delete({ where: { id } });
  await useLog(`${currentUser.role} menghapus kategori id ${existing.id}`)
  return { message: "Kategori berhasil dihapus", ok: true };
}
