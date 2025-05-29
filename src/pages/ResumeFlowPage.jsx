// ResumeFlowPage.jsx

import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } // Impor useNavigate jika Anda ingin navigasi setelah semua step selesai
    from 'react-router-dom';
import ResumeFormLayout from '../components/ResumeFormLayout';
import PersonalInformationPage from './PersonalInformationPage';
import ExperiencePage from './ExperiencePage';
import EducationPage from './EducationPage';
import OrganisationPage from './OrganisationPage';
import SkillsAchievementsPage from './SkillsAchievementsPage';

const stepComponents = {
    personal: PersonalInformationPage,
    experience: ExperiencePage,
    education: EducationPage,
    organisation: OrganisationPage,
    skills_achievements: SkillsAchievementsPage,
};

const keyMap = {
    personal: 'personalDetails',
    experience: 'professionalExperience',
    education: 'education',
    organisation: 'leadershipExperience',
    skills_achievements: 'others',
};

const steps = ['personal', 'experience', 'education', 'organisation', 'skills_achievements'];

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const ResumeFlowPage = () => {
    const { resumeId } = useParams();
    const navigate = useNavigate(); // Untuk navigasi opsional
    const [currentStep, setCurrentStep] = useState('personal');
    const [resumeData, setResumeData] = useState({
        personalDetails: {},
        professionalExperience: [],
        education: [],
        leadershipExperience: [],
        others: [],
        // Pastikan semua field yang mungkin ada di data resume dari backend diinisialisasi di sini
        // agar tidak ada masalah saat spread operator ({...prev})
    });
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isSaving, setIsSaving] = useState(false); // State untuk loading simpan

    const fetchResumeData = async () => {
        if (!resumeId) return; // Jangan fetch jika resumeId tidak ada
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.warn("Akses token tidak ditemukan. Mengarahkan ke login.");
                // navigate('/login'); // Opsional: arahkan ke login
                throw new Error('Akses token tidak ditemukan.');
            }

            const response = await fetch(`${apiBaseUrl}/resume/${resumeId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token tidak valid atau sesi berakhir
                    console.warn("Sesi berakhir atau token tidak valid. Mengarahkan ke login.");
                    // navigate('/login'); // Opsional
                }
                throw new Error(`Failed to fetch resume. Status: ${response.status}`);
            }
            const data = await response.json();
            setResumeData(prevData => ({ ...prevData, ...data })); // Gabungkan dengan state awal untuk menjaga struktur
            // Anda mungkin ingin mengisi completedSteps berdasarkan data yang diambil jika ada indikatornya
        } catch (error) {
            console.error('Error fetching resume:', error);
            alert(`Gagal memuat data resume: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchResumeData();
    }, [resumeId]); // Hapus navigate dari dependensi jika tidak digunakan di sini

    // Fungsi untuk mengirim data ke backend (dengan error handling lebih baik)
    const sendResumeDataToBackend = async (fullResumeDataToSend) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Autentikasi diperlukan. Token tidak ditemukan.');
            }

            const response = await fetch(`${apiBaseUrl}/resume/${resumeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(fullResumeDataToSend),
            });

            if (!response.ok) {
                let errorMessage = `Gagal memperbarui resume. Status: ${response.status}`;
                try {
                    const errorBody = await response.json();
                    errorMessage += ` - Pesan: ${errorBody.message || JSON.stringify(errorBody.errors || errorBody)}`;
                } catch (e) {
                    errorMessage += ` - ${response.statusText || 'Tidak ada pesan error tambahan dari server.'}`;
                }
                throw new Error(errorMessage);
            }

            console.log('Resume berhasil diperbarui di backend.');
            return true; // Sukses
        } catch (error) {
            console.error('Error updating resume:', error); // Ini akan log error yang lebih detail
            // alert(`Error updating resume: ${error.message}`); // Anda bisa alert error yang lebih detail di sini jika mau
            return false; // Gagal
        } finally {
            setIsSaving(false);
        }
    };


    // handleSaveStepData sekarang hanya fokus memperbarui state lokal
    // dan memanggil onSaveAndNext untuk logika penyimpanan ke backend dan navigasi.
    // Perubahan ini menyederhanakan, karena CurrentForm langsung memanggil onDataChange.
    // handleSaveStepData yang lama bisa jadi tidak diperlukan jika onDataChange sudah benar.
    // Kita akan memodifikasi handleSaveAndNext agar langsung memanggil sendResumeDataToBackend

    const handleSaveAndNext = async () => {
        // Data terbaru sudah ada di `resumeData` karena `onDataChange` dari CurrentForm
        const success = await sendResumeDataToBackend(resumeData); // Kirim seluruh resumeData terbaru

        if (success) {
            const currentStepKey = keyMap[currentStep];
            if (!completedSteps.includes(currentStepKey)) { // Gunakan currentStep, bukan currentStepKey jika completedSteps menyimpan nama step
                 if (!completedSteps.includes(currentStep)) {
                    setCompletedSteps(prev => [...prev, currentStep]);
                }
            }

            const idx = steps.indexOf(currentStep);
            if (idx < steps.length - 1) {
                setCurrentStep(steps[idx + 1]);
            } else {
                alert('Semua langkah telah selesai dan disimpan!');
                // navigate('/dashboard'); // Opsional: navigasi ke dashboard atau halaman lain
            }
        } else {
            alert('Gagal menyimpan data. Periksa konsol untuk detail atau coba lagi.');
        }
    };


    const handleBack = () => {
        const idx = steps.indexOf(currentStep);
        if (idx > 0) {
            setCurrentStep(steps[idx - 1]);
        }
    };

    const CurrentForm = stepComponents[currentStep];
    if (!CurrentForm) {
        return <div>Error: Step component not found for {currentStep}</div>;
    }
    
    // Fungsi onDataChange yang akan dipanggil oleh child component (misal: PersonalInformationPage)
    // Ini memastikan resumeData di parent selalu update sebelum save.
    const handleDataChangeForStep = (dataFromChild) => {
        setResumeData(prev => ({ ...prev, [keyMap[currentStep]]: dataFromChild }));
    };


    return (
        <ResumeFormLayout
            currentStepId={currentStep}
            completedSteps={completedSteps}
            onStepChange={setCurrentStep} // Ini untuk navigasi via klik step di layout
            onBack={handleBack}
            onSaveAndNext={handleSaveAndNext} // handleSaveAndNext sekarang yang utama untuk save
            formTitle={currentStep.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} // Judul lebih rapi
            isSaving={isSaving} // Teruskan state isSaving
            resumeId={resumeId} // Teruskan resumeId ke ResumeFormLayout jika diperlukan untuk Preview/Download
        >
            <CurrentForm
                data={resumeData[keyMap[currentStep]] || (keyMap[currentStep] === 'personalDetails' ? {} : [])} // Berikan default value yang sesuai (objek atau array)
                onDataChange={handleDataChangeForStep} // Gunakan handler ini
            />
        </ResumeFormLayout>
    );
};

export default ResumeFlowPage;