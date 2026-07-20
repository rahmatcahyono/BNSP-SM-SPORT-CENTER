import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courts = [
    {
      name: 'Lapangan Futsal 1',
      type: 'FUTSAL' as const,
      pricePerHour: 150000,
      openTime: 8,
      closeTime: 22,
    },
    {
      name: 'Lapangan Futsal 2',
      type: 'FUTSAL' as const,
      pricePerHour: 150000,
      openTime: 8,
      closeTime: 22,
    },
    {
      name: 'Lapangan Badminton 1',
      type: 'BADMINTON' as const,
      pricePerHour: 50000,
      openTime: 8,
      closeTime: 22,
    },
    {
      name: 'Lapangan Badminton 2',
      type: 'BADMINTON' as const,
      pricePerHour: 50000,
      openTime: 8,
      closeTime: 22,
    },
    {
      name: 'Lapangan Badminton 3',
      type: 'BADMINTON' as const,
      pricePerHour: 50000,
      openTime: 8,
      closeTime: 22,
    }
  ];

  for (const court of courts) {
    await prisma.court.create({
      data: court,
    });
  }

  console.log("Seeded 5 courts successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
