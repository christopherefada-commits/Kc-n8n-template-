import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { CatalogPage } from "./pages/CatalogPage";
import { AutomationDetailPage } from "./pages/AutomationDetailPage";
import { DeploymentsPage } from "./pages/DeploymentsPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<CatalogPage />} />
          <Route path="automation/:id" element={<AutomationDetailPage />} />
          <Route path="deployments" element={<DeploymentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
