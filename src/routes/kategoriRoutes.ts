// src/routes/kategoriRoutes.ts
import { Elysia, t } from "elysia";
import { jwtPlugin, verifyToken } from "../middleware/authMiddleware";
import { getKategori, getKategoriById, createKategori, updateKategori, deleteKategori, getKategoriTrending } from "../controllers/kategoriController";

export const kategoriRoutes = new Elysia({ prefix: "/kategori" })
  .use(jwtPlugin)

  .get("/", () => getKategori())
  .get("/trending", () => getKategoriTrending())

  .get("/:id", ({ params, set }) => getKategoriById(Number(params.id), set))

  .post("/", async ({ body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return createKategori(body.nama_kategori, currentUser, set);
  }, {
    body: t.Object({
      nama_kategori: t.String({ minLength: 3 }),
    }),
  })

  .put("/:id", async ({ params, body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return updateKategori(Number(params.id), body.nama_kategori, currentUser, set);
  }, {
    body: t.Object({
      nama_kategori: t.String({ minLength: 3 }),
    }),
  })

  .delete("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return deleteKategori(Number(params.id), currentUser, set);
  });
