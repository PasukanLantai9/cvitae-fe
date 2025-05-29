import React, { useState, useEffect, useRef } from 'react';

// Modal component dipisah, inputnya pake ref untuk fokus otomatis
function NameModal({ isOpen, onCancel, onSubmit, value, onChange }) {
    const inputRef = useRef(null);

    // Fokus otomatis input tiap kali modal dibuka
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded p-6 w-80">
                <h2 className="text-lg font-semibold mb-4">Name Your CV</h2>
                <input
                    ref={inputRef}
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
                    placeholder="Enter CV name"
                    value={value}
                    onChange={onChange}
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export function useNameModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [resolvePromise, setResolvePromise] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const showModalAndGetName = () => {
        setInputValue('');
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolvePromise(() => resolve);
        });
    };

    const handleSubmit = () => {
        if (inputValue.trim() === '') {
            alert('Please enter a name');
            return;
        }
        if (resolvePromise) resolvePromise(inputValue.trim());
        setIsOpen(false);
    };

    const handleCancel = () => {
        if (resolvePromise) resolvePromise(null);
        setIsOpen(false);
    };

    const Modal = () => (
        <NameModal
            isOpen={isOpen}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
        />
    );

    return { showModalAndGetName, Modal };
}
