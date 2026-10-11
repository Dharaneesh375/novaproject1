import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Phone, MapPin, Shield, MessageSquare } from 'lucide-react';

export default function CitizenPage() {
  const { user } = useAuth();
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Citizen Portal</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Welcome, {user?.name} · District: {user?.district || 'All'}
        </p>
      </div>

      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <AlertTriangle size={18} color="#f87171" />
        <div>
          <p style={{ margin: '0 0 0.25rem', color: '#f87171', fontWeight: 700, fontSize: '0.875rem' }}>⚠ DEMONSTRATION ONLY</p>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>This is a simulated citizen portal. Emergency numbers and shelter locations shown are for demonstration only. In a real emergency, call 112 (National Emergency) or 1077 (TNSDMA Helpline).</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        <InfoCard icon={<Phone size={24} />} title="Emergency Numbers" color="#ef4444">
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {[
              { name: 'National Emergency', number: '112' },
              { name: 'TNSDMA Helpline', number: '1077' },
              { name: 'Ambulance', number: '108' },
              { name: 'Fire', number: '101' },
            ].map(e => (
              <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{e.name}</span>
                <strong style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{e.number}</strong>
              </div>
            ))}
          </div>
          <p style={{ margin: '0.75rem 0 0', color: '#475569', fontSize: '0.7rem' }}>Real numbers — call in genuine emergency</p>
        </InfoCard>

        <InfoCard icon={<MapPin size={24} />} title="Nearby Shelters (SYNTHETIC)" color="#0ea5e9">
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {[
              { name: 'Rajaji Hall', capacity: '2000', status: 'OPEN', dist: '2.1 km' },
              { name: 'Nehru Stadium', capacity: '1500', status: 'OPEN', dist: '3.4 km' },
            ].map(s => (
              <div key={s.name} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{s.name}</strong>
                  <span style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 700 }}>{s.status}</span>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>Capacity: {s.capacity} · {s.dist}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: '0.75rem 0 0', color: '#fbbf24', fontSize: '0.7rem' }}>⚠ SYNTHETIC locations — not real shelter addresses</p>
        </InfoCard>

        <InfoCard icon={<Shield size={24} />} title="Safety Guidelines" color="#22c55e">
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.8 }}>
            <li>Move to higher ground if floods are approaching</li>
            <li>Keep emergency kit ready (water, documents, medicine)</li>
            <li>Do not walk through floodwater</li>
            <li>Follow official evacuation orders</li>
            <li>Stay tuned to All India Radio / Doordarshan</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<MessageSquare size={24} />} title="Report an Incident" color="#8b5cf6">
          <p style={{ margin: '0 0 0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Report emergency situations to authorities</p>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <InfoRow label="TNSDMA" value="1077" />
            <InfoRow label="Police Control" value="100" />
            <InfoRow label="Online Portal" value="tnsdma.gov.in" />
          </div>
          <p style={{ margin: '0.75rem 0 0', color: '#475569', fontSize: '0.7rem' }}>Real contact information for Tamil Nadu SDMA</p>
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ color, background: `${color}15`, padding: '8px', borderRadius: '10px', display: 'flex' }}>{icon}</div>
        <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</span>
      <strong style={{ color: '#f8fafc', fontSize: '0.8rem' }}>{value}</strong>
    </div>
  );
}
