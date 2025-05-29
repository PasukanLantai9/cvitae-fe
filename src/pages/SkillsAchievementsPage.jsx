import React from 'react';

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

const SkillsAchievementsPage = ({ data, onDataChange }) => {
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
        if (data.length === 1) return;
        const filtered = data.filter((_, idx) => idx !== index);
        onDataChange(filtered);
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
                    {data.length > 1 && (
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
                className="mt-2 text-blue-600 text-sm"
            >
                + Add Another Entry
            </button>
        </div>
    );
};

export default SkillsAchievementsPage;
