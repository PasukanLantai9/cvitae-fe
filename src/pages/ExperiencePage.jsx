// src/pages/ExperiencePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResumeFormLayout from '../components/ResumeFormLayout';
import GoHTMLTemplater from '../utils/GoHTMLTemplater';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = false, autoComplete, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5"> {label} </label> <input type={type} name={name} id={name} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete} disabled={disabled} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" /> </div> );
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3, required = false, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5"> {label} </label> <textarea name={name} id={name} rows={rows} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins placeholder-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed" /> </div> );
const SelectField = ({ label, name, value, onChange, options, required = false, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5">{label}</label> <select name={name} id={name} value={value || ''} onChange={onChange} required={required} disabled={disabled} className="mt-1 block w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins transition-all disabled:opacity-50 disabled:cursor-not-allowed" > <option value="">Select...</option> {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> </div> );
const CheckboxField = ({ label, name, checked, onChange, disabled = false }) => ( <div className="mb-4 flex items-center"> <input type="checkbox" name={name} id={name} checked={checked || false} onChange={onChange} disabled={disabled} className="h-4 w-4 text-[#2859A6] border-gray-300 rounded focus:ring-[#2859A6] disabled:opacity-50 disabled:cursor-not-allowed" /> <label htmlFor={name} className="ml-2 block text-sm text-gray-700 Poppins"> {label} </label> </div> );

const initialExperienceEntry = {
    jobTitle: '', companyName: '', companyLocation: '', current: false,
    startDateMonth: '', startDateYear: '', endDateMonth: '', endDateYear: '', description: ''
};

const fallbackFullResumeStructure = {
    id: null, name: `My CV ${new Date().toLocaleTimeString()}`,
    PersonalDetails: {},
    ProfessionalExperience: [],
    Education: [],
    LeadershipExperience: [],
    Others: []
};

const ExperiencePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [experiences, setExperiences] = useState([JSON.parse(JSON.stringify(initialExperienceEntry))]);
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

    const mapExperienceToPascalCaseItem = (expFormItem) => ({
        RoleTitle: expFormItem.jobTitle,
        CompanyName: expFormItem.companyName,
        Location: expFormItem.companyLocation,
        Current: expFormItem.current || false,
        StartDate: (expFormItem.startDateMonth && expFormItem.startDateYear) ? {
            Month: expFormItem.startDateMonth,
            Year: parseInt(expFormItem.startDateYear, 10)
        } : {},
        EndDate: (!expFormItem.current && expFormItem.endDateMonth && expFormItem.endDateYear) ? {
            Month: expFormItem.endDateMonth,
            Year: parseInt(expFormItem.endDateYear, 10)
        } : {},
        Elaboration: expFormItem.description && expFormItem.description.trim() !== '' ? [{ Text: expFormItem.description.trim() }] : []
    });

    const mapExperiencesToPascalCaseArray = useCallback((formExperiences) => {
        return formExperiences
            .map(exp => mapExperienceToPascalCaseItem(exp))
            .filter(exp => exp.RoleTitle && exp.CompanyName && exp.StartDate?.Month && exp.StartDate?.Year);
    }, []);

    useEffect(() => {
        const loadPageData = async () => {
            setIsPageDataLoading(true);
            let dataFromNav = location.state?.resumeData;

            if (!dataFromNav || Object.keys(dataFromNav).length === 0 || !dataFromNav.id) {
                alert("Sesi data resume tidak valid. Anda akan diarahkan ke halaman awal.");
                navigate('/resume/personal', { replace: true, state: { isNew: true, resumeData: JSON.parse(JSON.stringify(fallbackFullResumeStructure)), completedSteps: [] } });
                setIsPageDataLoading(false);
                return;
            }
            
            if (JSON.stringify(dataFromNav) !== JSON.stringify(currentFullResumeData)) {
                setCurrentFullResumeData(JSON.parse(JSON.stringify(dataFromNav)));
            }

            try {
                const templateRes = await fetch('/resume_template.gohtml');
                if (templateRes.ok) setBaseRawTemplate(await templateRes.text());
            } catch (error) { console.error("ExperiencePage: Error fetch /resume_template.gohtml:", error); }

            const existingExperiences = dataFromNav.ProfessionalExperience || dataFromNav.professionalExperience;
            if (Array.isArray(existingExperiences) && existingExperiences.length > 0) {
                const mappedExperiencesForForm = existingExperiences.map(exp => ({
                    jobTitle: exp.RoleTitle || '',
                    companyName: exp.CompanyName || '',
                    companyLocation: exp.Location || '',
                    current: exp.Current || false,
                    startDateMonth: exp.StartDate?.Month || '', startDateYear: String(exp.StartDate?.Year || ''),
                    endDateMonth: exp.EndDate?.Month || '', endDateYear: String(exp.EndDate?.Year || ''),
                    description: (Array.isArray(exp.Elaboration) && exp.Elaboration.length > 0) ? exp.Elaboration[0].Text : ''
                }));
                setExperiences(mappedExperiencesForForm);
            } else {
                setExperiences([JSON.parse(JSON.stringify(initialExperienceEntry))]);
            }

            if (location.state?.completedSteps) {
                setCompletedSteps(location.state.completedSteps);
            }
            setIsPageDataLoading(false);
        };
        loadPageData();
    }, [location.state, navigate]);

    const handleChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        setExperiences(prevExperiences => {
            const newList = JSON.parse(JSON.stringify(prevExperiences));
            newList[index][name] = type === 'checkbox' ? checked : value;
            if (name === "current" && checked) {
                newList[index].endDateMonth = "";
                newList[index].endDateYear = "";
            }
            return newList;
        });
    };

    const addExperience = () => setExperiences([...experiences, JSON.parse(JSON.stringify(initialExperienceEntry))]);

    const removeExperience = (index) => {
        setExperiences(prev => prev.length === 1 ? [JSON.parse(JSON.stringify(initialExperienceEntry))] : prev.filter((_, i) => i !== index));
    };

    const generatePreviewHtml = useCallback(() => {
        if (!baseRawTemplate) return "<p class='p-4 text-center text-orange-500'>Template preview loading...</p>";
        if (!currentFullResumeData || !currentFullResumeData.PersonalDetails || !currentFullResumeData.id) {
            return "<p class='p-4 text-center text-orange-500'>Basic resume data not ready for preview.</p>";
        }

        const professionalExperiencePascal = mapExperiencesToPascalCaseArray(experiences);
        
        const resumeDataForLocalPreview = {
            PersonalDetails: currentFullResumeData.PersonalDetails || {},
            ProfessionalExperience: professionalExperiencePascal.length > 0 ? professionalExperiencePascal : null,
            Education: currentFullResumeData.Education || currentFullResumeData.education || null,
            LeadershipExperience: currentFullResumeData.LeadershipExperience || currentFullResumeData.leadershipExperience || null,
            Others: currentFullResumeData.Others || currentFullResumeData.others || null,
        };
        // Ensure top-level section keys are PascalCase
        for (const key of ['personalDetails', 'professionalExperience', 'education', 'leadershipExperience', 'others']) {
            if (resumeDataForLocalPreview[key] && !resumeDataForLocalPreview[capitalizeFirstLetter(key)]) {
                resumeDataForLocalPreview[capitalizeFirstLetter(key)] = resumeDataForLocalPreview[key];
                if(key !== capitalizeFirstLetter(key)) delete resumeDataForLocalPreview[key];
            }
        }

        try {
            return GoHTMLTemplater.render(baseRawTemplate, resumeDataForLocalPreview);
        } catch (error) {
            console.error("Error preview generation (Experience):", error);
            return "<p class='text-red-500 p-4 text-center'>Error generating preview.</p>";
        }
    }, [baseRawTemplate, currentFullResumeData, experiences, mapExperiencesToPascalCaseArray]);

    useEffect(() => {
        if (baseRawTemplate && currentFullResumeData?.id) {
            setPreviewHtml(generatePreviewHtml());
        }
    }, [experiences, currentFullResumeData, baseRawTemplate, generatePreviewHtml]);

    const handleTogglePreviewModal = () => {
        setPreviewHtml(generatePreviewHtml());
        setShowPreviewModal(prev => !prev);
    };

    const handleSaveAndNext = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');
        if (!token || !currentFullResumeData?.id) {
            alert("Resume data/ID or token not found."); setIsSaving(false);
            if (!token) navigate('/login');
            else navigate('/resume/personal', { state: { resumeData: currentFullResumeData, isNew: !currentFullResumeData?.id, completedSteps }});
            return;
        }

        const resumeIdToUse = currentFullResumeData.id;
        let updatedDataForApi = JSON.parse(JSON.stringify(currentFullResumeData));
        
        updatedDataForApi.ProfessionalExperience = mapExperiencesToPascalCaseArray(experiences);
        
        for (const key of ['personalDetails', 'education', 'leadershipExperience', 'others']) {
            if (updatedDataForApi[key]) {
                const pascalKey = capitalizeFirstLetter(key);
                if (!updatedDataForApi[pascalKey]) { // Check if PascalCase version doesn't exist already
                    updatedDataForApi[pascalKey] = updatedDataForApi[key];
                }
                if (key !== pascalKey) delete updatedDataForApi[key];
            }
        }
        
        try {
            const { id, name, ...payloadForPut } = updatedDataForApi;
            const putResponse = await fetch(`${apiBaseUrl}/resume/${resumeIdToUse}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(payloadForPut)
            });
            if (putResponse.status === 401) throw new Error("Authentication failed (PUT)");
            if (!putResponse.ok || putResponse.status !== 204) {
                const errorTextPut = await putResponse.text().catch(()=>`Error PUT (Status: ${putResponse.status})`);
                throw new Error(`Failed to save Experience (Status: ${putResponse.status}): ${errorTextPut}`);
            }
            setCurrentFullResumeData(updatedDataForApi);
            const newCompletedSteps = completedSteps.includes("experience") ? completedSteps : [...completedSteps, "experience"];
            setCompletedSteps(newCompletedSteps);
            navigate('/resume/education', { state: { resumeData: updatedDataForApi, isNew: false, completedSteps: newCompletedSteps } });
        } catch (error) {
            console.error("Error Save & Next (Experience):", error); alert(`An error occurred: ${error.message}`);
            if (error.message.includes("Authentication failed")) navigate('/login');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        let dataToPassBack = JSON.parse(JSON.stringify(currentFullResumeData));
        dataToPassBack.ProfessionalExperience = mapExperiencesToPascalCaseArray(experiences);
        // Ensure other sections keys are also PascalCase before passing back
         for (const key of ['personalDetails', 'education', 'leadershipExperience', 'others']) {
            if (dataToPassBack[key]) {
                 const pascalKey = capitalizeFirstLetter(key);
                if (!dataToPassBack[pascalKey]) {
                    dataToPassBack[pascalKey] = dataToPassBack[key];
                }
                if (key !== pascalKey) delete dataToPassBack[key];
            }
        }
        navigate('/resume/personal', { state: { resumeData: dataToPassBack, isNew: false, completedSteps } });
    };

    const handleDownload = async () => {
        if (!baseRawTemplate) { alert("Template not loaded."); return; }
        if (isDownloadingPdf) return;
        setIsDownloadingPdf(true);

        try {
            const professionalExperiencePascal = mapExperiencesToPascalCaseArray(experiences);
            let dataForPdf = {
                ...JSON.parse(JSON.stringify(currentFullResumeData)),
                ProfessionalExperience: professionalExperiencePascal,
            };

            for (const key of ['personalDetails', 'education', 'leadershipExperience', 'others']) {
                 const pascalKey = capitalizeFirstLetter(key);
                if (dataForPdf[key] && !dataForPdf[pascalKey]) {
                    dataForPdf[pascalKey] = dataForPdf[key];
                     if (key !== pascalKey) delete dataForPdf[key];
                } else if (dataForPdf[key] && dataForPdf[pascalKey] && key !== pascalKey) {
                    // If both camelCase and PascalCase exist, prefer PascalCase and remove camelCase
                    delete dataForPdf[key];
                }
                // Ensure items within other array sections are also PascalCased if they are not already.
                // This example assumes items in currentFullResumeData.Education etc. are already PascalCased.
                // If not, you'd need map...ToPascalCaseArray for each section here.
            }
            // Ensure PersonalDetails exists and is an object, even if empty
            dataForPdf.PersonalDetails = dataForPdf.PersonalDetails || {};


            const completeHtmlForPdf = GoHTMLTemplater.render(baseRawTemplate, dataForPdf);
            if (!completeHtmlForPdf || completeHtmlForPdf.includes("Error") || completeHtmlForPdf.includes("tidak ditemukan")) {
                alert("Could not generate valid content for PDF."); setIsDownloadingPdf(false); return;
            }

            const printArea = document.createElement('div');
            printArea.id = 'print-area-exp-temp';
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

        } catch (error) { console.error("Error PDF download (Experience):", error); alert(`Error generating PDF: ${error.message}`);
        } finally { setIsDownloadingPdf(false); }
    };

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => ({value: m, label: m}));
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 70}, (_, i) => currentYear - i).map(y => ({value: String(y), label: String(y)}));

    if (isPageDataLoading || !currentFullResumeData?.id) { return ( <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100"> <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div> <p className="mt-3 text-gray-500 Poppins">Loading Experience Editor...</p> </div> );}

    return (
        <ResumeFormLayout
            currentStepId="experience" completedSteps={completedSteps}
            onBack={handleBack} onSaveAndNext={isSaving || isDownloadingPdf ? undefined : handleSaveAndNext}
            onPreview={isSaving || isDownloadingPdf ? undefined : handleTogglePreviewModal}
            onDownload={handleDownload} isSaving={isSaving} isDownloadingPdf={isDownloadingPdf}
            formTitle="Add Your Experience" formSubtitle="Start with your most recent experiences" >
            {isSaving && ( <div className="fixed top-0 left-0 right-0 pt-2 px-4 z-[9999] mx-auto max-w-md"> <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-md text-sm text-center shadow-lg"> Saving data... Please wait. </div> </div> )}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAndNext(); }} className={`space-y-1 ${isSaving ? 'opacity-50 pointer-events-none pt-12' : ''}`}>
                {experiences.map((exp, index) => (
                    <div key={index} className={`mb-6 p-4 border border-gray-300 rounded-lg shadow-sm relative ${isSaving ? 'bg-gray-50' : 'bg-white'}`}>
                        {experiences.length > 0 && (
                             <button type="button" onClick={() => removeExperience(index)} disabled={isSaving} className="absolute top-3 right-3 text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded-full hover:bg-red-100" title="Remove this experience" >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                             </button>
                        )}
                        <h3 className="text-lg font-semibold text-gray-700 Poppins mb-3 border-b pb-2">Experience #{index + 1}</h3>
                        <InputField label="Job / Role Title" name="jobTitle" value={exp.jobTitle} onChange={(e) => handleChange(index, e)} placeholder="e.g. Software Engineer" required disabled={isSaving} />
                        <InputField label="Company Name" name="companyName" value={exp.companyName} onChange={(e) => handleChange(index, e)} placeholder="e.g. Google" required disabled={isSaving} />
                        <InputField label="Company Location" name="companyLocation" value={exp.companyLocation} onChange={(e) => handleChange(index, e)} placeholder="e.g. Mountain View, CA" disabled={isSaving} />
                        <CheckboxField label="Currently working on this role" name="current" checked={exp.current} onChange={(e) => handleChange(index, e)} disabled={isSaving} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <SelectField label="Start Month" name="startDateMonth" value={exp.startDateMonth} onChange={(e) => handleChange(index, e)} options={months} required disabled={isSaving} />
                            <SelectField label="Start Year" name="startDateYear" value={exp.startDateYear} onChange={(e) => handleChange(index, e)} options={years} required disabled={isSaving} />
                        </div>
                        {!exp.current && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mt-4">
                                <SelectField label="End Month" name="endDateMonth" value={exp.endDateMonth} onChange={(e) => handleChange(index, e)} options={months} required={!exp.current} disabled={isSaving} />
                                <SelectField label="End Year" name="endDateYear" value={exp.endDateYear} onChange={(e) => handleChange(index, e)} options={years} required={!exp.current} disabled={isSaving} />
                            </div>
                        )}
                        <TextAreaField label="Description (Job Elaboration)" name="description" value={exp.description} onChange={(e) => handleChange(index, e)} placeholder="Describe your key responsibilities and achievements. Use bullet points if possible." rows={4} disabled={isSaving} />
                    </div>
                ))}
                <button type="button" onClick={addExperience} disabled={isSaving} className="w-full flex items-center justify-center py-2.5 px-4 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-md text-sm font-medium text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#2859A6] mt-6 disabled:opacity-50" >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Another Experience
                </button>
            </form>

            {showPreviewModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9998] p-4" 
                    onClick={() => { if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false); }}
                >
                    <div 
                        ref={pdfPreviewRef}
                        className="bg-white p-1 sm:p-2 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-2 sm:p-3 border-b">
                            <h3 className="text-base sm:text-lg font-semibold Poppins">
                                Resume Preview (Realtime Data) 
                            </h3>
                            <button 
                                onClick={() => { if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false); }} 
                                className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none" 
                                aria-label="Close preview"
                                disabled={isSaving || isDownloadingPdf}
                            >
                                &times;
                            </button>
                        </div>
                        <div 
                            id="pdf-content-to-download-modal-exp" // Unique ID for this page's modal
                            className="overflow-auto flex-grow p-1 sm:p-2 bg-gray-50 flex justify-center"
                        >
                            <div
                                className="mx-auto shadow-lg"
                                style={{
                                    width: '595.28px', 
                                    minHeight: '841.89px', 
                                    transform: 'scale(0.70)', 
                                    transformOrigin: 'top center',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                    boxSizing: 'content-box',
                                }}
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>
                        <div className="p-2 sm:p-3 border-t text-right">
                            <button 
                                onClick={() => { if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false); }} 
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md Poppins text-sm"
                                disabled={isSaving || isDownloadingPdf}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ResumeFormLayout>
    );
};

export default ExperiencePage;