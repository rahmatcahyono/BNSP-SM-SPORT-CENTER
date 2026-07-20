import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const nextauthUrl = process.env.NEXTAUTH_URL;
  const nextauthSecret = process.env.NEXTAUTH_SECRET;

  let dbStatus = "UNKNOWN";
  let userCount = -1;

  try {
    userCount = await prisma.user.count();
    dbStatus = "CONNECTED";
  } catch (e: any) {
    dbStatus = `ERROR: ${e.message}`;
  }

  return NextResponse.json({
    DATABASE_URL_SET: !!dbUrl,
    DATABASE_URL_LENGTH: dbUrl?.length || 0,
    DATABASE_URL_PREVIEW: dbUrl ? dbUrl.substring(0, 20) + "..." : "EMPTY/UNDEFINED",
    NEXTAUTH_URL: nextauthUrl || "NOT SET",
    NEXTAUTH_SECRET_SET: !!nextauthSecret,
    DB_STATUS: dbStatus,
    USER_COUNT: userCount,
    NODE_ENV: process.env.NODE_ENV,
  });
}
