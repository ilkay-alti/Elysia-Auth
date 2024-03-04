import { Elysia } from "elysia";
import { logger } from "./utils/logger";
import swagger from "@elysiajs/swagger";
import jwt from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";

import authRoute from "./routes/auth";
import postRoute from "./routes/post";
import { isAuthenticated } from "./middleware/isAuthenticated";
const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Elysia",
          description: "Elysia API Documentation",
          version: "1.0.0",
        },
      },
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET! || "secret",
    })
  )
  .use(cookie())
  .group("/auth", (app) => app.use(authRoute))
  .group("/post", (app) => app.use(postRoute))
  .get("/", () => "Hello Elysia")
  .listen(8080);

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
