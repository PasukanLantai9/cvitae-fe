// ResumeFormLayout.jsx (Updated with onStepChange support)
import React from 'react';

const steps = [
    { id: 'personal', name: 'Personal Info', iconName: 'Personal' },
    { id: 'experience', name: 'Experience', iconName: 'Experience' },
    { id: 'education', name: 'Education', iconName: 'Education' },
    { id: 'organisation', name: 'Organisation', iconName: 'Organisation' },
    { id: 'skills_achievements', name: 'Skills & Others', iconName: 'Skills' },
];

const ResumeFormLayout = ({
                              children,
                              currentStepId,
                              completedSteps = [],
                              onStepChange,
                              onBack,
                              onSaveAndNext,
                              formTitle,
                              isSaving = false,
                          }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="w-full bg-[#2859A6] flex justify-between items-center px-4 py-3 text-white">
                <h1 className="text-lg font-bold">CV Builder</h1>
                <button onClick={() => localStorage.clear()} className="text-sm">Clear Data</button>
            </div>

            <div className="bg-white shadow-md sticky top-[56px] z-30">
                <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.includes(step.id);
                        const isActive = step.id === currentStepId;
                        return (
                            <button
                                key={step.id}
                                className={`text-xs sm:text-sm font-medium px-2 py-1 rounded transition-all ${isActive ? 'text-[#2859A6] underline' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}
                                onClick={() => onStepChange && onStepChange(step.id)}
                            >
                                {step.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <main className="max-w-3xl w-full mx-auto flex-1 p-4">
                <h2 className="text-xl font-semibold mb-4">{formTitle}</h2>
                {children}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Back
                    </button>
                    <button
                        onClick={onSaveAndNext}
                        disabled={isSaving}
                        className="px-4 py-2 bg-[#2859A6] text-white rounded hover:bg-[#1f477d] disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save & Next'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ResumeFormLayout;
