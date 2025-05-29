import React, { useState, useEffect } from 'react';

// Entri pendidikan awal yang kosong
const initialEducationEntry = {
    school: '',
    degreeLevel: '',
    major: '',
    location: '',
    startDate: { month: '', year: 0 }, // Menggunakan 0 untuk tahun kosong agar konsisten dengan parseInt
    endDate: { month: '', year: 0 },   // Menggunakan 0 untuk tahun kosong
    gpa: '',
    maxGpa: '',
    elaboration: [{ text: '' }], // Sesuai struktur, array dengan satu objek teks kosong
};

// Fungsi untuk mengecek apakah sebuah entri pendidikan benar-benar kosong
const isEducationEntryEmpty = (edu) => {
    if (!edu) return true;
    return !edu.school &&
           !edu.degreeLevel &&
           !edu.major &&
           !edu.location &&
           (edu.startDate ? (!edu.startDate.month && (edu.startDate.year === 0 || edu.startDate.year === '')) : true) &&
           (edu.endDate ? (!edu.endDate.month && (edu.endDate.year === 0 || edu.endDate.year === '')) : true) &&
           !edu.gpa &&
           !edu.maxGpa &&
           (!edu.elaboration || edu.elaboration.length === 0 || (edu.elaboration.length === 1 && !edu.elaboration[0].text));
};

