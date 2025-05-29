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

    const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

    return (
        <div className="p-4">
            {flatData.map((exp, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField label="Job Title" name="jobTitle" value={exp.jobTitle} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Company Name" name="companyName" value={exp.companyName} onChange={(e) => handleChange(idx, e)} />
                    <InputField label="Location" name="companyLocation" value={exp.companyLocation} onChange={(e) => handleChange(idx, e)} />
                    <div className="flex gap-4">
    {/* Penggantian untuk InputField Start Month */}
    <div className="flex flex-col flex-1"> {/* flex-1 agar mengisi ruang jika diperlukan, atau sesuaikan */}
        <label htmlFor={`exp-startDateMonth-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">
            Start Month
        </label>
        <select
            id={`exp-startDateMonth-${idx}`}
            name="startDateMonth" // Nama ini penting untuk handleChange(idx, e)
            value={exp.startDateMonth || ""}
            onChange={(e) => handleChange(idx, e)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
            <option value="" disabled>Select month</option>
            {months.map((month) => (
                <option key={month} value={month}>
                    {month}
                </option>
            ))}
        </select>
    </div>

    {/* InputField untuk Start Year tetap sama */}
    {/* Jika InputField Anda tidak otomatis mengambil flex-1, Anda mungkin perlu membungkusnya juga */}
    <div className="flex flex-col flex-1"> {/* Contoh pembungkusan jika InputField tidak punya struktur label sendiri */}
         {/* Jika InputField sudah punya label, wrapper div mungkin tidak perlu, atau sesuaikan struktur InputField */}
        <InputField 
            label="Start Year" 
            name="startDateYear" 
            value={exp.startDateYear} 
            onChange={(e) => handleChange(idx, e)} 
            // Jika InputField Anda adalah input sederhana, Anda mungkin perlu menambahkan className="... w-full ..."
        />
    </div>
</div>

{!exp.current && (
    <div className="flex gap-4 mt-4"> {/* Tambah mt-4 jika diperlukan, sesuai desain Anda */}
        {/* Penggantian untuk InputField End Month */}
        <div className="flex flex-col flex-1">
            <label htmlFor={`exp-endDateMonth-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">
                End Month
            </label>
            <select
                id={`exp-endDateMonth-${idx}`}
                name="endDateMonth" // Nama ini penting untuk handleChange(idx, e)
                value={exp.endDateMonth || ""}
                onChange={(e) => handleChange(idx, e)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="" disabled>Select month</option>
                {months.map((month) => (
                    <option key={month} value={month}>
                        {month}
                    </option>
                ))}
            </select>
        </div>

        {/* InputField untuk End Year tetap sama */}
        <div className="flex flex-col flex-1">
            <InputField 
                label="End Year" 
                name="endDateYear" 
                value={exp.endDateYear} 
                onChange={(e) => handleChange(idx, e)} 
            />
        </div>
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


