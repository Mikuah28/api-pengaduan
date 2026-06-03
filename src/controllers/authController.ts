// src/controllers/authController.ts
import prisma from "../database";

export async function login(
  body: { email: string; password: string },
  jwt: any,
  set: any
) {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    set.status = 400;
    return { message: "Login gagal", ok: false };
  }

  const isMatch = await Bun.password.verify(body.password, user.password);
  if (!isMatch) {
    set.status = 400;
    return { message: "Login gagal", ok: false };
  }

  const token = await jwt.sign({ id: user.id, role: user.role });
  return { message: "Login berhasil", token, role: user.role, ok: true };
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

  const hashedPassword = await Bun.password.hash(body.password);
  const user = await prisma.user.create({
    data: { ...body, password: hashedPassword, role: "user" },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  set.status = 201;
  return { message: "Registrasi berhasil", data: user, ok: true };
}
