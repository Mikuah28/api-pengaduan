// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses seeding...");

  // 1. SEED MASTER ROLES (Wajib duluan karena User bergantung pada Role)
  const roles = ["super_admin", "admin", "user"];
  const roleMap: Record<string, number> = {};

  for (const nama_role of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { nama_role },
      update: {},
      create: { nama_role },
    });
    roleMap[nama_role] = roleRecord.id;
  }
  console.log("✅ Master roles berhasil di-seed.");

  // 2. SEED USERS (Menggunakan ID dari master roles)

  // Super Admin
  await prisma.user.upsert({
    where: { email: "superadmin@laporan.com" },
    update: {},
    create: {
      username: "Super Admin",
      email: "superadmin@laporan.com", // Perbaikan string kosong sebelumnya
      password: await Bun.password.hash("superadmin123"),
      roleId: roleMap["super_admin"], // Menghubungkan ID dari hasil seeder role
    },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      username: "Admin",
      email: "admin@gmail.com",
      password: await Bun.password.hash("admin123"),
      roleId: roleMap["admin"],
    },
  });

  // User biasa
  await prisma.user.upsert({
    where: { email: "alpha@gmail.com" },
    update: {},
    create: {
      username: "Alpha",
      email: "alpha@gmail.com",
      password: await Bun.password.hash("12345678"),
      roleId: roleMap["user"],
    },
  });
  console.log("✅ Data users berhasil di-seed.");

  const kategoris = [
    "Infrastruktur Jalan",
    "Kebersihan & Sampah",
    "Keamanan",
    "Pelayanan Publik",
    "Bencana Alam",
    "Lainnya",
  ];

  for (let i = 0; i < kategoris.length; i++) {
    const nama_kategori = kategoris[i];
    await prisma.kategori.upsert({
      where: { id: i + 1 },
      update: {},
      create: { 
        id: i + 1,
        nama_kategori 
      },
    });
  }
  console.log("✅ Data kategori berhasil di-seed.");

  console.log("\n🚀 SEED SELESAI!");
  console.log("🔑 Akun Login Default:");
  console.log("   - superadmin@laporan.com / superadmin123");
  console.log("   - admin@gmail.com       / admin123");
  console.log("   - alpha@gmail.com       / 12345678");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });