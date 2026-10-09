import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostSubmissionFeedback from './PostSubmissionFeedback';

export default function LogoutFeedbackModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState('customer');
    const navigate = useNavigate();

    useEffect(() => {
        const handleOpen = (e) => {
            setRole(e.detail?.role || 'customer');
            setIsOpen(true);
        };
        window.addEventListener('jynm:logout-feedback', handleOpen);
        return () => window.removeEventListener('jynm:logout-feedback', handleOpen);
    }, []);

    const handleFinish = () => {
        setIsOpen(false);
        if (role === 'admin') navigate('/admin-portal/login');
        else if (role === 'vendor') navigate('/vendor/login');
        else navigate('/');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md">
                <PostSubmissionFeedback
                    title="You've safely logged out."
                    message="How was your experience using JYNM today? Let us know!"
                    actionText="Return Home"
                    onAction={handleFinish}
                />
            </div>
        </div>
    );
}
