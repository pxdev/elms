import { PrismaClient } from './generated/client/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const scrypt = new Scrypt({})
const hash = new Hash(scrypt)

async function hashPassword(password: string) {
  return await hash.make(password)
}

async function main() {
  console.log('Seeding database...')

  // Create admin
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elms.local' },
    update: {},
    create: {
      email: 'admin@elms.local',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date()
    }
  })
  console.log(`Admin: ${admin.email}`)

  // Create teachers
  const teacherPassword = await hashPassword('teacher123')
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher1@elms.local' },
    update: { timeZone: 'Asia/Riyadh', isAvailableForBooking: true },
    create: {
      email: 'teacher1@elms.local',
      name: 'Ahmed Hassan',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      timeZone: 'Asia/Riyadh',
      emailVerified: true,
      emailVerifiedAt: new Date()
    }
  })
  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@elms.local' },
    update: { timeZone: 'Asia/Riyadh', isAvailableForBooking: true },
    create: {
      email: 'teacher2@elms.local',
      name: 'Sara Ali',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      timeZone: 'Asia/Riyadh',
      emailVerified: true,
      emailVerifiedAt: new Date()
    }
  })
  console.log(`Teachers: ${teacher1.email}, ${teacher2.email}`)

  // Create students
  const studentPassword = await hashPassword('student123')
  const students = []
  for (let i = 1; i <= 3; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@elms.local` },
      update: {},
      create: {
        email: `student${i}@elms.local`,
        name: `Student ${i}`,
        passwordHash: studentPassword,
        role: 'STUDENT',
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    })
    students.push(student)
  }
  console.log(`Students: ${students.map(s => s.email).join(', ')}`)

  // Create courses
  const coursesData = [
    {
      name: 'Introduction to Arabic',
      description: 'Learn the basics of Arabic language including alphabet, pronunciation, and simple conversations.',
      outcomes: 'Read and write the Arabic alphabet\nIntroduce yourself and handle everyday greetings\nBuild simple present-tense sentences',
      prerequisites: 'No prior Arabic experience required.',
      targetAudience: 'Complete beginners who want live, guided practice.',
      refundPolicy: 'Request a refund through Support before your first session, or reschedule any session at least 24 hours in advance.',
      imageUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80',
      teacherId: teacher1.id,
      price: 49.99,
      totalSessions: 4,
      lsVariantId: 'demo-arabic-variant'
    },
    {
      name: 'Quranic Arabic',
      description: 'Deep dive into Quranic vocabulary, grammar, and tafsir fundamentals.',
      outcomes: 'Recognize high-frequency Quranic vocabulary\nAnalyze foundational sentence structures\nUse grammar tools while reading selected passages',
      prerequisites: 'Comfort reading the Arabic alphabet.',
      targetAudience: 'Learners seeking a structured introduction to Quranic Arabic.',
      refundPolicy: 'Request a refund through Support before your first session, or reschedule any session at least 24 hours in advance.',
      imageUrl: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&q=80',
      teacherId: teacher1.id,
      price: 59.99,
      totalSessions: 8,
      lsVariantId: 'demo-quranic-variant'
    },
    {
      name: 'Advanced Conversation',
      description: 'Master fluency through immersive conversation practice with native speakers.',
      outcomes: 'Speak more confidently in extended conversations\nUse natural expressions and transitions\nReceive personalized pronunciation feedback',
      prerequisites: 'Intermediate spoken Arabic or equivalent experience.',
      targetAudience: 'Intermediate learners ready for conversation-first coaching.',
      refundPolicy: 'Request a refund through Support before your first session, or reschedule any session at least 24 hours in advance.',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      teacherId: teacher2.id,
      price: 69.99,
      totalSessions: 4,
      lsVariantId: 'demo-conversation-variant'
    }
  ]

  for (const courseData of coursesData) {
    const existing = await prisma.course.findFirst({ where: { name: courseData.name } })
    const course = existing
      ? await prisma.course.update({ where: { id: existing.id }, data: { ...courseData, isActive: true } })
      : await prisma.course.create({ data: { ...courseData, isActive: true } })
    console.log(`Course: ${course.name}`)

    if (course.name === 'Introduction to Arabic') {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: students[0]!.id, courseId: course.id } },
        update: { status: 'ACTIVE', paymentStatus: 'PAID', amountCents: 4999, currency: 'USD' },
        create: {
          userId: students[0]!.id,
          courseId: course.id,
          status: 'ACTIVE',
          paymentStatus: 'PAID',
          amountCents: 4999,
          currency: 'USD',
          paidAt: new Date()
        }
      })
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const date = tomorrow.toISOString().slice(0, 10)
  await prisma.teacherAvailability.deleteMany({ where: { teacherId: teacher1.id, date } })
  await prisma.teacherAvailability.create({
    data: { teacherId: teacher1.id, date, startTime: 9 * 60, endTime: 15 * 60 }
  })

  console.log('Seeding complete.')
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
