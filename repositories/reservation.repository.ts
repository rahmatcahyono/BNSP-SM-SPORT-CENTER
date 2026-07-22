import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class ReservationRepository {
  static async findById(id: string) {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phoneNumber: true } },
        court: true,
      },
    });
  }

  static async findByCustomerId(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      include: { court: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findAll() {
    return prisma.reservation.findMany({
      include: {
        user: { select: { name: true, email: true, phoneNumber: true } },
        court: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(data: Prisma.ReservationUncheckedCreateInput) {
    return prisma.reservation.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.ReservationUpdateInput) {
    return prisma.reservation.update({
      where: { id },
      data,
    });
  }

  static async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalBookings, pendingReviews, approvedBookings, revenueAggregate, totalCourts] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "AWAITING_REVIEW" } }),
      prisma.reservation.count({ where: { status: "CONFIRMED" } }),
      prisma.reservation.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { totalPrice: true },
      }),
      prisma.court.count({ where: { status: "AVAILABLE" } }),
    ]);

    return {
      totalBookings,
      pendingReviews,
      approvedBookings,
      totalRevenue: Number(revenueAggregate._sum?.totalPrice || 0),
      activeCourts: totalCourts,
    };
  }

  static async getRecentLogs(limit: number = 10) {
    return prisma.activityLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async getDashboardAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Revenue last 7 days
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
      const agg = await prisma.reservation.aggregate({
        where: {
          date: d,
          status: "CONFIRMED",
        },
        _sum: { totalPrice: true },
      });
      revenueData.push({
        date: d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }),
        revenue: Number(agg._sum?.totalPrice || 0)
      });
    }

    // Peak hours (group by startTime)
    const allBookings = await prisma.reservation.findMany({
      where: { status: "CONFIRMED" },
      select: { startTime: true }
    });

    const hoursMap: Record<number, number> = {};
    allBookings.forEach(b => {
      hoursMap[b.startTime] = (hoursMap[b.startTime] || 0) + 1;
    });

    const peakHoursData = Object.entries(hoursMap).map(([hour, count]) => ({
      time: `${hour}:00`,
      bookings: count
    })).sort((a, b) => parseInt(a.time) - parseInt(b.time));

    return { revenueData, peakHoursData };
  }

  static async getLiveCourtStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Using current date without time for exact DB match
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const courts = await prisma.court.findMany({
      include: {
        reservations: {
          where: {
            date: today,
            status: "CONFIRMED",
            startTime: { lte: currentHour },
          },
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    return courts.map(court => {
      // Find if any reservation is active right now
      const activeReservation = court.reservations.find(r => 
        currentHour >= r.startTime && currentHour < (r.startTime + r.durationHours)
      );

      let status = "AVAILABLE"; // 🟢
      let currentBooking = null;

      if (court.status === "MAINTENANCE") {
        status = "MAINTENANCE"; // 🟡
      } else if (activeReservation) {
        status = "OCCUPIED"; // 🔴
        currentBooking = {
          userName: activeReservation.user.name,
          startTime: activeReservation.startTime,
          endTime: activeReservation.startTime + activeReservation.durationHours
        };
      }

      return {
        id: court.id,
        name: court.name,
        type: court.type,
        status,
        currentBooking
      };
    });
  }

  static async getPendingVerifications(limit: number = 5) {
    const reservations = await prisma.reservation.findMany({
      where: { status: "AWAITING_REVIEW" },
      include: {
        user: { select: { name: true, email: true } },
        court: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return reservations.map(r => ({
      ...r,
      totalPrice: Number(r.totalPrice),
      discountApplied: r.discountApplied ? Number(r.discountApplied) : null,
      originalPrice: r.originalPrice ? Number(r.originalPrice) : null,
    }));
  }
}
