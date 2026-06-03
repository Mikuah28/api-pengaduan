// src/controllers/usersController.ts
import prisma from "../database";
import { requireAdmin, requireSuperAdmin, type UserRole } from "../middleware/authMiddleware";

// GET semua user — admin & super_admin
export async function getUsers(currentUser: { id: number; role: UserRole }, set: any) {
  requireAdmin(currentUser.role, set);

  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return { message: "success", data: users, ok: true };
}

// GET user by id — user hanya bisa lihat diri sendiri, admin/super_admin bisa semua
export async function getUserById(id: number, currentUser: { id: number; role: UserRole }, set: any) {
  if (currentUser.role === "user" && currentUser.id !== id) {
    set.status = 403;
    return { message: "Akses ditolak", ok: false };
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    set.status = 404;
    return { message: "User tidak ditemukan", ok: false };
  }
  return { message: "success", data: user, ok: true };
}

// POST buat user baru — hanya super_admin
// super_admin bisa buat role apa saja (user, admin, super_admin)
export async function createUser(
  body: { username: string; email: string; password: string; role: UserRole },
  currentUser: { id: number; role: UserRole },
  set: any
) {
  requireSuperAdmin(currentUser.role, set);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    set.status = 400;
    return { message: "Email sudah terdaftar", ok: false };
  }

  const hashedPassword = await Bun.password.hash(body.password);
  const user = await prisma.user.create({
    data: { ...body, password: hashedPassword },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  set.status = 201;
  return { message: "success", data: user, ok: true };
}

// PUT update user — aturan:
// super_admin  → bisa update siapa saja, termasuk ganti role
// admin        → hanya bisa update data user biasa (tidak bisa ubah ke admin/super_admin)
// user         → hanya bisa update data diri sendiri, tidak bisa ganti role
export async function updateUser(
  id: number,
  body: { username?: string; email?: string; role?: UserRole },
  currentUser: { id: number; role: UserRole },
  set: any
) {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    set.status = 404;
    return { message: "User tidak ditemukan", ok: false };
  }

  if (currentUser.role === "user") {
    // user hanya bisa edit diri sendiri dan tidak boleh ganti role
    if (currentUser.id !== id) {
      set.status = 403;
      return { message: "Akses ditolak", ok: false };
    }
    if (body.role) {
      set.status = 403;
      return { message: "Anda tidak bisa mengubah role", ok: false };
    }
  }

  if (currentUser.role === "admin") {
    // admin tidak bisa mengedit sesama admin atau super_admin
    if (target.role === "admin" || target.role === "super_admin") {
      set.status = 403;
      return { message: "Admin tidak bisa mengubah data admin lain atau super admin", ok: false };
    }
    // admin tidak bisa assign role admin/super_admin
    if (body.role && body.role !== "user") {
      set.status = 403;
      return { message: "Admin hanya bisa assign role user", ok: false };
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: body,
    select: { id: true, username: true, email: true, role: true, updatedAt: true },
  });
  return { message: "success", data: updated, ok: true };
}

// DELETE user — aturan:
// super_admin → bisa hapus siapa saja (kecuali diri sendiri)
// admin       → hanya bisa hapus user biasa
// user        → tidak bisa hapus
export async function deleteUser(
  id: number,
  currentUser: { id: number; role: UserRole },
  set: any
) {
  requireAdmin(currentUser.role, set);

  if (currentUser.id === id) {
    set.status = 400;
    return { message: "Tidak bisa menghapus akun sendiri", ok: false };
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    set.status = 404;
    return { message: "User tidak ditemukan", ok: false };
  }

  // admin hanya bisa hapus user biasa
  if (currentUser.role === "admin" && (target.role === "admin" || target.role === "super_admin")) {
    set.status = 403;
    return { message: "Admin tidak bisa menghapus admin lain atau super admin", ok: false };
  }

  await prisma.user.delete({ where: { id } });
  return { message: "User berhasil dihapus", ok: true };
}
