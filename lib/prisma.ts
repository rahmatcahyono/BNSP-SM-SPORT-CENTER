import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

let connectionString = process.env.DATABASE_URL || "";
if (connectionString.includes("sslmode=require") && !connectionString.includes("uselibpqcompat")) {
  connectionString += "&uselibpqcompat=true";
}

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // Re-create Prisma Client on every reload during development
  // to ensure new database schema columns are loaded immediately.
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  globalThis.prisma = new PrismaClient({ adapter });
  prisma = globalThis.prisma;
}

export { prisma };
