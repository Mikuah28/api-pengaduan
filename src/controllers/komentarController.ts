// src/controllers/komentarController.ts
import { useNotification } from "@/utils/useNotification";
import prisma from "../database";
import { isAdmin, type UserRole } from "../middleware/authMiddleware";
import { useLog } from "@/utils/useLog";

// GET — public
export async function getKomentar(laporan_id: number, set: any) {
  if (!laporan_id) {
    set.status = 400;
    return { message: "laporan_id wajib diisi", ok: false };
  }
  const data = await prisma.komentar.findMany({
    where: { id_laporan: laporan_id },
    include: {
      user: { select: { id: true, username: true, foto_profil: true } },
      balasKomentar: { orderBy: { created_at: "asc" }, include:{
        user: { select: { id: true, username: true, foto_profil: true } },
      } },
    },
    orderBy: { created_at: "asc" },
  });
  return { message: "success", data, ok: true };
}

// POST — semua role yang login
export async function createKomentar(
  body: { id_laporan: number; isi_komentar: string },
  currentUser: { id: number; role: UserRole },
  set: any
) {
  // 1. Ambil data laporan beserta id_user pemilik laporan untuk target notifikasi
  const laporan = await prisma.laporan.findUnique({
    where: { id: body.id_laporan }
  });

  if (!laporan) {
    set.status = 404;
    return { message: "Laporan tidak ditemukan", ok: false };
  }

  // 2. Buat komentar baru
  const data = await prisma.komentar.create({
    data: {
      id_user: currentUser.id,
      id_laporan: body.id_laporan,
      isi_komentar: body.isi_komentar
    },
    include: { user: { select: { id: true, username: true } } },
  });

  if (laporan.id_user !== currentUser.id) {
    await useNotification({
      id_user: laporan.id_user, // Penerima adalah pemilik laporan
      id_laporan: body.id_laporan,
      id_komentar: data.id, // ID komentar yang baru saja dibuat
      isi_notifikasi: "komentar baru pada laporan anda",
      is_read: false
    }
    );

    await useLog(`user id ${currentUser.id} komentar ke laporan id ${laporan.id}`)
  }

  set.status = 201;
  return { message: "Komentar berhasil ditambahkan", data, ok: true };
}

// DELETE — pemilik komentar, admin, super_admin
export async function deleteKomentar(id: number, currentUser: { id: number; role: UserRole }, set: any) {
  const komentar = await prisma.komentar.findUnique({ where: { id } });
  if (!komentar) {
    set.status = 404;
    return { message: "Komentar tidak ditemukan", ok: false };
  }
  if (!isAdmin(currentUser.role) && komentar.id_user !== currentUser.id) {
    set.status = 403;
    return { message: "Akses ditolak", ok: false };
  }

  await prisma.komentar.delete({ where: { id } });

  await useLog(`${currentUser.role} id ${currentUser.id} delete komentar id ${id}`)
  return { message: "Komentar berhasil dihapus", ok: true };
}
