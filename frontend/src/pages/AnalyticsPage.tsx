import { BarChart2, TrendingUp, Database, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const POPULATION_DATA = [
  { district: 'Chennai', population: 10.97 },
  { district: 'Coimbatore', population: 3.46 },
  { district: 'Madurai', population: 3.04 },
  { district: 'Salem', population: 3.48 },
  { district: 'Tiruvallur', population: 3.73 },
  { district: 'Vellore', population: 3.94 },
];

const TREND_DATA = [
  { month: 'Jan', incidents: 3, sheltered: 800 },
  { month: 'Feb', incidents: 2, sheltered: 400 },
  { month: 'Mar', incidents: 1, sheltered: 100 },
  { month: 'Apr', incidents: 0, sheltered: 0 },
  { month: 'May', incidents: 1, sheltered: 200 },
  { month: 'Jun', incidents: 4, sheltered: 1200 },
  { month: 'Jul', incidents: 6, sheltered: 2800 },
  { month: 'Aug', incidents: 8, sheltered: 4000 },
  { month: 'Sep', incidents: 9, sheltered: 4800 },
  { month: 'Oct', incidents: 5, sheltered: 4452 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Analytics</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          <AlertTriangle size={12} style={{ display: 'inline', color: '#fbbf24', marginRight: '4px' }} />
          All analytics use SYNTHETIC demonstration data only
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <ChartCard title="Population by District" subtitle="Census data (real public data)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={POPULATION_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}M`} />
              <YAxis dataKey="district" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} formatter={(v: any) => [`${v}M`, 'Population']} />
              <Bar dataKey="population" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Incident Trend (2026)" subtitle="SYNTHETIC historical data">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
              <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} name="Incidents" dot={{ fill: '#ef4444' }} />
              <Line type="monotone" dataKey="sheltered" stroke="#0ea5e9" strokeWidth={2} name="Sheltered (×100)" dot={{ fill: '#0ea5e9' }}
                data={TREND_DATA.map(d => ({ ...d, sheltered: d.sheltered / 100 }))} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Data Provenance" subtitle="Source transparency">
          <div style={{ display: 'grid', gap: '0.6rem', padding: '0.5rem 0' }}>
            {[
              { source: 'District boundaries & population', status: 'Real', statusColor: '#22c55e', note: 'Census of India 2011' },
              { source: 'Incident reports', status: 'Synthetic', statusColor: '#fbbf24', note: 'Demo scenarios only' },
              { source: 'Shelter occupancy', status: 'Synthetic', statusColor: '#fbbf24', note: 'Simulated for demonstration' },
              { source: 'Risk scores', status: 'Synthetic', statusColor: '#fbbf24', note: 'Deterministic model with synthetic inputs' },
              { source: 'Resource inventory', status: 'Synthetic', statusColor: '#fbbf24', note: 'Demo quantities only' },
              { source: 'Weather data', status: 'Not available', statusColor: '#ef4444', note: 'No live weather API configured' },
            ].map(r => (
              <div key={r.source} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <Database size={14} color="#475569" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 500 }}>{r.source}</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.7rem' }}>{r.note}</p>
                </div>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, background: `${r.statusColor}15`, color: r.statusColor, flexShrink: 0 }}>{r.status}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="System Statistics" subtitle="Platform metrics">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.5rem 0' }}>
            {[
              { label: 'Districts monitored', value: '12', icon: <TrendingUp size={18} />, color: '#0ea5e9' },
              { label: 'Active incidents', value: '5', icon: <AlertTriangle size={18} />, color: '#ef4444' },
              { label: 'Demo users', value: '7', icon: <Database size={18} />, color: '#22c55e' },
              { label: 'API version', value: 'v1.0.0', icon: <BarChart2 size={18} />, color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{s.icon}</div>
                <p style={{ margin: '0 0 0.25rem', color: '#f8fafc', fontWeight: 800, fontSize: '1.5rem' }}>{s.value}</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.7rem' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{title}</h3>
        {subtitle && <p style={{ margin: '0.15rem 0 0', color: '#475569', fontSize: '0.7rem' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
