import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResumeFormLayout from '../components/ResumeFormLayout';
import GoHTMLTemplater from '../utils/GoHTMLTemplater';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = false, autoComplete, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5"> {label} </label> <input type={type} name={name} id={name} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete} disabled={disabled} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" /> </div> );
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3, required = false, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5"> {label} </label> <textarea name={name} id={name} rows={rows} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins placeholder-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed" /> </div> );
const SelectField = ({ label, name, value, onChange, options, required = false, disabled = false }) => ( <div className="mb-4"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5">{label}</label> <select name={name} id={name} value={value || ''} onChange={onChange} required={required} disabled={disabled} className="mt-1 block w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins transition-all disabled:opacity-50 disabled:cursor-not-allowed" > <option value="">Select...</option> {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> </div> );

const initialOtherEntry = {
    category: '', positionHeld: '', dateMonth: '', dateYear: '', description: ''
};

const fallbackFullResumeStructure = {
    id: null, name: `My CV ${new Date().toLocaleTimeString()}`,
    PersonalDetails: {}, ProfessionalExperience: [], Education: [],
    LeadershipExperience: [], Others: []
};

const SkillsAchievementsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [otherEntries, setOtherEntries] = useState([JSON.parse(JSON.stringify(initialOtherEntry))]);
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

    const mapOtherItemToPascalCase = (entryFormItem) => {
        const pascalItem = {};
        if (entryFormItem.category) pascalItem.Category = entryFormItem.category;
        if (entryFormItem.positionHeld) pascalItem.Title = entryFormItem.positionHeld; // Template uses Title for this section
        
        if (entryFormItem.dateMonth && entryFormItem.dateYear) {
            pascalItem.Date = { Month: entryFormItem.dateMonth, Year: parseInt(entryFormItem.dateYear, 10) };
        } else if (entryFormItem.dateYear) { // Allow year only
             pascalItem.Date = { Year: parseInt(entryFormItem.dateYear, 10) };
        }


        if (entryFormItem.description && entryFormItem.description.trim() !== '') {
            pascalItem.Elaboration = [{ Text: entryFormItem.description.trim() }];
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
            } catch (error) { console.error("SkillsAchievementsPage: Error fetch /resume_template.gohtml:", error); }

            const existingEntries = dataFromNav.Others || dataFromNav.others; // Check for PascalCase first
            if (Array.isArray(existingEntries) && existingEntries.length > 0) {
                const mappedEntriesForForm = existingEntries.map(entry => ({ // entry has PascalCase keys
                    category: entry.Category || '',
                    positionHeld: entry.Title || '', // Template uses Title
                    dateMonth: entry.Date?.Month || '', 
                    dateYear: String(entry.Date?.Year || ''),
                    description: (Array.isArray(entry.Elaboration) && entry.Elaboration.length > 0) ? entry.Elaboration[0].Text : ''
                }));
                setOtherEntries(mappedEntriesForForm);
            } else {
                setOtherEntries([JSON.parse(JSON.stringify(initialOtherEntry))]);
            }

            if (location.state?.completedSteps) setCompletedSteps(location.state.completedSteps);
            setIsPageDataLoading(false);
        };
        loadPageData();
    }, [location.state, navigate]);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        setOtherEntries(prev => {
            const newList = JSON.parse(JSON.stringify(prev));
            newList[index][name] = value;
            return newList;
        });
    };

    const addEntry = () => setOtherEntries([...otherEntries, JSON.parse(JSON.stringify(initialOtherEntry))]);
    const removeEntry = (index) => {
        setOtherEntries(prev => prev.length === 1 ? [JSON.parse(JSON.stringify(initialOtherEntry))] : prev.filter((_, i) => i !== index));
    };

    const mapSkillsAchievementsToPascalCaseArray = useCallback((formEntries) => {
        return formEntries
            .map(entry => mapOtherItemToPascalCase(entry))
            .filter(entry => entry.Category && entry.Elaboration && entry.Elaboration.length > 0 && entry.Elaboration[0].Text.trim() !== '');
    }, []);

    const generatePreviewHtml = useCallback(() => {
        if (!baseRawTemplate) return "<p>Template loading...</p>";
        if (!currentFullResumeData?.PersonalDetails || !currentFullResumeData.id) return "<p>Basic data not ready.</p>";

        const othersPascal = mapSkillsAchievementsToPascalCaseArray(otherEntries);
        const resumeDataForLocalPreview = {
            PersonalDetails: currentFullResumeData.PersonalDetails || {},
            ProfessionalExperience: currentFullResumeData.ProfessionalExperience || null,
            Education: currentFullResumeData.Education || null,
            LeadershipExperience: currentFullResumeData.LeadershipExperience || null,
            Others: othersPascal.length > 0 ? othersPascal : null,
        };
        try {
            return GoHTMLTemplater.render(baseRawTemplate, resumeDataForLocalPreview);
        } catch (error) { console.error("Error preview (Skills):", error); return "<p>Error generating preview.</p>";}
    }, [baseRawTemplate, currentFullResumeData, otherEntries, mapSkillsAchievementsToPascalCaseArray]);

    useEffect(() => {
        if (baseRawTemplate && currentFullResumeData?.id) {
            setPreviewHtml(generatePreviewHtml());
        }
    }, [otherEntries, currentFullResumeData, baseRawTemplate, generatePreviewHtml]);

    const handleTogglePreviewModal = () => {
        setPreviewHtml(generatePreviewHtml());
        setShowPreviewModal(prev => !prev);
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');
        if (!token || !currentFullResumeData?.id) { navigate('/login'); setIsSaving(false); return; }

        let updatedDataForApi = JSON.parse(JSON.stringify(currentFullResumeData));
        updatedDataForApi.Others = mapSkillsAchievementsToPascalCaseArray(otherEntries); // Use PascalCase key

        for (const key of ['personalDetails', 'professionalExperience', 'education', 'leadershipExperience']) {
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
                throw new Error(`Failed to save (Status: ${putResponse.status}): ${errorTextPut}`);
            }
            setCurrentFullResumeData(updatedDataForApi);
            const newCompletedSteps = completedSteps.includes("skills_achievements") ? completedSteps : [...completedSteps, "skills_achievements"];
            setCompletedSteps(newCompletedSteps);
            localStorage.setItem('completedResumeSteps', JSON.stringify(newCompletedSteps));
            
            alert("Resume saved successfully! You will be redirected to the dashboard.");
            navigate('/dashboard');
        } catch (error) { console.error("Error Save (Skills):", error); alert(`Error: ${error.message}`);
            if (error.message.includes("Authentication failed")) navigate('/login');
        } finally { setIsSaving(false); }
    };

    const handleBack = () => {
        let dataToPassBack = JSON.parse(JSON.stringify(currentFullResumeData));
        dataToPassBack.Others = mapSkillsAchievementsToPascalCaseArray(otherEntries); // Use PascalCase key
        navigate('/resume/organisation', { state: { resumeData: dataToPassBack, isNew: false, completedSteps } });
    };
    
    const handleDownload = async () => {
        if (!baseRawTemplate || !currentFullResumeData?.PersonalDetails) { alert("Template or basic data not loaded."); return; }
        if (isDownloadingPdf) return;
        setIsDownloadingPdf(true);

        try {
            const othersPascal = mapSkillsAchievementsToPascalCaseArray(otherEntries);
            const dataForPdf = {
                ...JSON.parse(JSON.stringify(currentFullResumeData)),
                Others: othersPascal,
            };
            for (const key of ['personalDetails', 'professionalExperience', 'education', 'leadershipExperience']) {
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
            printArea.id = 'print-area-skills-temp';
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

        } catch (error) { console.error("Error PDF download (Skills):", error); alert(`Error generating PDF: ${error.message}`);
        } finally { setIsDownloadingPdf(false); }
    };

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => ({value: m, label: m}));
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 70}, (_, i) => currentYear - i).map(y => ({value: String(y), label: String(y)}));

    if (isPageDataLoading || !currentFullResumeData?.id) { return ( <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div><p className="mt-3 Poppins">Loading...</p></div> ); }

    return (
        <ResumeFormLayout
            currentStepId="skills_achievements" completedSteps={completedSteps}
            onBack={handleBack} onSave={isSaving || isDownloadingPdf ? undefined : handleSave}
            onPreview={isSaving || isDownloadingPdf ? undefined : handleTogglePreviewModal}
            onDownload={handleDownload} isSaving={isSaving} isDownloadingPdf={isDownloadingPdf}
            formTitle="Skills, Achievements, & Other Experience"
            formSubtitle="Add skills, achievements, and projects relevant to the job"
            isLastStep={true} >
            {isSaving && ( <div className="fixed top-0 left-0 right-0 pt-2 px-4 z-[9999] mx-auto max-w-md"> <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-md text-sm text-center shadow-lg"> Saving data... </div> </div> )}
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className={`space-y-1 ${isSaving ? 'opacity-50 pointer-events-none pt-12' : ''}`}>
                {otherEntries.map((entry, index) => (
                    <div key={index} className={`mb-6 p-4 border border-gray-300 rounded-lg shadow-sm relative ${isSaving ? 'bg-gray-50' : 'bg-white'}`}>
                        {otherEntries.length > 0 && (
                             <button type="button" onClick={() => removeEntry(index)} disabled={isSaving} className="absolute top-3 right-3 text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded-full hover:bg-red-100" title="Remove this entry" >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                             </button>
                        )}
                        <h3 className="text-lg font-semibold text-gray-700 Poppins mb-3 border-b pb-2">Entry #{index + 1}</h3>
                        <InputField label="Category Project/Skills/Achievements" name="category" value={entry.category} onChange={(e) => handleChange(index, e)} placeholder="e.g. Project, Skill, Publication" required disabled={isSaving} />
                        <InputField label="Title / Name (Optional)" name="positionHeld" value={entry.positionHeld} onChange={(e) => handleChange(index, e)} placeholder="e.g. Lead Developer, Fluent in Spanish" disabled={isSaving} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <SelectField label="Date Month (Optional)" name="dateMonth" value={entry.dateMonth} onChange={(e) => handleChange(index, e)} options={months} disabled={isSaving} />
                            <SelectField label="Date Year (Optional)" name="dateYear" value={entry.dateYear} onChange={(e) => handleChange(index, e)} options={years} disabled={isSaving} />
                        </div>
                        <TextAreaField label="Description" name="description" value={entry.description} onChange={(e) => handleChange(index, e)} placeholder="Describe the project, skill, or achievement." rows={4} required disabled={isSaving} />
                    </div>
                ))}
                <button type="button" onClick={addEntry} disabled={isSaving} className="w-full flex items-center justify-center py-2.5 px-4 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-md text-sm font-medium text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#2859A6] mt-6 disabled:opacity-50" >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Another Entry
                </button>
            </form>

            {showPreviewModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9998] p-4" onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}}> <div ref={pdfPreviewRef} className="bg-white p-1 sm:p-2 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}> <div className="flex justify-between items-center p-2 sm:p-3 border-b"> <h3 className="text-base sm:text-lg font-semibold Poppins">Resume Preview (Other Entries)</h3> <button onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}} className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none" aria-label="Close preview">&times;</button> </div> <div id="pdf-content-to-download-modal-skills" className="overflow-auto flex-grow p-1 sm:p-2 bg-gray-50 flex justify-center"> <div className="mx-auto shadow-lg" style={{width: '595.28px', minHeight: '841.89px', transform: 'scale(0.70)', transformOrigin: 'top center', border: '1px solid #ccc', backgroundColor: '#fff', boxSizing: 'content-box'}} dangerouslySetInnerHTML={{ __html: previewHtml }} /> </div> <div className="p-2 sm:p-3 border-t text-right"> <button onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md Poppins text-sm">Close</button> </div> </div> </div> )}
        </ResumeFormLayout>
    );
};

export default SkillsAchievementsPage;