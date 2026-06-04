// src/controllers/notificationController.ts
import { useLog } from "@/utils/useLog";
import prisma from "../database";
import { requireAdmin, isAdmin, type UserRole } from "../middleware/authMiddleware";

// GET notifikasi milik user yang login — dengan pagination
export async function getNotifications(currentUser: { id: number; role: UserRole }, query: any) {
  const { page = "1", limit = "10", is_read } = query;
  const where: any = { id_user: currentUser.id };
  if (is_read !== undefined) where.is_read = is_read === "true";

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where, skip, take: Number(limit),
      orderBy: { created_at: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    message: "success", data,
    meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    ok: true,
  };
}

// GET jumlah notifikasi belum dibaca
export async function getUnreadCount(currentUser: { id: number; role: UserRole }) {
  const count = await prisma.notification.count({
    where: { id_user: currentUser.id, is_read: false },
  });
  return { message: "success", data: { unread_count: count }, ok: true };
}

// POST buat notifikasi — admin & super_admin
export async function createNotification(body: any, currentUser: { id: number; role: UserRole }, set: any) {
  requireAdmin(currentUser.role, set);

  const { id_user, id_laporan, id_komentar, isi_notifikasi } = body;

  const user = await prisma.user.findUnique({ where: { id: Number(id_user) } });
  if (!user) {
    set.status = 400;
    return { message: "User tidak ditemukan", ok: false };
  }

  if (id_laporan) {
    const laporan = await prisma.laporan.findUnique({ where: { id: Number(id_laporan) } });
    if (!laporan) {
      set.status = 400;
      return { message: "Laporan tidak ditemukan", ok: false };
    }
  }

  if (id_komentar) {
    const komentar = await prisma.komentar.findUnique({ where: { id: Number(id_komentar) } });
    if (!komentar) {
      set.status = 400;
      return { message: "Komentar tidak ditemukan", ok: false };
    }
  }

  const data = await prisma.notification.create({
    data: {
      id_user: Number(id_user),
      id_laporan: id_laporan ? Number(id_laporan) : null,
      id_komentar: id_komentar ? Number(id_komentar) : null,
      isi_notifikasi,
    },
  });

  set.status = 201;
  return { message: "Notifikasi berhasil dibuat", data, ok: true };
}

// PATCH tandai notifikasi sebagai dibaca
export async function markAsRead(id: number, currentUser: { id: number; role: UserRole }, set: any) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) {
    set.status = 404;
    return { message: "Notifikasi tidak ditemukan", ok: false };
  }
  if (!isAdmin(currentUser.role) && existing.id_user !== currentUser.id) {
    set.status = 403;
    return { message: "Akses ditolak", ok: false };
  }

  const data = await prisma.notification.update({
    where: { id },
    data: { is_read: true },
  });
  return { message: "Notifikasi berhasil ditandai dibaca", data, ok: true };
}

// PATCH tandai semua notifikasi user sebagai dibaca
export async function markAllAsRead(currentUser: { id: number; role: UserRole }) {
  await prisma.notification.updateMany({
    where: { id_user: currentUser.id, is_read: false },
    data: { is_read: true },
  });
  return { message: "Semua notifikasi berhasil ditandai dibaca", ok: true };
}

// DELETE notifikasi — pemilik, admin, super_admin
export async function deleteNotification(id: number, currentUser: { id: number; role: UserRole }, set: any) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) {
    set.status = 404;
    return { message: "Notifikasi tidak ditemukan", ok: false };
  }
  if (!isAdmin(currentUser.role) && existing.id_user !== currentUser.id) {
    set.status = 403;
    return { message: "Akses ditolak", ok: false };
  }

  await prisma.notification.delete({ where: { id } });
  await useLog(`${currentUser.role} id ${currentUser.id} menghapus notifikasi dengan id ${id}`)
  return { message: "Notifikasi berhasil dihapus", ok: true };
}
