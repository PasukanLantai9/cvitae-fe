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

// Map flat experience object (form state) to structured backend format
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

// Map structured experience (from props) to flat form data
const mapStructuredToFlat = (exp) => ({
    jobTitle: exp.roleTitle || '',
    companyName: exp.companyName || '',
    companyLocation: exp.location || '',
    current: exp.current || false,
    startDateMonth: exp.startDate?.month || '',
    startDateYear: exp.startDate?.year || '',
    endDateMonth: exp.endDate?.month || '',
    endDateYear: exp.endDate?.year || '',
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
    // Local flat data state for editing
    const [flatData, setFlatData] = useState(data.map(mapStructuredToFlat));

    // Sync props data -> local flatData on data prop changes
    useEffect(() => {
        setFlatData(data.map(mapStructuredToFlat));
    }, [data]);

    const handleChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updated = flatData.map((exp, idx) =>
            idx === index ? { ...exp, [name]: type === 'checkbox' ? checked : value } : exp
        );
        setFlatData(updated);
        onDataChange(updated.map(mapFlatToStructured));
    };

    const addExperience = () => {
        const updated = [...flatData, { ...initialExperienceEntry }];
        setFlatData(updated);
        onDataChange(updated.map(mapFlatToStructured));
    };

    const removeExperience = (index) => {
        const filtered = flatData.filter((_, idx) => idx !== index);
        setFlatData(filtered);
        onDataChange(filtered.map(mapFlatToStructured));
    };

    return (
        <div className="p-4">
            {flatData.map((exp, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField label="Job Title" name="jobTitle" value={exp.jobTitle} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Company Name" name="companyName" value={exp.companyName} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Location" name="companyLocation" value={exp.companyLocation} onChange={(e) => handleChange(idx, e)} />
                    <div className="flex gap-4">
                        <InputField label="Start Month" name="startDateMonth" value={exp.startDateMonth} onChange={(e) => handleChange(idx, e)} />
                        <InputField label="Start Year" name="startDateYear" value={exp.startDateYear} onChange={(e) => handleChange(idx, e)} />
                    </div>
                    {!exp.current && (
                        <div className="flex gap-4">
                            <InputField label="End Month" name="endDateMonth" value={exp.endDateMonth} onChange={(e) => handleChange(idx, e)} />
                            <InputField label="End Year" name="endDateYear" value={exp.endDateYear} onChange={(e) => handleChange(idx, e)} />
                        </div>
                    )}
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            name="current"
                            checked={exp.current}
                            onChange={(e) => handleChange(idx, e)}
                            className="h-4 w-4 text-[#2859A6] border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Currently Working Here</label>
                    </div>
                    <TextAreaField
                        label="Job Description"
                        name="description"
                        value={exp.description}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder="Describe your responsibilities..."
                    />
                    {flatData.length >= 1 && (
                        <button type="button" onClick={() => removeExperience(idx)} className="text-red-600 text-sm">
                            Remove Experience
                        </button>
                    )}
                </div>
            ))}
            <button type="button" onClick={addExperience} className="mt-2 text-blue-600 text-sm">
                + Add Another Experience
            </button>
        </div>
    );
};

export default ExperiencePage;
