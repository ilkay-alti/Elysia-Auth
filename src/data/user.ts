import { prisma } from "../db";
import { logger } from "../utils/logger";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (e) {
    logger.error(`Error in getUserByEmail: ${e}`);
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (e) {
    logger.error(`Error in getUserById: ${e}`);
  }
};
