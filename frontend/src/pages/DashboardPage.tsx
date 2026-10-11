import { useEffect, useState } from 'react';
import {
  AlertTriangle, Users, Building2, Package, TrendingUp, Activity,
  ArrowUp, ArrowDown, Minus, MapPin, Clock, RefreshCw, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../lib/api';
import type { DashboardSummary, District, Incident } from '../types';

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MODERATE: '#eab308',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const INCIDENT_TYPE_COLORS: Record<string, string> = {
  FLOOD: '#0ea5e9',
  CYCLONE: '#8b5cf6',
  DROUGHT: '#f97316',
  HEATWAVE: '#ef4444',
  LANDSLIDE: '#d97706',
};

// Synthetic time-series for trend chart
const TREND_DATA = [
  { time: '06:00', incidents: 2, sheltered: 2100, riskScore: 58 },
  { time: '08:00', incidents: 3, sheltered: 2800, riskScore: 62 },
  { time: '10:00', incidents: 3, sheltered: 3200, riskScore: 65 },
  { time: '12:00', incidents: 4, sheltered: 3900, riskScore: 70 },
  { time: '14:00', incidents: 5, sheltered: 4200, riskScore: 74 },
  { time: '16:00', incidents: 5, sheltered: 4452, riskScore: 78 },
  { time: 'Now', incidents: 5, sheltered: 4452, riskScore: 82 },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setData(res.data);
      setLastRefresh(new Date());
      setError('');
    } catch {
      setError('Failed to load dashboard. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorScreen message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const { summary, districts, activeIncidents } = data;

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            State Command Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Tamil Nadu Disaster Management — Situation Report
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SyntheticBadge />
          <button
            onClick={fetchDashboard}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
              fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <span style={{ color: '#475569', fontSize: '0.75rem' }}>
            <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {lastRefresh.toLocaleTimeString('en-IN')} IST
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard
          title="Active Incidents"
          value={summary.activeIncidents}
          icon={<AlertTriangle size={20} />}
          color="#ef4444"
          trend="up"
          subtitle="2 CRITICAL"
        />
        <KpiCard
          title="Affected Population"
          value={summary.affectedPopulation.toLocaleString('en-IN')}
          icon={<Users size={20} />}
          color="#f97316"
          trend="up"
          subtitle="Across 4 districts"
        />
        <KpiCard
          title="Shelter Utilization"
          value={`${summary.shelterUtilization}%`}
          icon={<Building2 size={20} />}
          color={summary.shelterUtilization > 80 ? '#ef4444' : '#22c55e'}
          trend={summary.shelterUtilization > 80 ? 'up' : 'stable'}
          subtitle={`${summary.shelterOccupancy.toLocaleString()} / ${summary.shelterCapacity.toLocaleString()}`}
        />
        <KpiCard
          title="Critical Districts"
          value={summary.criticalDistricts}
          icon={<MapPin size={20} />}
          color="#ef4444"
          trend="stable"
          subtitle={`${summary.highRiskDistricts} HIGH risk`}
        />
        <KpiCard
          title="Resources Deployed"
          value={summary.deployedResources}
          icon={<Package size={20} />}
          color="#0ea5e9"
          trend="up"
          subtitle={`of ${summary.totalResources} total`}
        />
        <KpiCard
          title="State Risk Index"
          value="78 / 100"
          icon={<Zap size={20} />}
          color="#f97316"
          trend="up"
          subtitle="SYNTHETIC estimate"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Area chart */}
        <ChartCard title="Situation Trend (Today)" subtitle="SYNTHETIC — illustrative only">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="sheltered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
              <Area type="monotone" dataKey="sheltered" stroke="#0ea5e9" fill="url(#sheltered)" name="Sheltered" />
              <Area type="monotone" dataKey="riskScore" stroke="#ef4444" fill="url(#riskGrad)" name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk distribution pie */}
        <ChartCard title="Risk Distribution" subtitle="By district">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.riskDistribution.filter(d => d.count > 0)}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="level"
              >
                {data.riskDistribution.map((entry) => (
                  <Cell key={entry.level} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {data.riskDistribution.map(d => (
              <div key={d.level} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#94a3b8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                {d.level} ({d.count})
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Incidents by type */}
        <ChartCard title="Incidents by Type" subtitle="Active only">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.incidentsByType.filter(d => d.count > 0)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="type" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.incidentsByType.map(entry => (
                  <Cell key={entry.type} fill={INCIDENT_TYPE_COLORS[entry.type] || '#0ea5e9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Active incidents */}
        <div style={{
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>Active Incidents</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>[SYNTHETIC DATA]</p>
            </div>
            <Activity size={18} color="#ef4444" />
          </div>
          <div style={{ maxHeight: '320px', overflow: 'auto' }}>
            {activeIncidents.map(inc => (
              <IncidentRow key={inc.id} incident={inc} />
            ))}
          </div>
        </div>

        {/* District risk table */}
        <div style={{
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>District Risk Status</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>[SYNTHETIC SCORES]</p>
            </div>
            <TrendingUp size={18} color="#0ea5e9" />
          </div>
          <div style={{ maxHeight: '320px', overflow: 'auto' }}>
            {districts.slice(0, 8).map(d => (
              <DistrictRow key={d.id} district={d} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SyntheticBadge() {
  return (
    <div style={{
      padding: '0.35rem 0.85rem',
      background: 'rgba(251, 191, 36, 0.08)',
      border: '1px solid rgba(251, 191, 36, 0.25)',
      borderRadius: '20px',
      color: '#fbbf24',
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
    }}>
      <AlertTriangle size={12} />
      SYNTHETIC DATA
    </div>
  );
}

function KpiCard({ title, value, icon, color, trend, subtitle }: {
  title: string; value: string | number; icon: React.ReactNode;
  color: string; trend: 'up' | 'down' | 'stable'; subtitle?: string;
}) {
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '1.25rem',
      transition: 'border-color 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
        background: `radial-gradient(circle at 70% 30%, ${color}15, transparent)`,
        borderRadius: '50%',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
        <TrendIcon size={16} color={trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : '#64748b'} />
      </div>
      <p style={{ margin: '0 0 0.25rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <p style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</p>
      {subtitle && <p style={{ margin: '0.25rem 0 0', color: '#475569', fontSize: '0.75rem' }}>{subtitle}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(15,23,42,0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '1.25rem',
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{title}</h3>
        {subtitle && <p style={{ margin: '0.15rem 0 0', color: '#475569', fontSize: '0.7rem' }}>[{subtitle}]</p>}
      </div>
      {children}
    </div>
  );
}

function IncidentRow({ incident }: { incident: Incident }) {
  const sev = incident.severity;
  return (
    <div style={{
      padding: '0.875rem 1.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
    }}>
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
        background: RISK_COLORS[sev], marginTop: '5px',
        boxShadow: sev === 'CRITICAL' ? `0 0 8px ${RISK_COLORS[sev]}` : 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.title}</p>
        <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.72rem' }}>
          {incident.district?.name} · {incident.type} · {incident.affectedPop.toLocaleString()} affected
        </p>
      </div>
      <span style={{
        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
        background: `${RISK_COLORS[sev]}15`, color: RISK_COLORS[sev], flexShrink: 0,
      }}>{sev}</span>
    </div>
  );
}

function DistrictRow({ district }: { district: District }) {
  const color = RISK_COLORS[district.riskLevel];
  return (
    <div style={{
      padding: '0.75rem 1.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600, fontSize: '0.825rem' }}>{district.name}</p>
        <p style={{ margin: 0, color: '#475569', fontSize: '0.7rem' }}>{district.nametamil}</p>
      </div>
      {/* Risk bar */}
      <div style={{ width: '80px' }}>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${district.riskScore}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
        </div>
        <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.65rem', textAlign: 'right' }}>{district.riskScore}/100</p>
      </div>
      <span style={{
        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
        background: `${color}15`, color, minWidth: '70px', textAlign: 'center', flexShrink: 0,
      }}>{district.riskLevel}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid rgba(14,165,233,0.2)', borderTop: '3px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading dashboard...</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <AlertTriangle size={48} color="#ef4444" />
      <p style={{ color: '#ef4444', fontWeight: 600 }}>{message}</p>
      <button onClick={onRetry} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: '#0ea5e9', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
        Retry
      </button>
    </div>
  );
}
