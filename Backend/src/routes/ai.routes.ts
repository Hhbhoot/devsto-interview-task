import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middlewares/auth.middleware';
import { generateEmbedding, searchSimilarChunks, generateAnswer, generateDataAnswer } from '../lib/ai';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(verifyToken);

router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const queryEmbedding = await generateEmbedding(question);
    const similarChunks = await searchSimilarChunks(queryEmbedding, 3);

    if (similarChunks.length === 0) {
      res.json({ answer: "I couldn't find any relevant company policies to answer that." });
      return;
    }

    const answer = await generateAnswer(question, similarChunks);
    res.json({ answer });
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

router.post('/ask-data', async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    let data;

    if (userRole === 'ADMIN') {
      data = await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          role: true,
          attendances: {
            select: {
              checkIn: true,
              checkOut: true,
              workingHours: true,
              overtimeHours: true,
              createdAt: true,
            }
          }
        }
      });
    } else if (userRole === 'MANAGER') {
      data = await prisma.user.findMany({
        where: { managerId: userId },
        select: {
          name: true,
          email: true,
          role: true,
          attendances: {
            select: {
              checkIn: true,
              checkOut: true,
              workingHours: true,
              overtimeHours: true,
              createdAt: true,
            }
          }
        }
      });
    }

    const answer = await generateDataAnswer(question, data);
    res.json({ answer });
  } catch (error) {
    console.error('Ask data error:', error);
    res.status(500).json({ error: 'Failed to process data question' });
  }
});

export default router;
