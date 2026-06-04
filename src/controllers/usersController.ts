// src/controllers/usersController.ts
import { getRoleIdByName } from "@/utils/getrole";
import prisma from "../database";
import { requireAdmin, requireSuperAdmin, type UserRole } from "../middleware/authMiddleware";
import { useLog } from "@/utils/useLog";

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

  try {
    // Cari id_role dinamis berdasarkan string nama role di request body
    const targetRoleId = await getRoleIdByName(body.role);

    const hashedPassword = await Bun.password.hash(body.password);
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        roleId: targetRoleId, // Masukkan id dari query tabel role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: { select: { nama_role: true } }, // Select nama_role dari relasi
        createdAt: true
      },
    });
    await useLog(`${currentUser.role} id ${currentUser.id} membuat pengguna dengan id ${user.id}`)
    set.status = 201;
    return { message: "success", data: user, ok: true };
  } catch (error: any) {
    set.status = 500;
    return { message: error.message || "Internal server error", ok: false };
  }
}

// 2. UPDATE USER
export async function updateUser(
  id: number,
  body: { username?: string; email?: string; role?: UserRole },
  currentUser: { id: number; role: UserRole },
  set: any
) {
  // Ambil data user target beserta data teks nama_role-nya melalui relasi include/select
  const target = await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });

  if (!target) {
    set.status = 404;
    return { message: "User tidak ditemukan", ok: false };
  }

  // Ambil teks nama role dari target user saat ini
  const targetRoleName = target.role.nama_role;

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
    if (targetRoleName === "admin" || targetRoleName === "super_admin") {
      set.status = 403;
      return { message: "Admin tidak bisa mengubah data admin lain atau super admin", ok: false };
    }
    // admin tidak bisa assign role admin/super_admin
    if (body.role && body.role !== "user") {
      set.status = 403;
      return { message: "Admin hanya bisa assign role user", ok: false };
    }
  }

  try {
    // Siapkan penampung objek untuk query Prisma update data
    const updateData: any = {};
    if (body.username) updateData.username = body.username;
    if (body.email) updateData.email = body.email;

    // Jika ada request perubahan role, cari ID dinamisnya dari tabel role
    if (body.role) {
      updateData.roleId = await getRoleIdByName(body.role);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: { select: { nama_role: true } },
        updatedAt: true
      },
    });

    await useLog(`${currentUser.role} id ${currentUser.id} update pengguna dengan id ${id}`)

    return { message: "success", data: updated, ok: true };
  } catch (error: any) {
    set.status = 500;
    return { message: error.message || "Internal server error", ok: false };
  }
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

  const target = await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });

  if (!target) {
    set.status = 404;
    return { message: "User tidak ditemukan", ok: false };
  }

  const targetRoleName = target.role.nama_role;

  if (
    currentUser.role === "admin" &&
    (targetRoleName === "admin" || targetRoleName === "super_admin")
  ) {
    set.status = 403;
    return { message: "Admin tidak bisa menghapus admin lain atau super admin", ok: false };
  }

  await prisma.user.delete({ where: { id } });

  await useLog(`${currentUser.role} id ${currentUser.id} menghapus pengguna dengan id ${id}`)
  return { message: "User berhasil dihapus", ok: true };
}