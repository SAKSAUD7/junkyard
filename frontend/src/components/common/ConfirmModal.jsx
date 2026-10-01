import React from 'react';
import { createPortal } from 'react-dom';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ConfirmModal({ 
    isOpen, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?', 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    onConfirm, 
    onCancel, 
    type = 'danger' // 'danger' | 'warning' | 'info'
}) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            iconBg: 'bg-red-100',
            iconText: 'text-red-600',
            btnBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        },
        warning: {
            iconBg: 'bg-yellow-100',
            iconText: 'text-yellow-600',
            btnBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
        },
        info: {
            iconBg: 'bg-blue-100',
            iconText: 'text-blue-600',
            btnBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
        }
    };

    const currentStyle = colors[type] || colors.danger;

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>

            {/* Modal Panel */}
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-in zoom-in-95 duration-200">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-slate-100">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${currentStyle.iconBg}`}>
                                {currentStyle.icon}
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-lg font-bold leading-6 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-slate-500 font-medium">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm sm:ml-3 sm:w-auto transition-colors ${currentStyle.btnBg}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors hover:text-slate-900"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
