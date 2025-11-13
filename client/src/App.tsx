import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import MoldManagement from './pages/admin/MoldManagement';
import MoldForm from './pages/admin/MoldForm';
import MoldRegistration from './pages/admin/MoldRegistration';
import MoldEdit from './pages/admin/MoldEdit';
import MoldRepair from './pages/admin/MoldRepair';
import MoldDailyManagement from './pages/admin/MoldDailyManagement';
import MoldScheduleManagement from './pages/admin/MoldScheduleManagement';
import MoldQRInspection from './pages/admin/MoldQRInspection';
import DailyInspectionHistory from './pages/admin/DailyInspectionHistory';
import AssemblyCleaningHistory from './pages/admin/AssemblyCleaningHistory';
import NotificationSettings from './pages/admin/NotificationSettings';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerMoldRepair from './pages/partner/PartnerMoldRepair';
import PartnerDailyManagement from './pages/partner/PartnerDailyManagement';
import DailyCheck from './pages/worker/DailyCheck';
import RepairRequest from './pages/worker/RepairRequest';
import PeriodicCheck from './pages/worker/PeriodicCheck';
import CleaningLubrication from './pages/worker/CleaningLubrication';
import Cleaning from './pages/worker/Cleaning';
import Lubrication from './pages/worker/Lubrication';
import InjectionConditions from './pages/worker/InjectionConditions';
import InjectionConditionsInput from './pages/worker/InjectionConditionsInput';
import InjectionRevision from './pages/worker/InjectionRevision';
import InjectionChangeHistory from './pages/worker/InjectionChangeHistory';
import ManufacturingSpecs from './pages/worker/ManufacturingSpecs';
import HardnessMeasurement from './pages/worker/HardnessMeasurement';
import MoldChecklist from './pages/worker/MoldChecklist';
import DevelopmentProgress from './pages/worker/DevelopmentProgress';
import TransferRequest from './pages/worker/TransferRequest';
import TransferStatus from './pages/worker/TransferStatus';
import TransferChecklist from './pages/worker/TransferChecklist';
import TransferApproval from './pages/worker/TransferApproval';
import RepairInspection from './pages/worker/RepairInspection';
import RepairProgress from './pages/worker/RepairProgress';
import ExcelUpload from './pages/admin/ExcelUpload';
import QRScanner from './pages/worker/QRScanner';
import MoldInfo from './pages/worker/MoldInfo';

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Routes>
            {/* 관리자 로그인 */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* 협력사 로그인 */}
            <Route path="/partner/login" element={<PartnerLogin />} />
            
            {/* 관리자 라우트 */}
            <Route path="/admin" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="molds" element={<MoldManagement />} />
              <Route path="molds/new" element={<MoldForm />} />
              <Route path="molds/register" element={<MoldRegistration />} />
              <Route path="molds/edit" element={<MoldEdit />} />
              <Route path="molds/:id/edit" element={<MoldEdit />} />
              <Route path="molds/repair" element={<MoldRepair />} />
              <Route path="molds/:id/repair" element={<MoldRepair />} />
              <Route path="molds/daily-management" element={<MoldDailyManagement />} />
              <Route path="/admin/molds/daily-management" element={<MoldDailyManagement />} />
              <Route path="/admin/molds/schedule-management" element={<MoldScheduleManagement />} />
              <Route path="/admin/molds/qr-inspection" element={<MoldQRInspection />} />
              <Route path="/admin/daily-inspection-history" element={<DailyInspectionHistory />} />
              <Route path="/admin/assembly-cleaning-history" element={<AssemblyCleaningHistory />} />
            <Route path="/admin/notification-settings" element={<NotificationSettings />} />
              <Route path="molds/upload" element={<ExcelUpload />} />
            </Route>
            
            {/* 협력사 라우트 */}
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/partner/mold/:moldId/repair" element={<PartnerMoldRepair />} />
            <Route path="/partner/mold/:moldId/daily-management" element={<PartnerDailyManagement />} />
            
            {/* 작업자 라우트 */}
            <Route path="/worker/scan" element={<QRScanner />} />
            <Route path="/worker/mold/:moldId" element={<MoldInfo />} />
            <Route path="/worker/mold/:moldId/daily-check" element={<DailyCheck />} />
            <Route path="/worker/mold/:moldId/repair-request" element={<RepairRequest />} />
            <Route path="/worker/mold/:moldId/periodic-check" element={<PeriodicCheck />} />
            <Route path="/worker/mold/:moldId/cleaning-lubrication" element={<CleaningLubrication />} />
            <Route path="/worker/mold/:moldId/cleaning" element={<Cleaning />} />
            <Route path="/worker/mold/:moldId/lubrication" element={<Lubrication />} />
            <Route path="/worker/mold/:moldId/injection-conditions" element={<InjectionConditions />} />
            <Route path="/worker/mold/:moldId/injection-conditions-input" element={<InjectionConditionsInput />} />
            <Route path="/worker/mold/:moldId/injection-revision" element={<InjectionRevision />} />
            <Route path="/worker/mold/:moldId/injection-change-history" element={<InjectionChangeHistory />} />
            <Route path="/worker/mold/:moldId/manufacturing-specs" element={<ManufacturingSpecs />} />
            <Route path="/worker/mold/:moldId/hardness-measurement" element={<HardnessMeasurement />} />
            <Route path="/worker/mold/:moldId/mold-checklist" element={<MoldChecklist />} />
            <Route path="/worker/mold/:moldId/development-progress" element={<DevelopmentProgress />} />
            <Route path="/worker/mold/:moldId/transfer-request" element={<TransferRequest />} />
            <Route path="/worker/mold/:moldId/transfer-status" element={<TransferStatus />} />
            <Route path="/worker/mold/:moldId/transfer-checklist" element={<TransferChecklist />} />
            <Route path="/worker/mold/:moldId/transfer-approval" element={<TransferApproval />} />
            <Route path="/worker/mold/:moldId/repair-inspection" element={<RepairInspection />} />
            <Route path="/worker/mold/:moldId/repair-progress" element={<RepairProgress />} />
            
            {/* 기본 리다이렉트 */}
            <Route path="/" element={<Navigate to="/partner/login" replace />} />
            
            {/* Catch all route for better navigation */}
            <Route path="/worker" element={<Navigate to="/worker/scan" replace />} />
            
            {/* 404 페이지 */}
            <Route path="*" element={
              <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-semibold text-neutral-900 mb-4">404</h1>
                  <p className="text-neutral-600 mb-8">페이지를 찾을 수 없습니다.</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="btn-primary"
                  >
                    돌아가기
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