// Komponen InputField dan TextAreaField (diasumsikan sama seperti sebelumnya, tidak diubah)
const InputField = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input
            type={type} // Memungkinkan type="number" untuk tahun jika diinginkan
            name={name}
            value={value === 0 && (name === 'startDateYear' || name === 'endDateYear') ? '' : (value || '')} // Tampilkan string kosong untuk tahun 0
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
    // State lokal untuk UI, selalu ada minimal satu entri
    const [uiEducationEntries, setUiEducationEntries] = useState(() => {
        if (data && data.length > 0) {
            return JSON.parse(JSON.stringify(data)); // Deep clone data props
        }
        return [JSON.parse(JSON.stringify(initialEducationEntry))]; // Mulai dengan satu form kosong
    });

    // Sinkronisasi dengan props `data`
    useEffect(() => {
        if (data && data.length > 0) {
            setUiEducationEntries(JSON.parse(JSON.stringify(data)));
        } else {
            // Jika data dari parent kosong, pastikan UI tetap menampilkan satu form kosong,
            // kecuali jika uiEducationEntries sudah dalam kondisi tersebut.
            const isAlreadySinglePlaceholder = uiEducationEntries.length === 1 && isEducationEntryEmpty(uiEducationEntries[0]);
            if (!isAlreadySinglePlaceholder) {
                setUiEducationEntries([JSON.parse(JSON.stringify(initialEducationEntry))]);
            }
        }
    }, [data]); // Hanya bergantung pada `data`

    // Fungsi untuk memproses dan mengirim data yang valid ke parent
    const processAndSendData = (currentEntries) => {
        const actualEntries = currentEntries.filter(edu => !isEducationEntryEmpty(edu));
        onDataChange(actualEntries); // Kirim array entri yang benar-benar diisi
    };

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const updatedEntries = uiEducationEntries.map((edu, idx) =>
            idx === index ? { ...edu, [name]: value } : edu
        );
        setUiEducationEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    const handleNestedChange = (index, section, field, value) => {
        const updatedEntries = uiEducationEntries.map((edu, idx) => {
            if (idx === index) {
                const isYearField = field === 'year';
                // Untuk field tahun, parse ke integer. Jika string kosong atau invalid, jadi 0.
                // Untuk field bulan, biarkan sebagai string.
                const processedValue = (section === 'startDate' || section === 'endDate') && isYearField
                    ? parseInt(value, 10) || 0 // Pastikan tahun adalah angka, atau 0 jika kosong/invalid
                    : value;

                return {
                    ...edu,
                    [section]: {
                        ...(edu[section] || {}), // Pastikan section ada sebelum di-spread
                        [field]: processedValue,
                    },
                };
            }
            return edu;
        });
        setUiEducationEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    const handleElaborationChange = (index, value) => {
        const updatedEntries = uiEducationEntries.map((edu, idx) =>
            idx === index
                ? { ...edu, elaboration: [{ text: value }] }
                : edu
        );
        setUiEducationEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    const addEducation = () => {
        const updatedEntries = [...uiEducationEntries, JSON.parse(JSON.stringify(initialEducationEntry))];
        setUiEducationEntries(updatedEntries);
        processAndSendData(updatedEntries); // Panggil setelah update state UI
    };

    const removeEducation = (index) => {
        let updatedEntries = uiEducationEntries.filter((_, idx) => idx !== index);
        if (updatedEntries.length === 0) {
            // Jika semua entri dihapus, pastikan UI tetap menampilkan satu form kosong
            updatedEntries = [JSON.parse(JSON.stringify(initialEducationEntry))];
        }
        setUiEducationEntries(updatedEntries);
        processAndSendData(updatedEntries);
    };

    return (
        <div className="p-4">
            {uiEducationEntries.map((edu, idx) => (
                <div key={idx} className="border p-4 mb-6 rounded-md bg-gray-50">
                    <InputField label="School / University" name="school" value={edu.school} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Universitas Indonesia" />
                    <InputField label="Degree Level" name="degreeLevel" value={edu.degreeLevel} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Bachelor's, Master's" />
                    <InputField label="Major / Field of Study" name="major" value={edu.major} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Computer Science" />
                    <InputField label="Location" name="location" value={edu.location} onChange={(e) => handleChange(idx, e)} placeholder="e.g. Depok, Indonesia" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Start Month"
                            name="startDateMonth" // Nama disesuaikan untuk kejelasan, tapi tidak langsung jadi key di state
                            value={edu.startDate?.month}
                            onChange={(e) => handleNestedChange(idx, 'startDate', 'month', e.target.value)}
                            placeholder="e.g. August"
                        />
                        <InputField
                            label="Start Year"
                            name="startDateYear" // Nama disesuaikan
                            type="number" // Gunakan type number untuk input tahun
                            value={edu.startDate?.year}
                            onChange={(e) => handleNestedChange(idx, 'startDate', 'year', e.target.value)}
                            placeholder="e.g. 2018"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="End Month"
                            name="endDateMonth" // Nama disesuaikan
                            value={edu.endDate?.month}
                            onChange={(e) => handleNestedChange(idx, 'endDate', 'month', e.target.value)}
                            placeholder="e.g. July"
                        />
                        <InputField
                            label="End Year"
                            name="endDateYear" // Nama disesuaikan
                            type="number" // Gunakan type number untuk input tahun
                            value={edu.endDate?.year}
                            onChange={(e) => handleNestedChange(idx, 'endDate', 'year', e.target.value)}
                            placeholder="e.g. 2022"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="GPA" name="gpa" value={edu.gpa} onChange={(e) => handleChange(idx, e)} placeholder="e.g. 3.75" />
                        <InputField label="Max GPA (Optional)" name="maxGpa" value={edu.maxGpa} onChange={(e) => handleChange(idx, e)} placeholder="e.g. 4.00 or 100" />
                    </div>
                    <TextAreaField
                        label="Description / Thesis / Activities (Optional)"
                        name="elaboration" // Nama disesuaikan
                        value={edu.elaboration?.[0]?.text || ''}
                        onChange={(e) => handleElaborationChange(idx, e.target.value)}
                        placeholder="e.g. Graduated with honors, Thesis title, Relevant coursework, Extracurricular activities..."
                    />
                    {/* Tombol Remove hanya jika ada lebih dari satu form yang ditampilkan */}
                    {uiEducationEntries.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-150"
                        >
                            Remove This Education
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addEducation}
                className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2859A6] hover:bg-[#1e4a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] transition-colors duration-150"
            >
                + Add Another Education
            </button>
        </div>
    );
};

export default EducationPage;