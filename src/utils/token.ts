import { getPasswordResetTokenByEmail } from "../data/resetPassword";
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
