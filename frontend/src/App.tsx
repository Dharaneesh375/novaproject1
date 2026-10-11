import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import SheltersPage from './pages/SheltersPage';
import ResourcesPage from './pages/ResourcesPage';
import MapPage from './pages/MapPage';
import RiskPage from './pages/RiskPage';
import DistrictsPage from './pages/DistrictsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FieldPage from './pages/FieldPage';
import CitizenPage from './pages/CitizenPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/incidents" element={
            <ProtectedRoute>
              <AppLayout><IncidentsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/shelters" element={
            <ProtectedRoute allowedRoles={['state_commander','district_officer','relief_coordinator','data_analyst']}>
              <AppLayout><SheltersPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute allowedRoles={['state_commander','district_officer','relief_coordinator']}>
              <AppLayout><ResourcesPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute allowedRoles={['state_commander','district_officer','field_responder','data_analyst']}>
              <AppLayout>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <MapPage />
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/risk" element={
            <ProtectedRoute allowedRoles={['state_commander','district_officer','data_analyst']}>
              <AppLayout><RiskPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/districts" element={
            <ProtectedRoute allowedRoles={['state_commander','data_analyst']}>
              <AppLayout><DistrictsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['state_commander','data_analyst']}>
              <AppLayout><AnalyticsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/field" element={
            <ProtectedRoute allowedRoles={['field_responder','district_officer']}>
              <AppLayout><FieldPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/citizen" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <AppLayout><CitizenPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
