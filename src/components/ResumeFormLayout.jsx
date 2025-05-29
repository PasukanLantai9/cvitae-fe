import React from 'react';
import { useNavigate } from 'react-router-dom';

// Definisikan path ke ikon PNG Anda di folder public
const iconPaths = {
    Personal: '/personal.png',        // Adjusted path, assuming icons are directly in /public
    Experience: '/experiences.png',   // Adjusted path
    Education: '/education.png',      // Adjusted path
    Organisation: '/organization.png',// Adjusted path
    Skills: '/skill.png',             // Adjusted path (for skills_achievements)
    Default: '/default-placeholder.png' // Adjusted path
};

const IconComponent = ({ iconName, isActiveOrCompleted }) => {
    const iconClasses = `w-5 h-5 sm:w-6 sm:h-6 object-contain`;
    // The iconName for "Skills & Others" will be 'Skills' from the steps array.
    // We map this to the correct icon file if needed, or ensure iconPaths.Skills points to the right asset.
    let imagePath = iconPaths[iconName] || iconPaths.Default;

    // Example for active state icons (if you have them, e.g., white versions for dark background)
    // if (isActiveOrCompleted && iconName === 'Personal' /* && specific active icon exists */) {
    //     imagePath = '/personal_active.png'; // Or however you name them
    // }
    // Add similar conditions for other icons if they have active versions

    return (
        <img src={imagePath} alt={`${iconName} icon`} className={iconClasses} />
    );
};

const IconWrapper = ({ iconName, isActive, isCompleted }) => {
    const isHighlighted = isActive || isCompleted;
    return (
        <div className={`p-2 rounded-full transition-colors duration-150 
            ${isHighlighted ? 'bg-[#2859A6]' : // Warna untuk step aktif atau selesai
              'bg-gray-200 hover:bg-gray-300'   // Step Belum Disentuh
            }`}>
            {/* Pass iconName directly. IconComponent can handle specific active versions if needed. */}
            <IconComponent iconName={iconName} isActiveOrCompleted={isHighlighted} />
        </div>
    );
};

const steps = [
    { id: 'personal', name: 'Personal Info', iconName: 'Personal', path: '/resume/personal' },
    { id: 'experience', name: 'Experience', iconName: 'Experience', path: '/resume/experience' },
    { id: 'education', name: 'Education', iconName: 'Education', path: '/resume/education' },
    { id: 'organisation', name: 'Organisation', iconName: 'Organisation', path: '/resume/organisation' },
    // **** FIX IS HERE ****
    { id: 'skills_achievements', name: 'Skills & Others', iconName: 'Skills', path: '/resume/skills_achievements' },
];

