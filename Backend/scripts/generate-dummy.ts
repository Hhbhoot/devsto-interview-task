import { Role } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function generateData() {
  console.log('Generating dummy data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create 5 Managers
  const managers = [];
  for (let i = 1; i <= 5; i++) {
    const managerEmail = `manager${i}@devsto.com`;
    let manager = await prisma.user.findUnique({ where: { email: managerEmail } });

    if (!manager) {
      manager = await prisma.user.create({
        data: {
          name: `Manager ${i}`,
          email: managerEmail,
          password: hashedPassword,
          role: Role.MANAGER,
        },
      });
      console.log(`Created Manager: ${manager.name}`);
    }
    managers.push(manager);
  }

  // 2. Create 50 Staff Members
  const staffList = [];
  for (let i = 1; i <= 50; i++) {
    const staffEmail = `staff${i}@devsto.com`;
    let staff = await prisma.user.findUnique({ where: { email: staffEmail } });

    // Assign to a random manager
    const randomManager = managers[Math.floor(Math.random() * managers.length)];

    if (!staff) {
      staff = await prisma.user.create({
        data: {
          name: `Staff Member ${i}`,
          email: staffEmail,
          password: hashedPassword,
          role: Role.STAFF,
          managerId: randomManager.id,
        },
      });
      console.log(`Created Staff: ${staff.name} assigned to ${randomManager.name}`);
    }
    staffList.push(staff);
  }

  // 3. Generate 1 Month Attendance for all users (managers + staff)
  const allUsers = [...managers, ...staffList];
  const today = new Date();

  // Go back 30 days
  for (let i = 30; i >= 1; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    // Skip weekends (0 = Sunday, 6 = Saturday)
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    console.log(`Generating attendance for date: ${date.toDateString()}`);

    const attendanceRecords = [];

    for (const user of allUsers) {
      // 90% chance they showed up to work
      if (Math.random() < 0.1) continue;

      // Check-in between 8:30 AM and 10:00 AM
      const checkInHour = 8 + Math.floor(Math.random() * 2);
      const checkInMinute = Math.floor(Math.random() * 60);

      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

      // Check-out between 5:00 PM (17) and 7:00 PM (19)
      const checkOutHour = 17 + Math.floor(Math.random() * 3);
      const checkOutMinute = Math.floor(Math.random() * 60);

      const checkOutTime = new Date(date);
      checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

      const workingHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      const overtimeHours = workingHours > 8 ? workingHours - 8 : 0;

      attendanceRecords.push({
        userId: user.id,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workingHours: parseFloat(workingHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
        createdAt: checkInTime,
      });
    }

    // Insert all records for this day
    await prisma.attendance.createMany({
      data: attendanceRecords,
    });
  }

  console.log('Dummy data generation complete!');
}

generateData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
