import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  static async getAllCustomers() {
    return prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
    });
  }
}
