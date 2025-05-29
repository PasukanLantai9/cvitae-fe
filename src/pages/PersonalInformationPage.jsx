// PersonalInformationPage.jsx (Refactor untuk pakai props data/onDataChange)
import React from 'react';

const InputField = ({ label, name, type = 'text', value, onChange, placeholder }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm"
        />
    </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        <textarea
            name={name}
            id={name}
            rows={rows}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm resize-none"
        />
    </div>
);

const PersonalInformationPage = ({ data, onDataChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onDataChange({ ...data, [name]: value });
    };

    return (
        <div className="p-4">
            <InputField label="Full Name" name="fullName" value={data.fullName} onChange={handleChange} placeholder="John Doe" />
            <InputField label="Email" name="email" value={data.email} onChange={handleChange} placeholder="john@example.com" />
            <InputField label="Phone Number" name="phoneNumber" value={data.phoneNumber} onChange={handleChange} placeholder="08123456789" />
            <InputField label="LinkedIn URL" name="linkedin" value={data.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
            <InputField label="Portfolio URL" name="portfolioUrl" value={data.portfolioUrl} onChange={handleChange} placeholder="https://yourportfolio.com" />
            <InputField label="Address" name="addressString" value={data.addressString} onChange={handleChange} placeholder="Jl. Contoh No.123, Jakarta" />
            <TextAreaField label="Professional Summary" name="description" value={data.description} onChange={handleChange} placeholder="A passionate developer with experience in..." />
        </div>
    );
};

export default PersonalInformationPage;
