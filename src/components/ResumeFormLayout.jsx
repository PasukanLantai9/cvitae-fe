import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

const steps = [
    { id: 'personal', name: 'Personal Info', iconName: 'Personal' },
    { id: 'experience', name: 'Experience', iconName: 'Experiences' },
    { id: 'education', name: 'Education', iconName: 'Education' },
    { id: 'organisation', name: 'Organisation', iconName: 'Organization' },
    { id: 'skills_achievements', name: 'Skills & Others', iconName: 'Skill' },
];

const ResumeFormLayout = ({
    children,
    currentStepId,
    onStepChange,
    onBack,
    onSaveAndNext,
    formTitle,
    isSaving = false,
    resumeId,
}) => {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    const handleLogoClick = () => {
        navigate('/dashboard');
    };

    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');

    const handlePreview = async () => {
        if (!resumeId) return console.warn('resumeId missing');
        const token = localStorage.getItem('accessToken');
        const url = `${apiBaseUrl}/resume/${resumeId}/download`;

        try {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Preview failed');

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            setPdfUrl(blobUrl);
            setPreviewOpen(true);
        } catch (err) {
            console.error('Preview failed:', err);
        }
    };

    const closePreview = () => {
        setPreviewOpen(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl('');
        }
    };

    const handleDownload = async () => {
        if (!resumeId) return console.warn('resumeId missing');
        const token = localStorage.getItem('accessToken');
        const url = `${apiBaseUrl}/resume/${resumeId}/download`;

        try {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const blob = await res.blob();
            const filename = `resume-${resumeId}.pdf`;

            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };


    const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top blue bar - Fixed */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-4xl h-[80vh] relative">
                        <button
                            onClick={closePreview}
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-lg font-bold z-10"
                        >
                            &times;
                        </button>
                        <iframe
                            src={pdfUrl}
                            title="PDF Preview"
                            className="w-full h-full"
                            frameBorder="0"
                        />
                    </div>
                </div>
            )}
            <div className="w-full bg-[#2859A6] flex justify-between items-center px-4 py-3 text-white fixed top-0 left-0 right-0 z-40 h-[56px]">
                <button
                    onClick={handleLogoClick}
                    className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
                    aria-label="Go to dashboard"
                >
                    {/* Jika logo.png ada di folder public, pathnya /logo.png */}
                    <img src="/logo.png" alt="CVitae Logo" className="h-7 sm:h-8 w-auto" />
                </button>
                <button onClick={() => {
                    if (window.confirm("Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.")) {
                        localStorage.clear();
                        alert("Semua data telah dihapus. Silakan segarkan halaman.");
                    }
                }} className="text-sm hover:bg-[#1f477d] p-1 rounded">Clear Data</button>
            </div>

            <div className="pt-[56px] flex-grow flex flex-col">
                {/* Steps Navigation - Sticky */}
                <div className="bg-white shadow-md sticky top-[56px] z-30">
                    <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-6">
                        {/* Kontainer relative dengan py-4 untuk garis dan ikon */}
                        <div className="relative py-4 flex justify-between items-start">
                            {/* Garis abu-abu (latar belakang) */}
                            {/* top-9 (2.25rem) = 1rem (py-4) + 1.25rem (setengah tinggi ikon h-10) */}
                            {/* sm:top-10 (2.5rem) = 1rem (py-4) + 1.5rem (setengah tinggi ikon sm:h-12) */}
                            <div
                                className="absolute top-9 sm:top-10 h-[2px] bg-gray-300 z-0"
                                style={{
                                    left: `calc((100% / ${steps.length}) / 2)`,
                                    width: `calc(100% - (100% / ${steps.length}))`,
                                }}
                            ></div>
                            {/* Garis biru (progres) */}
                            {currentStepIndex >= 0 && steps.length > 1 && (
                                <div
                                    className="absolute top-9 sm:top-10 h-[2px] bg-[#2859A6] z-[1]"
                                    style={{
                                        left: `calc((100% / ${steps.length}) / 2)`,
                                        width: currentStepIndex === 0
                                            ? '0px'
                                            : `calc( (${currentStepIndex} / ${steps.length - 1}) * (100% - (100% / ${steps.length})) )`,
                                    }}
                                ></div>
                            )}

                            {steps.map((step, index) => {
                                const isStepCompletedOrActive = index <= currentStepIndex;
                                const isActive = step.id === currentStepId;
                                // Jika ikon ada di folder public, pathnya /namaikon.png
                                const iconPath = `/${step.iconName.toLowerCase()}.png`;
                                const iconStyle = isStepCompletedOrActive ? { filter: 'brightness(0) invert(1)' } : {};

                                return (
                                    <div key={step.id} className="flex flex-col items-center text-center relative z-[2]" style={{ width: `${100 / steps.length}%` }}>
                                        <button
                                            onClick={() => onStepChange && onStepChange(step.id)}
                                            disabled={!onStepChange}
                                            className="flex flex-col items-center group focus:outline-none"
                                            aria-current={isActive ? 'step' : undefined}
                                        >
                                            <div
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 transition-colors duration-150 ease-in-out
                                                            ${isStepCompletedOrActive ? 'bg-[#2859A6]' : 'bg-gray-200 group-hover:bg-gray-300'}`}
                                            >
                                                <img
                                                    src={iconPath}
                                                    alt={`${step.name} icon`}
                                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                                    style={iconStyle}
                                                />
                                            </div>
                                            <span
                                                className={`text-[10px] leading-tight sm:text-xs font-medium transition-colors duration-150 ease-in-out
                                                            ${isStepCompletedOrActive ? 'text-[#2859A6]' : 'text-gray-500 group-hover:text-gray-700'}`}
                                            >
                                                {step.name}
                                            </span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Preview and Download Buttons Section */}
                <div className="bg-white py-4 border-b shadow-sm">
                    <div className="max-w-3xl mx-auto flex flex-row items-center space-x-3 sm:space-x-4 px-4">
                        <button
                            onClick={handlePreview}
                            disabled={!resumeId}
                            className="flex-1 px-8 py-2 border border-[#2859A6] text-[#2859A6] rounded-md font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Preview
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!resumeId}
                            className="flex-1 px-8 py-2 bg-[#2859A6] text-white rounded-md font-medium hover:bg-[#1f477d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Download
                        </button>
                    </div>
                </div>

                {/* Main form content */}
                <main className="max-w-3xl w-full mx-auto flex-1 p-4 sm:p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">{formTitle}</h2>
                    {children}
                    {/* Back and Save & Next Buttons */}
                    <div className="mt-8 flex flex-row justify-between items-center">
                        <button
                            onClick={onBack}
                            className="px-12 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={onSaveAndNext}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-[#2859A6] text-white rounded-md hover:bg-[#1f477d] font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] disabled:opacity-50 transition-colors"
                        >
                            {isSaving ? 'Saving...' : 'Save & Next'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ResumeFormLayout;