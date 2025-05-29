import React, { useState, useEffect } from 'react';

const initialOrganisationEntry = {
    organisationName: '',
    roleTitle: '',
    location: '',
    current: false,
    startDate: { month: '', year: '' },
    endDate: { month: '', year: '' },
    elaboration: [{ text: '' }]
};

const isOrganisationEntryEmpty = (org) => {
    if (!org) return true;
    return !org.organisationName &&
           !org.roleTitle &&
           !org.location &&
           org.current === false &&
           (!org.startDate || (!org.startDate.month && !org.startDate.year)) &&
           (!org.endDate || (!org.endDate.month && !org.endDate.year)) &&
           (!org.elaboration || org.elaboration.length === 0 || (org.elaboration.length === 1 && !org.elaboration[0].text));
};

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

const OrganisationPage = ({ data = [], onDataChange }) => {
    const [uiOrganisationEntries, setUiOrganisationEntries] = useState(() => {
        if (data && data.length > 0) {
            return JSON.parse(JSON.stringify(data));
        }
        return [JSON.parse(JSON.stringify(initialOrganisationEntry))];
    });

    useEffect(() => {
        if (data && data.length > 0) {
            setUiOrganisationEntries(JSON.parse(JSON.stringify(data)));
        } else {
            const isAlreadySinglePlaceholder = uiOrganisationEntries.length === 1 && isOrganisationEntryEmpty(uiOrganisationEntries[0]);
            if (!isAlreadySinglePlaceholder) {
                setUiOrganisationEntries([JSON.parse(JSON.stringify(initialOrganisationEntry))]);
            }
        }
    }, [data]);

    const processAndSendData = (currentEntries) => {
        const actualEntries = currentEntries.filter(org => !isOrganisationEntryEmpty(org));
        onDataChange(actualEntries);
    };

    const handleChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedEntries = uiOrganisationEntries.map((entry, idx) => {
            if (idx !== index) return entry;

            if (name.startsWith('startDate.') || name.startsWith('endDate.')) {
                const [dateKey, field] = name.split('.');
                return {
                    ...entry,
                    [dateKey]: {
                        ...(entry[dateKey] || { month: '', year: '' }),
                        [field]: value
                    }
                };
            } else if (name === 'current') {
                return {
                    ...entry,
                    current: checked
                };
            } else if (name === 'elaboration') {
                return {
                    ...entry,
                    elaboration: [{ text: value }]
                };
            } else {
                return {
                    ...entry,
                    [name]: value
                };
            }
        });

        setUiOrganisationEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    const addOrganisation = () => {
        const updatedEntries = [...uiOrganisationEntries, JSON.parse(JSON.stringify(initialOrganisationEntry))];
        setUiOrganisationEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    const removeOrganisation = (index) => {
        let updatedEntries = uiOrganisationEntries.filter((_, idx) => idx !== index);
        if (updatedEntries.length === 0) {
            updatedEntries = [JSON.parse(JSON.stringify(initialOrganisationEntry))];
        }
        setUiOrganisationEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

    return (
        <div className="p-4">
            {uiOrganisationEntries.map((org, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField label="Organisation Name" name="organisationName" value={org.organisationName} onChange={(e) => handleChange(idx, e)} placeholder="e.g. IEEE Student Branch" />
                    <InputField label="Role / Title" name="roleTitle" value={org.roleTitle} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Chairman, Treasurer" />
                    <InputField label="Location" name="location" value={org.location} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Campus Location" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField 
                            label="Start Month" 
                            name="startDate.month" 
                            value={org.startDate?.month} 
                            onChange={(e) => handleChange(idx, e)} 
                            placeholder="e.g. September"
                        />
                        <InputField 
                            label="Start Year" 
                            name="startDate.year" 
                            type="text"
                            value={org.startDate?.year} 
                            onChange={(e) => handleChange(idx, e)} 
                            placeholder="e.g. 2019"
                        />
                    </div>

                    {!org.current && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-0">
                            <InputField 
                                label="End Month" 
                                name="endDate.month" 
                                value={org.endDate?.month} 
                                onChange={(e) => handleChange(idx, e)} 
                                placeholder="e.g. June"
                            />
                            <InputField 
                                label="End Year" 
                                name="endDate.year" 
                                type="text"
                                value={org.endDate?.year} 
                                onChange={(e) => handleChange(idx, e)} 
                                placeholder="e.g. 2021"
                            />
                        </div>
                    )}

                    <div className="mb-4 mt-4 flex items-center">
                        <input
                            type="checkbox"
                            name="current"
                            id={`org-current-${idx}`}
                            checked={!!org.current}
                            onChange={(e) => handleChange(idx, e)}
                            className="h-4 w-4 text-[#2859A6] border-gray-300 rounded focus:ring-[#1e4a8a]"
                        />
                        <label htmlFor={`org-current-${idx}`} className="ml-2 text-sm text-gray-700 cursor-pointer">Currently Active Here</label>
                    </div>

                    <TextAreaField
                        label="Description of Responsibilities / Achievements"
                        name="elaboration"
                        value={org.elaboration?.[0]?.text || ''}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder="Describe your role, responsibilities, and any notable achievements..."
                    />

                    {uiOrganisationEntries.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeOrganisation(idx)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-150"
                        >
                            Remove This Organisation
                        </button>
                    )}
                </div>
            ))}

            <button
                type="button"
                onClick={addOrganisation}
                className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2859A6] hover:bg-[#1e4a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] transition-colors duration-150"
            >
                + Add Another Organisation
            </button>
        </div>
    );
};

export default OrganisationPage;
