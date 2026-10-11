import { Router, Response } from 'express';
import { prisma } from '../db/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export const resourcesRouter = Router();

resourcesRouter.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { districtId, type, status } = req.query;
    const where: Record<string, unknown> = {};
    if (districtId) where.districtId = districtId;
    if (type) where.type = type;
    if (status) where.status = status;

    const resources = await prisma.resource.findMany({
      where,
      include: { district: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ resources, isSynthetic: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});
