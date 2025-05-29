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

const mapStructuredToFlat = (entry) => ({
    category: entry.category || '',
    name: entry.name || '',
    dateMonth: entry.date?.month || '',
    dateYear: entry.date?.year || '',
    elaboration: entry.elaboration?.text || '',
});


const mapFlatToStructured = (flatEntry) => ({
    category: flatEntry.category || '',
    name: flatEntry.name || '',
    date: {
        month: flatEntry.dateMonth || '',
        year: flatEntry.dateYear ? parseInt(flatEntry.dateYear, 10) : '',
    },
    elaboration: {
        text: flatEntry.elaboration || '',
    }
});


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

    const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SkillsAchievementsPage = ({ data, onDataChange }) => {


    const [flatData, setFlatData] = useState(data.map(mapStructuredToFlat));


    const handleChange = (index, e) => {
        const { name, value } = e.target;

        const updated = data.map((entry, idx) => {
            if (idx !== index) return entry;

            const newEntry = { ...entry };

            if (name === 'month' || name === 'year') {
                newEntry.date = { ...entry.date, [name]: value };
            } else if (name === 'description') {
                newEntry.elaboration = { ...entry.elaboration, text: value };
            } else {
                newEntry[name] = value;
            }

            return newEntry;
        });

        onDataChange(updated);
    };

    const addEntry = () => onDataChange([...data, { ...initialOtherEntry }]);

    const removeEntry = (index) => {
        const filtered = flatData.filter((_, idx) => idx !== index);
        setFlatData(filtered);
        onDataChange(filtered.map(mapFlatToStructured));
    };

    return (
        <div className="p-4">
            {(data ?? []).map((entry, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField
                        label="Category (e.g. Skills, Certificates, Achievements)"
                        name="category"
                        value={entry.category}
                        onChange={(e) => handleChange(idx, e)}
                    />
                    <InputField
                        label="Title"
                        name="name"
                        value={entry.name}
                        onChange={(e) => handleChange(idx, e)}
                    />
                    <div className="flex gap-4">
                        <InputField
                            label="Month"
                            name="month"
                            value={entry.date?.month}
                            onChange={(e) => handleChange(idx, e)}
                        />
                        <InputField
                            label="Year"
                            name="year"
                            value={entry.date?.year}
                            onChange={(e) => handleChange(idx, e)}
                        />
                    </div>
                    <TextAreaField
                        label="Description"
                        name="description"
                        value={entry.elaboration?.text}
                        onChange={(e) => handleChange(idx, e)}
                    />
                    {data.length >= 1 && (
                        <button
                            type="button"
                            onClick={() => removeEntry(idx)}
                            className="text-red-600 text-sm"
                        >
                            Remove Entry
                        </button>
                    )}
                </div>
            ))}
              <button
                type="button"
                onClick={addEntry}
                className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2859A6] hover:bg-[#1e4a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] transition-colors duration-150"
            >
                + Add Another Organisation
            </button>
        </div>
    );
};

export default SkillsAchievementsPage;