const ResumeFormLayout = ({
    children,
    currentStepId,
    completedSteps = [],
    onBack,
    onSaveAndNext,
    onSave, // Added for the last step
    isLastStep = false, // Added for the last step
    onPreview,
    onDownload,
    formTitle,
    formSubtitle,
    isSaving = false,
    isDownloadingPdf = false,
}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('sessionID');
        navigate('/login');
    };

    // Logic for canNavigateToStep can be kept if you want to restrict navigation,
    // but the primary fix is matching the step id.
    const canNavigateToStep = (stepIdToNavigate, stepIndexTarget) => {
        if (stepIdToNavigate === currentStepId) return true;
        if (completedSteps.includes(stepIdToNavigate)) return true;

        if (stepIndexTarget === 0) return true;
        const previousStepOfTarget = steps[stepIndexTarget - 1];
        if (previousStepOfTarget && completedSteps.includes(previousStepOfTarget.id)) {
            return true;
        }
        return false;
    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className='w-full bg-[#2859A6] flex justify-between items-center px-4 sm:px-9 py-3 shadow-md sticky top-0 z-40'>
                <button onClick={() => navigate('/dashboard')} className="focus:outline-none" aria-label="Go to Dashboard">
                    <img src="/logo.png" alt="logocvtae" className='w-[80px] sm:w-[90px] h-auto' />
                </button>
                <button
                    type="button"
                    className='p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <img src="/menu (1).png" alt="Menu Icon" className='w-5 h-5 sm:w-6 sm:h-6' />
                </button>
            </div>

            <div className="bg-white shadow-md sticky top-[56px] sm:top-[60px] z-30">
                <div className="max-w-3xl mx-auto px-2 xs:px-4 sm:px-6 py-3">
                    <div className="flex justify-between items-center">
                        {steps.map((step, index) => {
                            const isActive = step.id === currentStepId;
                            const isCompleted = completedSteps.includes(step.id) && !isActive; // Only completed if not active
                            const canNavigate = canNavigateToStep(step.id, index);

                            return (
                                <React.Fragment key={step.id}>
                                    <button
                                        onClick={() => {
                                            // Simplified navigation for now, assuming canNavigate logic is handled if needed
                                            // if (canNavigate) navigate(step.path, { state: { resumeData: currentFullResumeData, completedSteps } });
                                            // For debugging or simpler flow, allow navigation:
                                            navigate(step.path); // You might want to pass state here if needed for direct navigation
                                        }}
                                        className={`flex flex-col items-center p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 
                                            ${isActive || isCompleted ? 'focus:ring-[#2859A6]' : 'focus:ring-gray-400'}
                                            ${!canNavigate && !isActive ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} 
                                        `}
                                        title={step.name}
                                        aria-current={isActive ? "page" : undefined}
                                        // disabled={!canNavigate && !isActive} // Re-enable if strict navigation is desired
                                    >
                                        <IconWrapper
                                            iconName={step.iconName}
                                            isActive={isActive}
                                            isCompleted={isCompleted}
                                        />
                                    </button>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-grow h-0.5 mx-1 sm:mx-2 transition-colors duration-300
                                            ${(isActive || completedSteps.includes(step.id)) && 
                                              (steps[index+1]?.id === currentStepId || completedSteps.includes(steps[index+1]?.id)) 
                                                ? 'bg-[#2859A6]' : 'bg-gray-300'}`}
                                        ></div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    {(onPreview || onDownload) && (
                        <div className="mt-3 flex space-x-3">
                            {onPreview && (
                                <button type="button" onClick={onPreview} disabled={isSaving || isDownloadingPdf} className="btn-outline flex-1">Preview</button>
                            )}
                            {onDownload && (
                                <button type="button" onClick={onDownload} disabled={isSaving || isDownloadingPdf} className="btn-primary flex-1">
                                    {isDownloadingPdf ? "Generating..." : 'Download'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-grow py-6 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto bg-white p-5 sm:p-6 rounded-lg shadow-lg">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 Poppins">{formTitle}</h1>
                    {formSubtitle && <p className="text-sm text-gray-500 Poppins mt-1 mb-6">{formSubtitle}</p>}
                    {children}
                </div>
            </main>

            {/* Footer for navigation buttons */}
            <footer className="bg-white py-4 px-4 sm:px-6 border-t border-gray-200 sticky bottom-0 z-20 shadow-top">
                <div className="max-w-3xl mx-auto flex justify-between items-center space-x-3">
                    {onBack ? (
                        <button type="button" onClick={onBack} disabled={isSaving || isDownloadingPdf} className="btn-outline flex-1 sm:flex-none">Back</button>
                    ) : <div className="flex-1 sm:flex-none" />}
                    
                    {/* Conditionally render "Save" or "Save & Next" */}
                    {isLastStep && onSave ? (
                        <button type="button" onClick={onSave} disabled={isSaving || isDownloadingPdf} className="btn-primary flex-1 sm:flex-none">
                           {isSaving ? "Saving..." : 'Save'}
                        </button>
                    ) : onSaveAndNext ? (
                         <button type="button" onClick={onSaveAndNext} disabled={isSaving || isDownloadingPdf} className="btn-primary flex-1 sm:flex-none">
                            {isSaving ? "Saving..." : 'Save & Next'}
                         </button>
                    ) : null}
                </div>
            </footer>
        </div>
    );
};

export default ResumeFormLayout;