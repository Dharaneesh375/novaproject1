import { Router, Response } from 'express';
import { prisma } from '../db/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export const sheltersRouter = Router();

sheltersRouter.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const districtId = typeof req.query.districtId === 'string' ? req.query.districtId : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;

    const where: Record<string, unknown> = {};
    if (districtId) where.districtId = districtId;
    if (status) where.status = status;

    const shelters = await prisma.shelter.findMany({
      where,
      include: { district: { select: { name: true, nametamil: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const totalCapacity = shelters.reduce((s, sh) => s + sh.capacity, 0);
    const totalOccupancy = shelters.reduce((s, sh) => s + sh.occupancy, 0);

    res.json({
      shelters,
      summary: { totalCapacity, totalOccupancy, utilization: totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0 },
      isSynthetic: true,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch shelters' });
  }
});

sheltersRouter.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const shelter = await prisma.shelter.findUnique({
      where: { id: String(req.params.id) },
      include: { district: true },
    });
    if (!shelter) {
      res.status(404).json({ error: 'Shelter not found' });
      return;
    }
    res.json({ shelter, isSynthetic: true });
  } catch {
    res.status(500).json({ error: 'Failed to fetch shelter' });
  }
});
