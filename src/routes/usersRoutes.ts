// src/routes/usersRoutes.ts
import { Elysia, t } from "elysia";
import { jwtPlugin, verifyToken } from "../middleware/authMiddleware";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/usersController";

const roleEnum = t.Union([t.Literal("user"), t.Literal("admin"), t.Literal("super_admin")]);

export const usersRoutes = new Elysia({ prefix: "/users" })
  .use(jwtPlugin)

  .get("/", async ({ query, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getUsers(query, currentUser, set);
  })

  .get("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getUserById(Number(params.id), currentUser, set);
  })

  .post("/", async ({ body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return createUser(body, currentUser, set);
  }, {
    body: t.Object({
      username: t.String({ minLength: 3 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
      role: roleEnum,
    }),
  })

  .put("/:id", async ({ params, body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return updateUser(Number(params.id), body, currentUser, set);
  }, {
    body: t.Object({
      username: t.Optional(t.String({ minLength: 3 })),
      email: t.Optional(t.String({ format: "email" })),
      role: t.Optional(roleEnum),
    }),
  })

  .delete("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return deleteUser(Number(params.id), currentUser, set);
  });
