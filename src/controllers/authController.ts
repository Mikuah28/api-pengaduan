import { useLog } from "@/utils/useLog";
import prisma from "../database";

export async function login(
  body: { email: string; password: string },
  jwt: any,
  set: any
) {
  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: { role: true }
  });

  if (!user) {
    set.status = 400;
    return { message: "Login gagal", ok: false };
  }

  const isMatch = await Bun.password.verify(body.password, user.password);
  if (!isMatch) {
    set.status = 400;
    return { message: "Login gagal", ok: false };
  }

  const roleName = user.role.nama_role;
  const token = await jwt.sign({ id: user.id, role: roleName });

  await useLog(`${user.role.nama_role} id ${user.id} login`)

  return {
    message: "Login berhasil",
    token,
    role: roleName,
    ok: true
  };
}

export async function register(
  body: { username: string; email: string; password: string },
  set: any
) {
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    set.status = 400;
    return { message: "Email sudah terdaftar", ok: false };
  }

  try {
    const defaultRole = await prisma.role.findUnique({
      where: { nama_role: "user" }
    });

    if (!defaultRole) {
      set.status = 500;
      return { message: "Konfigurasi role 'user' belum di-seed di database", ok: false };
    }

    const hashedPassword = await Bun.password.hash(body.password);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        roleId: defaultRole.id
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: { select: { nama_role: true } },
        createdAt: true
      },
    });

    set.status = 201;
    await useLog(`Pengguna baru terdaftar ${body.username}`)

    return { message: "Registrasi berhasil", data: user, ok: true };

  } catch (error: any) {
    set.status = 500;
    return { message: error.message || "Internal server error", ok: false };
  }
}