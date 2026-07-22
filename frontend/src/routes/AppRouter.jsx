import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Dashboard from "../pages/Dashboard";
import PlansPage from "../pages/PlansPage";
import OtpPage from "../pages/OtpPage";
import TermsPage from "../pages/TermsPage";
import FaqPage from "../pages/FaqPage";
import PrivacyPage from "../pages/PrivacyPage";
import RefundPage from "../pages/RefundPage";
import CareersPage from "../pages/CareersPage";
import AuthPage from "../pages/AuthPage";
import MissionVisionPage from "../pages/OurMission&Vision";
import DocumentationPage from "../pages/Documentation";
import SupportChatPage from "../pages/SupportChatPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refunds" element={<RefundPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/mission-vision" element={<MissionVisionPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/support-chat" element={<SupportChatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
