import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Seeding database...');

  // Clean existing data
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.file.deleteMany();
  await prisma.note.deleteMany();
  await prisma.meetingAttendance.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.peerEvaluation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aiPrompt.deleteMany();
  await prisma.aiSummary.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@university.edu',
      passwordHash,
      department: 'Computer Science',
      semester: 6,
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@university.edu',
      passwordHash,
      department: 'Computer Science',
      semester: 6,
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL'],
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie Davis',
      email: 'charlie@university.edu',
      passwordHash,
      department: 'Software Engineering',
      semester: 4,
      skills: ['Java', 'Spring Boot', 'Docker', 'AWS'],
    },
  });

  const diana = await prisma.user.create({
    data: {
      name: 'Diana Wilson',
      email: 'diana@university.edu',
      passwordHash,
      department: 'Computer Science',
      semester: 5,
      skills: ['UI/UX Design', 'Figma', 'CSS', 'React'],
    },
  });

  console.info(`  ✓ Created ${4} users`);

  // Create groups
  const projectGroup = await prisma.group.create({
    data: {
      name: 'CS401 Final Project',
      description: 'Full-stack web application for the Software Engineering course final project',
      type: 'PROJECT',
      createdById: alice.id,
    },
  });

  const assignmentGroup = await prisma.group.create({
    data: {
      name: 'ML Assignment 3',
      description: 'Machine Learning homework on neural networks and deep learning',
      type: 'ASSIGNMENT',
      createdById: bob.id,
    },
  });

  const studyGroup = await prisma.group.create({
    data: {
      name: 'Algorithms Study Group',
      description: 'Preparing for the algorithms midterm exam',
      type: 'STUDY',
      createdById: charlie.id,
    },
  });

  console.info(`  ✓ Created ${3} groups`);

  // Add members to groups
  await prisma.groupMember.createMany({
    data: [
      { groupId: projectGroup.id, userId: alice.id, role: 'LEADER' },
      { groupId: projectGroup.id, userId: bob.id, role: 'MEMBER' },
      { groupId: projectGroup.id, userId: charlie.id, role: 'MEMBER' },
      { groupId: projectGroup.id, userId: diana.id, role: 'MEMBER' },
      { groupId: assignmentGroup.id, userId: bob.id, role: 'LEADER' },
      { groupId: assignmentGroup.id, userId: alice.id, role: 'MEMBER' },
      { groupId: assignmentGroup.id, userId: diana.id, role: 'MEMBER' },
      { groupId: studyGroup.id, userId: charlie.id, role: 'LEADER' },
      { groupId: studyGroup.id, userId: alice.id, role: 'MEMBER' },
      { groupId: studyGroup.id, userId: bob.id, role: 'MEMBER' },
    ],
  });

  console.info(`  ✓ Created group memberships`);

  // Create tasks for the project group
  const now = new Date();
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        groupId: projectGroup.id,
        title: 'Set up project repository',
        description: 'Initialize monorepo with pnpm workspaces, add CI/CD pipeline',
        priority: 'HIGH',
        status: 'COMPLETED',
        assignedToId: alice.id,
        createdById: alice.id,
        dueDate: now,
      },
      {
        groupId: projectGroup.id,
        title: 'Design database schema',
        description: 'Create ERD and Prisma schema for all entities',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedToId: bob.id,
        createdById: alice.id,
        dueDate: inTwoDays,
      },
      {
        groupId: projectGroup.id,
        title: 'Create UI mockups',
        description: 'Design mockups for dashboard, chat, and task board views in Figma',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assignedToId: diana.id,
        createdById: alice.id,
        dueDate: inFiveDays,
      },
      {
        groupId: projectGroup.id,
        title: 'Implement authentication API',
        description: 'JWT-based auth with register, login, refresh, and Google OAuth',
        priority: 'HIGH',
        status: 'TODO',
        assignedToId: charlie.id,
        createdById: alice.id,
        dueDate: inOneWeek,
      },
      {
        groupId: projectGroup.id,
        title: 'Build real-time chat',
        description: 'Socket.IO-based group chat with reactions, replies, and file sharing',
        priority: 'MEDIUM',
        status: 'TODO',
        assignedToId: alice.id,
        createdById: alice.id,
        dueDate: inTwoWeeks,
      },
      {
        groupId: projectGroup.id,
        title: 'Write project documentation',
        description: 'API documentation, setup guide, and architecture overview',
        priority: 'LOW',
        status: 'TODO',
        createdById: alice.id,
        dueDate: inTwoWeeks,
      },
    ],
  });

  console.info(`  ✓ Created tasks`);

  // Create messages in the project group
  await prisma.message.createMany({
    data: [
      {
        groupId: projectGroup.id,
        senderId: alice.id,
        content: 'Hey team! I just set up the project repository. Everyone should have access now.',
        type: 'TEXT',
        sentAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        groupId: projectGroup.id,
        senderId: bob.id,
        content: 'Great! I\'ll start working on the database schema today.',
        type: 'TEXT',
        sentAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
      },
      {
        groupId: projectGroup.id,
        senderId: diana.id,
        content: 'I\'ve started the Figma mockups. Should I focus on the dashboard first or the chat view?',
        type: 'TEXT',
        sentAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        groupId: projectGroup.id,
        senderId: alice.id,
        content: '@Diana start with the dashboard — it\'ll help us align on the overall navigation structure.',
        type: 'TEXT',
        sentAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
      },
      {
        groupId: projectGroup.id,
        senderId: charlie.id,
        content: 'I\'ll review the auth patterns from our reference projects. Should we go with httpOnly cookies or localStorage for tokens?',
        type: 'TEXT',
        sentAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  console.info(`  ✓ Created messages`);

  // Create a meeting
  await prisma.meeting.create({
    data: {
      groupId: projectGroup.id,
      title: 'Sprint Planning - Week 2',
      scheduledAt: inTwoDays,
      duration: 60,
      notes: 'Review database schema, finalize UI mockups, assign sprint tasks',
      attendances: {
        createMany: {
          data: [
            { userId: alice.id, present: false },
            { userId: bob.id, present: false },
            { userId: charlie.id, present: false },
            { userId: diana.id, present: false },
          ],
        },
      },
    },
  });

  console.info(`  ✓ Created meetings`);

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: bob.id,
        type: 'TASK_ASSIGNED',
        entityType: 'task',
        entityId: projectGroup.id,
        message: 'You have been assigned to "Design database schema"',
      },
      {
        userId: charlie.id,
        type: 'TASK_ASSIGNED',
        entityType: 'task',
        entityId: projectGroup.id,
        message: 'You have been assigned to "Implement authentication API"',
      },
      {
        userId: diana.id,
        type: 'TASK_DUE_SOON',
        entityType: 'task',
        entityId: projectGroup.id,
        message: '"Create UI mockups" is due in 5 days',
      },
    ],
  });

  console.info(`  ✓ Created notifications`);

  console.info('✅ Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
