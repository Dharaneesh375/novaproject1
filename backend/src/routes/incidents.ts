import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const incidentsRouter = Router();

incidentsRouter.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const severity = typeof req.query.severity === 'string' ? req.query.severity : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const districtId = typeof req.query.districtId === 'string' ? req.query.districtId : undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (districtId) where.districtId = districtId;

    const incidents = await prisma.incident.findMany({
      where,
      include: { district: { select: { name: true, nametamil: true } } },
      orderBy: { reportedAt: 'desc' },
    });
    res.json({ incidents, isSynthetic: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

incidentsRouter.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: String(req.params.id) },
      include: {
        district: true,
        auditLogs: { orderBy: { timestamp: 'desc' }, take: 20 },
      },
    });
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }
    res.json({ incident, isSynthetic: true });
  } catch {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

const createIncidentSchema = z.object({
  districtId: z.string(),
  type: z.enum(['FLOOD', 'CYCLONE', 'DROUGHT', 'HEATWAVE', 'LANDSLIDE']),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  affectedPop: z.number().int().min(0).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

incidentsRouter.post(
  '/',
  authenticate,
  requireRole('state_commander', 'district_officer', 'field_responder'),
  async (req: AuthenticatedRequest, res: Response) => {
    const parsed = createIncidentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }

    try {
      const incident = await prisma.incident.create({
        data: { ...parsed.data, status: 'ACTIVE' },
        include: { district: { select: { name: true } } },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          incidentId: incident.id,
          action: 'CREATE',
          entity: 'Incident',
          entityId: incident.id,
          after: JSON.stringify(incident),
        },
      });

      res.status(201).json({ incident, isSynthetic: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create incident' });
    }
  }
);

incidentsRouter.patch(
  '/:id/status',
  authenticate,
  requireRole('state_commander', 'district_officer'),
  async (req: AuthenticatedRequest, res: Response) => {
    const schema = z.object({ status: z.enum(['ACTIVE', 'MONITORING', 'RESOLVED', 'CLOSED']) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    try {
      const before = await prisma.incident.findUnique({ where: { id: String(req.params.id) } });
      if (!before) {
        res.status(404).json({ error: 'Incident not found' });
        return;
      }

      const incident = await prisma.incident.update({
        where: { id: String(req.params.id) },
        data: {
          status: parsed.data.status,
          resolvedAt: parsed.data.status === 'RESOLVED' ? new Date() : undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          incidentId: incident.id,
          action: 'UPDATE_STATUS',
          entity: 'Incident',
          entityId: incident.id,
          before: JSON.stringify({ status: before.status }),
          after: JSON.stringify({ status: incident.status }),
        },
      });

      res.json({ incident });
    } catch {
      res.status(500).json({ error: 'Failed to update incident' });
    }
  }
);
