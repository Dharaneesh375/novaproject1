import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Map, AlertTriangle, Building2,
  Users, Package, BarChart3, LogOut, Menu, X, ChevronRight,
  Radio, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/map', icon: <Map size={18} />, label: 'Live Map', roles: ['state_commander', 'district_officer', 'field_responder', 'data_analyst'] },
  { to: '/incidents', icon: <AlertTriangle size={18} />, label: 'Incidents' },
  { to: '/shelters', icon: <Building2 size={18} />, label: 'Shelters & Relief', roles: ['state_commander', 'district_officer', 'relief_coordinator', 'data_analyst'] },
  { to: '/resources', icon: <Package size={18} />, label: 'Resources', roles: ['state_commander', 'district_officer', 'relief_coordinator'] },
  { to: '/districts', icon: <Map size={18} />, label: 'Districts', roles: ['state_commander', 'data_analyst'] },
  { to: '/risk', icon: <Zap size={18} />, label: 'Risk Analysis', roles: ['state_commander', 'district_officer', 'data_analyst'] },
  { to: '/analytics', icon: <BarChart3 size={18} />, label: 'Analytics', roles: ['state_commander', 'data_analyst'] },
  { to: '/field', icon: <Radio size={18} />, label: 'Field Ops', roles: ['field_responder', 'district_officer'] },
  { to: '/citizen', icon: <Users size={18} />, label: 'Citizen Portal', roles: ['citizen'] },
];

const ROLE_LABELS: Record<UserRole, string> = {
  state_commander: 'State Commander',
  district_officer: 'District Officer',
  field_responder: 'Field Responder',
  relief_coordinator: 'Relief Coordinator',
  data_analyst: 'Data Analyst',
  citizen: 'Citizen',
};

const ROLE_COLORS: Record<UserRole, string> = {
  state_commander: '#ef4444',
  district_officer: '#f97316',
  field_responder: '#eab308',
  relief_coordinator: '#22c55e',
  data_analyst: '#0ea5e9',
  citizen: '#8b5cf6',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || (user && item.roles.includes(user.role as UserRole))
  );

  const roleColor = user ? ROLE_COLORS[user.role as UserRole] : '#0ea5e9';
  const roleLabel = user ? ROLE_LABELS[user.role as UserRole] : '';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0f1e', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '64px',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(15,23,42,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        backdropFilter: 'blur(20px)',
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.25rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minHeight: '64px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(14,165,233,0.3)',
          }}>
            <Shield size={20} color="white" />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>ResilienceOS</p>
              <p style={{ margin: 0, color: '#0ea5e9', fontSize: '0.65rem', fontWeight: 500, whiteSpace: 'nowrap' }}>TN Disaster Platform</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              marginLeft: 'auto',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Demo badge */}
        {sidebarOpen && (
          <div style={{
            margin: '0.75rem 0.75rem 0',
            padding: '0.4rem 0.75rem',
            background: 'rgba(251, 191, 36, 0.08)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#d97706', fontSize: '0.7rem', fontWeight: 600 }}>DEMO / SYNTHETIC DATA</span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflow: 'auto', padding: '0.75rem 0.5rem' }}>
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={!sidebarOpen ? item.label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '10px',
                marginBottom: '0.25rem',
                textDecoration: 'none',
                color: isActive ? '#f8fafc' : '#94a3b8',
                background: isActive ? 'rgba(14,165,233,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #0ea5e9' : '3px solid transparent',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              })}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: '0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {sidebarOpen ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: `${roleColor}22`,
                border: `2px solid ${roleColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: roleColor, fontWeight: 700, fontSize: '0.85rem',
              }}>
                {user?.name?.charAt(0)}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ margin: 0, color: roleColor, fontSize: '0.7rem', fontWeight: 500 }}>{roleLabel}</p>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} title="Sign out" style={{
              width: '100%', background: 'rgba(255,255,255,0.04)', border: 'none',
              borderRadius: '10px', padding: '0.75rem', cursor: 'pointer', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: '64px',
          background: 'rgba(15,23,42,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          gap: '1rem',
          backdropFilter: 'blur(10px)',
          flexShrink: 0,
        }}>
          {/* Status indicators */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <StatusPill label="API" status="online" />
            <StatusPill label="DB" status="online" />
            <div style={{
              padding: '0.3rem 0.75rem',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '20px',
              color: '#fbbf24',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}>
              ⚠ DEMO MODE
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        a:hover { background: rgba(14,165,233,0.08) !important; color: #f8fafc !important; }
      `}</style>
    </div>
  );
}

function StatusPill({ label, status }: { label: string; status: 'online' | 'offline' | 'degraded' }) {
  const colors = { online: '#22c55e', offline: '#ef4444', degraded: '#f97316' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors[status], boxShadow: `0 0 6px ${colors[status]}` }} />
      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{label}</span>
    </div>
  );
}
