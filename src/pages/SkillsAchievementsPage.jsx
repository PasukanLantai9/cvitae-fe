import React, { useState, useEffect } from 'react';

const initialOtherEntry = {
    category: '',
    name: '',
    date: {
        month: '',
        year: ''
    },
    elaboration: {
        text: ''
    }
};

const isOtherEntryEmpty = (entry) => {
    if (!entry) return true;
    return !entry.category &&
           !entry.name &&
           (!entry.date || (!entry.date.month && !entry.date.year)) &&
           (!entry.elaboration || !entry.elaboration.text);
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

const SkillsAchievementsPage = ({ data = [], onDataChange }) => {
    const [uiEntries, setUiEntries] = useState(() => {
        if (data && data.length > 0) {
            return JSON.parse(JSON.stringify(data));
        }
        return [JSON.parse(JSON.stringify(initialOtherEntry))];
    });

    useEffect(() => {
        if (data && data.length > 0) {
            setUiEntries(JSON.parse(JSON.stringify(data)));
        } else {
            const isAlreadySinglePlaceholder = uiEntries.length === 1 && isOtherEntryEmpty(uiEntries[0]);
            if (!isAlreadySinglePlaceholder) {
                setUiEntries([JSON.parse(JSON.stringify(initialOtherEntry))]);
            }
        }
    }, [data]);

    const processAndSendData = (currentEntries) => {
        const actualEntries = currentEntries.filter(entry => !isOtherEntryEmpty(entry));
        onDataChange(actualEntries);
    };

    const handleChange = (index, e) => {
        const { name, value } = e.target;

        const updatedEntries = uiEntries.map((entry, idx) => {
            if (idx !== index) return entry;

            const newEntry = JSON.parse(JSON.stringify(entry));

            if (name === 'month' || name === 'year') {
                newEntry.date = { ...(newEntry.date || { month: '', year: '' }), [name]: value };
            } else if (name === 'description') {
                newEntry.elaboration = { ...(newEntry.elaboration || { text: '' }), text: value };
            } else {
                newEntry[name] = value;
            }

            return newEntry;
        });

        setUiEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    const addEntry = () => {
        const updatedEntries = [...uiEntries, JSON.parse(JSON.stringify(initialOtherEntry))];
        setUiEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    const removeEntry = (index) => {
        let updatedEntries = uiEntries.filter((_, idx) => idx !== index);
        if (updatedEntries.length === 0) {
            updatedEntries = [JSON.parse(JSON.stringify(initialOtherEntry))];
        }
        setUiEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    return (
        <div className="p-4">
            {uiEntries.map((entry, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField
                        label="Category"
                        name="category"
                        value={entry.category}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder="e.g. Skill, Certificate, Achievement, Project"
                    />
                    <InputField
                        label="Title / Name"
                        name="name"
                        value={entry.name}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder="e.g. JavaScript, Google Certified Cloud Architect, Best Employee Award"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Month (Optional)"
                            name="month"
                            value={entry.date?.month}
                            onChange={(e) => handleChange(idx, e)}
                            placeholder="e.g. March"
                        />
                        <InputField
                            label="Year (Optional)"
                            name="year"
                            type="text"
                            value={entry.date?.year}
                            onChange={(e) => handleChange(idx, e)}
                            placeholder="e.g. 2023"
                        />
                    </div>
                    <TextAreaField
                        label="Description / Details"
                        name="description"
                        value={entry.elaboration?.text}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder="Provide more details here..."
                    />
                    {uiEntries.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeEntry(idx)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-150"
                        >
                            Remove This Entry
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addEntry}
                className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2859A6] hover:bg-[#1e4a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] transition-colors duration-150"
            >
                + Add Another Entry
            </button>
        </div>
    );
};

export default SkillsAchievementsPage;
