import { Elysia } from "elysia";
import {
  CreateUser,
  LoginUser,
  LogoutUser,
  NewPassword,
  ResetPassword,
} from "./handlers";
import {
  CreateUserValidationSchema,
  LoginValidationSchema,
  ResetPasswordValidationSchema,
  TCreateUserValidationSchema,
  TLoginValidationSchema,
  TResetPasswordValidationSchema,
  NewPasswordValidationSchema,
  TNewPasswordValidationSchema,
} from "./validator";

const authRoute = (app: Elysia) =>
  app
    //create user
    .post("/register", ({ body, set }) => CreateUser(body, set), {
      body: CreateUserValidationSchema as TCreateUserValidationSchema,
    })
    //login user
    .post(
      "/login",
      // @ts-ignore
      ({ body, set, jwt, setCookie }) => LoginUser(body, set, jwt, setCookie),
      {
        body: LoginValidationSchema as TLoginValidationSchema,
      }
    )
    // @ts-ignore
    .get("/logout", ({ setCookie }) => LogoutUser(setCookie))
    //reset password email
    .post("/reset-password", ({ body }) => ResetPassword(body), {
      body: ResetPasswordValidationSchema as TResetPasswordValidationSchema,
    })
    //reset password confirm and change
    .post("/new-password", ({ body }) => NewPassword(body), {
      body: NewPasswordValidationSchema as TNewPasswordValidationSchema,
    });

export default authRoute;
