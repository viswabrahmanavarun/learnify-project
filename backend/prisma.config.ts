// prisma.config.ts
// Prisma v7 config – environment variables are loaded via dotenv

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  /**
   * Path to Prisma schema
   */
  schema: "prisma/schema.prisma",

  /**
   * Migrations directory
   */
  migrations: {
    path: "prisma/migrations",
  },

  /**
   * Datasource configuration (REQUIRED)
   * Prisma reads DATABASE_URL from .env
   */
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
