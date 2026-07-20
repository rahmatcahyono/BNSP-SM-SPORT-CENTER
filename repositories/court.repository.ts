import { prisma } from "@/lib/prisma";
// Force hot-reload after Prisma generation
import { Prisma } from "@prisma/client";

export class CourtRepository {
  static async findAllActive() {
    return prisma.court.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { name: "asc" },
    });
  }

  static async findAll() {
    return prisma.court.findMany({
      orderBy: { name: "asc" },
    });
  }

  static async findById(id: string) {
    return prisma.court.findUnique({
      where: { id },
    });
  }

  static async create(data: Prisma.CourtCreateInput) {
    return prisma.court.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.CourtUpdateInput) {
    return prisma.court.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.court.delete({
      where: { id },
    });
  }
}
