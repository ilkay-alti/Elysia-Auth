import { t } from "elysia";
export const CreateUserValidationSchema = t.Object({
  email: t.String({
    format: "email",
    minLength: 5,
  }),
  password: t.String({
    minLength: 8,
  }),
});

export type TCreateUserValidationSchema = typeof CreateUserValidationSchema;

export const LoginValidationSchema = t.Object({
  email: t.String({
    format: "email",
    minLength: 5,
  }),
  password: t.String(),
});

export type TLoginValidationSchema = typeof LoginValidationSchema;

export const ResetPasswordValidationSchema = t.Object({
  email: t.String({
    format: "email",
    minLength: 5,
  }),
});

export type TResetPasswordValidationSchema =
  typeof ResetPasswordValidationSchema;

export const NewPasswordValidationSchema = t.Object({
  password: t.String({
    minLength: 8,
  }),
  token: t.String(),
});

export type TNewPasswordValidationSchema = typeof NewPasswordValidationSchema;
