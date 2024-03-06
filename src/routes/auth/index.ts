import { Elysia } from "elysia";
import {
  CreateUser,
  LoginUser,
  LogoutUser,
  NewPassword,
  ResetPassword,
  Verify2FACode,
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
  TVerify2FACodeValidationSchema,
  Verify2FACodeValidationSchema,
} from "./validator";

const authRoute = (app: Elysia) =>
  app
    //create user
    .post("/register", ({ body }) => CreateUser(body), {
      body: CreateUserValidationSchema as TCreateUserValidationSchema,
    })
    //login user
    .post(
      "/login",
      // @ts-ignore
      ({ body, jwt, setCookie }) => LoginUser(body, jwt, setCookie),
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
    //reset password with token
    .post("/new-password", ({ body }) => NewPassword(body), {
      body: NewPasswordValidationSchema as TNewPasswordValidationSchema,
    })
    // 2FA code verify
    .post(
      "/verify-2fa",
      // @ts-ignore
      ({ body, jwt, setCookie }) => Verify2FACode(body, jwt, setCookie),
      {
        body: Verify2FACodeValidationSchema as TVerify2FACodeValidationSchema,
      }
    );

export default authRoute;
