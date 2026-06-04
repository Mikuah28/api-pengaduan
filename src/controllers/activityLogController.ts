import prisma from "../database";
import { requireAdmin, requireSuperAdmin, type UserRole } from "../middleware/authMiddleware";

export async function getLogs(currentUser: { id: number; role: UserRole }, set: any) {
    requireSuperAdmin(currentUser.role, set)

    const data = await prisma.activityLog.findMany({
        orderBy: { created_at: "desc" },
        take: 5
    });
    return { message: "success", data, ok: true };
}