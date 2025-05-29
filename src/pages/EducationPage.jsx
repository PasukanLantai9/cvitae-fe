import React from 'react';

const initialEducationEntry = {
    school: '',
    degreeLevel: '',
    major: '',
    location: '',
    startDate: { month: '', year: 0 },
    endDate: { month: '', year: 0 },
    gpa: '',
    maxGpa: '',
    elaboration: [{ text: '' }],
};

const InputField = ({ label, name, value, onChange, placeholder }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input
            type="text"
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

const EducationPage = ({ data, onDataChange }) => {
    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const updated = data.map((edu, idx) =>
            idx === index ? { ...edu, [name]: value } : edu
        );
        onDataChange(updated);
    };

    const handleNestedChange = (index, section, field, value) => {
        const updated = data.map((edu, idx) =>
            idx === index
                ? {
                    ...edu,
                    [section]: {
                        ...edu[section],
                        [field]: section === 'startDate' || section === 'endDate'
                            ? field === 'year' ? parseInt(value || 0, 10) : value
                            : value
                    },
                }
                : edu
        );
        onDataChange(updated);
    };

    const handleElaborationChange = (index, value) => {
        const updated = data.map((edu, idx) =>
            idx === index
                ? { ...edu, elaboration: [{ text: value }] }
                : edu
        );
        onDataChange(updated);
    };

    const addEducation = () => onDataChange([...data, { ...initialEducationEntry }]);

    const removeEducation = (index) => {
        if (data.length === 1) return;
        const filtered = data.filter((_, idx) => idx !== index);
        onDataChange(filtered);
    };

    return (
        <div className="p-4">
            {(data ?? []).map((edu, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField label="School" name="school" value={edu.school} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Degree Level" name="degreeLevel" value={edu.degreeLevel} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Major" name="major" value={edu.major} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Location" name="location" value={edu.location} onChange={(e) => handleChange(idx, e)} />
                    <div className="flex gap-4">
                        <InputField
                            label="Start Month"
                            name="startDateMonth"
                            value={edu.startDate?.month}
                            onChange={(e) => handleNestedChange(idx, 'startDate', 'month', e.target.value)}
                        />
                        <InputField
                            label="Start Year"
                            name="startDateYear"
                            value={edu.startDate?.year}
                            onChange={(e) => handleNestedChange(idx, 'startDate', 'year', e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <InputField
                            label="End Month"
                            name="endDateMonth"
                            value={edu.endDate?.month}
                            onChange={(e) => handleNestedChange(idx, 'endDate', 'month', e.target.value)}
                        />
                        <InputField
                            label="End Year"
                            name="endDateYear"
                            value={edu.endDate?.year}
                            onChange={(e) => handleNestedChange(idx, 'endDate', 'year', e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <InputField label="GPA" name="gpa" value={edu.gpa} onChange={(e) => handleChange(idx, e)} />
                        <InputField label="Max GPA" name="maxGpa" value={edu.maxGpa} onChange={(e) => handleChange(idx, e)} />
                    </div>
                    <TextAreaField
                        label="Description / Thesis"
                        name="elaboration"
                        value={edu.elaboration?.[0]?.text || ''}
                        onChange={(e) => handleElaborationChange(idx, e.target.value)}
                    />
                    {data.length > 1 && (
                        <button type="button" onClick={() => removeEducation(idx)} className="text-red-600 text-sm">
                            Remove Education
                        </button>
                    )}
                </div>
            ))}
            <button type="button" onClick={addEducation} className="mt-2 text-blue-600 text-sm">
                + Add Another Education
            </button>
        </div>
    );
};

export default EducationPage;
