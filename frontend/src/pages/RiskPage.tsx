import { useState } from 'react';
import { Zap, Info, TrendingUp } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../lib/api';

interface RiskResult {
  riskScore: number;
  riskLevel: string;
  components: { rainfallComponent: number; riverLevelComponent: number; soilComponent: number; historicalComponent: number };
  assumptions: { rainfallWeight: number; riverLevelWeight: number; soilWeight: number; historicalWeight: number; modelVersion: string; modelDescription: string };
  uncertainty: number;
  recommendation: string;
  isSynthetic: boolean;
}

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e', MODERATE: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444',
};

export default function RiskPage() {
  const [districts, setDistricts] = useState<{id:string;name:string}[]>([]);
  const [form, setForm] = useState({ districtId: '', rainfallMm: 120, riverLevel: 4.5, soilSaturation: 0.7, historicalScore: 65 });
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [districtsLoaded, setDistrictsLoaded] = useState(false);

  if (!districtsLoaded) {
    api.get('/districts').then(r => { setDistricts(r.data.districts); setDistrictsLoaded(true); });
  }

  const handleCalc = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/risk/flood/calculate', { ...form, rainfallMm: Number(form.rainfallMm), riverLevel: Number(form.riverLevel), soilSaturation: Number(form.soilSaturation), historicalScore: Number(form.historicalScore) });
      setResult(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Calculation failed');
    } finally { setLoading(false); }
  };

  const radarData = result ? [
    { factor: 'Rainfall', value: result.components.rainfallComponent, max: 40 },
    { factor: 'River Level', value: result.components.riverLevelComponent, max: 35 },
    { factor: 'Soil', value: result.components.soilComponent, max: 15 },
    { factor: 'Historical', value: result.components.historicalComponent, max: 10 },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Flood Risk Analysis</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Deterministic scoring with transparent assumptions · <span style={{ color: '#fbbf24' }}>[SYNTHETIC / EDUCATIONAL MODEL]</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input form */}
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="#f97316" /> Input Parameters
          </h2>
          <form onSubmit={handleCalc} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>District</label>
              <select value={form.districtId} onChange={e => setForm(f => ({...f, districtId: e.target.value}))} required style={inputStyle}>
                <option value="">Select district...</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <SliderInput label={`24h Rainfall: ${form.rainfallMm} mm`} id="rainfall" min={0} max={500} value={form.rainfallMm} onChange={v => setForm(f => ({...f, rainfallMm: v}))} description="0–500mm (extreme threshold: 300mm, weight: 40%)" />
            <SliderInput label={`River Level: ${form.riverLevel} m`} id="river" min={0} max={15} step={0.1} value={form.riverLevel} onChange={v => setForm(f => ({...f, riverLevel: v}))} description="0–15m (danger threshold: 10m, weight: 35%)" />
            <SliderInput label={`Soil Saturation: ${Math.round(Number(form.soilSaturation) * 100)}%`} id="soil" min={0} max={1} step={0.01} value={form.soilSaturation} onChange={v => setForm(f => ({...f, soilSaturation: v}))} description="0=dry, 1=fully saturated (weight: 15%)" />
            <SliderInput label={`Historical Score: ${form.historicalScore}`} id="hist" min={0} max={100} value={form.historicalScore} onChange={v => setForm(f => ({...f, historicalScore: v}))} description="District historical flood vulnerability 0–100 (weight: 10%)" />

            {error && <p style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ padding: '0.8rem', borderRadius: '10px', background: loading ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg,#f97316,#ea580c)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Zap size={16} /> {loading ? 'Calculating...' : 'Calculate Risk Score'}
            </button>
          </form>

          {/* Model disclosure */}
          <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Info size={14} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ margin: '0 0 0.25rem', color: '#0ea5e9', fontWeight: 600, fontSize: '0.75rem' }}>Model Transparency</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.72rem', lineHeight: 1.5 }}>
                  Weighted-sum formula: Rainfall×0.40 + River×0.35 + Soil×0.15 + Historical×0.10. 
                  Uncertainty ±15%. Educational model — not operationally validated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div>
          {result ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* Score card */}
              <div style={{
                background: `${RISK_COLORS[result.riskLevel]}10`,
                border: `2px solid ${RISK_COLORS[result.riskLevel]}40`,
                borderRadius: '16px', padding: '1.5rem', textAlign: 'center',
              }}>
                <p style={{ margin: '0 0 0.5rem', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700 }}>⚠ SYNTHETIC SCORE</p>
                <div style={{ fontSize: '5rem', fontWeight: 900, color: RISK_COLORS[result.riskLevel], lineHeight: 1, marginBottom: '0.25rem' }}>
                  {result.riskScore}
                </div>
                <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>out of 100 · ±{result.uncertainty}% uncertainty</p>
                <span style={{ padding: '0.4rem 1.25rem', borderRadius: '20px', background: `${RISK_COLORS[result.riskLevel]}20`, color: RISK_COLORS[result.riskLevel], fontWeight: 800, fontSize: '1rem' }}>
                  {result.riskLevel} RISK
                </span>
                <p style={{ margin: '1rem 0 0', color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.6 }}>{result.recommendation}</p>
              </div>

              {/* Component breakdown */}
              <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>Component Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Radar name="Score" dataKey="value" stroke={RISK_COLORS[result.riskLevel]} fill={RISK_COLORS[result.riskLevel]} fillOpacity={0.3} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[
                    { k: 'Rainfall', v: result.components.rainfallComponent, w: '40%' },
                    { k: 'River Level', v: result.components.riverLevelComponent, w: '35%' },
                    { k: 'Soil', v: result.components.soilComponent, w: '15%' },
                    { k: 'Historical', v: result.components.historicalComponent, w: '10%' },
                  ].map(c => (
                    <div key={c.k} style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.65rem' }}>{c.k} (weight {c.w})</p>
                      <p style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>{c.v} pts</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#475569' }}>
              <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Adjust parameters on the left and click "Calculate Risk Score" to see the deterministic flood risk assessment.</p>
              <p style={{ fontSize: '0.8rem' }}>Model v1.0.0 — educational/demonstration use only</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SliderInput({ label, id, min, max, step = 1, value, onChange, description }: {
  label: string; id: string; min: number; max: number; step?: number; value: number | string;
  onChange: (v: number) => void; description?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer' }}
      />
      {description && <p style={{ margin: '0.25rem 0 0', color: '#475569', fontSize: '0.7rem' }}>{description}</p>}
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
