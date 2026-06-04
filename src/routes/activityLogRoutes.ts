// src/routes/balasKomentarRoutes.ts
import { Elysia, t } from "elysia";
import { jwtPlugin, verifyToken } from "../middleware/authMiddleware";
import { getBalasKomentar, createBalasKomentar, deleteBalasKomentar } from "../controllers/balasKomentarController";
import { getLogs } from "@/controllers/activityLogController";

export const logRoutes = new Elysia({ prefix: "/activity-logs" })
  .use(jwtPlugin)

  .get("/", async ({ jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getLogs(currentUser, set)
  });
