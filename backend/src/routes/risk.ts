import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { calculateFloodRisk } from '../services/floodRisk';

export const riskRouter = Router();

const calcSchema = z.object({
  districtId: z.string(),
  rainfallMm: z.number().min(0).max(2000),
  riverLevel: z.number().min(0).max(20),
  soilSaturation: z.number().min(0).max(1),
  historicalScore: z.number().min(0).max(100),
});

riskRouter.post('/flood/calculate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = calcSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const result = calculateFloodRisk(parsed.data);

    // Persist calculation
    await prisma.floodRiskRecord.create({
      data: {
        districtId: parsed.data.districtId,
        rainfallMm: parsed.data.rainfallMm,
        riverLevel: parsed.data.riverLevel,
        soilSaturation: parsed.data.soilSaturation,
        historicalScore: parsed.data.historicalScore,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        assumptions: JSON.stringify(result.assumptions),
        uncertainty: result.uncertainty,
        isSynthetic: true,
      },
    });

    res.json({ ...result, isSynthetic: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Risk calculation failed' });
  }
});

riskRouter.get('/flood/history/:districtId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const records = await prisma.floodRiskRecord.findMany({
      where: { districtId: String(req.params.districtId) },
      orderBy: { calculatedAt: 'desc' },
      take: 30,
    });
    res.json({ records, isSynthetic: true });
  } catch {
    res.status(500).json({ error: 'Failed to fetch risk history' });
  }
});
