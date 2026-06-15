import { Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { generateAttendanceReport } from '../lib/ai';

const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user!.userId;

    const parsed = createStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.format() });
      return;
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.STAFF,
        managerId,
      },
      select: { id: true, name: true, email: true, role: true, managerId: true },
    });

    res.status(201).json({ message: 'Staff created successfully', staff });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOwnStaff = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user!.userId;

    const staffList = await prisma.user.findMany({
      where: { managerId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.status(200).json({ staff: staffList });
  } catch (error) {
    console.error('Get own staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user!.userId;

    const staffList = await prisma.user.findMany({
      where: { managerId },
      select: { id: true },
    });

    const staffIds = staffList.map((s) => s.id);

    const attendanceRecords = await prisma.attendance.findMany({
      where: { userId: { in: staffIds } },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ attendance: attendanceRecords });
  } catch (error) {
    console.error('Get team attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamStats = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user!.userId;

    const staffList = await prisma.user.findMany({
      where: { managerId },
      select: { id: true },
    });

    const staffIds = staffList.map((s) => s.id);
    const totalTeamMembers = staffIds.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAttendance = await prisma.attendance.findMany({
      where: {
        userId: { in: staffIds },
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const checkedInToday = todaysAttendance.length;
    const currentlyOnline = todaysAttendance.filter((a) => !a.checkOut).length;

    res.status(200).json({
      stats: {
        totalTeamMembers,
        checkedInToday,
        currentlyOnline,
      },
    });
  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user!.userId;

    const staffList = await prisma.user.findMany({
      where: { managerId },
      select: { id: true },
    });

    const staffIds = staffList.map((s) => s.id);

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { userId: { in: staffIds } },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ leaveRequests });
  } catch (error) {
    console.error('Get team leaves error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateLeaveStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user!.userId;
    const leaveId = req.params.id as string;

    const parsed = updateLeaveStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.format() });
      return;
    }

    const { status } = parsed.data;

    // Verify the leave exists and belongs to a staff member managed by this manager
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { user: true },
    });

    if (!leaveRequest) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }

    if (leaveRequest.user.managerId !== managerId) {
      res.status(403).json({ error: 'You do not have permission to update this leave request' });
      return;
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status },
    });

    res
      .status(200)
      .json({ message: 'Leave status updated successfully', leaveRequest: updatedLeave });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAIReport = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user!.userId;

    const staffList = await prisma.user.findMany({
      where: { managerId },
      select: { id: true },
    });

    const staffIds = staffList.map((s) => s.id);

    const attendanceRecords = await prisma.attendance.findMany({
      where: { userId: { in: staffIds } },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit
    });

    const report = await generateAttendanceReport(attendanceRecords);
    res.json({ report });
  } catch (error) {
    console.error('Manager AI Report error:', error);
    res.status(500).json({ error: 'Failed to generate AI report' });
  }
};
