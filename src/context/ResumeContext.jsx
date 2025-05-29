// ResumeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
    const [resume, setResume] = useState({
        id: null,
        name: '',
        personalDetails: {},
        professionalExperience: [],
        education: [],
        leadershipExperience: [],
        others: []
    });

    const updateResume = (section, data) => {
        setResume(prev => ({
            ...prev,
            [section]: data
        }));
    };

    return (
        <ResumeContext.Provider value={{ resume, updateResume }}>
            {children}
        </ResumeContext.Provider>
    );
};

export const useResume = () => useContext(ResumeContext);