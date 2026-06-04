// src/controllers/laporanController.ts
import { useNotification } from "@/utils/useNotification";
import prisma from "../database";
import { requireAdmin, isAdmin, type UserRole } from "../middleware/authMiddleware";
import { saveImage } from "@/utils/saveImage";
import { useLog } from "@/utils/useLog";

// GET semua — public, bisa filter
export async function getLaporan(query: any) {
  const { status, kategori_id, page = "1", limit = "10" } = query;
  const where: any = {};
  if (status) where.status = status;
  if (kategori_id) where.kategori_id = Number(kategori_id);

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await prisma.$transaction([
    prisma.laporan.findMany({
      where, skip, take: Number(limit),
      include: {
        user: { select: { id: true, username: true, email: true, foto_profil: true } },
        kategori: true,
        _count: { select: { komentar: true, likes: true } },
      },
      orderBy: { create_at: "desc" },
    }),
    prisma.laporan.count({ where }),
  ]);

  return {
    message: "success", data,
    meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    ok: true,
  };
}

// GET by id — public
export async function getLaporanById(id: number, set: any) {
  const data = await prisma.laporan.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, email: true, foto_profil: true } },
      kategori: true,
      _count: { select: { komentar: true, likes: true } },
      komentar: {
        include: { user: { select: { id: true, username: true, foto_profil: true } }, balasKomentar: true },
        orderBy: { created_at: "asc" },
      },
    },
  });
  if (!data) {
    set.status = 404;
    return { message: "Laporan tidak ditemukan", ok: false };
  }
  return { message: "success", data, ok: true };
}

// GET laporan milik sendiri — semua role yang login
export async function getLaporanByUser(currentUser: { id: number; role: UserRole }) {
  const data = await prisma.laporan.findMany({
    where: { id_user: currentUser.id },
    include: { kategori: true, _count: { select: { komentar: true } } },
    orderBy: { create_at: "desc" },
  });
  return { message: "success", data, ok: true };
}

// POST buat laporan — semua role yang login
export async function createLaporan(body: any, currentUser: { id: number; role: UserRole }, set: any) {
  const { judul, deskripsi, lokasi, kategori_id, image } = body;

  const kategori = await prisma.kategori.findUnique({ where: { id: Number(kategori_id) } });
  if (!kategori) {
    set.status = 400;
    return { message: "Kategori tidak ditemukan", ok: false };
  }

  let gambar: string | null = null;
  if (image instanceof File) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(image.type)) {
      set.status = 400;
      return { message: "Format gambar tidak valid. Gunakan jpg, png, atau webp", ok: false };
    }
    gambar = await saveImage(image);
  }

  const data = await prisma.laporan.create({
    data: { id_user: currentUser.id, kategori_id: Number(kategori_id), judul, deskripsi, lokasi, gambar, status: "menunggu" },
    include: { kategori: true, user: { select: { id: true, username: true } } },
  });

  set.status = 201;
  await useLog(`${currentUser.role} membuat laporan dengan id ${data.id}`)
  return { message: "Laporan berhasil dibuat", data, ok: true };
}

// PUT update laporan — pemilik, admin, super_admin
export async function updateLaporan(id: number, body: any, currentUser: { id: number; role: UserRole }, set: any) {
  const existing = await prisma.laporan.findUnique({ where: { id } });
  if (!existing) {
    set.status = 404;
    return { message: "Laporan tidak ditemukan", ok: false };
  }
  if (!isAdmin(currentUser.role) && existing.id_user !== currentUser.id) {
    set.status = 403;
    return { message: "Akses ditolak", ok: false };
  }

  const { judul, deskripsi, lokasi, kategori_id, image } = body;
  let gambar = existing.gambar;
  if (image instanceof File) gambar = await saveImage(image);

  const data = await prisma.laporan.update({
    where: { id },
    data: {
      judul: judul ?? existing.judul,
      deskripsi: deskripsi ?? existing.deskripsi,
      lokasi: lokasi ?? existing.lokasi,
      kategori_id: kategori_id ? Number(kategori_id) : existing.kategori_id,
      gambar,
    },
    include: { kategori: true },
  });
  await useLog(`${currentUser.role} update laporan dengan id ${id}`)
  return { message: "Laporan berhasil diupdate", data, ok: true };
}

// PATCH status — admin & super_admin
export async function editStatus(id: number, status: string, currentUser: { role: UserRole }, set: any) {
  requireAdmin(currentUser.role, set);

  const existing = await prisma.laporan.findUnique({ where: { id } });
  if (!existing) {
    set.status = 404;
    return { message: "Laporan tidak ditemukan", ok: false };
  }

  const data = await prisma.laporan.update({ where: { id }, data: { status } });

  await useNotification({
    id_user: existing.id_user,
    id_laporan: existing.id,
    isi_notifikasi: `Laporan Anda berubah status menjadi ${status}`,
    is_read: false
  })
  await useLog(`${currentUser.role} mengubah status laporan dengan id ${id} menjadi ${status}`)
  return { message: "Status berhasil diupdate", data, ok: true };
}

// DELETE — pemilik laporan, admin, super_admin
export async function deleteLaporan(id: number, currentUser: { id: number; role: UserRole }, set: any) {
  const existing = await prisma.laporan.findUnique({ where: { id } });
  if (!existing) {
    set.status = 404;
    return { message: "Laporan tidak ditemukan", ok: false };
  }
  if (!isAdmin(currentUser.role) && existing.id_user !== currentUser.id) {
    set.status = 403;
    return { message: "Akses ditolak", ok: false };
  }

  await prisma.laporan.delete({ where: { id } });
  await useLog(`${currentUser.role} mengahpus laporan dengan id ${id}`)
  return { message: "Laporan berhasil dihapus", ok: true };
}
