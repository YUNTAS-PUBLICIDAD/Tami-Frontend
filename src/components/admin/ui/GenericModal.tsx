import React, { type ReactNode } from "react";
import { IoMdCloseCircle } from "react-icons/io";

interface GenericModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const GenericModal = ({ isOpen, onClose, title, children }: GenericModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-teal-500 to-emerald-600">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                        <IoMdCloseCircle size={32} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default GenericModal;
