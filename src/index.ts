import { Elysia } from "elysia";
import authRoute from "./routes/auth";
import postRoute from "./routes/post";

const app = new Elysia()
  .group("/auth", (app) => app.use(authRoute))
  .group("/post", (app) => app.use(postRoute))
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
