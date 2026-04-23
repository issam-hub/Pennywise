import jwt from "jsonwebtoken";

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in env file");
  }

  const payload = { userId };

  const token = jwt.sign(payload, secret, { expiresIn: "7d" });
  return token;
};
