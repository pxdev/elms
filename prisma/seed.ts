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
    update: {},
    create: {
      email: 'teacher1@elms.local',
      name: 'Ahmed Hassan',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      emailVerified: true,
      emailVerifiedAt: new Date()
    }
  })
  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@elms.local' },
    update: {},
    create: {
      email: 'teacher2@elms.local',
      name: 'Sara Ali',
      passwordHash: teacherPassword,
      role: 'TEACHER',
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
      imageUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80',
      teacherId: teacher1.id,
      variants: [
        { name: 'Basic Plan', sessionsPerMonth: 4, price: 49.99 },
        { name: 'Standard Plan', sessionsPerMonth: 8, price: 89.99 },
        { name: 'Intensive Plan', sessionsPerMonth: 12, price: 129.99 }
      ]
    },
    {
      name: 'Quranic Arabic',
      description: 'Deep dive into Quranic vocabulary, grammar, and tafsir fundamentals.',
      imageUrl: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&q=80',
      teacherId: teacher1.id,
      variants: [
        { name: 'Self-Paced', sessionsPerMonth: 4, price: 59.99 },
        { name: 'Guided Study', sessionsPerMonth: 8, price: 99.99 }
      ]
    },
    {
      name: 'Advanced Conversation',
      description: 'Master fluency through immersive conversation practice with native speakers.',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      teacherId: teacher2.id,
      variants: [
        { name: 'Weekly Sessions', sessionsPerMonth: 4, price: 69.99 },
        { name: 'Bi-Weekly Sessions', sessionsPerMonth: 8, price: 119.99 },
        { name: 'Daily Immersion', sessionsPerMonth: 20, price: 249.99 }
      ]
    }
  ]

  for (const courseData of coursesData) {
    const { variants, ...courseFields } = courseData

    const existing = await prisma.course.findFirst({ where: { name: courseFields.name } })
    const course = existing || await prisma.course.create({
      data: {
        ...courseFields,
        isActive: true
      }
    })

    for (const variantData of variants) {
      const existingVariant = await prisma.courseVariant.findFirst({
        where: { courseId: course.id, name: variantData.name }
      })
      if (!existingVariant) {
        await prisma.courseVariant.create({
          data: {
            ...variantData,
            courseId: course.id,
            isActive: true
          }
        })
      }
    }
    console.log(`Course: ${course.name} (${variants.length} variants)`)
  }

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
