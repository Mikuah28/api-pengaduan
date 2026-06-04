import prisma from "../database";

export async function search(query: string, set: any) {
  if (!query || query.trim().length < 2) {
    set.status = 400;
    return { message: "Query minimal 2 karakter", ok: false };
  }

  const q = query.trim();

  const [laporan, kategori, users] = await Promise.all([
    // Cari laporan berdasarkan judul, deskripsi, atau lokasi
    prisma.laporan.findMany({
      where: {
        OR: [
          { judul:     { contains: q, mode: "insensitive" } },
          { deskripsi: { contains: q, mode: "insensitive" } },
          { lokasi:    { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        user:    { select: { id: true, username: true } },
        kategori: true,
        _count:  { select: { komentar: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Cari kategori berdasarkan nama
    prisma.kategori.findMany({
      where: { nama_kategori: { contains: q, mode: "insensitive" } },
      take: 5,
    }),

    // Cari user berdasarkan username atau email (admin only — dipakai di endpoint terpisah)
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { email:    { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, username: true, email: true, role: true },
      take: 5,
    }),
  ]);

  return {
    message: "success",
    query: q,
    data: {
      laporan,
      kategori,
      users,
    },
    meta: {
      totalLaporan:  laporan.length,
      totalKategori: kategori.length,
      totalUsers:    users.length,
    },
    ok: true,
  };
}

// Search laporan saja dengan filter tambahan
export async function searchLaporan(params: {
  query?:       string;
  status?:      string;
  kategori_id?: number;
  lokasi?:      string;
  page?:        number;
  limit?:       number;
}) {
  const { query, status, kategori_id, lokasi, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query?.trim()) {
    where.OR = [
      { judul:     { contains: query.trim(), mode: "insensitive" } },
      { deskripsi: { contains: query.trim(), mode: "insensitive" } },
      { lokasi:    { contains: query.trim(), mode: "insensitive" } },
    ];
  }
  if (status)      where.status     = status;
  if (kategori_id) where.kategori_id = kategori_id;
  if (lokasi?.trim()) {
    where.lokasi = { contains: lokasi.trim(), mode: "insensitive" };
  }

  const [data, total] = await prisma.$transaction([
    prisma.laporan.findMany({
      where,
      skip,
      take: limit,
      include: {
        user:    { select: { id: true, username: true, email: true } },
        kategori: true,
        _count:  { select: { komentar: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.laporan.count({ where }),
  ]);

  return {
    message: "success",
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    ok: true,
  };
}