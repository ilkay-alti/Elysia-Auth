import { getPasswordResetTokenByToken } from "../../data/resetPassword";
import { getUserByEmail } from "../../data/user";
import { prisma } from "../../db";
import { passwordHash, passwordVerify } from "../../utils/crypto";
import { logger } from "../../utils/logger";
import { sendResetPasswordEmail } from "../../utils/mail";
import { generatePasswordResetToken } from "../../utils/token";

//Create user
export async function CreateUser(body: any, set: any) {
  try {
    const { email, password } = body;

    //check if user exists
    const userExists = await getUserByEmail(email);
    if (userExists) {
      set.status = 400;
      return {
        success: false,
        data: null,
        message: "Email address already in use.",
      };
    }
    const hashedPassword = await passwordHash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    if (!user) {
      set.status = 400;
      return {
        success: false,
        data: null,
        message: "Error creating user.",
      };
    }
    set.status = 201;
    return {
      success: true,
      data: user,
      message: "User created successfully.",
    };
  } catch (e) {
    logger.error(`Error in CreateUser: ${e}`);
  }
}

//Login user

export async function LoginUser(body: any, set: any, jwt: any, setCookie: any) {
  try {
    const { email, password } = body;

    const user = await getUserByEmail(email);
    if (!user) {
      set.status = 400;
      return {
        success: false,
        data: null,
        message: "Not user go to register.",
      };
    }
    const isMatch = await passwordVerify(password, user.password);
    if (!isMatch) {
      set.status = 400;
      return {
        success: false,
        data: null,
        message: "Invalid credentials.",
      };
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

    set.status = 200;
    return {
      success: true,
      message: "User logged in successfully.",
    };
  } catch (e) {
    logger.error(`Error in LoginUser: ${e}`);
  }
}
//logout user
export async function LogoutUser(setCookie: any) {
  setCookie("access_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return {
    success: true,
    message: "User logged out successfully.",
  };
}

//reset password
export async function ResetPassword(body: any) {
  const { email } = body;
  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return {
      success: false,
      message: "User not found.",
    };
  }
  const passwordResetToken = await generatePasswordResetToken(email);
  if (!passwordResetToken) {
    return {
      success: false,
      message: "Error generating password reset token.",
    };
  }

  sendResetPasswordEmail(passwordResetToken.email, passwordResetToken.token);
  return {
    success: true,
    message: "Password reset email sent.",
  };
}

export async function NewPassword(body: any) {
  const { token, password } = body;
  if (!token || !password) {
    return {
      success: false,
      message: "Token and password required.",
    };
  }
  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return {
      success: false,
      message: "Invalid token.",
    };
  }

  const hasExpired = existingToken.expires < new Date();
  if (hasExpired) {
    return {
      success: false,
      message: "Token has expired.",
    };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return {
      success: false,
      message: "User not found.",
    };
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

  return {
    success: true,
    message: "Password reset successfully.",
  };
}
