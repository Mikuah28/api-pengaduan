import { Elysia, t } from "elysia";
import { search, searchLaporan } from "../controllers/searchController";
import { jwtPlugin, verifyToken } from "@/middleware/authMiddleware";

export const searchRoutes = new Elysia({ prefix: "/search" })
  .use(jwtPlugin)
  // GET /api/search?q=jalan — search global (laporan + kategori + user)
  .get("/", async ({ query, set }) => {
    const q = (query as any).q || "";
    return search(q, set);
  })

  // GET /api/search/laporan?q=jalan&status=diproses&kategori_id=1&lokasi=menteng&page=1&limit=10
  .get(
    "/laporan",
    async ({ query, jwt, headers, set }) => {
      const q = query as any;
      const currentUser = await verifyToken(jwt, headers.authorization, set);
      return searchLaporan({
        query: q.query,
        status: q.status,
        kategori_id: q.kategori_id ? Number(q.kategori_id) : undefined,
        lokasi: q.lokasi,
        page: q.page ? Number(q.page) : 1,
        limit: q.limit ? Number(q.limit) : 10,
      }, currentUser);
    },
    {
      query: t.Object({
        query: t.Optional(t.String()),
        status: t.Optional(t.String()),
        kategori_id: t.Optional(t.String()),
        lokasi: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  );