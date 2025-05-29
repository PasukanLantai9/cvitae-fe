import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import GoHTMLTemplater from '../utils/GoHTMLTemplater';
import {useNameModal} from "../hooks/useNameModal.jsx";

function Dashboard() {
    const navigate = useNavigate();
    const [rawTemplateHtml, setRawTemplateHtml] = useState('');
    const [templateData, setTemplateData] = useState(null);
    const [processedTemplateHtml, setProcessedTemplateHtml] = useState('');
    const [renderedSoonHtml, setRenderedSoonHtml] = useState('');
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [scale, setScale] = useState(0.1);
    const previewContainerRef = useRef(null);
    const soonPreviewContainerRef = useRef(null);
    const [myResumes, setMyResumes] = useState([]);
    const [isResumesLoading, setIsResumesLoading] = useState(true);
    const [resumesError, setResumesError] = useState(null);
    const [isSpecificResumeLoading, setIsSpecificResumeLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [openDropdownId, setOpenDropdownId] = useState(null); // Untuk dropdown opsi di kartu resume

    const { showModalAndGetName, Modal } = useNameModal();

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleResumeOptions = (resumeId) => {
        setOpenDropdownId(prevId => (prevId === resumeId ? null : resumeId));
    };

    useEffect(() => {
        const fetchPreviewAssets = async () => {
            try {
                const [templateResponse, dataResponse] = await Promise.all([
                    fetch('/resume_template.gohtml'),
                    fetch('/template.json'),
                ]);
                if (!templateResponse.ok) throw new Error(`Gagal memuat template HTML utama: ${templateResponse.statusText}`);
                if (!dataResponse.ok) throw new Error(`Gagal memuat data JSON default: ${dataResponse.statusText}`);
                const htmlText = await templateResponse.text();
                const jsonData = await dataResponse.json();
                setRawTemplateHtml(htmlText);
                setTemplateData(jsonData);
            } catch (error) {
                console.error("Error fetching preview assets for Dashboard:", error);
                const errorMsg = `<div class="p-2 text-xs text-red-600 text-center">Failed to load preview assets.<br/>${error.message}</div>`;
                setProcessedTemplateHtml(errorMsg);
                setRenderedSoonHtml(errorMsg.replace("Soon preview", "Preview assets"));
            }
        };
        fetchPreviewAssets();
    }, []);

    useEffect(() => {
        if (rawTemplateHtml && templateData && !processedTemplateHtml) {
            try {
                const renderedHtml = GoHTMLTemplater.render(rawTemplateHtml, templateData);
                if (renderedHtml && renderedHtml.trim() !== "" && !renderedHtml.includes("Data atau template tidak tersedia")) {
                    setProcessedTemplateHtml(renderedHtml);
                } else {
                    setProcessedTemplateHtml("<p class='text-red-500 p-2 text-xs text-center'>Preview generation failed (empty/no data).</p>");
                }
            } catch (e) {
                setProcessedTemplateHtml(`<div class="p-2 text-xs text-red-600 text-center">Error rendering preview.<br/>${e.message}</div>`);
            }
        }
    }, [rawTemplateHtml, templateData, processedTemplateHtml]);

    useEffect(() => {
        if (rawTemplateHtml && templateData && !renderedSoonHtml) {
             try {
                const soonHtml = GoHTMLTemplater.render(rawTemplateHtml, templateData);
                 if (soonHtml && soonHtml.trim() !== "" && !soonHtml.includes("Data atau template tidak tersedia")) {
                    setRenderedSoonHtml(soonHtml);
                } else {
                     setRenderedSoonHtml("<p class='text-red-500 p-2 text-xs text-center'>Soon preview failed (empty/no data).</p>");
                }
            } catch (e) {
                setRenderedSoonHtml(`<div class="p-2 text-xs text-red-600 text-center">Error rendering Soon preview. ${e}</div>`);
            }
        }
    }, [rawTemplateHtml, templateData, renderedSoonHtml]);

    const fetchMyResumes = async () => { // Jadikan fungsi agar bisa dipanggil ulang setelah delete
        setIsResumesLoading(true);
        setResumesError(null);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setResumesError("Token akses tidak ditemukan. Silakan login kembali.");
            setIsResumesLoading(false);
            navigate('/login'); return;
        }
        try {
            const response = await fetch(`${apiBaseUrl}/resume`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (response.status === 401) {
                const errorData = await response.json().catch(() => ({}));
                setResumesError(errorData.errors?.message || "Sesi Anda telah berakhir.");
                localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('sessionID');
                navigate('/login'); return;
            }
            if (!response.ok) { throw new Error(`Gagal load My Resumes (Status: ${response.status})`); }
            const data = await response.json();
            setMyResumes(Array.isArray(data) ? data : []);
        } catch (error) { setResumesError(error.message);
        } finally { setIsResumesLoading(false); }
    };

    useEffect(() => {
        fetchMyResumes();
    }, [apiBaseUrl, navigate]); // Hanya panggil sekali saat mount atau jika dependensi ini berubah

    useEffect(() => {
        const previewAssetsReadyOrFailed = (rawTemplateHtml && templateData) ||
                                       (processedTemplateHtml.includes("Failed") || processedTemplateHtml.includes("Error"));
        if (previewAssetsReadyOrFailed && !isResumesLoading) {
            setIsLoadingPage(false);
        }
    }, [rawTemplateHtml, templateData, processedTemplateHtml, isResumesLoading]);

    useEffect(() => {
        const adjustScale = (containerElement, contentWidth = 595.28, contentHeight = 841.89) => {
             if (containerElement) {
                const containerWidth = containerElement.offsetWidth;
                const containerHeight = containerElement.offsetHeight;
                if (containerWidth <= 0 || containerHeight <= 0) return 0.1;
                const PADDING = 10;
                const effectiveContainerWidth = Math.max(containerWidth - PADDING, 1);
                const effectiveContainerHeight = Math.max(containerHeight - PADDING, 1);
                const scaleX = effectiveContainerWidth / contentWidth;
                const scaleY = effectiveContainerHeight / contentHeight;
                const newCalculatedScale = Math.min(scaleX, scaleY, 1);
                return Math.max(newCalculatedScale, 0.05);
            }
            return 0.1;
        };
        const updateScaleForAllPreviews = () => {
            let newScaleValue = 0.1;
            if (previewContainerRef.current && processedTemplateHtml && !processedTemplateHtml.includes("Gagal") && !processedTemplateHtml.includes("kosong") && !processedTemplateHtml.includes("Failed")) {
                newScaleValue = adjustScale(previewContainerRef.current);
            } else if (soonPreviewContainerRef.current && renderedSoonHtml && !renderedSoonHtml.includes("Gagal") && !renderedSoonHtml.includes("Error") && !renderedSoonHtml.includes("Failed")) {
                newScaleValue = adjustScale(soonPreviewContainerRef.current);
            }
            setScale(prevScale => Math.abs(prevScale - newScaleValue) > 0.001 ? newScaleValue : prevScale);
        };
        const scaleTimeoutId = setTimeout(updateScaleForAllPreviews, 100);
        window.addEventListener('resize', updateScaleForAllPreviews);
        return () => {
            window.removeEventListener('resize', updateScaleForAllPreviews);
            clearTimeout(scaleTimeoutId);
        };
    }, [processedTemplateHtml, renderedSoonHtml]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const hamburgerButton = event.target.closest('button[aria-label="Open menu or logout"]');
            if (menuRef.current && !menuRef.current.contains(event.target) && !hamburgerButton) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        else document.removeEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleCreateNewResume = async () => {
        if (!templateData) {
            alert("Default resume data is not loaded yet. Please wait.");
            return;
        }

        // Minta user input nama CV lewat modal (asumsikan sudah dapat di variable `cvName`)
        const cvName = await showModalAndGetName(); // contoh fungsi modal async, ganti sesuai implementasimu
        if (!cvName) {
            return
        }

        try {
            // POST request ke backend buat bikin resume baru, hanya kirim { name }
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${apiBaseUrl}/resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: cvName })
            });

            if (!response.ok) throw new Error('Failed to create resume');

            const created = await response.json();

            // Buat object lengkap dari template + data backend
            const newResumeObject = {
                ...JSON.parse(JSON.stringify(templateData)),
                id: created.id,
                name: created.name,
                professionalExperience: [],
                education: [],
                leadershipExperience: [],
                others: []
            };

            console.log("Created new resume:", newResumeObject);

            // Navigate ke halaman resume yang baru dengan id dari backend
            navigate(`/resume/${created.id}`, {
                state: {
                    resumeData: newResumeObject,
                    isNew: true,
                    completedSteps: []
                }
            });
        } catch (error) {
            alert('Error creating new resume: ' + error.message);
        }
    };

    const handleContinueResume = async (resumeId) => {
        navigate(`/resume/${resumeId}`, {})
    };

    const handleDeleteResume = async (resumeIdToDelete) => {
        if (!window.confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
            setOpenDropdownId(null);
            return;
        }
        setIsSpecificResumeLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) { setIsSpecificResumeLoading(false); return; }

        try {
            const response = await fetch(`${apiBaseUrl}/resume/${resumeIdToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) { return; }
            if (!response.ok) { // API Delete mungkin mengembalikan 204 atau 200
                let errorMsg = `Failed to delete resume (Status: ${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.errors?.message || errorData.message || errorMsg;
                    throw new Error(errorMsg);
                } catch (e) {
                    throw new Error(e);
                }

            }
            console.log(`Resume dengan ID ${resumeIdToDelete} berhasil dihapus.`);
            setMyResumes(prevResumes => prevResumes.filter(resume => resume.id !== resumeIdToDelete));
        } catch (error) {
            console.error("Error deleting resume:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSpecificResumeLoading(false);
            setOpenDropdownId(null); // Selalu tutup dropdown
        }
    };


    if (isLoadingPage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2859A6]"></div>
                <p className="mt-4 text-gray-600 Poppins">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {isSpecificResumeLoading && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                    <p className="ml-4 text-white text-xl Poppins">Processing...</p>
                </div>
            )}
            {/* Header dengan Dropdown Menu */}
            <div className='w-full bg-[#2859A6] flex justify-between items-center px-4 sm:px-9 py-3 shadow-md sticky top-0 z-50'>
                <img src="/logo.png" alt="logocvtae" className='w-[80px] sm:w-[90px] h-auto' />
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        className='p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
                        onClick={toggleMenu}
                        aria-expanded={isMenuOpen}
                        aria-controls="dropdown-menu-header"
                        aria-label="Open menu or logout"
                    >
                        <img src="/menu (1).png" alt="Menu Icon" className='w-6 h-6' />
                    </button>
                    {isMenuOpen && (
                        <div
                            id="dropdown-menu-header"
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-200 origin-top-right"
                            role="menu" aria-orientation="vertical"
                        >
                            <button
                                onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                                className="w-[calc(100%-1rem)] mx-2 text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center border border-[#2859A6] rounded-md transition-colors duration-150"
                                role="menuitem"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('sessionID');
                                    navigate('/login'); setIsMenuOpen(false);
                                }}
                                className="w-[calc(100%-1rem)] mx-2 mt-1 text-left px-3 py-2 text-sm text-white bg-[#2859A6] hover:bg-[#1e4a8a] flex items-center rounded-md transition-colors duration-150"
                                role="menuitem"
                            >
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Modal />
            {/* Konten Utama Dashboard */}
            <div className='py-6 px-4 sm:px-5 md:px-9'>
                <h1 className='text-xl md:text-2xl font-bold Poppins mb-6 text-gray-800'>
                    Choose a template to start
                </h1>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {/* ATS-Friendly Template Card */}
                    <div
                        className="flex flex-col bg-white shadow-xl rounded-lg rounded-br-[20px] sm:rounded-br-[30px] md:rounded-br-[40px] overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer border-2 border-[#2859A6] focus-within:border-[#2859A6]"
                        onClick={handleCreateNewResume}
                        tabIndex={0}
                    >
                        <div
                            ref={previewContainerRef}
                            className="h-[180px] xs:h-[220px] sm:h-[280px] md:h-[320px] lg:h-[350px] xl:h-[400px] overflow-hidden bg-gray-100 flex justify-center items-center p-1 sm:p-2 relative"
                        >
                            {(!rawTemplateHtml || !templateData) && !processedTemplateHtml.includes("Failed") && !processedTemplateHtml.includes("Gagal") && !processedTemplateHtml.includes("kosong") ? (
                                <div className="flex flex-col justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#2859A6] mb-2"></div>
                                    <p className="text-gray-500 Poppins text-xs sm:text-sm">Loading Preview...</p>
                                </div>
                            ) : processedTemplateHtml.includes("Failed") || processedTemplateHtml.includes("Gagal") || processedTemplateHtml.includes("kosong") || !processedTemplateHtml ? (
                                 <div className="w-full h-full flex items-center justify-center p-2 Poppins text-xs sm:text-sm text-red-600" dangerouslySetInnerHTML={{ __html: processedTemplateHtml || "<p>Preview not available.</p>" }} />
                            ) : (
                                <div
                                    className="origin-top bg-white shadow-lg"
                                    style={{ width: '595.28px', height: '841.89px', transform: `scale(${scale})`, transformOrigin: 'top center', overflow: 'hidden' }}
                                >
                                    <div dangerouslySetInnerHTML={{ __html: processedTemplateHtml }} />
                                </div>
                            )}
                        </div>
                        <div className="bg-[#2859A6] text-white text-center py-2 sm:py-3 px-2 sm:px-4">
                            <span className="font-semibold Poppins text-xs sm:text-sm md:text-base">ATS-Friendly</span>
                        </div>
                    </div>

                    {/* Soon Template Card */}
                    <div className="flex flex-col bg-white shadow-xl rounded-lg rounded-br-[20px] sm:rounded-br-[30px] md:rounded-br-[40px] overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 border-[#2859A6] focus-within:border-[#2859A6]">
                         <div
                            ref={soonPreviewContainerRef}
                            className="h-[180px] xs:h-[220px] sm:h-[280px] md:h-[320px] lg:h-[350px] xl:h-[400px] overflow-hidden bg-gray-100 flex justify-center items-center p-1 sm:p-2 relative"
                        >
                            {(!rawTemplateHtml || !templateData) && !renderedSoonHtml.includes("Failed") && !renderedSoonHtml.includes("Gagal") && !renderedSoonHtml.includes("Error") ? (
                                <div className="flex flex-col justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-500 mb-2"></div>
                                    <p className="text-gray-500 Poppins text-xs sm:text-sm">Loading Preview...</p>
                                </div>
                            ) : renderedSoonHtml.includes("Failed") || renderedSoonHtml.includes("Gagal") || renderedSoonHtml.includes("Error") || !renderedSoonHtml ? (
                                <div className="w-full h-full flex items-center justify-center p-2 Poppins text-xs sm:text-sm text-red-600" dangerouslySetInnerHTML={{ __html: renderedSoonHtml || "<p>Soon preview not available.</p>" }} />
                            ) : (
                                <div
                                    className="origin-top relative"
                                    style={{ width: '595.28px', height: '841.89px', transform: `scale(${scale})`, transformOrigin: 'top center', overflow: 'hidden' }}
                                >
                                    <div className="bg-white" style={{ filter: 'blur(6px)', WebkitFilter: 'blur(6px)'}} dangerouslySetInnerHTML={{ __html: renderedSoonHtml }} />
                                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center text-gray-700 font-bold text-xs xxs:text-sm sm:text-base Poppins p-2 text-center leading-tight">
                                        Template Preview<br className="hidden xxs:inline"/> Coming Soon
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-[#2859A6] text-white text-center py-2 sm:py-3 px-2 sm:px-4">
                            <span className="font-semibold Poppins text-xs sm:text-sm md:text-base">Soon</span>
                        </div>
                    </div>
                </div>


                {/* My Resumes Section */}
                <h1 className='text-xl mt-10 md:text-2xl font-bold Poppins mb-6 text-gray-800'>
                    My Resumes
                </h1>
                {isResumesLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2859A6]"></div>
                        <p className="ml-3 text-gray-600 Poppins">Loading My Resumes...</p>
                    </div>
                ) : resumesError ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative Poppins" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {resumesError}</span>
                    </div>
                ) : myResumes.length > 0 ? (
                    // PERUBAHAN DI SINI: Tambahkan div dengan kelas grid
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {myResumes.map(resume => (
                            <div key={resume.id || resume.name} className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 border-[#2859A6] focus-within:border-[#2859A6]">
                                <div className="h-40 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                                    {/* Placeholder untuk thumbnail resume atau gambar sebenarnya jika ada */}
                                    {resume.previewImageUrl ? (
                                        <img src={resume.previewImageUrl} alt={`Preview of ${resume.name}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    )}
                                    
                                    {/* Tombol Titik Tiga (Opsi) */}
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleResumeOptions(resume.id); }}
                                            className="p-1.5 bg-gray-700 bg-opacity-30 hover:bg-opacity-50 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                                            aria-label="Resume options"
                                        >
                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                            </svg>
                                        </button>
                                        {/* Dropdown untuk Opsi Delete */}
                                        {openDropdownId === resume.id && (
                                            <div
                                                className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200 origin-top-right"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => handleDeleteResume(resume.id)}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.287.094M5.25 5.79c-.003.004-.006.007-.009.01l-.006.006l-.004.005l-.002.002l-.001.001v.001M5.25 5.79l-.003.004l-.006.007l-.004.005L5.23 5.8M5.25 5.79l-.003.004L5.24 5.811M5.25 5.79l-.003.004l-.006.007l-.004.005-.002.002-.001.001v.001a.75.75 0 01-.703.742L3.263 6.99c-.34-.058-.664-.133-.956-.228a2.25 2.25 0 01-1.572-2.344V3.75a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 3.75v.693a2.25 2.25 0 01-1.572 2.344c-.292.095-.616.17-.956.228l-1.267.215a.75.75 0 01-.703-.742v-.001l-.001-.001-.002-.002-.004-.005-.006-.007-.003-.004zm-1.89 6.328c.1-.006.198-.013.296-.021l1.267-.215a.75.75 0 01.703.742v.001l.001.001.002.002.004.005.006.007.003.004M18.75 5.79c.003.004.006.007.009.01l.006.006.004.005.002.002.001.001v.001M18.75 5.79l.003.004.006.007.004.005L18.77 5.8M18.75 5.79l.003.004L18.76 5.811M18.75 5.79l.003.004l.006.007.004.005.002.002.001.001v.001a.75.75 0 00.703-.742l1.267-.215c.098.008.196.015.296.021m-6.75-1.228a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* ... sisa info kartu ... */}
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold Poppins text-gray-800 text-base truncate" title={resume.name || "Untitled Resume"}>{resume.name || "Untitled Resume"}</h3>
                                        <p className="text-gray-500 text-xs Poppins mt-1">
                                            Created: {new Date(resume.createdAt || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleContinueResume(resume.id, resume.name)}
                                            className="text-xs Poppins px-3 py-1 bg-[#2859A6] hover:bg-[#1e4a8a] text-white rounded-md disabled:opacity-50"
                                            disabled={isSpecificResumeLoading && openDropdownId !== resume.id} // Hanya disable jika loading untuk resume lain
                                        >
                                            {(isSpecificResumeLoading && openDropdownId === resume.id) ? "Loading..." : "Edit / View"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" /* ... ikon no resume ... */ />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 Poppins">No resumes</h3>
                        <p className="mt-1 text-sm text-gray-500 Poppins">Get started by creating a new resume from a template.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;