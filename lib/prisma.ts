import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("CRITICAL ERROR: process.env.DATABASE_URL is undefined or empty!");
}

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaNeon({ connectionString: connectionString || "" });

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
