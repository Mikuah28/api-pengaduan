import prisma from "../database";

export async function getDashboardData(currentUser: { id: number; role: string }) {
    try {
        const role = currentUser.role;

        if (role === "admin") {
            const [
                totalLaporan,
                laporanPending,
                laporanDiproses,
                laporanSelesai,
                kategoriData
            ] = await Promise.all([
                prisma.laporan.count(),
                prisma.laporan.count({ where: { status: "menunggu" } }),
                prisma.laporan.count({ where: { status: "diproses" } }),
                prisma.laporan.count({ where: { status: "selesai" } }),
                prisma.kategori.findMany({
                    include: {
                        _count: { select: { laporan: true } }
                    }
                })
            ]);

            const dataChartKategori = kategoriData.map((kat) => {
                const jumlah = kat._count.laporan;

                return {
                    kategori: kat.nama_kategori,
                    jumlah_laporan: jumlah,
                };
            });

            const categoryPrecentage = dataChartKategori.map((kat) => {
                const jumlah = kat.jumlah_laporan
                const persentase = totalLaporan > 0
                    ? Math.round((jumlah / totalLaporan) * 100)
                    : 0;
                return {
                    kategori: kat.kategori,
                    persentase: `${persentase}%`
                };
            });

            return {
                message: "success",
                role: "admin",
                data: {
                    counts: {
                        total_laporan: totalLaporan,
                        laporan_pending: laporanPending,
                        laporan_diproses: laporanDiproses,
                        laporan_selesai: laporanSelesai
                    },
                    charts: {
                        category_reports: dataChartKategori,
                        category_percentage: categoryPrecentage
                    }
                },
                ok: true
            };
        }

        if (role === "super_admin" || role === "superadmin") {
            const [
                totalAdmin,
                totalLaporan,
                laporanSelesai,
                totalUser
            ] = await Promise.all([
                prisma.user.count({
                    where: { role: { nama_role: "admin" } }
                }),
                prisma.laporan.count(),
                prisma.laporan.count({ where: { status: "selesai" } }),
                prisma.user.count({
                    where: { role: { nama_role: "user" } }
                })
            ]);

            const aktivitas7Hari = [];
            const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                const startOfDay = new Date(date.setHours(0, 0, 0, 0));
                const endOfDay = new Date(date.setHours(23, 59, 59, 999));
                const hariString = namaHari[startOfDay.getDay()];

                const [laporanMasukHariIni, laporanSelesaiHariIni] = await Promise.all([
                    prisma.laporan.count({
                        where: {
                            create_at: { gte: startOfDay, lte: endOfDay }
                        }
                    }),
                    prisma.laporan.count({
                        where: {
                            status: "selesai",
                            create_at: { gte: startOfDay, lte: endOfDay }
                        }
                    })
                ]);

                aktivitas7Hari.push({
                    day: hariString,
                    jumlah_laporan: laporanMasukHariIni,
                    laporan_selesai: laporanSelesaiHariIni
                });
            }

            return {
                message: "success",
                role: "superadmin",
                data: {
                    counts: {
                        total_akun_admin: totalAdmin,
                        total_laporan: totalLaporan,
                        laporan_selesai: laporanSelesai,
                        total_user: totalUser
                    },
                    charts: {
                        weekly_activity: aktivitas7Hari
                    }
                },
                ok: true
            };
        }

        return {
            message: "Akses ditolak, role tidak valid",
            ok: false
        };

    } catch (error) {
        console.error("Error getDashboardStatistik:", error);
        return {
            message: "Gagal mengambil data statistik",
            ok: false
        };
    }
}