import { Elysia } from "elysia";

const postRoute = (app: Elysia) => app.get("/", () => "Hello Post Route");

export default postRoute;
