import jwt from "jsonwebtoken";

export function createJWT(data: { [key: string]: any }) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
  }
  return jwt.sign({ ...data }, process.env.JWT_SECRET!, {
    expiresIn: "28d",
  });
}

export function verifyJWT(token: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
  }
  return jwt.verify(token, process.env.JWT_SECRET!);
}
