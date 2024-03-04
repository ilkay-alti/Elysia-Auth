export const passwordHash = async (password: string) => {
  const hash = await Bun.password.hash(password);
  return hash.toString();
};

export const passwordVerify = (password: string, passwordHash: string) => {
  const isMatch = Bun.password.verify(password, passwordHash);
  return isMatch;
};
