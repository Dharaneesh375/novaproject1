import { useEffect, useState } from 'react';
import { Building2, Users, Zap, Droplets, Heart } from 'lucide-react';
import api from '../lib/api';
import type { Shelter } from '../types';

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [summary, setSummary] = useState({ totalCapacity: 0, totalOccupancy: 0, utilization: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shelters').then(r => {
      setShelters(r.data.shelters);
      setSummary(r.data.summary);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Shelters & Relief</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Shelter capacity and occupancy data · <span style={{ color: '#fbbf24' }}>[SYNTHETIC]</span>
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <SummaryCard title="Total Capacity" value={summary.totalCapacity.toLocaleString()} color="#0ea5e9" icon={<Building2 size={20} />} />
        <SummaryCard title="Current Occupancy" value={summary.totalOccupancy.toLocaleString()} color="#f97316" icon={<Users size={20} />} />
        <SummaryCard
          title="Utilization Rate"
          value={`${summary.utilization}%`}
          color={summary.utilization > 85 ? '#ef4444' : summary.utilization > 65 ? '#f97316' : '#22c55e'}
          icon={<Zap size={20} />}
          subtitle={summary.utilization > 85 ? '⚠ Approaching capacity' : 'Within safe limits'}
        />
      </div>

      {loading ? <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Loading shelters...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
          {shelters.map(s => <ShelterCard key={s.id} shelter={s} />)}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, color, icon, subtitle }: {
  title: string; value: string; color: string; icon: React.ReactNode; subtitle?: string;
}) {
  return (
    <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '10px', padding: '8px', display: 'flex' }}>{icon}</div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      </div>
      <p style={{ margin: 0, color: '#f8fafc', fontSize: '2rem', fontWeight: 800 }}>{value}</p>
      {subtitle && <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.75rem' }}>{subtitle}</p>}
    </div>
  );
}

function ShelterCard({ shelter }: { shelter: Shelter }) {
  const utilization = Math.round((shelter.occupancy / shelter.capacity) * 100);
  const statusColors = { OPERATIONAL: '#22c55e', FULL: '#ef4444', CLOSED: '#475569', STANDBY: '#eab308' };
  const statusColor = statusColors[shelter.status as keyof typeof statusColors] || '#64748b';
  const barColor = utilization > 90 ? '#ef4444' : utilization > 70 ? '#f97316' : '#22c55e';

  return (
    <div style={{
      background: 'rgba(15,23,42,0.8)',
      border: `1px solid ${shelter.status === 'FULL' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '16px',
      padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{shelter.name}</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>{shelter.nameTamil} · {shelter.district?.name}</p>
        </div>
        <span style={{
          padding: '0.25rem 0.7rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700,
          background: `${statusColor}15`, color: statusColor,
        }}>{shelter.status}</span>
      </div>

      {/* Capacity bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Occupancy</span>
          <span style={{ color: '#f8fafc', fontSize: '0.75rem', fontWeight: 700 }}>
            {shelter.occupancy.toLocaleString()} / {shelter.capacity.toLocaleString()} ({utilization}%)
          </span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(utilization, 100)}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Amenities */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Amenity label="Water" available={shelter.waterSupply} icon={<Droplets size={12} />} />
        <Amenity label="Power" available={shelter.powerSupply} icon={<Zap size={12} />} />
        <Amenity label="Medical" available={shelter.medicalUnit} icon={<Heart size={12} />} />
        <span style={{
          padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600,
          background: 'rgba(255,255,255,0.05)', color: '#64748b',
        }}>{shelter.type}</span>
      </div>
    </div>
  );
}

function Amenity({ label, available, icon }: { label: string; available: boolean; icon: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.6rem',
      borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600,
      background: available ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
      color: available ? '#22c55e' : '#f87171',
    }}>
      {icon} {label}
    </div>
  );
}
