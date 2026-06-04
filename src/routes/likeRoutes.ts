import { Elysia, t } from "elysia";
import { jwtPlugin, verifyToken, requireAdmin } from "../middleware/authMiddleware";
import { toggleLike, getLikeStatus, getLikesByLaporan } from "../controllers/likeController";

export const likeRoutes = new Elysia({ prefix: "/likes" })
  .use(jwtPlugin)

  // POST /api/likes/:id_laporan — toggle like (butuh login)
  .post("/:id_laporan", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return toggleLike(Number(params.id_laporan), currentUser, set);
  })

  // GET /api/likes/:id_laporan/status — cek status like user (butuh login)
  .get("/:id_laporan/status", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getLikeStatus(Number(params.id_laporan), currentUser);
  })

  // GET /api/likes/:id_laporan — daftar semua yang like (admin only)
  .get("/:id_laporan", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    requireAdmin(currentUser.role, set);
    return getLikesByLaporan(Number(params.id_laporan), set);
  });