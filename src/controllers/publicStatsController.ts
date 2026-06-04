import prisma from "../database";

export async function getPublicStats() {
  try {
    const [
      totalUser,
      laporanDiproses,
      laporanSelesai,
      totalLaporan
    ] = await Promise.all([
      prisma.user.count(),

      prisma.laporan.count({
        where: { status: "diproses" }
      }),

      prisma.laporan.count({
        where: { status: "selesai" }
      }),

      prisma.laporan.count()
    ]);

    const laporanDitangani = laporanDiproses + laporanSelesai;

    const persentasePenyelesaian = totalLaporan > 0 
      ? Math.round((laporanSelesai / totalLaporan) * 100) 
      : 0;

    return {
      message: "success",
      data: {
        total_user: totalUser,
        laporan_ditangani: laporanDitangani,
        persentase_penyelesaian: `${persentasePenyelesaian}%`, 
        detail: {
          total_laporan: totalLaporan,
          diproses: laporanDiproses,
          selesai: laporanSelesai
        }
      },
      ok: true
    };
  } catch (error) {
    console.error("Gagal mengambil data statistik:", error);
    return {
      message: "failed",
      data: {
        total_user: 0,
        laporan_ditangani: 0,
        persentase_penyelesaian: "0%"
      },
      ok: false
    };
  }
}