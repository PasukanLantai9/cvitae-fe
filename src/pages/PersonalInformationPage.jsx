// src/pages/PersonalInformationPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResumeFormLayout from '../components/ResumeFormLayout';
import GoHTMLTemplater from '../utils/GoHTMLTemplater';
import jsPDF from 'jspdf'; //  Import jsPDF
import html2canvas from 'html2canvas'; // Import html2canvas

// --- Komponen Form Fields --- (Assuming these are defined or imported)
const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = false, autoComplete, disabled = false }) => ( <div className="mb-5"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5"> {label} </label> <input type={type} name={name} id={name} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete} disabled={disabled} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" /> </div> );
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 4, required = false, disabled = false }) => ( <div className="mb-5"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 Poppins mb-1.5"> {label} </label> <textarea name={name} id={name} rows={rows} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] text-sm Poppins placeholder-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed" /> </div> );
// --- End of FormField Components ---

const initialPersonalFormData = {
    fullName: '', phoneNumber: '', email: '',
    linkedin: '', description: '', portfolioUrl: '', addressString: '',
};

const fallbackFullResumeStructure = {
    id: null, name: `My CV ${new Date().toLocaleTimeString()}`,
    personalDetails: {}, // Will be populated with PascalCase keys
    professionalExperience: [], education: [], leadershipExperience: [], others: []
};

const PersonalInformationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    const [formData, setFormData] = useState(initialPersonalFormData); // Uses camelCase for form state
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
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false); // State for PDF download
    const pdfPreviewRef = useRef(null);

    const capitalizeFirstLetter = (string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const mapToPascalCase = (camelCaseData) => {
        const pascalCaseData = {};
        for (const key in camelCaseData) {
            if (Object.prototype.hasOwnProperty.call(camelCaseData, key) && camelCaseData[key] != null && String(camelCaseData[key]).trim() !== '') {
                let pascalKey = capitalizeFirstLetter(key);
                if (key === "portfolioUrl") pascalKey = "PortfolioURL";
                else if (key === "fullName") pascalKey = "FullName";
                else if (key === "phoneNumber") pascalKey = "PhoneNumber";
                else if (key === "email") pascalKey = "Email";
                else if (key === "linkedin") pascalKey = "Linkedin"; // Assuming template uses "Linkedin"
                else if (key === "description") pascalKey = "Description";
                else if (key === "addressString") pascalKey = "AddressString";
                pascalCaseData[pascalKey] = camelCaseData[key];
            }
        }
        return pascalCaseData;
    };

    useEffect(() => {
        const loadInitialPageData = async () => {
            setIsPageDataLoading(true);
            let resolvedResumeData = location.state?.resumeData ?
                JSON.parse(JSON.stringify(location.state.resumeData)) :
                JSON.parse(JSON.stringify(fallbackFullResumeStructure));
            
            const isNewFlow = location.state?.isNew === true;

            try {
                const templateRes = await fetch('/resume_template.gohtml');
                if (templateRes.ok) setBaseRawTemplate(await templateRes.text());
                else console.error("PersonalPage: Error loading template.gohtml");
            } catch (error) { console.error("PersonalPage: Error fetch template.gohtml:", error); }

            if (isNewFlow && resolvedResumeData.id === null) {
                setFormData(initialPersonalFormData);
                resolvedResumeData.name = resolvedResumeData.name || `My New CV ${new Date().toLocaleTimeString()}`;
                resolvedResumeData.personalDetails = mapToPascalCase(initialPersonalFormData);
            } else if (resolvedResumeData.personalDetails) {
                const pd = resolvedResumeData.personalDetails; // Assuming pd comes with PascalCase keys
                setFormData({
                    fullName: pd.FullName || '',
                    phoneNumber: pd.PhoneNumber || '',
                    email: pd.Email || '',
                    linkedin: pd.Linkedin || '',
                    description: pd.Description || '',
                    portfolioUrl: pd.PortfolioURL || pd.PortfolioUrl || '',
                    addressString: pd.AddressString || '',
                });
            } else {
                 setFormData(initialPersonalFormData);
                 resolvedResumeData.personalDetails = mapToPascalCase(initialPersonalFormData);
            }
            setCurrentFullResumeData(resolvedResumeData);
            if (location.state?.completedSteps) setCompletedSteps(location.state.completedSteps);
            setIsPageDataLoading(false);
        };
        loadInitialPageData();
    }, [location.state]); // location.state is the primary dependency

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generatePreviewHtml = useCallback(() => {
        if (!baseRawTemplate) return "<p class='p-4 text-center text-orange-500'>Template preview loading...</p>";
        const pdPreviewCapitalized = mapToPascalCase(formData);
        const dataForRender = { PersonalDetails: pdPreviewCapitalized };
        try {
            return GoHTMLTemplater.render(baseRawTemplate, dataForRender);
        } catch (error) { 
            console.error("Error rendering preview in PersonalInformationPage:", error);
            return "<p class='text-red-500 p-4 text-center'>Error generating preview. Check console.</p>"; 
        }
    }, [baseRawTemplate, formData, mapToPascalCase]); // Added mapToPascalCase to dependencies

    useEffect(() => {
        if (baseRawTemplate) {
            setPreviewHtml(generatePreviewHtml());
        }
    }, [formData, baseRawTemplate, generatePreviewHtml]);

    const handleTogglePreviewModal = () => {
        setPreviewHtml(generatePreviewHtml());
        setShowPreviewModal(prev => !prev);
    };

    const handleSaveAndNext = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');
        if (!token) { alert("Authentication token not found."); setIsSaving(false); navigate('/login'); return; }

        let resumeIdToUse = currentFullResumeData.id;
        let dataToSubmit = JSON.parse(JSON.stringify(currentFullResumeData));
        dataToSubmit.personalDetails = mapToPascalCase(formData);

        if (!dataToSubmit.name && formData.fullName) {
            dataToSubmit.name = `${formData.fullName}'s CV`;
        } else if (!dataToSubmit.name) {
            dataToSubmit.name = `My CV ${new Date().toLocaleDateString('en-CA')}`;
        }
        
        try {
            if (!resumeIdToUse) {
                const postPayload = { name: dataToSubmit.name };
                const postResponse = await fetch(`${apiBaseUrl}/resume`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify(postPayload)
                });
                const postData = await postResponse.json().catch(() => ({}));
                if (postResponse.status === 401) throw new Error(postData.errors?.message || "Authentication failed (POST)");
                if (!postResponse.ok || !postData.id) throw new Error(postData.errors?.message || postData.message || `Failed to create resume. ID missing.`);
                resumeIdToUse = postData.id;
                dataToSubmit.id = resumeIdToUse;
            }

            const { id, name, ...payloadForPut } = dataToSubmit; 
            const putResponse = await fetch(`${apiBaseUrl}/resume/${resumeIdToUse}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(payloadForPut) 
            });
            if (putResponse.status === 401) throw new Error("Authentication failed (PUT)");
            if (!putResponse.ok || putResponse.status !== 204) {
                const errorTextPut = await putResponse.text().catch(()=>`Error on PUT, status: ${putResponse.status}`);
                throw new Error(`Failed to save details (Status: ${putResponse.status}): ${errorTextPut.substring(0,200)}`);
            }
            
            if (location.state?.isNew === true) {
                dataToSubmit.professionalExperience = dataToSubmit.professionalExperience || [];
                dataToSubmit.education = dataToSubmit.education || [];
                dataToSubmit.leadershipExperience = dataToSubmit.leadershipExperience || [];
                dataToSubmit.others = dataToSubmit.others || [];
            }
            setCurrentFullResumeData(dataToSubmit); 

            const currentStepFormId = "personal";
            let newCompletedSteps = completedSteps.includes(currentStepFormId) ? completedSteps : [...completedSteps, currentStepFormId];
            setCompletedSteps(newCompletedSteps);
            
            navigate('/resume/experience', { state: { resumeData: dataToSubmit, isNew: false, completedSteps: newCompletedSteps } });
        } catch (error) {
            console.error("Error Save & Next (Personal):", error);
            alert(`An error occurred: ${error.message}`);
            if (error.message.includes("Authentication failed")) navigate('/login');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        const dataToPassBack = { ...currentFullResumeData, personalDetails: mapToPascalCase(formData) };
        navigate('/dashboard', { state: { resumeData: dataToPassBack, completedSteps } });
    };

    const handleDownload = async () => {
        if (!baseRawTemplate) {
            alert("Resume template is not loaded yet. Please wait.");
            return;
        }
        if (isDownloadingPdf) return; // Prevent multiple clicks
        setIsDownloadingPdf(true);

        try {
            // 1. Prepare the full data for the PDF with PascalCase keys
            const currentPersonalDetailsPascal = mapToPascalCase(formData);

            // IMPORTANT: Assume currentFullResumeData's other sections (ProfessionalExperience, Education, etc.)
            // AND the items within those arrays already have PascalCase keys, as expected by GoHTMLTemplater.
            // If not, they would need to be mapped here similar to how personalDetails is handled.
            const dataForPdf = {
                ...JSON.parse(JSON.stringify(currentFullResumeData)), // Deep clone
                PersonalDetails: currentPersonalDetailsPascal, // Override with latest form data
            };
             // Ensure all section keys are PascalCase if `currentFullResumeData` might have camelCase
            if (dataForPdf.professionalExperience && !dataForPdf.ProfessionalExperience) {
                dataForPdf.ProfessionalExperience = dataForPdf.professionalExperience;
                delete dataForPdf.professionalExperience;
            }
            if (dataForPdf.education && !dataForPdf.Education) {
                dataForPdf.Education = dataForPdf.education;
                delete dataForPdf.education;
            }
            if (dataForPdf.leadershipExperience && !dataForPdf.LeadershipExperience) {
                dataForPdf.LeadershipExperience = dataForPdf.leadershipExperience;
                delete dataForPdf.leadershipExperience;
            }
            if (dataForPdf.others && !dataForPdf.Others) {
                dataForPdf.Others = dataForPdf.others;
                delete dataForPdf.others;
            }


            const completeHtmlForPdf = GoHTMLTemplater.render(baseRawTemplate, dataForPdf);

            if (!completeHtmlForPdf || completeHtmlForPdf.includes("Error generating") || completeHtmlForPdf.includes("Template HTML tidak ditemukan")) {
                alert("Could not generate valid resume content for PDF. Please check your data or template.");
                setIsDownloadingPdf(false);
                return;
            }

            // 2. Create a temporary, off-screen element
            const printArea = document.createElement('div');
            printArea.id = 'print-area-for-pdf-temp';
            printArea.style.width = '595.28px'; // Standard A4 width at 72DPI, matching your CSS
            printArea.style.position = 'absolute';
            printArea.style.left = '-9999px';
            printArea.style.top = '0px';
            printArea.style.backgroundColor = 'white'; // Ensure background for capture
            printArea.innerHTML = completeHtmlForPdf;
            document.body.appendChild(printArea);
            
            // Small delay for rendering, especially if there are images or complex CSS
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Capture with html2canvas
            const canvas = await html2canvas(printArea, {
                scale: 2, // Higher scale for better PDF quality
                useCORS: true,
                logging: false,
                width: printArea.scrollWidth, // Capture full width
                height: printArea.scrollHeight, // Capture full scrollable height
                windowWidth: printArea.scrollWidth,
                windowHeight: printArea.scrollHeight,
            });

            document.body.removeChild(printArea); // Clean up temporary element

            // 4. Create PDF with jsPDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px', // Using pixels as units
                format: [canvas.width / 2, canvas.height / 2] // PDF dimensions based on canvas (divided by scale)
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2); // Add image scaled down

            let fileName = "resume.pdf";
            if (dataForPdf.PersonalDetails?.FullName) {
                fileName = `${dataForPdf.PersonalDetails.FullName.replace(/[^a-z0-9]/gi, '_')}_CV.pdf`;
            } else if (dataForPdf.name) {
                fileName = `${dataForPdf.name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
            }

            pdf.save(fileName);

        } catch (error) {
            console.error("Error during PDF download:", error);
            alert(`An error occurred while generating the PDF: ${error.message}`);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    if (isPageDataLoading) { return ( <div className="min-h-screen flex items-center justify-center bg-gray-100"> <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div> <p className="mt-3 Poppins">Loading...</p> </div> ); }

    return (
        <ResumeFormLayout
            currentStepId="personal"
            completedSteps={completedSteps}
            onBack={handleBack}
            onSaveAndNext={isSaving || isDownloadingPdf ? undefined : handleSaveAndNext}
            onPreview={isSaving || isDownloadingPdf ? undefined : handleTogglePreviewModal}
            onDownload={handleDownload} // Pass the actual function
            isSaving={isSaving}
            isDownloadingPdf={isDownloadingPdf} // Pass the state
            formTitle="Fill In Your Personal Information"
            formSubtitle="Help recruiter to get in touch with you"
        >
            {/* ... rest of your JSX for form fields and modal ... */}
             {isSaving && ( <div className="fixed top-0 left-0 right-0 pt-2 px-4 z-[9999] mx-auto max-w-md"> <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-md text-sm text-center shadow-lg"> Saving data... </div> </div> )}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAndNext(); }} className={`space-y-1 ${isSaving ? 'opacity-50 pointer-events-none pt-12' : ''}`}>
                <InputField label="Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. John Doe" required autoComplete="name" disabled={isSaving}/>
                <InputField label="Phone Number (Mobile)" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} placeholder="e.g. 081234567890" required autoComplete="tel" disabled={isSaving}/>
                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g. john.doe@example.com" required autoComplete="email" disabled={isSaving}/>
                <InputField label="Linkedin Profile URL" name="linkedin" type="url" value={formData.linkedin} onChange={handleChange} placeholder="e.g. https://linkedin.com/in/johndoe" autoComplete="url" disabled={isSaving}/>
                <InputField label="Portfolio URL (Optional)" name="portfolioUrl" type="url" value={formData.portfolioUrl} onChange={handleChange} placeholder="e.g. https://yourportfolio.com" autoComplete="url" disabled={isSaving}/>
                <TextAreaField label="Address (Optional)" name="addressString" value={formData.addressString} onChange={handleChange} placeholder="e.g. 123 Main St, Springfield, IL" rows={2} disabled={isSaving}/>
                <TextAreaField label="Short Description About Yourself" name="description" value={formData.description} onChange={handleChange} placeholder="Write a brief summary..." rows={5} required disabled={isSaving}/>
            </form>
            {showPreviewModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9998] p-4" onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}}> <div ref={pdfPreviewRef} className="bg-white p-1 sm:p-2 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}> <div className="flex justify-between items-center p-2 sm:p-3 border-b"> <h3 className="text-base sm:text-lg font-semibold Poppins">Resume Preview (Realtime)</h3> <button onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}} className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none">&times;</button> </div> <div id="pdf-content-to-download-modal-personal" className="overflow-auto flex-grow p-1 sm:p-2 bg-gray-50 flex justify-center"> <div className="mx-auto shadow-lg" style={{ width: '595.28px', minHeight: '841.89px', transform: 'scale(0.70)', transformOrigin: 'top center', border: '1px solid #ccc', backgroundColor: '#fff'}} dangerouslySetInnerHTML={{ __html: previewHtml }} /> </div> <div className="p-2 sm:p-3 border-t text-right"> <button onClick={() => {if (!isSaving && !isDownloadingPdf) setShowPreviewModal(false)}} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md Poppins text-sm">Close</button> </div> </div> </div> )}
        </ResumeFormLayout>
    );
};
export default PersonalInformationPage;