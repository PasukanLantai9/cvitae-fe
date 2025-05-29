import React, { useState, useEffect } from 'react';

const initialExperienceEntry = {
    jobTitle: '',
    companyName: '',
    companyLocation: '',
    current: false,
    startDateMonth: '',
    startDateYear: '',
    endDateMonth: '',
    endDateYear: '',
    description: '',
};


const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const isFlatExperienceEntryEmpty = (exp) => {
    return !exp.jobTitle &&
           !exp.companyName &&
           !exp.companyLocation &&
           !exp.startDateMonth &&
           !exp.startDateYear &&
           !exp.endDateMonth &&
           !exp.endDateYear &&
           !exp.description &&
           exp.current === false;
};

const mapFlatToStructured = (flatExp) => ({
    startDate: {
        month: flatExp.startDateMonth,
        year: flatExp.startDateYear ? parseInt(flatExp.startDateYear, 10) : 0,
    },
    endDate: {
        month: flatExp.endDateMonth,
        year: flatExp.endDateYear ? parseInt(flatExp.endDateYear, 10) : 0,
    },
    roleTitle: flatExp.jobTitle,
    companyName: flatExp.companyName,
    location: flatExp.companyLocation,
    current: flatExp.current,
    elaboration: flatExp.description ? [{ text: flatExp.description }] : [],
});
const mapStructuredToFlat = (exp) => ({
    jobTitle: exp.roleTitle || '',
    companyName: exp.companyName || '',
    companyLocation: exp.location || '',
    current: exp.current || false,
    startDateMonth: exp.startDate?.month || '',
    startDateYear: exp.startDate?.year ? String(exp.startDate.year) : '', 
    endDateMonth: exp.endDate?.month || '',
    endDateYear: exp.endDate?.year ? String(exp.endDate.year) : '',    
    description: exp.elaboration?.[0]?.text || '',
});

const InputField = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] text-sm"
        />
    </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] text-sm resize-none"
        />
    </div>
);



const ExperiencePage = ({ data, onDataChange }) => {
    const [flatData, setFlatData] = useState(() => {
        if (data && data.length > 0) {
            return data.map(mapStructuredToFlat);
        }
        return [{ ...initialExperienceEntry }]; 
    });

    useEffect(() => {
        if (data && data.length > 0) {
            setFlatData(data.map(mapStructuredToFlat));
        } else {
            const isAlreadySinglePlaceholder = flatData.length === 1 && isFlatExperienceEntryEmpty(flatData[0]);
            if (!isAlreadySinglePlaceholder) {
                setFlatData([{ ...initialExperienceEntry }]);
            }
        }
    }, [data]); 

    const processAndSendData = (currentFlatEntries) => {
        // Filter entri yang benar-benar diisi (bukan placeholder kosong)
        const actualExperiences = currentFlatEntries.filter(exp => !isFlatExperienceEntryEmpty(exp));
        onDataChange(actualExperiences.map(mapFlatToStructured));
    };

    const handleChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedFlatData = flatData.map((exp, idx) =>
            idx === index ? { ...exp, [name]: type === 'checkbox' ? checked : value } : exp
        );
        setFlatData(updatedFlatData);
        processAndSendData(updatedFlatData);
    };

    const addExperience = () => {
        const updatedFlatData = [...flatData, { ...initialExperienceEntry }];
        setFlatData(updatedFlatData);
        processAndSendData(updatedFlatData); 
    };

    const removeExperience = (index) => {
        let updatedFlatData = flatData.filter((_, idx) => idx !== index);
        if (updatedFlatData.length === 0) {
            updatedFlatData = [{ ...initialExperienceEntry }];
        }
        setFlatData(updatedFlatData);
        processAndSendData(updatedFlatData);
    };

    return (
        <div className="p-4">
            {flatData.map((exp, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField label="Job Title" name="jobTitle" value={exp.jobTitle} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Software Engineer" />
                    <InputField label="Company Name" name="companyName" value={exp.companyName} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Google" />
                    <InputField label="Location" name="companyLocation" value={exp.companyLocation} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Jakarta, Indonesia" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Penggantian untuk Start Month */}
    <div>
        <label htmlFor={`startDateMonth-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">
            Start Month
        </label>
        <select
            id={`startDateMonth-${idx}`}
            name="startDateMonth"
            value={exp.startDateMonth || ""} // Default ke string kosong jika belum ada nilai
            onChange={(e) => handleChange(idx, e)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
            <option value="" disabled>
                e.g. January
            </option>
            {months.map((month) => (
                <option key={month} value={month}>
                    {month}
                </option>
            ))}
        </select>
    </div>

    {/* InputField untuk Start Year tetap sama */}
    <InputField label="Start Year" name="startDateYear" value={exp.startDateYear} onChange={(e) => handleChange(idx, e)} placeholder="e.g. 2020" type="number" />
</div>

{!exp.current && (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-0">
        {/* Penggantian untuk End Month */}
        <div>
            <label htmlFor={`endDateMonth-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">
                End Month
            </label>
            <select
                id={`endDateMonth-${idx}`}
                name="endDateMonth"
                value={exp.endDateMonth || ""} // Default ke string kosong jika belum ada nilai
                onChange={(e) => handleChange(idx, e)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="" disabled>
                    e.g. December
                </option>
                {months.map((month) => (
                    <option key={month} value={month}>
                        {month}
                    </option>
                ))}
            </select>
        </div>

        {/* InputField untuk End Year tetap sama */}
        <InputField label="End Year" name="endDateYear" value={exp.endDateYear} onChange={(e) => handleChange(idx, e)} placeholder="e.g. 2022" type="number" />
    </div>
)}
                    <div className="mb-4 mt-4 flex items-center"> 
                        <input
                            type="checkbox"
                            name="current"
                            id={`current-${idx}`} 
                            checked={exp.current}
                            onChange={(e) => handleChange(idx, e)}
                            className="h-4 w-4 text-[#2859A6] border-gray-300 rounded focus:ring-[#1e4a8a]"
                        />
                        <label htmlFor={`current-${idx}`} className="ml-2 text-sm text-gray-700 cursor-pointer">Currently Working Here</label>
                    </div>
                    <TextAreaField
                        label="Job Description"
                        name="description"
                        value={exp.description}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder="Describe your responsibilities, achievements, and skills used..."
                    />
                
                    {flatData.length >= 1 && ( 
                        <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-150"
                        >
                            Remove This Experience
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addExperience}
                className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2859A6] hover:bg-[#1e4a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] transition-colors duration-150"
            >
                + Add Another Experience
            </button>
        </div>
    );
};

export default ExperiencePage;