import {
  getPasswordResetTokenByEmail,
  getPasswordResetTokenByToken,
} from "../../data/resetPassword";
import {
  getTwoFactorTokenByEmail,
  getTwoFactorTokenByToken,
} from "../../data/twoFactorAuth";
import { getUserByEmail, getUserById } from "../../data/user";
import { prisma } from "../../db";
import { passwordHash, passwordVerify } from "../../utils/crypto";
import { handleResponse } from "../../utils/handle";
import { logger } from "../../utils/logger";
import { sendResetPasswordEmail, sendTwoFactorEmail } from "../../utils/mail";
import {
  generatePasswordResetToken,
  generateTwoFactorToken,
} from "../../utils/token";
import {
  TSettings2FACodeValidationSchema,
  TVerify2FACodeValidationSchema,
} from "./validator";

//Create user
export async function CreateUser(body: any) {
  try {
    const { email, password } = body;

    //check if user exists
    const userExists = await getUserByEmail(email);
    if (userExists) {
      return handleResponse(false, null, "User already exists.", 400);
    }
    const hashedPassword = await passwordHash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    if (!user) {
      return handleResponse(false, null, "Error creating user.", 500);
    }

    return handleResponse(true, user, "User created successfully.", 201);
  } catch (e) {
    logger.error(`Error in CreateUser: ${e}`);
  }
}

//Login user
export async function LoginUser(body: any, jwt: any, setCookie: any) {
  try {
    const { email, password } = body;

    const user = await getUserByEmail(email);
    if (!user) {
      return handleResponse(false, null, "User not found.", 400);
    }
    const isMatch = await passwordVerify(password, user.password);
    if (!isMatch) {
      return handleResponse(false, null, "Invalid credentials.", 400);
    }
    if (user.twoFactorConfirmation) {
      await Generate2FACodeToken({ email });

      return handleResponse(
        true,
        null,
        "2FA code send email.",
        400,
        "/verify-2fa"
      );
    }

    //generate acccess token
    const accessToken = await jwt.sign({
      userID: user.id,
    });

    setCookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return handleResponse(true, null, "User logged in successfully.", 200);
  } catch (e) {
    logger.error(`Error in LoginUser: ${e}`);
  }
}

//logout user
export async function LogoutUser(setCookie: any) {
  try {
    setCookie("access_token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return handleResponse(true, null, "User logged out successfully.", 200);
  } catch (e) {
    logger.error(`Error in LogoutUser: ${e}`);
  }
}

//reset password token generation
export async function ResetPassword(body: any) {
  try {
    const { email } = body;
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return handleResponse(false, null, "User not found.", 400);
    }
    const passwordResetToken = await generatePasswordResetToken(email);
    if (!passwordResetToken) {
      return handleResponse(
        false,
        null,
        "Error generating password reset token.",
        500
      );
    }

    sendResetPasswordEmail(passwordResetToken.email, passwordResetToken.token);
    return handleResponse(true, null, "Password reset email sent.", 200);
  } catch (e) {
    logger.error(`Error in ResetPassword: ${e}`);
  }
}
// reset password with token
export async function NewPassword(body: any) {
  try {
    const { token, password } = body;
    if (!token || !password) {
      return handleResponse(false, null, "Token and password required.", 400);
    }
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return handleResponse(false, null, "Invalid token.", 400);
    }

    const hasExpired = existingToken.expires < new Date();
    if (hasExpired) {
      return handleResponse(false, null, "Token has expired.", 400);
    }

    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
      return handleResponse(false, null, "User not found.", 400);
    }
    const hashedPassword = await passwordHash(password);

    //Update user password
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    logger.info(`Password reset for user: ${existingUser.email}`);

    // Delete token
    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
    logger.info(`Password reset token deleted: ${existingToken.token}`);

    return handleResponse(true, null, "Password reset successfully.", 200);
  } catch (e) {
    logger.error(`Error in NewPassword: ${e}`);
  }
}

// 2FA code token generation
export async function Generate2FACodeToken(body: any) {
  try {
    const { email } = body;
    const user = await getUserByEmail(email);
    if (!user) {
      return handleResponse(false, null, "User not found.", 400);
    }
    const TwoFactorToken = await generateTwoFactorToken(email);
    if (!TwoFactorToken) {
      return handleResponse(
        false,
        null,
        "Error generating 2FA code token.",
        500
      );
    }

    sendTwoFactorEmail(TwoFactorToken.email, TwoFactorToken.token);
    return handleResponse(true, null, "2FA code token sent.", 200);
  } catch (e) {
    logger.error(`Error in Generate2FACodeToken: ${e}`);
  }
}

// 2FA code verify
export async function Verify2FACode(
  body: TVerify2FACodeValidationSchema,
  jwt: any,
  setCookie: any
) {
  try {
    const { code } = body;

    if (!code) {
      return handleResponse(false, null, "2FA code required.", 400);
    }

    const existingToken = await getTwoFactorTokenByToken(code);

    if (!existingToken) {
      return handleResponse(false, null, "Invalid 2FA code.", 400);
    }

    const hasExpired = existingToken.expires < new Date();

    if (hasExpired) {
      return handleResponse(false, null, "2FA code has expired.", 400);
    }

    const user = await getTwoFactorTokenByEmail(existingToken.email);
    if (!user) {
      return handleResponse(false, null, "User not found.", 400);
    }
    const accessToken = await jwt.sign({
      userID: user.id,
    });

    setCookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    // Delete token
    await prisma.twoFactorToken.delete({
      where: {
        id: existingToken!.id,
      },
    });
    return handleResponse(true, null, "2FA code verified successfully.", 200);
  } catch (e) {
    logger.error(`Error in Verify2FACode: ${e}`);
  }
}

export async function Settings2FACode(body: any) {
  try {
    const { userId } = body;
    const user = await getUserById(userId);
    if (!user) {
      return handleResponse(false, null, "User not found.", 400);
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorConfirmation: !user.twoFactorConfirmation,
      },
    });

    return handleResponse(
      true,
      null,
      "2FA code settings updated successfully.",
      200
    );
  } catch (e) {
    logger.error(`Error in Settings2FACode: ${e}`);
  }
}
