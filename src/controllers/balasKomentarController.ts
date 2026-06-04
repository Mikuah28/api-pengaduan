// src/controllers/balasKomentarController.ts
import prisma from "../database";
import { requireAdmin,  type UserRole } from "../middleware/authMiddleware";

// GET — public
export async function getBalasKomentar(komentar_id: number, set: any) {
  if (!komentar_id) {
    set.status = 400;
    return { message: "komentar_id wajib diisi", ok: false };
  }
  const data = await prisma.balasKomentar.findMany({
    where: { id_komentar: komentar_id },
    include: { komentar: { include: { user: { select: { id: true, username: true } } } } },
    orderBy: { created_at: "asc" },
  });
  return { message: "success", data, ok: true };
}

// POST — semua role yang login
export async function createBalasKomentar(
  body: { id_komentar: number; balas_komentar: string },
  currentUser: { id: number; role: UserRole },
  set: any
) {
  const komentar = await prisma.komentar.findUnique({ where: { id: body.id_komentar } });
  if (!komentar) {
    set.status = 404;
    return { message: "Komentar tidak ditemukan", ok: false };
  }

  const data = await prisma.balasKomentar.create({
    data: { id_user: currentUser.id, id_komentar: body.id_komentar, balas_komentar: body.balas_komentar },
  });

  set.status = 201;
  return { message: "Balasan berhasil ditambahkan", data, ok: true };
}

// DELETE — admin & super_admin
export async function deleteBalasKomentar(id: number, currentUser: { role: UserRole }, set: any) {
  requireAdmin(currentUser.role, set);

  const existing = await prisma.balasKomentar.findUnique({ where: { id } });
  if (!existing) {
    set.status = 404;
    return { message: "Balasan tidak ditemukan", ok: false };
  }

  await prisma.balasKomentar.delete({ where: { id } });
  return { message: "Balasan berhasil dihapus", ok: true };
}
