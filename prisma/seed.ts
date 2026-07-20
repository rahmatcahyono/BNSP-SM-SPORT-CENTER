export {}
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smsport.com' },
    update: {},
    create: {
      email: 'admin@smsport.com',
      name: 'Super Admin',
      phoneNumber: '081234567890',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log(`Created admin user with id: ${admin.id}`)

  // 2. Create Courts
  const courts = [
    { name: 'Lapangan Futsal 1', type: 'FUTSAL', pricePerHour: 150000, openTime: 8, closeTime: 22 },
    { name: 'Lapangan Futsal 2', type: 'FUTSAL', pricePerHour: 150000, openTime: 8, closeTime: 22 },
    { name: 'Lapangan Badminton 1', type: 'BADMINTON', pricePerHour: 50000, openTime: 8, closeTime: 22 },
    { name: 'Lapangan Badminton 2', type: 'BADMINTON', pricePerHour: 50000, openTime: 8, closeTime: 22 },
    { name: 'Lapangan Badminton 3', type: 'BADMINTON', pricePerHour: 50000, openTime: 8, closeTime: 22 },
  ]

  for (const c of courts) {
    const court = await prisma.court.create({
      data: c
    })
    console.log(`Created court: ${court.name}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
