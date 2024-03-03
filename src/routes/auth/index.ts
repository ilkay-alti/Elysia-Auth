import { Elysia } from "elysia";

const authRoute = (app: Elysia) => app.get("/", () => "Hello Auth Route");

export default authRoute;
