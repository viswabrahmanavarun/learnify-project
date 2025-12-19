import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export type JwtPayload = {
  userId: string;
  role: Role;
};

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
