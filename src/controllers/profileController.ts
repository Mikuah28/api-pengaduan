import { useLog } from "@/utils/useLog";
import prisma from "../database";
import { saveImage } from "@/utils/saveImage";

export async function getProfileUser(currentUser: { id: number }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        username: true,
        email: true,
        foto_profil: true,
        createdAt: true,
        role: {
          select: {
            nama_role: true,
          },
        },
        _count: {
          select: {
            laporan: true, 
            komentar: true, 
          },
        },
        laporan: {
          where: {
            status: "selesai", 
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return { message: "User tidak ditemukan", ok: false };
    }

    const { role, _count, laporan, ...rest } = user;

    const formattedData = {
      ...rest,
      role: role.nama_role,
      stats: {
        total_laporan: _count.laporan,          
        laporan_selesai: laporan.length,       
        total_komentar: _count.komentar,        
      },
    };

    return { message: "success", data: formattedData, ok: true };
  } catch (error: any) {
    return { message: error.message || "Internal server error", ok: false };
  }
}
export async function updateProfileUser(
  body: any,
  currentUser: { id: number },
  set: any
) {
  const { username, email, image } = body;

  if (email) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: currentUser.id }, 
      },
    });

    if (existingEmail) {
      set.status = 400;
      return { message: "Email sudah digunakan oleh pengguna lain", ok: false };
    }
  }

  let foto_profil: string | undefined = undefined;
  
  if (image instanceof File) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(image.type)) {
      set.status = 400;
      return { message: "Format gambar tidak valid. Gunakan jpg, png, atau webp", ok: false };
    }
    
    foto_profil = await saveImage(image);
  }

  const updateData: any = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (foto_profil !== undefined) updateData.foto_profil = foto_profil;

  if (Object.keys(updateData).length === 0) {
    set.status = 400;
    return { message: "Tidak ada data profil yang dikirim untuk diperbarui", ok: false };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        foto_profil: true,
        role: {
          select: { nama_role: true },
        },
        createdAt: true,
      },
    });

    const { role, ...rest } = updatedUser;
    const formattedData = {
      ...rest,
      role: role.nama_role,
    };
    await useLog(`user ${currentUser.id} mengupdate profil`)

    return { message: "Profil berhasil diperbarui", data: formattedData, ok: true };
  } catch (error: any) {
    set.status = 500;
    return { message: error.message || "Internal server error", ok: false };
  }
}