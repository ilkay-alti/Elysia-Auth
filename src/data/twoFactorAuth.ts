import { prisma } from "../db";
import { logger } from "../utils/logger";

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const TwoFactorToken = await prisma.twoFactorToken.findUnique({
      where: {
        token,
      },
    });
    return TwoFactorToken;
  } catch (e) {
    logger.error(`Error in getTwoFactorTokenByToken: ${e}`);
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const TwoFactorToken = await prisma.twoFactorToken.findFirst({
      where: {
        email,
      },
    });
    return TwoFactorToken;
  } catch (e) {
    logger.error(`Error in getTwoFactorTokenByEmail: ${e}`);
  }
};
