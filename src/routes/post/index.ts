import { Elysia } from "elysia";
import { isAuthenticated } from "../../middleware/isAuthenticated";

const postRoute = (app: Elysia) =>
  app
    .use(isAuthenticated)
    // protected route
    .get("/me", ({ user }) => {
      return {
        data: {
          user,
        },
      };
    });

export default postRoute;
