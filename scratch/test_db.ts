import { prisma } from "../lib/prisma";

async function test() {
  const courts = await prisma.court.findMany();
  console.log("Courts in database:", courts.map(c => ({ id: c.id, name: c.name, imageUrl: (c as any).imageUrl })));
}

test();
