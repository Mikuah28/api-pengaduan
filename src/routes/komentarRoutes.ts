// src/routes/komentarRoutes.ts
import { Elysia, t } from "elysia";
import { jwtPlugin, verifyToken } from "../middleware/authMiddleware";
import { getKomentar, createKomentar, deleteKomentar } from "../controllers/komentarController";

export const komentarRoutes = new Elysia({ prefix: "/komentar" })
  .use(jwtPlugin)

  .get("/", ({ query, set }) => getKomentar(Number((query as any).laporan_id), set))

  .post("/", async ({ body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return createKomentar(body, currentUser, set);
  }, {
    body: t.Object({
      id_laporan: t.Number(),
      isi_komentar: t.String({ minLength: 1 }),
    }),
  })

  .delete("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return deleteKomentar(Number(params.id), currentUser, set);
  });
