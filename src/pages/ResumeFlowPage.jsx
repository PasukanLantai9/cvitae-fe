// src/pages/ResumeFlowPage.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

// Struktur data resume awal yang KOSONG atau dari template.json jika diperlukan
const initialResumeDataStructure = {
    id: null,
    name: `My New CV ${new Date().toLocaleDateString()}`,
    personalDetails: { fullName: '', phoneNumber: '', email: '', linkedin: '', description: '', portfolioUrl: '', addressString: '' },
    professionalExperience: [],
    education: [],
    leadershipExperience: [],
    others: []
};

const stepsOrder = ['personal', 'experience', 'education', 'organisation', 'skills_achievements'];

function ResumeFlowPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { stepIdFromUrl } = useParams(); // Jika Anda menggunakan parameter rute seperti /resume/:stepIdFromUrl

    // Inisialisasi resumeData: Coba dari location.state (jika melanjutkan dari Dashboard),
    // atau dari localStorage (jika ingin persistensi antar sesi), atau struktur awal.
    const [resumeData, setResumeData] = useState(() => {
        const persistedResumeData = localStorage.getItem('currentResumeProgress');
        if (persistedResumeData) {
            try {
                const parsedData = JSON.parse(persistedResumeData);
                // Pastikan struktur dasar ada jika data dari localStorage tidak lengkap
                return { ...JSON.parse(JSON.stringify(initialResumeDataStructure)), ...parsedData };
            } catch (e) {
                console.error("Error parsing resume data from localStorage", e);
            }
        }
        return location.state?.resumeData || JSON.parse(JSON.stringify(initialResumeDataStructure));
    });

    // Inisialisasi completedSteps
    const [completedSteps, setCompletedSteps] = useState(() => {
         const persistedCompletedSteps = localStorage.getItem('completedResumeSteps');
        if (persistedCompletedSteps) {
            try {
                return JSON.parse(persistedCompletedSteps);
            } catch (e) {
                console.error("Error parsing completed steps from localStorage", e);
            }
        }
        return location.state?.completedSteps || [];
    });

    // Simpan ke localStorage setiap kali resumeData atau completedSteps berubah
    useEffect(() => {
        localStorage.setItem('currentResumeProgress', JSON.stringify(resumeData));
    }, [resumeData]);

    useEffect(() => {
        localStorage.setItem('completedResumeSteps', JSON.stringify(completedSteps));
    }, [completedSteps]);


    // Fungsi yang akan dipanggil oleh halaman anak (form) saat "Save & Next"
    // Halaman anak akan mengirimkan data yang sudah diupdate untuk bagiannya.
    const handleStepSave = (currentStepFormId, updatedSectionData) => {
        let newResumeData = { ...resumeData };

        // Tentukan key di resumeData berdasarkan currentStepFormId
        let sectionKey = '';
        if (currentStepFormId === 'personal') sectionKey = 'personalDetails';
        else if (currentStepFormId === 'experience') sectionKey = 'professionalExperience';
        else if (currentStepFormId === 'education') sectionKey = 'education';
        else if (currentStepFormId === 'organisation') sectionKey = 'leadershipExperience';
        else if (currentStepFormId === 'skills_achievements') sectionKey = 'others';

        if (sectionKey) {
            newResumeData = {
                ...newResumeData,
                [sectionKey]: updatedSectionData,
                id: newResumeData.id || resumeData.id // Pertahankan ID yang mungkin sudah didapat dari API
            };
        }
        setResumeData(newResumeData);

        // Tandai step saat ini sebagai selesai
        if (!completedSteps.includes(currentStepFormId)) {
            setCompletedSteps(prev => [...prev, currentStepFormId]);
        }
        return newResumeData; // Kembalikan data yang sudah diupdate untuk navigasi
    };


    // Outlet akan merender komponen rute anak (PersonalInformationPage, ExperiencePage, dll.)
    // Kita mengirim fungsi dan state melalui context agar anak bisa mengaksesnya.
    return <Outlet context={{ resumeData, setResumeData, completedSteps, setCompletedSteps, handleStepSave }} />;
}

export default ResumeFlowPage;