import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { ToastContainer } from "@/components/common";
import { AppProvider } from "@/state/AppContext";
import { DashboardPage } from "@/pages/DashboardPage";
import { RepositoryPage } from "@/pages/RepositoryPage";
import { MarketplacePage } from "@/pages/MarketplacePage";
import { ConfigurationPage } from "@/pages/ConfigurationPage";
import { DeploymentsPage } from "@/pages/DeploymentsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AutomationDetailPage } from "@/pages/AutomationDetailPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/repository" element={<RepositoryPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/configuration" element={<ConfigurationPage />} />
            <Route path="/deployments" element={<DeploymentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/automation/:id" element={<AutomationDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AppProvider>
  );
}
