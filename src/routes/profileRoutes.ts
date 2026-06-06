// src/routes/authRoutes.ts
import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { verifyToken } from "@/middleware/authMiddleware";
import { updateProfileUser } from "@/controllers/profileController";
import { getProfileUser } from "@/controllers/profileController";

export const profileRoutes = new Elysia({ prefix: "/profile" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET ?? "supersecret", exp: "1d" }))

  .get("/me", async ({ jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getProfileUser(currentUser);
  })

  .get("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getProfileUser({id: Number(params.id)});
  })

  .put("/", async ({ body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return updateProfileUser(body, currentUser, set);
  }, {
    body: t.Object({
      username: t.Optional(t.String()),
      email: t.Optional(t.String()),
      image: t.Optional(t.File()), // Mengambil file foto profil baru
    }),
    type: "multipart/form-data",
  });
