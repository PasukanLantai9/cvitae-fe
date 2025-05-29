import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResumeFormLayout from '../components/ResumeFormLayout';
import GoHTMLTemplater from '../utils/GoHTMLTemplater';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = false, autoComplete, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5"> {label} </label> <input type={type} name={name} id={name} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete} disabled={disabled} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" /> </div> );
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3, required = false, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5"> {label} </label> <textarea name={name} id={name} rows={rows} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins placeholder-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed" /> </div> );
const SelectField = ({ label, name, value, onChange, options, required = false, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5">{label}</label> <select name={name} id={name} value={value || ''} onChange={onChange} required={required} disabled={disabled} className="mt-1 block w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins transition-all disabled:opacity-50 disabled:cursor-not-allowed" > <option value="">Select...</option> {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> </div> );

const initialEducationEntry = {
    school: '', degree: '', fieldOfStudy: '',
    startDateMonth: '', startDateYear: '', endDateMonth: '', endDateYear: '',
    grade: '', description: ''
};

const fallbackFullResumeStructure = {
    id: null, name: `My CV ${new Date().toLocaleTimeString()}`,
    PersonalDetails: {}, ProfessionalExperience: [], Education: [], LeadershipExperience: [], Others: []
};

const EducationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [educations, setEducations] = useState([JSON.parse(JSON.stringify(initialEducationEntry))]);
    const [currentFullResumeData, setCurrentFullResumeData] = useState(() => {
        const stateData = location.state?.resumeData;
        return stateData && typeof stateData === 'object' && Object.keys(stateData).length > 0
            ? JSON.parse(JSON.stringify(stateData))
            : JSON.parse(JSON.stringify(fallbackFullResumeStructure));
    });
    const [completedSteps, setCompletedSteps] = useState(location.state?.completedSteps || []);
    const [baseRawTemplate, setBaseRawTemplate] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPageDataLoading, setIsPageDataLoading] = useState(true);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const pdfPreviewRef = useRef(null);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    const capitalizeFirstLetter = (string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
    const mapEducationItemToPascalCase = (eduFormItem) => {
        const pascalItem = {};
        if (eduFormItem.school) pascalItem.School = eduFormItem.school;
        if (eduFormItem.degree) pascalItem.DegreeLevel = eduFormItem.degree;
        if (eduFormItem.fieldOfStudy) pascalItem.Major = eduFormItem.fieldOfStudy;
        // Location is not in form state, default to empty or handle if added
        pascalItem.Location = eduFormItem.location || ''; 
        
        if (eduFormItem.startDateMonth && eduFormItem.startDateYear) {
            pascalItem.StartDate = { Month: eduFormItem.startDateMonth, Year: parseInt(eduFormItem.startDateYear, 10) };
        }
        if (eduFormItem.endDateMonth && eduFormItem.endDateYear) {
            pascalItem.EndDate = { Month: eduFormItem.endDateMonth, Year: parseInt(eduFormItem.endDateYear, 10) };
        }
        if (eduFormItem.grade) {
            pascalItem.GPA = parseFloat(eduFormItem.grade);
            pascalItem.MaxGPA = 4.0; // Assuming a default MaxGPA, adjust if form includes it
        }
        if (eduFormItem.description && eduFormItem.description.trim() !== '') {
            pascalItem.Elaboration = [{ Text: eduFormItem.description.trim() }];
        } else {
            pascalItem.Elaboration = [];
        }
        return pascalItem;
    };

    useEffect(() => {
        const loadPageData = async () => {
            setIsPageDataLoading(true);
            let dataFromNav = location.state?.resumeData;

            if (!dataFromNav || Object.keys(dataFromNav).length === 0 || !dataFromNav.id) {
                alert("Sesi data resume tidak valid. Anda akan diarahkan ke halaman awal.");
                navigate('/resume/personal', { replace: true, state: { isNew: true, resumeData: JSON.parse(JSON.stringify(fallbackFullResumeStructure)), completedSteps: [] } });
                setIsPageDataLoading(false); return;
            }
            
            if (JSON.stringify(dataFromNav) !== JSON.stringify(currentFullResumeData)) {
                setCurrentFullResumeData(JSON.parse(JSON.stringify(dataFromNav)));
            }

            try {
                const templateRes = await fetch('/resume_template.gohtml');
                if (templateRes.ok) setBaseRawTemplate(await templateRes.text());
            } catch (error) { console.error("EducationPage: Error fetch /resume_template.gohtml:", error); }

            const existingEducations = dataFromNav.Education || dataFromNav.education;
            if (Array.isArray(existingEducations) && existingEducations.length > 0) {
                const mappedEducationsForForm = existingEducations.map(edu => ({ // edu has PascalCase keys
                    school: edu.School || '',
                    degree: edu.DegreeLevel || '',
                    fieldOfStudy: edu.Major || '',
                    startDateMonth: edu.StartDate?.Month || '', startDateYear: String(edu.StartDate?.Year || ''),
                    endDateMonth: edu.EndDate?.Month || '', endDateYear: String(edu.EndDate?.Year || ''),
                    grade: String(edu.GPA || ''),
                    description: (Array.isArray(edu.Elaboration) && edu.Elaboration.length > 0) ? edu.Elaboration[0].Text : ''
                }));
                setEducations(mappedEducationsForForm);
            } else {
                setEducations([JSON.parse(JSON.stringify(initialEducationEntry))]);
            }

            if (location.state?.completedSteps) setCompletedSteps(location.state.completedSteps);
            setIsPageDataLoading(false);
        };
        loadPageData();
    }, [location.state, navigate]);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        setEducations(prevEducations => {
            const newList = JSON.parse(JSON.stringify(prevEducations));
            newList[index][name] = value;
            return newList;
        });
    };

    const addEducation = () => setEducations([...educations, JSON.parse(JSON.stringify(initialEducationEntry))]);
    const removeEducation = (index) => {
        setEducations(prev => prev.length === 1 ? [JSON.parse(JSON.stringify(initialEducationEntry))] : prev.filter((_, i) => i !== index));
    };

    const mapEducationsToPascalCaseArray = useCallback((formEducations) => {
        return formEducations
            .map(edu => mapEducationItemToPascalCase(edu))
            .filter(edu => edu.School && edu.DegreeLevel && edu.Major && edu.StartDate?.Month && edu.StartDate?.Year);
    }, []);

    const generatePreviewHtml = useCallback(() => {
        if (!baseRawTemplate) return "<p class='p-4 text-center text-orange-500'>Template loading...</p>";
        if (!currentFullResumeData?.PersonalDetails || !currentFullResumeData.id) return "<p>Basic data not ready.</p>";

        const educationsPascal = mapEducationsToPascalCaseArray(educations);
        const resumeDataForLocalPreview = {
            PersonalDetails: currentFullResumeData.PersonalDetails || {},
            ProfessionalExperience: currentFullResumeData.ProfessionalExperience || null,
            Education: educationsPascal.length > 0 ? educationsPascal : null,
            LeadershipExperience: currentFullResumeData.LeadershipExperience || null,
            Others: currentFullResumeData.Others || null,
        };
        try {
            return GoHTMLTemplater.render(baseRawTemplate, resumeDataForLocalPreview);
        } catch (error) { console.error("Error preview (Education):", error); return "<p>Error generating preview.</p>"; }
    }, [baseRawTemplate, currentFullResumeData, educations, mapEducationsToPascalCaseArray]);

    useEffect(() => {
        if (baseRawTemplate && currentFullResumeData?.id) {
            setPreviewHtml(generatePreviewHtml());
        }
    }, [educations, currentFullResumeData, baseRawTemplate, generatePreviewHtml]);

    const handleTogglePreviewModal = () => {
        setPreviewHtml(generatePreviewHtml());
        setShowPreviewModal(prev => !prev);
    };

    const handleSaveAndNext = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');
        if (!token || !currentFullResumeData?.id) { /* ... */ navigate('/login'); setIsSaving(false); return; }

        let updatedDataForApi = JSON.parse(JSON.stringify(currentFullResumeData));
        updatedDataForApi.Education = mapEducationsToPascalCaseArray(educations); // Use PascalCase key
        
        // Ensure other top-level section keys are also PascalCase
        for (const key of ['personalDetails', 'professionalExperience', 'leadershipExperience', 'others']) {
            if (updatedDataForApi[key]) {
                updatedDataForApi[capitalizeFirstLetter(key)] = updatedDataForApi[key];
                if (key !== capitalizeFirstLetter(key)) delete updatedDataForApi[key];
            }
        }

        try {
            const { id, name, ...payloadForPut } = updatedDataForApi;
            const putResponse = await fetch(`${apiBaseUrl}/resume/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(payloadForPut)
            });
            if (putResponse.status === 401) throw new Error("Authentication failed (PUT)");
            if (!putResponse.ok || putResponse.status !== 204) {
                const errorTextPut = await putResponse.text().catch(()=>`Error PUT (Status: ${putResponse.status})`);
                throw new Error(`Failed to save Education (Status: ${putResponse.status}): ${errorTextPut}`);
            }
            setCurrentFullResumeData(updatedDataForApi);
            const newCompletedSteps = completedSteps.includes("education") ? completedSteps : [...completedSteps, "education"];
            setCompletedSteps(newCompletedSteps);
            navigate('/resume/organisation', { state: { resumeData: updatedDataForApi, isNew: false, completedSteps: newCompletedSteps } });
        } catch (error) { console.error("Error Save & Next (Education):", error); alert(`Error: ${error.message}`);
            if (error.message.includes("Authentication failed")) navigate('/login');
        } finally { setIsSaving(false); }
    };

    const handleBack = () => {
        let dataToPassBack = JSON.parse(JSON.stringify(currentFullResumeData));
        dataToPassBack.Education = mapEducationsToPascalCaseArray(educations); // Use PascalCase key
        navigate('/resume/experience', { state: { resumeData: dataToPassBack, isNew: false, completedSteps } });
    };

    const handleDownload = async () => {
        if (!baseRawTemplate || !currentFullResumeData?.PersonalDetails) { alert("Template or basic data not loaded."); return; }
        if (isDownloadingPdf) return;
        setIsDownloadingPdf(true);

        try {
            const educationsPascal = mapEducationsToPascalCaseArray(educations);
            const dataForPdf = {
                ...JSON.parse(JSON.stringify(currentFullResumeData)),
                Education: educationsPascal, // Override with current form's education data
            };
            // Ensure all top-level section keys are PascalCase for the templater
            for (const key of ['personalDetails', 'professionalExperience', 'leadershipExperience', 'others']) {
                if (dataForPdf[key] && !dataForPdf[capitalizeFirstLetter(key)]) {
                    dataForPdf[capitalizeFirstLetter(key)] = dataForPdf[key];
                    if (key !== capitalizeFirstLetter(key)) delete dataForPdf[key];
                }
            }

            const completeHtmlForPdf = GoHTMLTemplater.render(baseRawTemplate, dataForPdf);
            if (!completeHtmlForPdf || completeHtmlForPdf.includes("Error") || completeHtmlForPdf.includes("tidak ditemukan")) {
                alert("Could not generate valid content for PDF."); setIsDownloadingPdf(false); return;
            }

            const printArea = document.createElement('div');
            printArea.id = 'print-area-edu-temp';
            printArea.style.width = '595.28px'; printArea.style.position = 'absolute';
            printArea.style.left = '-9999px'; printArea.style.top = '0px';
            printArea.style.backgroundColor = 'white';
            printArea.innerHTML = completeHtmlForPdf;
            document.body.appendChild(printArea);
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(printArea, { scale: 2, useCORS: true, logging: false, width: printArea.scrollWidth, height: printArea.scrollHeight, windowWidth: printArea.scrollWidth, windowHeight: printArea.scrollHeight });
            document.body.removeChild(printArea);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            
            let fileName = (dataForPdf.PersonalDetails?.FullName || currentFullResumeData.name || "resume") + "_CV.pdf";
            fileName = fileName.replace(/[^a-z0-9_.-]/gi, '_');
            pdf.save(fileName);

        } catch (error) { console.error("Error PDF download (Education):", error); alert(`Error generating PDF: ${error.message}`);
        } finally { setIsDownloadingPdf(false); }
    };

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => ({value: m, label: m}));
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 70}, (_, i) => currentYear - i).map(y => ({value: String(y), label: String(y)}));

    if (isPageDataLoading || !currentFullResumeData?.id) { return ( <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div><p className="mt-3 Poppins">Loading...</p></div> ); }

    return (
        <ResumeFormLayout
            currentStepId="education" completedSteps={completedSteps}
            onBack={handleBack} onSaveAndNext={isSaving || isDownloadingPdf ? undefined : handleSaveAndNext}
            onPreview={isSaving || isDownloadingPdf ? undefined : handleTogglePreviewModal}
            onDownload={handleDownload} isSaving={isSaving} isDownloadingPdf={isDownloadingPdf}
            formTitle="Education Level" formSubtitle="Start with your most recent education" >
            {isSaving && ( <div className="fixed top-0 left-0 right-0 pt-2 px-4 z-[9999] mx-auto max-w-md"> <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-md text-sm text-center shadow-lg"> Saving data... </div> </div> )}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAndNext(); }} className={`space-y-1 ${isSaving ? 'opacity-50 pointer-events-none pt-12' : ''}`}>
                {educations.map((edu, index) => (
                    <div key={index} className={`mb-6 p-4 border border-gray-300 rounded-lg shadow-sm relative ${isSaving ? 'bg-gray-50' : 'bg-white'}`}>
                        {educations.length > 0 && (
                             <button type="button" onClick={() => removeEducation(index)} disabled={isSaving} className="absolute top-3 right-3 text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded-full hover:bg-red-100" title="Remove this education" >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                             </button>
                        )}
                        <h3 className="text-lg font-semibold text-gray-700 Poppins mb-3 border-b pb-2">Education #{index + 1}</h3>
                        <InputField label="School" name="school" value={edu.school} onChange={(e) => handleChange(index, e)} placeholder="e.g. Harvard University" required disabled={isSaving} />
                        <InputField label="Degree" name="degree" value={edu.degree} onChange={(e) => handleChange(index, e)} placeholder="e.g. Bachelor's, Master's" required disabled={isSaving} />
                        <InputField label="Field of Study" name="fieldOfStudy" value={edu.fieldOfStudy} onChange={(e) => handleChange(index, e)} placeholder="e.g. Computer Science" required disabled={isSaving} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <SelectField label="Start Month" name="startDateMonth" value={edu.startDateMonth} onChange={(e) => handleChange(index, e)} options={months} required disabled={isSaving} />
                            <SelectField label="Start Year" name="startDateYear" value={edu.startDateYear} onChange={(e) => handleChange(index, e)} options={years} required disabled={isSaving} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mt-4">
                            <SelectField label="End Month" name="endDateMonth" value={edu.endDateMonth} onChange={(e) => handleChange(index, e)} options={months} required disabled={isSaving} />
                            <SelectField label="End Year" name="endDateYear" value={edu.endDateYear} onChange={(e) => handleChange(index, e)} options={years} required disabled={isSaving} />
                        </div>
                        <InputField label="Grade" name="grade" type="text" value={edu.grade} onChange={(e) => handleChange(index, e)} placeholder="e.g. 3.8 or 85%" disabled={isSaving} />
                        <TextAreaField label="Description (Optional)" name="description" value={edu.description} onChange={(e) => handleChange(index, e)} placeholder="e.g. Relevant coursework, thesis, honors" rows={3} disabled={isSaving} />
                    </div>
                ))}
                <button type="button" onClick={addEducation} disabled={isSaving} className="w-full flex items-center justify-center py-2.5 px-4 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-md text-sm font-medium text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#2859A6] mt-6 disabled:opacity-50" >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Another Education
                </button>
            </form>

            {showPreviewModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9998] p-4" onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}}> <div ref={pdfPreviewRef} className="bg-white p-1 sm:p-2 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}> <div className="flex justify-between items-center p-2 sm:p-3 border-b"> <h3 className="text-base sm:text-lg font-semibold Poppins">Resume Preview (Current Data)</h3> <button onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}} className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none" aria-label="Close preview">&times;</button> </div> <div id="pdf-content-to-download-modal-edu" className="overflow-auto flex-grow p-1 sm:p-2 bg-gray-50 flex justify-center"> <div className="mx-auto shadow-lg" style={{width: '595.28px', minHeight: '841.89px', transform: 'scale(0.70)', transformOrigin: 'top center', border: '1px solid #ccc', backgroundColor: '#fff', boxSizing: 'content-box'}} dangerouslySetInnerHTML={{ __html: previewHtml }} /> </div> <div className="p-2 sm:p-3 border-t text-right"> <button onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md Poppins text-sm">Close</button> </div> </div> </div> )}
        </ResumeFormLayout>
    );
};

export default EducationPage;