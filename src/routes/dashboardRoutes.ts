// src/routes/balasKomentarRoutes.ts
import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { verifyToken } from "../middleware/authMiddleware";
import { getDashboardData } from "@/controllers/dashboardController";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET ?? "supersecret", exp: "1d" }))

    .get("/stats", async ({ jwt, headers, set }) => {
        const currentUser = await verifyToken(jwt, headers.authorization, set);
        return getDashboardData(currentUser);
    });