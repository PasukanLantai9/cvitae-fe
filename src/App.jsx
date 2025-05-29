import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Tambahkan Navigate
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard'; // Pastikan path ini benar, biasanya './Dashboard' jika di folder yang sama dengan App.jsx, atau './pages/Dashboard' jika di subfolder.
import ResumeFlowPage from './pages/ResumeFlowPage';    // Komponen Induk untuk alur resume
import PersonalInformationPage from './pages/PersonalInformationPage';
import ExperiencePage from './pages/ExperiencePage';         // Halaman anak
// Impor halaman form lainnya yang akan menjadi anak dari ResumeFlowPage
import EducationPage from './pages/EducationPage';     // Ganti dengan komponen Anda
import OrganisationPage from './pages/OrganisationPage'; // Ganti dengan komponen Anda
import SkillsAchievementsPage from './pages/SkillsAchievementsPage'; // Ganti dengan komponen Anda

const PlaceholderPage = ({ title }) => (
    <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p>This page is under construction.</p>
    </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rute yang mungkin dilindungi (misalnya, setelah login) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rute untuk Alur Pembuatan/Edit Resume */}
          <Route path="/resume/:resumeId" element={<ResumeFlowPage />}>
              
          </Route>

        {/* Fallback atau redirect jika path tidak cocok (opsional) */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </Router>
  );
}

export default App;