import { useEffect, useState } from 'react';
import { MapPin, TrendingUp, Users, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import type { District } from '../types';

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e', MODERATE: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444',
};

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/districts').then(r => setDistricts(r.data.districts))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Districts</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          {districts.length} districts tracked · <span style={{ color: '#fbbf24' }}>[SYNTHETIC RISK SCORES]</span>
        </p>
      </div>

      {loading ? <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Loading districts...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {districts.map(d => <DistrictCard key={d.id} district={d} />)}
        </div>
      )}
    </div>
  );
}

function DistrictCard({ district: d }: { district: District }) {
  const color = RISK_COLORS[d.riskLevel];
  return (
    <div style={{
      background: 'rgba(15,23,42,0.8)',
      border: `1px solid ${d.riskLevel === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '14px', padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem' }}>{d.name}</h3>
          <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>{d.nametamil}</p>
        </div>
        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, background: `${color}15`, color }}>
          {d.riskLevel}
        </span>
      </div>

      {/* Risk bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Risk Score (SYNTHETIC)</span>
          <span style={{ color, fontWeight: 800, fontSize: '0.85rem' }}>{d.riskScore}/100</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${d.riskScore}%`, height: '100%', background: color, borderRadius: '3px', boxShadow: `0 0 8px ${color}50` }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Stat icon={<Users size={12} />} label="Population" value={(d.population / 1000000).toFixed(1) + 'M'} />
        <Stat icon={<MapPin size={12} />} label="Area" value={d.area.toLocaleString() + ' km²'} />
        {d._count && (
          <>
            <Stat icon={<AlertCircle size={12} />} label="Incidents" value={String(d._count.incidents)} />
            <Stat icon={<TrendingUp size={12} />} label="Shelters" value={String(d._count.shelters)} />
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', marginBottom: '0.2rem' }}>
        {icon}
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <p style={{ margin: 0, color: '#cbd5e1', fontWeight: 700, fontSize: '0.875rem' }}>{value}</p>
    </div>
  );
}
