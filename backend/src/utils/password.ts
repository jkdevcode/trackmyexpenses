import bcrypt from "bcrypt";

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
