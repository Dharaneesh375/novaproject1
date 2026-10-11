import { useAuth } from '../contexts/AuthContext';
import { Radio, MapPin, AlertTriangle, Phone, Compass } from 'lucide-react';

export default function FieldPage() {
  const { user } = useAuth();
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Field Operations</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Logged in as: <strong style={{ color: '#0ea5e9' }}>{user?.name}</strong> · District: {user?.district || 'All'} · <span style={{ color: '#fbbf24' }}>[SYNTHETIC]</span>
        </p>
      </div>

      <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <AlertTriangle size={18} color="#fbbf24" />
        <div>
          <p style={{ margin: '0 0 0.25rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.875rem' }}>DEMO MODE — Field Operations Workspace</p>
          <p style={{ margin: 0, color: '#d97706', fontSize: '0.8rem' }}>All field data shown is entirely synthetic. Route suggestions are not validated safe evacuation routes. Do not use for real emergency operations.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {[
          { icon: <Radio size={24} />, title: 'Active Assignment', desc: 'Adyar River flood monitoring — Zone C4', color: '#ef4444', badge: 'ACTIVE' },
          { icon: <MapPin size={24} />, title: 'Current Location', desc: '13.0100°N, 80.2650°E (GPS demo)', color: '#0ea5e9', badge: 'GPS DEMO' },
          { icon: <Phone size={24} />, title: 'Emergency Contacts', desc: 'District Control: 044-XXXX-XXXX (synthetic)', color: '#22c55e', badge: 'SYNTHETIC' },
          { icon: <Compass size={24} />, title: 'Route to Shelter', desc: 'Rajaji Hall — 3.2km via Anna Salai (SYNTHETIC route, not validated)', color: '#f97316', badge: 'ROUTE DEMO' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ color: item.color, background: `${item.color}15`, padding: '10px', borderRadius: '10px', display: 'flex' }}>{item.icon}</div>
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 700, background: `${item.color}15`, color: item.color }}>{item.badge}</span>
            </div>
            <h3 style={{ margin: '0 0 0.4rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{item.title}</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
