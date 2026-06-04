// src/index.ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { authRoutes } from "./routes/authRoutes";
import { usersRoutes } from "./routes/usersRoutes";
import { kategoriRoutes } from "./routes/kategoriRoutes";
import { laporanRoutes } from "./routes/laporanRoutes";
import { komentarRoutes } from "./routes/komentarRoutes";
import { balasKomentarRoutes } from "./routes/balasKomentarRoutes";
import { profileRoutes } from "./routes/profileRoutes";
import { notificationRoutes } from "./routes/notificationRoutes";
import { logRoutes } from "./routes/activityLogRoutes";
import { publicRoutes } from "./routes/publicRoutes";
import { dashboardRoutes } from "./routes/dashboardRoutes";

const PORT = Number(process.env.PORT) || 5000;

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ assets: "uploads", prefix: "/uploads" }))

  .get("/", () => ({
    message: "API Laporan Pengaduan Masyarakat",
    version: "1.0.0",
    status: "running",
  }))

  .group("/api", (app) =>
    app
      .use(publicRoutes)
      .use(authRoutes)
      .use(profileRoutes)
      .use(usersRoutes)
      .use(kategoriRoutes)
      .use(laporanRoutes)
      .use(komentarRoutes)
      .use(balasKomentarRoutes)
      .use(notificationRoutes)
      .use(logRoutes)
      .use(dashboardRoutes)
  )

  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 422;
      return { message: "Validasi gagal", errors: error.message, ok: false };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { message: "Route tidak ditemukan", ok: false };
    }
    if (error.message.includes("Token") || error.message.includes("Akses")) {
      return { message: error.message, ok: false };
    }
    set.status = 500;
    return { message: "Internal server error", error: error.message, ok: false };
  })

  .listen(PORT);

console.log(`🚀 Server berjalan di http://localhost:${PORT}`);

export type App = typeof app;
