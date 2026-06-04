import prisma from "../database";

export async function useNotification(body: any) {
    const { id_user, id_laporan, id_komentar, isi_notifikasi } = body;

    const user = await prisma.user.findUnique({ where: { id: Number(id_user) } });
    if (!user) {
        return { message: "User tidak ditemukan", ok: false };
    }

    if (id_laporan) {
        const laporan = await prisma.laporan.findUnique({ where: { id: Number(id_laporan) } });
        if (!laporan) {
            return { message: "Laporan tidak ditemukan", ok: false };
        }
    }

    if (id_komentar) {
        const komentar = await prisma.komentar.findUnique({ where: { id: Number(id_komentar) } });
        if (!komentar) {
            return { message: "Komentar tidak ditemukan", ok: false };
        }
    }

    const data = await prisma.notification.create({
        data: {
            id_user: Number(id_user),
            id_laporan: id_laporan ? Number(id_laporan) : null,
            id_komentar: id_komentar ? Number(id_komentar) : null,
            isi_notifikasi,
        },
    });
    
    return { message: "Notifikasi berhasil dibuat", data, ok: true };
}