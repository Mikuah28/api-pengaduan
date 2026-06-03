import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRoleIdByName(roleName: string): Promise<number> {
  const roleRecord = await prisma.role.findUnique({
    where: { nama_role: roleName },
  });
  
  if (!roleRecord) {
    throw new Error(`Role '${roleName}' tidak ditemukan di database.`);
  }
  
  return roleRecord.id;
}