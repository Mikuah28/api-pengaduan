import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { getPublicStats } from "@/controllers/publicStatsController";

export const publicRoutes = new Elysia({ prefix: "/public" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET ?? "supersecret", exp: "1d" }))

  .get("/stats", () => getPublicStats())