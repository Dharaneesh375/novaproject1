import { Router, Response } from 'express';
import { prisma } from '../db/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export const districtsRouter = Router();

districtsRouter.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const districts = await prisma.district.findMany({
      include: {
        _count: { select: { incidents: true, shelters: true, resources: true } },
      },
      orderBy: { riskScore: 'desc' },
    });
    res.json({ districts, isSynthetic: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

districtsRouter.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const district = await prisma.district.findUnique({
      where: { id: String(req.params.id) },
      include: {
        incidents: { orderBy: { reportedAt: 'desc' }, take: 10 },
        shelters: true,
        resources: true,
      },
    });
    if (!district) {
      res.status(404).json({ error: 'District not found' });
      return;
    }
    res.json({ district, isSynthetic: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch district' });
  }
});
