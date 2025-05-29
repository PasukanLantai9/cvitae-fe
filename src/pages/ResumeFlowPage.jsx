// ResumeFlowPage.jsx (Versi Baru dengan Step di 1 Halaman)
import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
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
    const [currentStep, setCurrentStep] = useState('personal');
    const [resumeData, setResumeData] = useState({
        personalDetails: {},
        professionalExperience: [],
        education: [],
        leadershipExperience: [],
        others: [],
    });
    const [completedSteps, setCompletedSteps] = useState([]);

    const fetchResumeData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`${apiBaseUrl}/resume/${resumeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch resume');

            const data = await response.json();
            setResumeData(data);
        } catch (error) {
            console.error('Error fetching resume:', error);
            alert('Gagal memuat data resume.');
        }
    };

    useEffect(() => {
        fetchResumeData();
    }, [resumeId]);

    const handleSaveStepData = async (stepId, data) => {
        const key = keyMap[stepId];

        // Update local state dulu
        setResumeData(prev => {
            const updated = { ...prev, [key]: data };

            // Kirim seluruh data resume sekaligus ke backend
            sendResumeDataToBackend(updated);

            return updated;
        });

        if (!completedSteps.includes(stepId)) {
            setCompletedSteps(prev => [...prev, stepId]);
        }
    };

    const sendResumeDataToBackend = async (fullResumeData) => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`${apiBaseUrl}/resume/${resumeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(fullResumeData), // kirim semua data resume
            });

            if (!response.ok) throw new Error('Failed to update resume');

            console.log('Resume updated');
            return true;
        } catch (error) {
            console.error('Error updating resume:', error);
            return false;
        }
    };

    // Fungsi ini akan dipanggil saat tombol Save & Next
    const handleSaveAndNext = async () => {
        const key = keyMap[currentStep];
        const currentStepData = resumeData[key];

        const success = await handleSaveStepData(currentStep, currentStepData);
        if (success) {
            const idx = steps.indexOf(currentStep);
            if (idx < steps.length - 1) {
                setCurrentStep(steps[idx + 1]);
            }
        } else {
            alert('Gagal menyimpan data, coba lagi.');
        }
    };
    const handleBack = () => {
        const idx = steps.indexOf(currentStep);
        if (idx > 0) {
            setCurrentStep(steps[idx - 1]);
        }
    };

    const CurrentForm = stepComponents[currentStep];

    return (
        <ResumeFormLayout
            currentStepId={currentStep}
            completedSteps={completedSteps}
            onStepChange={setCurrentStep}
            onBack={handleBack}
            onSaveAndNext={handleSaveAndNext}
            formTitle={currentStep.replace('_', ' ').toUpperCase()}
            isSaving={false}
        >
            <CurrentForm
                data={resumeData[keyMap[currentStep]]}
                onDataChange={(data) => setResumeData(prev => ({ ...prev, [keyMap[currentStep]]: data }))}
            />
        </ResumeFormLayout>
    );
};

export default ResumeFlowPage;
