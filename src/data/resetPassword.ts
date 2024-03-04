import { prisma } from "../db";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });
    return passwordResetToken;
  } catch (e) {
    console.log(`Error in getPasswordResetTokenByToken: ${e}`);
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
      },
    });
    return passwordResetToken;
  } catch (e) {
    console.log(`Error in getPasswordResetTokenByEmail: ${e}`);
  }
};
