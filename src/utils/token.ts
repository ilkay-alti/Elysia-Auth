import { getPasswordResetTokenByEmail } from "../data/resetPassword";
import { getTwoFactorTokenByEmail } from "../data/twoFactorAuth";
import { prisma } from "../db";

export const generatePasswordResetToken = async (email: string) => {
  try {
    const token = crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour
    const existingUser = await getPasswordResetTokenByEmail(email);

    if (existingUser) {
      if (existingUser.expires > new Date()) {
        const ExpiredPasswordResetToken =
          await prisma.passwordResetToken.findUnique({
            where: {
              id: existingUser.id,
            },
          });
        return ExpiredPasswordResetToken;
      }
      await prisma.passwordResetToken.delete({
        where: {
          id: existingUser.id,
        },
      });
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });
    return passwordResetToken;
  } catch (e) {
    console.log(`Error in generatePasswordResetToken: ${e}`);
  }
};

export const generateTwoFactorToken = async (email: string) => {
  try {
    const token = crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 600 * 1000); // 10 minutes
    const existingUser = await getTwoFactorTokenByEmail(email);

    if (existingUser) {
      if (existingUser.expires > new Date()) {
        const ExpiredTwoFactorToken = await prisma.twoFactorToken.findUnique({
          where: {
            id: existingUser.id,
          },
        });
        return ExpiredTwoFactorToken;
      }
      await prisma.twoFactorToken.delete({
        where: {
          id: existingUser.id,
        },
      });
    }

    const TwoFactorToken = await prisma.twoFactorToken.create({
      data: {
        email,
        token,
        expires,
      },
    });
    return TwoFactorToken;
  } catch (e) {
    console.log(`Error in generatePasswordResetToken: ${e}`);
  }
};
