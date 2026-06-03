// src/routes/balasKomentarRoutes.ts
import { Elysia, t } from "elysia";
import { jwtPlugin, verifyToken } from "../middleware/authMiddleware";
import { getBalasKomentar, createBalasKomentar, deleteBalasKomentar } from "../controllers/balasKomentarController";

export const balasKomentarRoutes = new Elysia({ prefix: "/balas-komentar" })
  .use(jwtPlugin)

  .get("/", ({ query, set }) => getBalasKomentar(Number((query as any).komentar_id), set))

  .post("/", async ({ body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return createBalasKomentar(body, currentUser, set);
  }, {
    body: t.Object({
      id_komentar: t.Number(),
      balas_komentar: t.String({ minLength: 1 }),
    }),
  })

  .delete("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return deleteBalasKomentar(Number(params.id), currentUser, set);
  });
