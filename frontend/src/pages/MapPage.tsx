import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import api from '../lib/api';
import type { Incident, Shelter, District } from '../types';

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e', MODERATE: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444',
};

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLayers, setShowLayers] = useState({ incidents: true, shelters: true, districts: true });
  const [selected, setSelected] = useState<{ type: string; data: Incident | Shelter | District } | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/incidents?status=ACTIVE'),
      api.get('/shelters'),
      api.get('/districts'),
    ]).then(([inc, sh, dist]) => {
      setIncidents(inc.data.incidents);
      setShelters(sh.data.shelters);
      setDistricts(dist.data.districts);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [79.8, 11.5],
      zoom: 6.5,
    });

    mapInstance.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // District labels
      districts.forEach(d => {
        const el = document.createElement('div');
        el.style.cssText = `
          background: ${RISK_COLORS[d.riskLevel]}22;
          border: 2px solid ${RISK_COLORS[d.riskLevel]};
          color: ${RISK_COLORS[d.riskLevel]};
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          font-family: Inter, sans-serif;
          cursor: pointer;
          white-space: nowrap;
          backdrop-filter: blur(4px);
        `;
        el.textContent = d.name;
        el.title = `${d.name} — Risk: ${d.riskLevel} (${d.riskScore}/100) [SYNTHETIC]`;
        el.onclick = () => setSelected({ type: 'district', data: d });

        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([d.longitude, d.latitude])
          .addTo(map);
      });

      // Incident markers
      incidents.forEach(inc => {
        if (!inc.latitude || !inc.longitude) return;
        const el = document.createElement('div');
        el.style.cssText = `
          width: 28px; height: 28px;
          background: ${RISK_COLORS[inc.severity]};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 12px ${RISK_COLORS[inc.severity]}88;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
        `;
        el.textContent = inc.type === 'CYCLONE' ? '🌀' : inc.type === 'FLOOD' ? '🌊' : '⚠️';
        el.title = `${inc.title} [SYNTHETIC]`;
        el.onclick = () => setSelected({ type: 'incident', data: inc });

        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([inc.longitude, inc.latitude])
          .addTo(map);
      });

      // Shelter markers
      shelters.forEach(sh => {
        const el = document.createElement('div');
        const utilization = Math.round((sh.occupancy / sh.capacity) * 100);
        const color = sh.status === 'FULL' ? '#ef4444' : sh.status === 'OPERATIONAL' ? '#22c55e' : '#64748b';
        el.style.cssText = `
          width: 24px; height: 24px;
          background: ${color};
          border: 2px solid white;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
        `;
        el.textContent = '🏠';
        el.title = `${sh.name} — ${utilization}% full [SYNTHETIC]`;
        el.onclick = () => setSelected({ type: 'shelter', data: sh });

        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([sh.longitude, sh.latitude])
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [loading, incidents, shelters, districts]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.5rem', fontWeight: 800 }}>Operational Map</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
            <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px', color: '#fbbf24' }} />
            SYNTHETIC DEMONSTRATION DATA — not real incident locations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['incidents', 'shelters', 'districts'] as const).map(layer => (
            <button
              key={layer}
              onClick={() => setShowLayers(l => ({ ...l, [layer]: !l[layer] }))}
              style={{
                padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: showLayers[layer] ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.04)',
                color: showLayers[layer] ? '#0ea5e9' : '#64748b',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', minHeight: '400px' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <p style={{ color: '#64748b' }}>Loading map data...</p>
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: '1rem', left: '1rem',
          background: 'rgba(10,15,30,0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '0.75rem 1rem',
          backdropFilter: 'blur(10px)', zIndex: 5,
        }}>
          <p style={{ margin: '0 0 0.5rem', color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Levels (SYNTHETIC)</p>
          {Object.entries(RISK_COLORS).map(([level, color]) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color }} />
              <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{level}</span>
            </div>
          ))}
        </div>

        {/* Info panel */}
        {selected && (
          <div style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'rgba(10,15,30,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '1rem 1.25rem',
            backdropFilter: 'blur(10px)', zIndex: 5,
            maxWidth: '260px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, color: '#fbbf24', fontSize: '0.65rem', fontWeight: 700 }}>⚠ SYNTHETIC DATA</p>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}>×</button>
            </div>
            {selected.type === 'district' && <DistrictInfo d={selected.data as District} />}
            {selected.type === 'incident' && <IncidentInfo inc={selected.data as Incident} />}
            {selected.type === 'shelter' && <ShelterInfo sh={selected.data as Shelter} />}
          </div>
        )}
      </div>
    </div>
  );
}

function DistrictInfo({ d }: { d: District }) {
  return (
    <>
      <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>{d.name} / {d.nametamil}</h3>
      <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.8rem' }}>Population: {d.population.toLocaleString('en-IN')}</p>
      <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.8rem' }}>Risk Score: <strong style={{ color: RISK_COLORS[d.riskLevel] }}>{d.riskScore}/100</strong></p>
      <p style={{ margin: 0, color: RISK_COLORS[d.riskLevel], fontWeight: 700, fontSize: '0.8rem' }}>Risk Level: {d.riskLevel}</p>
    </>
  );
}

function IncidentInfo({ inc }: { inc: Incident }) {
  return (
    <>
      <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{inc.title}</h3>
      <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.78rem' }}>{inc.district?.name} · {inc.type}</p>
      <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.78rem' }}>Affected: {inc.affectedPop.toLocaleString('en-IN')}</p>
      <p style={{ margin: 0, color: RISK_COLORS[inc.severity], fontWeight: 700, fontSize: '0.78rem' }}>Severity: {inc.severity}</p>
    </>
  );
}

function ShelterInfo({ sh }: { sh: Shelter }) {
  const util = Math.round((sh.occupancy / sh.capacity) * 100);
  return (
    <>
      <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{sh.name}</h3>
      <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.78rem' }}>{sh.district?.name} · {sh.type}</p>
      <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.78rem' }}>Occupancy: {sh.occupancy}/{sh.capacity} ({util}%)</p>
      <p style={{ margin: 0, color: sh.status === 'FULL' ? '#ef4444' : '#22c55e', fontWeight: 700, fontSize: '0.78rem' }}>Status: {sh.status}</p>
    </>
  );
}
