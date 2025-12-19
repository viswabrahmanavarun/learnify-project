// src/lib/prisma.ts

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * PostgreSQL connection pool
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Prisma PostgreSQL adapter (Prisma v7 requirement)
 */
const adapter = new PrismaPg(pool);

/**
 * Prisma Client instance
 */
export const prisma = new PrismaClient({
  adapter,
});
