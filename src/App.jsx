import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdmin } from './context/AdminContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const { adminUser, authLoading, toast, hideToast } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-sm font-medium text-slate-300">Connecting to SEORA Admin...</span>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Administrative Layout Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <Toast message={toast} onClose={hideToast} />
    </div>
  );
}
