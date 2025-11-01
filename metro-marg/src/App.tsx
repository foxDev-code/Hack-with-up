import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { HomePage } from '@/pages/HomePage';
import { RouteFinderPage } from '@/pages/RouteFinderPage';
import { LiveTrackingPage } from '@/pages/LiveTrackingPage';
import { BookTicketPage } from '@/pages/BookTicketPage';
import { MyTicketsPage } from '@/pages/MyTicketsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { HelpPage } from '@/pages/HelpPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { TrainManagementPage } from '@/pages/admin/TrainManagementPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { QRGeneratorPage } from '@/pages/admin/QRGeneratorPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User Portal */}
          <Route path="/" element={<HomePage />} />
          <Route path="/route-finder" element={<RouteFinderPage />} />
          <Route path="/live-tracking" element={<LiveTrackingPage />} />
          <Route path="/book-ticket" element={<BookTicketPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Admin Portal */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/trains" element={<TrainManagementPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/qr-generator" element={<QRGeneratorPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
