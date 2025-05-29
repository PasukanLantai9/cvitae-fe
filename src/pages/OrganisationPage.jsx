import React from 'react';

const initialOrganisationEntry = {
    organisationName: '',
    roleTitle: '',
    location: '',
    current: false,
    startDate: { month: '', year: '' },
    endDate: { month: '', year: '' },
    elaboration: [{ text: '' }]
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

const OrganisationPage = ({ data = [], onDataChange }) => {
    const handleChange = (index, e) => {
        const { name, value, _, checked } = e.target;
        const updated = data.map((entry, idx) => {
            if (idx !== index) return entry;

            if (name.startsWith('startDate.') || name.startsWith('endDate.')) {
                const [dateKey, field] = name.split('.');
                return {
                    ...entry,
                    [dateKey]: {
                        ...entry[dateKey],
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

        onDataChange(updated);
    };

    const addOrganisation = () => onDataChange([...data, { ...initialOrganisationEntry }]);

    const removeOrganisation = (index) => {
        if (data.length === 1) return;
        const filtered = data.filter((_, idx) => idx !== index);
        onDataChange(filtered);
    };

    return (
        <div className="p-4">
            {(data ?? []).map((org, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField label="Organisation Name" name="organisationName" value={org.organisationName} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Role Title" name="roleTitle" value={org.roleTitle} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Location" name="location" value={org.location} onChange={(e) => handleChange(idx, e)} />

                    <div className="flex gap-4">
                        <InputField label="Start Month" name="startDate.month" value={org.startDate?.month} onChange={(e) => handleChange(idx, e)} />
                        <InputField label="Start Year" name="startDate.year" value={org.startDate?.year} onChange={(e) => handleChange(idx, e)} />
                    </div>

                    {!org.current && (
                        <div className="flex gap-4">
                            <InputField label="End Month" name="endDate.month" value={org.endDate?.month} onChange={(e) => handleChange(idx, e)} />
                            <InputField label="End Year" name="endDate.year" value={org.endDate?.year} onChange={(e) => handleChange(idx, e)} />
                        </div>
                    )}

                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            name="current"
                            checked={org.current}
                            onChange={(e) => handleChange(idx, e)}
                            className="h-4 w-4 text-[#2859A6] border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Currently Active</label>
                    </div>

                    <TextAreaField
                        label="Description"
                        name="elaboration"
                        value={org.elaboration?.[0]?.text}
                        onChange={(e) => handleChange(idx, e)}
                    />

                    {data.length > 1 && (
                        <button type="button" onClick={() => removeOrganisation(idx)} className="text-red-600 text-sm">
                            Remove Organisation
                        </button>
                    )}
                </div>
            ))}

            <button type="button" onClick={addOrganisation} className="mt-2 text-blue-600 text-sm">
                + Add Another Organisation
            </button>
        </div>
    );
};

export default OrganisationPage;
