// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Super Admin
  await prisma.user.upsert({
    where: { email: "superadmin@laporan.com" },
    update: {},
    create: {
      username: "Super Admin",
      email: "superadmin@gmail.com",
      password: await Bun.password.hash("superadmin123"),
      role: "super_admin",
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
      role: "admin",
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
      role: "user",
    },
  });

  // Kategori
  const kategoris = [
    "Infrastruktur Jalan",
    "Kebersihan & Sampah",
    "Keamanan",
    "Pelayanan Publik",
    "Bencana Alam",
    "Lainnya",
  ];

  for (const nama_kategori of kategoris) {
    await prisma.kategori.upsert({
      where: { id: kategoris.indexOf(nama_kategori) + 1 },
      update: {},
      create: { nama_kategori },
    });
  }

  console.log("✅ Seed selesai!");
  console.log("   superadmin@laporan.com / superadmin123");
  console.log("   admin@laporan.com      / admin123");
  console.log("   user@laporan.com       / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
