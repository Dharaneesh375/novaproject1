export type UserRole =
  | 'state_commander'
  | 'district_officer'
  | 'field_responder'
  | 'relief_coordinator'
  | 'data_analyst'
  | 'citizen';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  district?: string | null;
}

export interface District {
  id: string;
  name: string;
  nametamil: string;
  population: number;
  area: number;
  latitude: number;
  longitude: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  lastUpdated: string;
  _count?: { incidents: number; shelters: number; resources: number };
}

export interface Incident {
  id: string;
  districtId: string;
  type: 'FLOOD' | 'CYCLONE' | 'DROUGHT' | 'HEATWAVE' | 'LANDSLIDE';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED' | 'CLOSED';
  title: string;
  description: string;
  affectedPop: number;
  latitude?: number | null;
  longitude?: number | null;
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  district?: { name: string; nametamil: string };
}

export interface Shelter {
  id: string;
  districtId: string;
  name: string;
  nameTamil: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupancy: number;
  status: 'OPERATIONAL' | 'FULL' | 'CLOSED' | 'STANDBY';
  type: 'PRIMARY' | 'SECONDARY' | 'TEMPORARY';
  waterSupply: boolean;
  powerSupply: boolean;
  medicalUnit: boolean;
  updatedAt: string;
  district?: { name: string; nametamil: string };
}

export interface Resource {
  id: string;
  districtId: string;
  type: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'AVAILABLE' | 'DEPLOYED' | 'DEPLETED' | 'MAINTENANCE';
  location: string;
  updatedAt: string;
  district?: { name: string };
}

export interface DashboardSummary {
  summary: {
    totalDistricts: number;
    criticalDistricts: number;
    highRiskDistricts: number;
    activeIncidents: number;
    affectedPopulation: number;
    shelterCapacity: number;
    shelterOccupancy: number;
    shelterUtilization: number;
    totalResources: number;
    deployedResources: number;
  };
  districts: District[];
  activeIncidents: Incident[];
  shelters: Shelter[];
  riskDistribution: { level: string; count: number; color: string }[];
  incidentsByType: { type: string; count: number }[];
  isSynthetic: boolean;
  dataNote: string;
}
