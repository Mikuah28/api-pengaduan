import prisma from "../database";
import type { UserRole } from "../middleware/authMiddleware";

// Toggle like — jika sudah like maka unlike, jika belum maka like
export async function toggleLike(
  idLaporan: number,
  currentUser: { id: number; role: UserRole },
  set: any
) {
  const laporan = await prisma.laporan.findUnique({ where: { id: idLaporan } });
  if (!laporan) {
    set.status = 404;
    return { message: "Laporan tidak ditemukan", ok: false };
  }

  const existing = await prisma.like.findUnique({
    where: { idUser_idLaporan: { idUser: currentUser.id, idLaporan } },
  });

  if (existing) {
    // Unlike
    await prisma.like.delete({ where: { id: existing.id } });
    const total = await prisma.like.count({ where: { idLaporan } });
    return { message: "Like dibatalkan", liked: false, total, ok: true };
  } else {
    // Like
    await prisma.like.create({ data: { idUser: currentUser.id, idLaporan } });
    const total = await prisma.like.count({ where: { idLaporan } });
    return { message: "Berhasil like", liked: true, total, ok: true };
  }
}

// Cek status like user pada laporan tertentu
export async function getLikeStatus(
  idLaporan: number,
  currentUser: { id: number; role: UserRole }
) {
  const [liked, total] = await Promise.all([
    prisma.like.findUnique({
      where: { idUser_idLaporan: { idUser: currentUser.id, idLaporan } },
    }),
    prisma.like.count({ where: { idLaporan } }),
  ]);

  return { liked: !!liked, total, ok: true };
}

// Daftar user yang like laporan — admin only
export async function getLikesByLaporan(idLaporan: number, set: any) {
  const laporan = await prisma.laporan.findUnique({ where: { id: idLaporan } });
  if (!laporan) {
    set.status = 404;
    return { message: "Laporan tidak ditemukan", ok: false };
  }

  const likes = await prisma.like.findMany({
    where: { idLaporan },
    include: { user: { select: { id: true, username: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return { message: "success", data: likes, total: likes.length, ok: true };
}