import { Router, Response } from 'express';
import { prisma } from '../db/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [districts, incidents, shelters, resources] = await Promise.all([
      prisma.district.findMany({ orderBy: { riskScore: 'desc' } }),
      prisma.incident.findMany({
        where: { status: { in: ['ACTIVE', 'MONITORING'] } },
        include: { district: { select: { name: true } } },
        orderBy: { reportedAt: 'desc' },
      }),
      prisma.shelter.findMany({ include: { district: { select: { name: true } } } }),
      prisma.resource.findMany({ include: { district: { select: { name: true } } } }),
    ]);

    const totalShelterCapacity = shelters.reduce((s, sh) => s + sh.capacity, 0);
    const totalOccupancy = shelters.reduce((s, sh) => s + sh.occupancy, 0);
    const criticalDistricts = districts.filter(d => d.riskLevel === 'CRITICAL').length;
    const highRiskDistricts = districts.filter(d => d.riskLevel === 'HIGH').length;
    const activeIncidents = incidents.filter(i => i.status === 'ACTIVE').length;
    const affectedPopulation = incidents.reduce((s, i) => s + i.affectedPop, 0);

    const riskDistribution = [
      { level: 'Critical', count: criticalDistricts, color: '#ef4444' },
      { level: 'High', count: highRiskDistricts, color: '#f97316' },
      { level: 'Moderate', count: districts.filter(d => d.riskLevel === 'MODERATE').length, color: '#eab308' },
      { level: 'Low', count: districts.filter(d => d.riskLevel === 'LOW').length, color: '#22c55e' },
    ];

    const incidentsByType = ['FLOOD', 'CYCLONE', 'DROUGHT', 'HEATWAVE', 'LANDSLIDE'].map(type => ({
      type,
      count: incidents.filter(i => i.type === type).length,
    }));

    res.json({
      summary: {
        totalDistricts: districts.length,
        criticalDistricts,
        highRiskDistricts,
        activeIncidents,
        affectedPopulation,
        shelterCapacity: totalShelterCapacity,
        shelterOccupancy: totalOccupancy,
        shelterUtilization: totalShelterCapacity > 0 ? Math.round((totalOccupancy / totalShelterCapacity) * 100) : 0,
        totalResources: resources.length,
        deployedResources: resources.filter(r => r.status === 'DEPLOYED').length,
      },
      districts,
      activeIncidents: incidents.slice(0, 10),
      shelters,
      riskDistribution,
      incidentsByType,
      isSynthetic: true,
      dataNote: 'DEMO MODE — All figures are synthetic and for emergency management training/demonstration only.',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});
