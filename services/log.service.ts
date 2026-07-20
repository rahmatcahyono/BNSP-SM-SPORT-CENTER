import { prisma } from "@/lib/prisma";

export class LogService {
  static async logActivity(userId: string, action: string, description: string) {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action,
          description,
        },
      });
    } catch (error) {
      console.error("Gagal mencatat log aktivitas:", error);
    }
  }
}
