// src/routes/laporanRoutes.ts
import { Elysia, t } from "elysia";
import { jwtPlugin, verifyToken } from "../middleware/authMiddleware";
import {
  getLaporan, getLaporanById, getLaporanByUser,
  createLaporan, updateLaporan, editStatus, deleteLaporan,
} from "../controllers/laporanController";

export const laporanRoutes = new Elysia({ prefix: "/laporan" })
  .use(jwtPlugin)

  .get("/", async ({ query, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getLaporan(query, currentUser)
  })

  .get("/user/me", async ({ query, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getLaporanByUser(query, currentUser);
  })

  .get("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getLaporanById(Number(params.id), set, currentUser)
  })

  .post("/", async ({ body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return createLaporan(body, currentUser, set);
  }, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      lokasi: t.String(),
      kategori_id: t.Union([t.String(), t.Number()]),
      image: t.Optional(t.File()),
    }),
    type: "multipart/form-data",
  })

  .put("/:id", async ({ params, body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return updateLaporan(Number(params.id), body, currentUser, set);
  }, {
    body: t.Object({
      judul: t.Optional(t.String()),
      deskripsi: t.Optional(t.String()),
      lokasi: t.Optional(t.String()),
      kategori_id: t.Optional(t.Union([t.String(), t.Number()])),
      image: t.Optional(t.File()),
    }),
    type: "multipart/form-data",
  })

  .patch("/:id/status", async ({ params, body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return editStatus(Number(params.id), body.status, currentUser, set);
  }, {
    body: t.Object({
      status: t.Union([
        t.Literal("pending"),
        t.Literal("diproses"),
        t.Literal("selesai"),
        t.Literal("ditolak"),
      ]),
    }),
  })

  .delete("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return deleteLaporan(Number(params.id), currentUser, set);
  });
