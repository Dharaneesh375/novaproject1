import { useEffect, useState } from 'react';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import type { Resource } from '../types';

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  FOOD_PACKET: { label: 'Food Packets', icon: '🍱' },
  WATER_BOTTLE: { label: 'Water', icon: '💧' },
  MEDICINE_KIT: { label: 'Medicine', icon: '💊' },
  RESCUE_BOAT: { label: 'Rescue Boats', icon: '🚤' },
  GENERATOR: { label: 'Generators', icon: '⚡' },
  TENT: { label: 'Tents', icon: '⛺' },
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#22c55e',
  DEPLOYED: '#0ea5e9',
  DEPLETED: '#ef4444',
  MAINTENANCE: '#eab308',
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/resources').then(r => setResources(r.data.resources))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const byType = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Emergency Resources</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Resource inventory and deployment status · <span style={{ color: '#fbbf24' }}>[SYNTHETIC]</span>
        </p>
      </div>

      {loading ? <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Loading resources...</p> : (
        Object.entries(byType).map(([type, items]) => {
          const info = TYPE_LABELS[type] || { label: type, icon: '📦' };
          return (
            <div key={type} style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: '0 0 0.75rem', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {info.icon} {info.label}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
                {items.map(r => <ResourceCard key={r.id} resource={r} />)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const statusColor = STATUS_COLORS[resource.status] || '#64748b';
  return (
    <div style={{
      background: 'rgba(15,23,42,0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '1.1rem 1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, color: '#e2e8f0', fontWeight: 700, fontSize: '0.875rem' }}>{resource.name}</h3>
        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, background: `${statusColor}15`, color: statusColor }}>
          {resource.status}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {resource.status === 'AVAILABLE' ? <CheckCircle size={16} color="#22c55e" /> : <AlertCircle size={16} color={statusColor} />}
        <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.2rem' }}>{resource.quantity.toLocaleString('en-IN')}</span>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{resource.unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem' }}>
        <MapPin size={12} />
        <span>{resource.location}</span>
      </div>
      {resource.district && (
        <p style={{ margin: '0.4rem 0 0', color: '#475569', fontSize: '0.7rem' }}>
          District: {resource.district.name}
        </p>
      )}
    </div>
  );
}
