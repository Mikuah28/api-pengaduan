// src/routes/notificationRoutes.ts
import { Elysia, t } from "elysia";
import { jwtPlugin, verifyToken } from "../middleware/authMiddleware";
import {
  getNotifications, getUnreadCount,
  createNotification, markAsRead, markAllAsRead, deleteNotification,
} from "../controllers/notificationController";

export const notificationRoutes = new Elysia({ prefix: "/notification" })
  .use(jwtPlugin)

  .get("/", async ({ query, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getNotifications(currentUser, query);
  })

  .get("/unread-count", async ({ jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return getUnreadCount(currentUser);
  })

  .post("/", async ({ body, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return createNotification(body, currentUser, set);
  }, {
    body: t.Object({
      id_user: t.Union([t.String(), t.Number()]),
      id_laporan: t.Optional(t.Union([t.String(), t.Number()])),
      id_komentar: t.Optional(t.Union([t.String(), t.Number()])),
      isi_notifikasi: t.String(),
    }),
  })

  .patch("/:id/read", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return markAsRead(Number(params.id), currentUser, set);
  })

  .patch("/read-all", async ({ jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return markAllAsRead(currentUser);
  })

  .delete("/:id", async ({ params, jwt, headers, set }) => {
    const currentUser = await verifyToken(jwt, headers.authorization, set);
    return deleteNotification(Number(params.id), currentUser, set);
  });
