// src/routes/authRoutes.ts
import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { login, register } from "../controllers/authController";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET ?? "supersecret", exp: "1d" }))

  .post("/login", ({ body, jwt, set }) => login(body, jwt, set), {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 1 }),
    }),
  })

  .post("/register", ({ body, set }) => register(body, set), {
    body: t.Object({
      username: t.String({ minLength: 3 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    }),
  });
