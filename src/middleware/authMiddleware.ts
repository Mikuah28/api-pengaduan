// src/middleware/authMiddleware.ts
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export type UserRole = "user" | "admin" | "super_admin";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
  jwt({ name: "jwt", secret: process.env.JWT_SECRET ?? "supersecret" })
);

export async function verifyToken(jwt: any, authorization: string | undefined, set: any) {
  if (!authorization) {
    set.status = 401;
    throw new Error("Token tidak ditemukan");
  }

  const token = authorization.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : authorization;

  const payload = await jwt.verify(token);
  if (!payload) {
    set.status = 401;
    throw new Error("Token tidak valid atau sudah expired");
  }

  return payload as { id: number; role: UserRole };
}

// Hanya super_admin
export function requireSuperAdmin(role: UserRole, set: any) {
  if (role !== "super_admin") {
    set.status = 403;
    throw new Error("Akses ditolak: hanya super admin");
  }
}

// admin DAN super_admin
export function requireAdmin(role: UserRole, set: any) {
  if (role !== "admin" && role !== "super_admin") {
    set.status = 403;
    throw new Error("Akses ditolak: hanya admin atau super admin");
  }
}

// Cek apakah role adalah admin atau super_admin (return boolean, tidak throw)
export function isAdmin(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}
