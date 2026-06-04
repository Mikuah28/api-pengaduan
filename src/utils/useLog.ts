import prisma from "../database";

export async function useLog(log: string) {
    const data = await prisma.activityLog.create({
        data: {
            activity: log,
        },
    });
    
    return { message: "Log berhasil dibuat", data, ok: true };
}