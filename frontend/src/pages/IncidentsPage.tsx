import { useEffect, useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import api from '../lib/api';
import type { Incident } from '../types';
import { useAuth } from '../contexts/AuthContext';

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e', MODERATE: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444',
};
const TYPE_ICONS: Record<string, string> = {
  FLOOD: '🌊', CYCLONE: '🌀', DROUGHT: '☀️', HEATWAVE: '🔥', LANDSLIDE: '⛰️',
};

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);

  const canCreate = user && ['state_commander', 'district_officer', 'field_responder'].includes(user.role);

  useEffect(() => {
    api.get('/incidents').then(r => {
      setIncidents(r.data.incidents);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = incidents.filter(i =>
    (!filter || i.status === filter) &&
    (!typeFilter || i.type === typeFilter)
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Incidents</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            {filtered.length} incidents · <span style={{ color: '#fbbf24' }}>[SYNTHETIC DATA]</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#94a3b8', fontSize: '0.8rem' }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="MONITORING">Monitoring</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#94a3b8', fontSize: '0.8rem' }}
          >
            <option value="">All Types</option>
            {['FLOOD','CYCLONE','DROUGHT','HEATWAVE','LANDSLIDE'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <Plus size={16} /> Report Incident
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Loading incidents...</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filtered.map(inc => (
            <IncidentCard key={inc.id} incident={inc} onStatusChange={async (id, status) => {
              try {
                await api.patch(`/incidents/${id}/status`, { status });
                setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: status as Incident['status'] } : i));
              } catch { alert('Failed to update status'); }
            }} canEdit={!!(user && ['state_commander','district_officer'].includes(user.role))} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
              <AlertTriangle size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No incidents match the current filters.</p>
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateIncidentModal onClose={() => setShowCreate(false)} onCreated={(inc) => { setIncidents(prev => [inc, ...prev]); setShowCreate(false); }} />}
    </div>
  );
}

function IncidentCard({ incident, onStatusChange, canEdit }: {
  incident: Incident;
  onStatusChange: (id: string, status: string) => void;
  canEdit: boolean;
}) {
  const sevColor = RISK_COLORS[incident.severity];
  return (
    <div style={{
      background: 'rgba(15,23,42,0.8)',
      border: `1px solid ${incident.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
      borderLeft: `4px solid ${sevColor}`,
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
    }}>
      <div style={{ fontSize: '1.75rem', lineHeight: 1, flexShrink: 0 }}>{TYPE_ICONS[incident.type]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>{incident.title}</h3>
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, background: `${sevColor}15`, color: sevColor }}>{incident.severity}</span>
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>{incident.status}</span>
        </div>
        <p style={{ margin: '0 0 0.75rem', color: '#94a3b8', fontSize: '0.825rem', lineHeight: 1.5 }}>{incident.description}</p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Stat label="District" value={incident.district?.name || '—'} />
          <Stat label="Type" value={incident.type} />
          <Stat label="Affected" value={incident.affectedPop.toLocaleString('en-IN')} />
          <Stat label="Reported" value={new Date(incident.reportedAt).toLocaleDateString('en-IN')} />
        </div>
      </div>
      {canEdit && incident.status !== 'CLOSED' && (
        <div style={{ flexShrink: 0 }}>
          <select
            value={incident.status}
            onChange={e => onStatusChange(incident.id, e.target.value)}
            style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30,41,59,0.8)', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <option value="ACTIVE">Active</option>
            <option value="MONITORING">Monitoring</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, color: '#cbd5e1', fontWeight: 600, fontSize: '0.8rem' }}>{value}</p>
    </div>
  );
}

function CreateIncidentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (inc: Incident) => void }) {
  const [form, setForm] = useState({ districtId: '', type: 'FLOOD', severity: 'MODERATE', title: '', description: '', affectedPop: 0 });
  const [districts, setDistricts] = useState<{id:string;name:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/districts').then(r => setDistricts(r.data.districts));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/incidents', { ...form, affectedPop: Number(form.affectedPop) });
      onCreated(res.data.incident);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '560px' }}>
        <h2 style={{ margin: '0 0 1.5rem', color: '#f8fafc', fontWeight: 700 }}>Report Incident <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>[SYNTHETIC]</span></h2>
        {error && <p style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>District</label>
            <select value={form.districtId} onChange={e => setForm(f => ({...f, districtId: e.target.value}))} required style={inputStyle}>
              <option value="">Select district...</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} style={inputStyle}>
                {['FLOOD','CYCLONE','DROUGHT','HEATWAVE','LANDSLIDE'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Severity</label>
              <select value={form.severity} onChange={e => setForm(f => ({...f, severity: e.target.value}))} style={inputStyle}>
                {['LOW','MODERATE','HIGH','CRITICAL'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required minLength={5} style={inputStyle} placeholder="Brief incident title..." />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required minLength={10} rows={3} style={{...inputStyle, resize: 'vertical'}} placeholder="Detailed description..." />
          </div>
          <div>
            <label style={labelStyle}>Affected Population (estimate)</label>
            <input type="number" value={form.affectedPop} onChange={e => setForm(f => ({...f, affectedPop: Number(e.target.value)}))} min={0} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
  color: '#f8fafc', fontSize: '0.875rem', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem',
};
